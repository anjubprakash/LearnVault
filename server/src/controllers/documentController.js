import path from 'path';
import fs from 'fs';
import mongoose from 'mongoose';
import { DocumentItem } from '../models/Document.js';
import { Topic } from '../models/Topic.js';
import { Activity } from '../models/Activity.js';
import { Video } from '../models/Video.js';
import { extractYouTubeId } from './videoController.js';
import { getStorageProvider } from '../storage/LocalStorageProvider.js';

export const getDocuments = async (req, res) => {
  try {
    const { topic, category, search, tag, sort = 'recent' } = req.query;
    const filter = {};

    if (topic) filter.topic = topic;
    if (category) filter.category = category;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { originalFilename: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(String(search), 'i')] } },
      ];
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'title') sortOption = { title: 1 };
    if (sort === 'popular') sortOption = { downloadCount: -1, viewCount: -1 };
    if (sort === 'views') sortOption = { viewCount: -1 };

    const documents = await DocumentItem.find(filter)
      .populate('topic', 'title slug category')
      .populate('uploadedBy', 'name role')
      .populate('relatedVideo')
      .sort(sortOption);

    res.json(documents);
  } catch (error) {
    console.error('getDocuments error:', error);
    res.status(500).json({ message: 'Error retrieving documents' });
  }
};

export const getDocumentById = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DocumentItem.findById(id)
      .populate('topic', 'title slug category')
      .populate('uploadedBy', 'name role')
      .populate('relatedVideo');

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    let textContent = null;
    if (['txt', 'md', 'markdown'].includes(doc.fileType.toLowerCase())) {
      const storage = getStorageProvider();
      const filePath = storage.getFilePath(doc.storedFilename);
      if (fs.existsSync(filePath)) {
        textContent = await fs.promises.readFile(filePath, 'utf-8');
      }
    }

    res.json({
      document: doc,
      textContent,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving document' });
  }
};

export const viewDocumentStream = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DocumentItem.findById(id).populate('topic', 'title');

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const storage = getStorageProvider();
    const filePath = storage.getFilePath(doc.storedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Physical file not found on disk' });
    }

    doc.viewCount += 1;
    doc.lastViewedAt = new Date();
    await doc.save();

    if (req.user) {
      const topicTitle = doc.topic?.title || '';
      await Activity.create({
        user: req.user._id,
        actionType: 'view_document',
        entityId: doc._id.toString(),
        entityType: 'document',
        entityTitle: doc.title || doc.originalFilename,
        topic: doc.topic,
        topicTitle,
        metadata: {
          fileType: doc.fileType,
          fileSize: doc.fileSize,
        },
      });
    }

    const mimeMap = {
      pdf: 'application/pdf',
      png: 'image/png',
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      webp: 'image/webp',
      txt: 'text/plain; charset=utf-8',
      md: 'text/markdown; charset=utf-8',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    };

    const contentType = mimeMap[doc.fileType.toLowerCase()] || doc.mimeType || 'application/octet-stream';

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${encodeURIComponent(doc.originalFilename)}"`);
    res.setHeader('Content-Length', doc.fileSize);

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  } catch (error) {
    console.error('viewDocumentStream error:', error);
    res.status(500).json({ message: 'Error streaming document' });
  }
};

export const downloadDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DocumentItem.findById(id).populate('topic', 'title');

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const storage = getStorageProvider();
    const filePath = storage.getFilePath(doc.storedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'Physical file not found on disk' });
    }

    doc.downloadCount += 1;
    await doc.save();

    if (req.user) {
      const topicTitle = doc.topic?.title || '';
      await Activity.create({
        user: req.user._id,
        actionType: 'download_document',
        entityId: doc._id.toString(),
        entityType: 'document',
        entityTitle: doc.title || doc.originalFilename,
        topic: doc.topic,
        topicTitle,
      });
    }

    res.download(filePath, doc.originalFilename);
  } catch (error) {
    console.error('downloadDocument error:', error);
    res.status(500).json({ message: 'Error downloading document' });
  }
};

