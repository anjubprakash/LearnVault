import { Topic } from '../models/Topic.js';
import { DocumentItem } from '../models/Document.js';
import { Video } from '../models/Video.js';
import { Project } from '../models/Project.js';
import { Note } from '../models/Note.js';
import { Bookmark } from '../models/Bookmark.js';
import { Activity } from '../models/Activity.js';

// Recursive helper to build breadcrumb trail
async function getBreadcrumbTrail(topicId) {
  const trail = [];
  let currentId = topicId;

  while (currentId) {
    const topic = await Topic.findById(currentId);
    if (!topic) break;
    trail.unshift({
      id: topic._id.toString(),
      title: topic.title,
      slug: topic.slug,
    });
    currentId = topic.parentTopic ? topic.parentTopic.toString() : null;
  }

  return trail;
}

export const getTopics = async (req, res) => {
  try {
    const { category, search } = req.query;
    const filter = {};

    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const topics = await Topic.find(filter).populate('parentTopic', 'title slug').sort({ category: 1, order: 1, title: 1 });

    const topicIds = topics.map((t) => t._id);
    const [docCounts, videoCounts, projectCounts, noteCounts, bookmarkCounts] = await Promise.all([
      DocumentItem.aggregate([{ $match: { topic: { $in: topicIds } } }, { $group: { _id: '$topic', count: { $sum: 1 } } }]),
      Video.aggregate([{ $match: { topic: { $in: topicIds } } }, { $group: { _id: '$topic', count: { $sum: 1 } } }]),
      Project.aggregate([{ $match: { topic: { $in: topicIds } } }, { $group: { _id: '$topic', count: { $sum: 1 } } }]),
      Note.aggregate([{ $match: { topic: { $in: topicIds } } }, { $group: { _id: '$topic', count: { $sum: 1 } } }]),
      Bookmark.aggregate([{ $match: { topic: { $in: topicIds } } }, { $group: { _id: '$topic', count: { $sum: 1 } } }]),
    ]);

    const docMap = new Map(docCounts.map((i) => [i._id.toString(), i.count]));
    const videoMap = new Map(videoCounts.map((i) => [i._id.toString(), i.count]));
    const projectMap = new Map(projectCounts.map((i) => [i._id.toString(), i.count]));
    const noteMap = new Map(noteCounts.map((i) => [i._id.toString(), i.count]));
    const bookmarkMap = new Map(bookmarkCounts.map((i) => [i._id.toString(), i.count]));

    const enrichedTopics = topics.map((t) => {
      const idStr = t._id.toString();
      return {
        ...t.toObject(),
        counts: {
          documents: docMap.get(idStr) || 0,
          videos: videoMap.get(idStr) || 0,
          projects: projectMap.get(idStr) || 0,
          notes: noteMap.get(idStr) || 0,
          bookmarks: bookmarkMap.get(idStr) || 0,
        },
      };
    });

    res.json(enrichedTopics);
  } catch (error) {
    console.error('getTopics error:', error);
    res.status(500).json({ message: 'Error retrieving topics' });
  }
};

export const getTopicById = async (req, res) => {
  try {
    const { id } = req.params;
    const topic = await Topic.findById(id).populate('parentTopic', 'title slug');

    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    const [documents, videos, notes, projects, bookmarks, subtopics, breadcrumbs] = await Promise.all([
      DocumentItem.find({ topic: topic._id }).populate('relatedVideo').sort({ createdAt: -1 }),
      Video.find({ topic: topic._id }).sort({ createdAt: -1 }),
      Note.find({ topic: topic._id }).sort({ isPinned: -1, createdAt: -1 }),
      Project.find({ topic: topic._id }).populate('relatedDocuments', 'title originalFilename fileType').populate('relatedVideos', 'title duration').sort({ createdAt: -1 }),
      Bookmark.find({ topic: topic._id }).sort({ createdAt: -1 }),
      Topic.find({ parentTopic: topic._id }).sort({ title: 1 }),
      getBreadcrumbTrail(topic._id.toString()),
    ]);

    if (req.user) {
      await Activity.create({
        user: req.user._id,
        actionType: 'open_topic',
        entityId: topic._id.toString(),
        entityType: 'topic',
        entityTitle: topic.title,
        topic: topic._id,
        topicTitle: topic.title,
      });
    }

    res.json({
      topic,
      breadcrumbs,
      subtopics,
      documents,
      videos,
      notes,
      projects,
      bookmarks,
      counts: {
        documents: documents.length,
        videos: videos.length,
        notes: notes.length,
        projects: projects.length,
        bookmarks: bookmarks.length,
        subtopics: subtopics.length,
      },
    });
  } catch (error) {
    console.error('getTopicById error:', error);
    res.status(500).json({ message: 'Error retrieving topic details' });
  }
};

export const createTopic = async (req, res) => {
  try {
    const { title, description, category, parentTopic, icon, colorAccent, order } = req.body;

    if (!title || !category) {
      return res.status(400).json({ message: 'Topic title and category are required' });
    }

    let level = 0;
    let path = title;

    if (parentTopic) {
      const parent = await Topic.findById(parentTopic);
      if (parent) {
        level = parent.level + 1;
        path = `${parent.path || parent.title} / ${title}`;
      }
    }

    const topic = new Topic({
      title,
      description: description || `Everything I have learned about ${title}.`,
      category,
      parentTopic: parentTopic || null,
      level,
      path,
      icon: icon || 'Folder',
      colorAccent: colorAccent || '#8b5cf6',
      order: Number(order) || 0,
      createdBy: req.user?._id,
    });

    await topic.save();
    res.status(201).json(topic);
  } catch (error) {
    console.error('createTopic error:', error);
    res.status(500).json({ message: error.message || 'Error creating topic' });
  }
};

export const updateTopic = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, parentTopic, icon, colorAccent, order } = req.body;

    const topic = await Topic.findById(id);
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }

    if (title) topic.title = title;
    if (description !== undefined) topic.description = description;
    if (category) topic.category = category;
    if (icon) topic.icon = icon;
    if (colorAccent) topic.colorAccent = colorAccent;
    if (order !== undefined) topic.order = Number(order);

    if (parentTopic !== undefined) {
      topic.parentTopic = parentTopic || null;
      if (parentTopic) {
        const parent = await Topic.findById(parentTopic);
        if (parent) {
          topic.level = parent.level + 1;
          topic.path = `${parent.path || parent.title} / ${topic.title}`;
        }
      } else {
        topic.level = 0;
        topic.path = topic.title;
      }
    }

    await topic.save();
    res.json(topic);
  } catch (error) {
    res.status(500).json({ message: 'Error updating topic' });
  }
};

export const deleteTopic = async (req, res) => {
  try {
    const { id } = req.params;

    const childCount = await Topic.countDocuments({ parentTopic: id });
    if (childCount > 0) {
      return res.status(400).json({ message: `Cannot delete topic because it contains ${childCount} subtopics. Please reassign or delete them first.` });
    }

    await Topic.findByIdAndDelete(id);
    res.json({ message: 'Topic deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting topic' });
  }
};