export const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please select a file to upload.' });
    }

    const { title, description, topic, category, tags, relatedVideo, videoUrl, videoTitle } = req.body;

    if (!topic) {
      return res.status(400).json({ message: 'Topic is required for uploaded document.' });
    }

    const topicObj = await Topic.findById(topic);
    if (!topicObj) {
      return res.status(400).json({ message: 'Selected topic does not exist.' });
    }

    const ext = path.extname(req.file.originalname).replace('.', '').toLowerCase();
    const tagList = tags
      ? (typeof tags === 'string' ? tags.split(',') : tags).map((t) => t.trim()).filter(Boolean)
      : [];

    let linkedVideoId = null;
    let finalVideoUrl = videoUrl?.trim() || '';
    let finalVideoTitle = videoTitle?.trim() || '';

    // If an existing video was selected from all saved videos
    if (relatedVideo && mongoose.Types.ObjectId.isValid(relatedVideo)) {
      const existingVideo = await Video.findById(relatedVideo);
      if (existingVideo) {
        linkedVideoId = existingVideo._id;
        finalVideoUrl = existingVideo.youtubeUrl;
        finalVideoTitle = existingVideo.title;
      }
    } else if (finalVideoUrl) {
      // If a video link was pasted directly, check or auto-create in library
      const ytId = extractYouTubeId(finalVideoUrl);
      if (ytId) {
        let matchedVideo = await Video.findOne({ youtubeId: ytId });
        if (!matchedVideo) {
          matchedVideo = await Video.create({
            title: finalVideoTitle || `${title?.trim() || req.file.originalname} Tutorial Video`,
            description: `Tutorial video linked to ${title?.trim() || req.file.originalname}`,
            youtubeUrl: finalVideoUrl,
            youtubeId: ytId,
            thumbnailUrl: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
            channelName: 'YouTube Educator',
            topic: topicObj._id,
            tags: tagList,
            addedBy: req.user?._id,
          });
        }
        linkedVideoId = matchedVideo._id;
        finalVideoTitle = matchedVideo.title;
      }
    }

    const newDoc = new DocumentItem({
      title: title?.trim() || req.file.originalname,
      description: description?.trim() || '',
      topic: topicObj._id,
      category: category?.trim() || topicObj.category || 'Programming Languages',
      tags: tagList,
      originalFilename: req.file.originalname,
      storedFilename: req.file.filename,
      fileType: ext,
      mimeType: req.file.mimetype,
      fileSize: req.file.size,
      filePath: req.file.path,
      uploadedBy: req.user?._id,
      relatedVideo: linkedVideoId,
      videoUrl: finalVideoUrl,
      videoTitle: finalVideoTitle,
      downloadCount: 0,
      viewCount: 0,
    });

    await newDoc.save();
    await newDoc.populate('relatedVideo');

    if (req.user) {
      await Activity.create({
        user: req.user._id,
        actionType: 'add_document',
        entityId: newDoc._id.toString(),
        entityType: 'document',
        entityTitle: newDoc.title,
        topic: topicObj._id,
        topicTitle: topicObj.title,
      });
    }

    res.status(201).json({
      message: 'Document uploaded successfully.',
      document: newDoc,
    });
  } catch (error) {
    console.error('uploadDocument error:', error);
    res.status(500).json({ message: error.message || 'Error uploading document' });
  }
};

export const updateDocumentMetadata = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, topic, category, tags, relatedVideo, videoUrl, videoTitle } = req.body;

    const doc = await DocumentItem.findById(id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    // Only update metadata - NEVER edit uploaded file contents!
    if (title) doc.title = title.trim();
    if (description !== undefined) doc.description = description.trim();
    if (category) doc.category = category.trim();
    if (topic) {
      const topicObj = await Topic.findById(topic);
      if (topicObj) doc.topic = topicObj._id;
    }
    if (tags !== undefined) {
      doc.tags = (typeof tags === 'string' ? tags.split(',') : tags).map((t) => t.trim()).filter(Boolean);
    }
    if (relatedVideo !== undefined) {
      doc.relatedVideo = relatedVideo && mongoose.Types.ObjectId.isValid(relatedVideo) ? relatedVideo : null;
    }
    if (videoUrl !== undefined) {
      doc.videoUrl = videoUrl.trim();
    }
    if (videoTitle !== undefined) {
      doc.videoTitle = videoTitle.trim();
    }

    await doc.save();
    await doc.populate('relatedVideo');
    res.json({ message: 'Document metadata updated successfully.', document: doc });
  } catch (error) {
    res.status(500).json({ message: 'Error updating document metadata' });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await DocumentItem.findById(id);

    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }

    const storage = getStorageProvider();
    await storage.deleteFile(doc.storedFilename);

    await DocumentItem.findByIdAndDelete(id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('deleteDocument error:', error);
    res.status(500).json({ message: 'Error deleting document' });
  }
};
