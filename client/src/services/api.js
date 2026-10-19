import { initialSeedData } from './seedData.js';
import { fileStorage } from './indexedDb.js';
import { driveService } from './driveService.js';

// Local storage keys
const STORAGE_KEYS = {
  TOPICS: 'learnvault_topics',
  DOCUMENTS: 'learnvault_documents',
  VIDEOS: 'learnvault_videos',
  PROJECTS: 'learnvault_projects',
  NOTES: 'learnvault_notes',
  BOOKMARKS: 'learnvault_bookmarks',
  ACTIVITIES: 'learnvault_activities',
  FAVORITES: 'learnvault_favorites',
  INITIALIZED: 'learnvault_initialized_v2',
};

// Helper: load array from localStorage
function getStoredArray(key, defaultData = []) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultData;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`Failed to parse ${key} from localStorage:`, err);
    return defaultData;
  }
}

// Helper: save array to localStorage
function setStoredArray(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error(`Failed to save ${key} to localStorage:`, err);
  }
}

// Generate unique ID
function generateId() {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).substring(2, 9);
}

// Initialize seed data once on first run
function initializeStorage() {
  const isInit = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInit) {
    setStoredArray(STORAGE_KEYS.TOPICS, initialSeedData.topics || []);
    setStoredArray(STORAGE_KEYS.DOCUMENTS, initialSeedData.documents || []);
    setStoredArray(STORAGE_KEYS.VIDEOS, initialSeedData.videos || []);
    setStoredArray(STORAGE_KEYS.PROJECTS, initialSeedData.projects || []);
    setStoredArray(STORAGE_KEYS.BOOKMARKS, initialSeedData.bookmarks || []);
    setStoredArray(STORAGE_KEYS.NOTES, []);
    setStoredArray(STORAGE_KEYS.ACTIVITIES, [
      {
        _id: generateId(),
        actionType: 'open_topic',
        entityTitle: 'Programming Fundamentals',
        topicTitle: 'Programming Fundamentals',
        createdAt: new Date().toISOString(),
      },
    ]);
    setStoredArray(STORAGE_KEYS.FAVORITES, []);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  }

  // Purge any legacy MongoDB documents that were previously cached in localStorage
  const PURGE_KEY = 'learnvault_purged_mongo_docs_v2';
  if (!localStorage.getItem(PURGE_KEY)) {
    setStoredArray(STORAGE_KEYS.DOCUMENTS, []);
    localStorage.setItem(PURGE_KEY, 'true');
  }
}

// Run initial storage check
initializeStorage();

// Object URL cache for local blob downloads
const blobUrlCache = new Map();

export const api = {
  // ==========================================
  // TOPICS
  // ==========================================
  async getTopics(params) {
    let topics = getStoredArray(STORAGE_KEYS.TOPICS);
    const docs = getStoredArray(STORAGE_KEYS.DOCUMENTS);
    const videos = getStoredArray(STORAGE_KEYS.VIDEOS);
    const projects = getStoredArray(STORAGE_KEYS.PROJECTS);
    const notes = getStoredArray(STORAGE_KEYS.NOTES);
    const bookmarks = getStoredArray(STORAGE_KEYS.BOOKMARKS);

    if (params?.category && params.category !== 'All') {
      topics = topics.filter((t) => t.category === params.category);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      topics = topics.filter(
        (t) => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
      );
    }

    return topics.map((t) => {
      const topicId = t._id?.toString();
      return {
        ...t,
        counts: {
          documents: docs.filter((d) => (d.topic?._id || d.topic)?.toString() === topicId).length,
          videos: videos.filter((v) => (v.topic?._id || v.topic)?.toString() === topicId).length,
          projects: projects.filter((p) => (p.topic?._id || p.topic)?.toString() === topicId).length,
          notes: notes.filter((n) => (n.topic?._id || n.topic)?.toString() === topicId).length,
          bookmarks: bookmarks.filter((b) => (b.topic?._id || b.topic)?.toString() === topicId).length,
        },
      };
    });
  },

  async getTopicById(id) {
    const topics = getStoredArray(STORAGE_KEYS.TOPICS);
    const topic = topics.find((t) => t._id?.toString() === id?.toString());
    if (!topic) throw new Error('Topic not found');

    const docs = getStoredArray(STORAGE_KEYS.DOCUMENTS);
    const videos = getStoredArray(STORAGE_KEYS.VIDEOS);
    const projects = getStoredArray(STORAGE_KEYS.PROJECTS);
    const notes = getStoredArray(STORAGE_KEYS.NOTES);
    const bookmarks = getStoredArray(STORAGE_KEYS.BOOKMARKS);

    const topicIdStr = topic._id?.toString();

    // Populate related entities
    const topicDocs = docs.filter((d) => (d.topic?._id || d.topic)?.toString() === topicIdStr);
    const topicVideos = videos.filter((v) => (v.topic?._id || v.topic)?.toString() === topicIdStr);
    const topicProjects = projects.filter((p) => (p.topic?._id || p.topic)?.toString() === topicIdStr);
    const topicNotes = notes.filter((n) => (n.topic?._id || n.topic)?.toString() === topicIdStr);
    const topicBookmarks = bookmarks.filter((b) => (b.topic?._id || b.topic)?.toString() === topicIdStr);
    const subtopics = topics.filter((t) => t.parentTopic?.toString() === topicIdStr);

    // Build breadcrumbs
    const breadcrumbs = [
      { id: topic._id, title: topic.title, slug: topic.slug || topic.title },
    ];

    // Log Activity
    this.recordActivity('open_topic', topic.title, 'topic', topic._id);

    return {
      topic,
      breadcrumbs,
      subtopics,
      documents: topicDocs,
      videos: topicVideos,
      projects: topicProjects,
      notes: topicNotes,
      bookmarks: topicBookmarks,
    };
  },

  async createTopic(topicData) {
    const topics = getStoredArray(STORAGE_KEYS.TOPICS);
    const newTopic = {
      _id: generateId(),
      title: topicData.title.trim(),
      description: topicData.description?.trim() || '',
      category: topicData.category || 'Programming Languages',
      parentTopic: topicData.parentTopic || null,
      level: topicData.parentTopic ? 1 : 0,
      path: `${topicData.category} / ${topicData.title}`,
      order: topics.length + 1,
      icon: topicData.icon || 'Folder',
      colorAccent: '#8b5cf6',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    topics.push(newTopic);
    setStoredArray(STORAGE_KEYS.TOPICS, topics);
    return newTopic;
  },

  async updateTopic(id, topicData) {
    const topics = getStoredArray(STORAGE_KEYS.TOPICS);
    const idx = topics.findIndex((t) => t._id?.toString() === id?.toString());
    if (idx === -1) throw new Error('Topic not found');

    topics[idx] = {
      ...topics[idx],
      ...topicData,
      updatedAt: new Date().toISOString(),
    };
    setStoredArray(STORAGE_KEYS.TOPICS, topics);
    return topics[idx];
  },

  async deleteTopic(id) {
    let topics = getStoredArray(STORAGE_KEYS.TOPICS);
    topics = topics.filter((t) => t._id?.toString() !== id?.toString());
    setStoredArray(STORAGE_KEYS.TOPICS, topics);
    return { success: true };
  },

  // ==========================================
  // DOCUMENTS (Local + Google Drive)
  // ==========================================
  async getDocuments(params) {
    let docs = getStoredArray(STORAGE_KEYS.DOCUMENTS);
    const topics = getStoredArray(STORAGE_KEYS.TOPICS);
    const videos = getStoredArray(STORAGE_KEYS.VIDEOS);

    // Populate topic and video objects
    docs = docs.map((d) => {
      const topicObj = typeof d.topic === 'object' && d.topic?._id
        ? d.topic
        : topics.find((t) => t._id?.toString() === d.topic?.toString()) || { title: 'General', category: d.category };

      const videoObj = typeof d.relatedVideo === 'object' && d.relatedVideo?._id
        ? d.relatedVideo
        : videos.find((v) => v._id?.toString() === d.relatedVideo?.toString()) || null;

      return {
        ...d,
        topic: topicObj,
        relatedVideo: videoObj,
      };
    });

    if (params?.topic) {
      docs = docs.filter((d) => (d.topic?._id || d.topic)?.toString() === params.topic?.toString());
    }
    if (params?.category && params.category !== 'All') {
      docs = docs.filter((d) => d.category === params.category || d.topic?.category === params.category);
    }
    if (params?.tag) {
      docs = docs.filter((d) => d.tags && d.tags.includes(params.tag));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      docs = docs.filter(
        (d) =>
          d.title?.toLowerCase().includes(q) ||
          d.description?.toLowerCase().includes(q) ||
          d.originalFilename?.toLowerCase().includes(q) ||
          (d.tags && d.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    if (params?.sort === 'title') {
      docs.sort((a, b) => a.title.localeCompare(b.title));
    } else if (params?.sort === 'views') {
      docs.sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0));
    } else if (params?.sort === 'popular') {
      docs.sort((a, b) => (b.downloadCount || 0) - (a.downloadCount || 0));
    } else {
      docs.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }

    return docs;
  },

  async getDocumentById(id) {
    const docs = getStoredArray(STORAGE_KEYS.DOCUMENTS);
    const topics = getStoredArray(STORAGE_KEYS.TOPICS);
    const videos = getStoredArray(STORAGE_KEYS.VIDEOS);

    const doc = docs.find((d) => d._id?.toString() === id?.toString());
    if (!doc) throw new Error('Document not found');

    const topicObj = typeof doc.topic === 'object' && doc.topic?._id
      ? doc.topic
      : topics.find((t) => t._id?.toString() === doc.topic?.toString()) || { title: 'General' };

    const videoObj = typeof doc.relatedVideo === 'object' && doc.relatedVideo?._id
      ? doc.relatedVideo
      : videos.find((v) => v._id?.toString() === doc.relatedVideo?.toString()) || null;

    let textContent = doc.textContent || null;

    // If it's a text/markdown file stored in IndexedDB without textContent in metadata
    if (!textContent && ['txt', 'md', 'markdown'].includes(doc.fileType?.toLowerCase())) {
      const fileData = await fileStorage.getFile(doc._id);
      if (fileData) {
        if (typeof fileData === 'string') {
          textContent = fileData;
        } else if (fileData instanceof Blob) {
          textContent = await fileData.text();
        }
      }
    }

    // Increment view count
    doc.viewCount = (doc.viewCount || 0) + 1;
    doc.lastViewedAt = new Date().toISOString();
    setStoredArray(STORAGE_KEYS.DOCUMENTS, docs);

    // Record activity
    this.recordActivity('view_document', doc.title, 'document', doc._id);

    return {
      document: {
        ...doc,
        topic: topicObj,
        relatedVideo: videoObj,
      },
      textContent,
    };
  },

  // Document View URL for modals/iframes
  getDocumentViewUrl(id) {
    const docs = getStoredArray(STORAGE_KEYS.DOCUMENTS);
    const doc = docs.find((d) => d._id?.toString() === id?.toString());
    if (!doc) return '';

    // If Google Drive link/ID present
    if (doc.driveFileId) {
      return driveService.getPreviewUrl(doc.driveFileId);
    }
    if (doc.driveUrl) {
      const fileId = driveService.extractDriveFileId(doc.driveUrl);
      if (fileId) return driveService.getPreviewUrl(fileId);
      return doc.driveUrl;
    }

    // If data URL exists (from seed data)
    if (doc.fileDataUrl) {
      return doc.fileDataUrl;
    }

    // Check blob URL cache
    if (blobUrlCache.has(doc._id)) {
      return blobUrlCache.get(doc._id);
    }

    return '';
  },

  // Document Download URL
  getDocumentDownloadUrl(id) {
    const docs = getStoredArray(STORAGE_KEYS.DOCUMENTS);
    const doc = docs.find((d) => d._id?.toString() === id?.toString());
    if (!doc) return '#';

    // Google Drive direct download link
    if (doc.driveFileId) {
      return driveService.getDirectDownloadUrl(doc.driveFileId);
    }
    if (doc.driveUrl) {
      const fileId = driveService.extractDriveFileId(doc.driveUrl);
      if (fileId) return driveService.getDirectDownloadUrl(fileId);
    }

    // Embedded data URL
    if (doc.fileDataUrl) {
      return doc.fileDataUrl;
    }

    if (blobUrlCache.has(doc._id)) {
      return blobUrlCache.get(doc._id);
    }

    return '#';
  },

  // Programmatic direct download for both local and Google Drive files
  async downloadDocument(doc) {
    if (!doc) return;

    // 1. Google Drive document
    if (doc.driveFileId || (doc.driveUrl && driveService.extractDriveFileId(doc.driveUrl))) {
      const fileId = doc.driveFileId || driveService.extractDriveFileId(doc.driveUrl);
      const dlUrl = driveService.getDirectDownloadUrl(fileId);
      window.open(dlUrl, '_blank');
      this.incrementDownloadCount(doc._id);
      return;
    }

    // 2. Data URL document
    if (doc.fileDataUrl) {
      const a = document.createElement('a');
      a.href = doc.fileDataUrl;
      a.download = doc.originalFilename || doc.title || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      this.incrementDownloadCount(doc._id);
      return;
    }

    // 3. IndexedDB stored Blob
    const fileData = await fileStorage.getFile(doc._id);
    if (fileData) {
      let blob = fileData;
      if (!(blob instanceof Blob)) {
        blob = new Blob([fileData], { type: doc.mimeType || 'application/octet-stream' });
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.originalFilename || doc.title || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => URL.revokeObjectURL(url), 4000);
      this.incrementDownloadCount(doc._id);
      return;
    }

    alert('Document file could not be downloaded.');
  },

  incrementDownloadCount(id) {
    const docs = getStoredArray(STORAGE_KEYS.DOCUMENTS);
    const doc = docs.find((d) => d._id?.toString() === id?.toString());
    if (doc) {
      doc.downloadCount = (doc.downloadCount || 0) + 1;
      setStoredArray(STORAGE_KEYS.DOCUMENTS, docs);
    }
  },

  // Upload Document (Supports Local Files + Google Drive Links)
  async uploadDocument(formDataOrObject) {
    const docs = getStoredArray(STORAGE_KEYS.DOCUMENTS);
    const docId = generateId();

    let file = null;
    let title = '';
    let description = '';
    let topicId = '';
    let category = 'Programming Languages';
    let tagsStr = '';
    let relatedVideo = null;
    let videoUrl = '';
    let videoTitle = '';
    let driveUrl = '';

    if (formDataOrObject instanceof FormData) {
      file = formDataOrObject.get('file');
      title = formDataOrObject.get('title') || '';
      description = formDataOrObject.get('description') || '';
      topicId = formDataOrObject.get('topic') || '';
      category = formDataOrObject.get('category') || 'Programming Languages';
      tagsStr = formDataOrObject.get('tags') || '';
      relatedVideo = formDataOrObject.get('relatedVideo') || null;
      videoUrl = formDataOrObject.get('videoUrl') || '';
      videoTitle = formDataOrObject.get('videoTitle') || '';
      driveUrl = formDataOrObject.get('driveUrl') || '';
    } else {
      file = formDataOrObject.file;
      title = formDataOrObject.title || '';
      description = formDataOrObject.description || '';
      topicId = formDataOrObject.topic || '';
      category = formDataOrObject.category || 'Programming Languages';
      tagsStr = formDataOrObject.tags || '';
      relatedVideo = formDataOrObject.relatedVideo || null;
      videoUrl = formDataOrObject.videoUrl || '';
      videoTitle = formDataOrObject.videoTitle || '';
      driveUrl = formDataOrObject.driveUrl || '';
    }

    const tags = Array.isArray(tagsStr)
      ? tagsStr
      : String(tagsStr).split(',').map((t) => t.trim()).filter(Boolean);

    // Check if Google Drive link provided
    const driveFileId = driveService.extractDriveFileId(driveUrl || (typeof file === 'string' ? file : ''));
    const isDrive = !!driveFileId;

    let originalFilename = title;
    let fileType = 'pdf';
    let mimeType = 'application/pdf';
    let fileSize = 0;
    let textContent = null;
    let fileDataUrl = '';

    if (isDrive) {
      fileType = 'gdrive';
      mimeType = 'application/vnd.google-apps.file';
      originalFilename = originalFilename.includes('.') ? originalFilename : `${originalFilename}.gdrive`;
      fileSize = 1024 * 50; // estimate
    } else if (file && file instanceof File) {
      originalFilename = file.name;
      const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
      fileType = ext;
      mimeType = file.type || 'application/octet-stream';
      fileSize = file.size;

      // If text/markdown, read text directly
      if (['txt', 'md', 'markdown'].includes(ext)) {
        textContent = await file.text();
      }

      // Save file blob to IndexedDB
      await fileStorage.saveFile(docId, file);

      // Create local object URL for preview
      const localUrl = URL.createObjectURL(file);
      blobUrlCache.set(docId, localUrl);
    }

    // Auto-create video if pasted videoUrl provided
    if (videoUrl && !relatedVideo) {
      try {
        const vid = await this.addVideo({
          youtubeUrl: videoUrl,
          title: videoTitle || `${title} Tutorial Video`,
          topic: topicId,
          tags: tags,
        });
        if (vid) relatedVideo = vid._id;
      } catch (err) {
        console.warn('Failed to auto-add video:', err);
      }
    }

    const newDoc = {
      _id: docId,
      title: title || originalFilename,
      description,
      topic: topicId,
      category,
      tags,
      originalFilename,
      fileType,
      mimeType,
      fileSize,
      textContent,
      fileDataUrl,
      driveUrl: driveUrl || (isDrive ? driveService.getViewUrl(driveFileId) : ''),
      driveFileId: driveFileId || '',
      isDrive,
      viewCount: 0,
      downloadCount: 0,
      relatedVideo,
      videoUrl,
      videoTitle,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    docs.unshift(newDoc);
    setStoredArray(STORAGE_KEYS.DOCUMENTS, docs);

    // Record activity
    this.recordActivity('add_document', newDoc.title, 'document', newDoc._id);

    return {
      message: 'Document saved successfully to LearnVault.',
      document: newDoc,
    };
  },

  async updateDocumentMetadata(id, metadata) {
    const docs = getStoredArray(STORAGE_KEYS.DOCUMENTS);
    const idx = docs.findIndex((d) => d._id?.toString() === id?.toString());
    if (idx === -1) throw new Error('Document not found');

    docs[idx] = {
      ...docs[idx],
      ...metadata,
      updatedAt: new Date().toISOString(),
    };
    setStoredArray(STORAGE_KEYS.DOCUMENTS, docs);
    return docs[idx];
  },

  async deleteDocument(id) {
    let docs = getStoredArray(STORAGE_KEYS.DOCUMENTS);
    docs = docs.filter((d) => d._id?.toString() !== id?.toString());
    setStoredArray(STORAGE_KEYS.DOCUMENTS, docs);
    await fileStorage.deleteFile(id);
    blobUrlCache.delete(id);
    return { success: true };
  },

  // ==========================================
  // VIDEOS
  // ==========================================
  async getVideos(params) {
    let videos = getStoredArray(STORAGE_KEYS.VIDEOS);
    const topics = getStoredArray(STORAGE_KEYS.TOPICS);

    videos = videos.map((v) => ({
      ...v,
      topic: typeof v.topic === 'object' && v.topic?._id
        ? v.topic
        : topics.find((t) => t._id?.toString() === v.topic?.toString()) || { title: 'General' },
    }));

    if (params?.topic) {
      videos = videos.filter((v) => (v.topic?._id || v.topic)?.toString() === params.topic?.toString());
    }
    if (params?.tag) {
      videos = videos.filter((v) => v.tags && v.tags.includes(params.tag));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      videos = videos.filter(
        (v) =>
          v.title?.toLowerCase().includes(q) ||
          v.channelName?.toLowerCase().includes(q) ||
          (v.tags && v.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    videos.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return videos;
  },

  async addVideo(videoData) {
    const videos = getStoredArray(STORAGE_KEYS.VIDEOS);

    // Extract YouTube ID
    const url = videoData.youtubeUrl?.trim() || '';
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    const youtubeId = match && match[2].length === 11 ? match[2] : 'dQw4w9WgXcQ';

    const newVideo = {
      _id: generateId(),
      title: videoData.title.trim(),
      description: videoData.description?.trim() || '',
      youtubeUrl: url,
      youtubeId,
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      channelName: videoData.channelName?.trim() || 'YouTube Educator',
      topic: videoData.topic,
      tags: Array.isArray(videoData.tags)
        ? videoData.tags
        : String(videoData.tags || '').split(',').map((t) => t.trim()).filter(Boolean),
      duration: videoData.duration || 'Video Tutorial',
      watchCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    videos.unshift(newVideo);
    setStoredArray(STORAGE_KEYS.VIDEOS, videos);
    return newVideo;
  },

  async recordVideoWatch(id) {
    const videos = getStoredArray(STORAGE_KEYS.VIDEOS);
    const video = videos.find((v) => v._id?.toString() === id?.toString());
    if (video) {
      video.watchCount = (video.watchCount || 0) + 1;
      video.lastWatchedAt = new Date().toISOString();
      setStoredArray(STORAGE_KEYS.VIDEOS, videos);
      this.recordActivity('watch_video', video.title, 'video', video._id);
    }
  },

  async updateVideo(id, videoData) {
    const videos = getStoredArray(STORAGE_KEYS.VIDEOS);
    const idx = videos.findIndex((v) => v._id?.toString() === id?.toString());
    if (idx === -1) throw new Error('Video not found');

    videos[idx] = {
      ...videos[idx],
      ...videoData,
      updatedAt: new Date().toISOString(),
    };
    setStoredArray(STORAGE_KEYS.VIDEOS, videos);
    return videos[idx];
  },

  async deleteVideo(id) {
    let videos = getStoredArray(STORAGE_KEYS.VIDEOS);
    videos = videos.filter((v) => v._id?.toString() !== id?.toString());
    setStoredArray(STORAGE_KEYS.VIDEOS, videos);
    return { success: true };
  },

  // ==========================================
  // PROJECTS (with Google Drive Folder Support)
  // ==========================================
  async getProjects(params) {
    let projects = getStoredArray(STORAGE_KEYS.PROJECTS);
    const topics = getStoredArray(STORAGE_KEYS.TOPICS);
    const docs = getStoredArray(STORAGE_KEYS.DOCUMENTS);
    const videos = getStoredArray(STORAGE_KEYS.VIDEOS);

    projects = projects.map((p) => {
      const topicObj = typeof p.topic === 'object' && p.topic?._id
        ? p.topic
        : topics.find((t) => t._id?.toString() === p.topic?.toString()) || { title: 'General' };

      const relatedDocs = Array.isArray(p.relatedDocuments)
        ? p.relatedDocuments.map((docId) =>
            typeof docId === 'object' ? docId : docs.find((d) => d._id?.toString() === docId?.toString())
          ).filter(Boolean)
        : [];

      const relatedVids = Array.isArray(p.relatedVideos)
        ? p.relatedVideos.map((vidId) =>
            typeof vidId === 'object' ? vidId : videos.find((v) => v._id?.toString() === vidId?.toString())
          ).filter(Boolean)
        : [];

      return {
        ...p,
        topic: topicObj,
        relatedDocuments: relatedDocs,
        relatedVideos: relatedVids,
        driveFolderUrl: driveService.getProjectDriveUrl(p),
      };
    });

    if (params?.topic) {
      projects = projects.filter((p) => (p.topic?._id || p.topic)?.toString() === params.topic?.toString());
    }
    if (params?.status) {
      projects = projects.filter((p) => p.status === params.status);
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      projects = projects.filter(
        (p) =>
          p.title?.toLowerCase().includes(q) ||
          p.technology?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
      );
    }

    projects.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    return projects;
  },

  async getProjectById(id) {
    const projects = await this.getProjects();
    const project = projects.find((p) => p._id?.toString() === id?.toString());
    if (!project) throw new Error('Project not found');
    return project;
  },

  async createProject(projectData) {
    const projects = getStoredArray(STORAGE_KEYS.PROJECTS);

    const newProject = {
      _id: generateId(),
      title: projectData.title.trim(),
      technology: projectData.technology?.trim() || '',
      description: projectData.description?.trim() || '',
      status: projectData.status || 'Completed',
      githubUrl: projectData.githubUrl?.trim() || '',
      demoUrl: projectData.demoUrl?.trim() || '',
      driveFolderUrl: projectData.driveFolderUrl?.trim() || '',
      driveFolderId: projectData.driveFolderId?.trim() || '',
      topic: projectData.topic,
      relatedDocuments: projectData.relatedDocuments || [],
      relatedVideos: projectData.relatedVideos || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    projects.unshift(newProject);
    setStoredArray(STORAGE_KEYS.PROJECTS, projects);
    return newProject;
  },

  async updateProject(id, projectData) {
    const projects = getStoredArray(STORAGE_KEYS.PROJECTS);
    const idx = projects.findIndex((p) => p._id?.toString() === id?.toString());
    if (idx === -1) throw new Error('Project not found');

    projects[idx] = {
      ...projects[idx],
      ...projectData,
      updatedAt: new Date().toISOString(),
    };
    setStoredArray(STORAGE_KEYS.PROJECTS, projects);
    return projects[idx];
  },

  async deleteProject(id) {
    let projects = getStoredArray(STORAGE_KEYS.PROJECTS);
    projects = projects.filter((p) => p._id?.toString() !== id?.toString());
    setStoredArray(STORAGE_KEYS.PROJECTS, projects);
    return { success: true };
  },

  // ==========================================
  // NOTES & BOOKMARKS
  // ==========================================
  async getNotes(params) {
    let notes = getStoredArray(STORAGE_KEYS.NOTES);
    if (params?.topic) {
      notes = notes.filter((n) => n.topic?.toString() === params.topic?.toString());
    }
    return notes;
  },

  async createNote(noteData) {
    const notes = getStoredArray(STORAGE_KEYS.NOTES);
    const newNote = {
      _id: generateId(),
      title: noteData.title,
      content: noteData.content,
      topic: noteData.topic,
      tags: noteData.tags || [],
      isPinned: false,
      createdAt: new Date().toISOString(),
    };
    notes.unshift(newNote);
    setStoredArray(STORAGE_KEYS.NOTES, notes);
    return newNote;
  },

  async updateNote(id, noteData) {
    const notes = getStoredArray(STORAGE_KEYS.NOTES);
    const idx = notes.findIndex((n) => n._id?.toString() === id?.toString());
    if (idx !== -1) {
      notes[idx] = { ...notes[idx], ...noteData };
      setStoredArray(STORAGE_KEYS.NOTES, notes);
      return notes[idx];
    }
    throw new Error('Note not found');
  },

  async deleteNote(id) {
    let notes = getStoredArray(STORAGE_KEYS.NOTES);
    notes = notes.filter((n) => n._id?.toString() !== id?.toString());
    setStoredArray(STORAGE_KEYS.NOTES, notes);
    return { success: true };
  },

  async getBookmarks(params) {
    let bookmarks = getStoredArray(STORAGE_KEYS.BOOKMARKS);
    if (params?.topic) {
      bookmarks = bookmarks.filter((b) => b.topic?.toString() === params.topic?.toString());
    }
    return bookmarks;
  },

  async createBookmark(bookmarkData) {
    const bookmarks = getStoredArray(STORAGE_KEYS.BOOKMARKS);
    const newBookmark = {
      _id: generateId(),
      title: bookmarkData.title,
      url: bookmarkData.url,
      description: bookmarkData.description || '',
      topic: bookmarkData.topic,
      category: bookmarkData.category || 'Documentation',
      tags: bookmarkData.tags || [],
      createdAt: new Date().toISOString(),
    };
    bookmarks.unshift(newBookmark);
    setStoredArray(STORAGE_KEYS.BOOKMARKS, bookmarks);
    return newBookmark;
  },

  async updateBookmark(id, bookmarkData) {
    const bookmarks = getStoredArray(STORAGE_KEYS.BOOKMARKS);
    const idx = bookmarks.findIndex((b) => b._id?.toString() === id?.toString());
    if (idx !== -1) {
      bookmarks[idx] = { ...bookmarks[idx], ...bookmarkData };
      setStoredArray(STORAGE_KEYS.BOOKMARKS, bookmarks);
      return bookmarks[idx];
    }
    throw new Error('Bookmark not found');
  },

  async deleteBookmark(id) {
    let bookmarks = getStoredArray(STORAGE_KEYS.BOOKMARKS);
    bookmarks = bookmarks.filter((b) => b._id?.toString() !== id?.toString());
    setStoredArray(STORAGE_KEYS.BOOKMARKS, bookmarks);
    return { success: true };
  },

  // ==========================================
  // GLOBAL SEARCH
  // ==========================================
  async search(query) {
    if (!query || !query.trim()) return {};
    const q = query.trim().toLowerCase();

    const topics = (await this.getTopics()).filter(
      (t) => t.title?.toLowerCase().includes(q) || t.description?.toLowerCase().includes(q)
    );
    const documents = (await this.getDocuments()).filter(
      (d) => d.title?.toLowerCase().includes(q) || d.originalFilename?.toLowerCase().includes(q)
    );
    const videos = (await this.getVideos()).filter(
      (v) => v.title?.toLowerCase().includes(q) || v.channelName?.toLowerCase().includes(q)
    );
    const projects = (await this.getProjects()).filter(
      (p) => p.title?.toLowerCase().includes(q) || p.technology?.toLowerCase().includes(q)
    );

    return { topics, documents, videos, projects };
  },

  // ==========================================
  // ACTIVITIES & DASHBOARD SUMMARY
  // ==========================================
  async getActivities() {
    const topics = getStoredArray(STORAGE_KEYS.TOPICS);
    const docs = await this.getDocuments();
    const videos = await this.getVideos();
    const projects = await this.getProjects();
    const activities = getStoredArray(STORAGE_KEYS.ACTIVITIES);

    // Continue learning items
    const continueLearning = topics.slice(0, 4).map((t) => ({
      topicId: t._id,
      topicTitle: t.title,
      lastAction: 'Continue Study',
      lastOpenedTitle: t.description || t.title,
      updatedAt: t.updatedAt || new Date().toISOString(),
    }));

    return {
      recentActivities: activities.slice(0, 10),
      recentlyViewedDocs: docs.slice(0, 4),
      recentlyAddedDocs: docs.slice(0, 4),
      recentlyWatchedVideos: videos.slice(0, 6),
      recentlyAddedVideos: videos.slice(0, 6),
      recentlyAddedProjects: projects.slice(0, 4),
      continueLearning,
    };
  },

  recordActivity(actionType, entityTitle, entityType, entityId) {
    const activities = getStoredArray(STORAGE_KEYS.ACTIVITIES);
    activities.unshift({
      _id: generateId(),
      actionType,
      entityTitle,
      entityType,
      entityId,
      createdAt: new Date().toISOString(),
    });
    setStoredArray(STORAGE_KEYS.ACTIVITIES, activities.slice(0, 50));
  },

  // ==========================================
  // FAVORITES
  // ==========================================
  async getFavorites() {
    return getStoredArray(STORAGE_KEYS.FAVORITES);
  },

  async toggleFavorite(itemType, itemId) {
    let favs = getStoredArray(STORAGE_KEYS.FAVORITES);
    const exists = favs.some((f) => f.itemType === itemType && f.itemId === itemId);
    if (exists) {
      favs = favs.filter((f) => !(f.itemType === itemType && f.itemId === itemId));
    } else {
      favs.push({ itemType, itemId, createdAt: new Date().toISOString() });
    }
    setStoredArray(STORAGE_KEYS.FAVORITES, favs);
    return { favorited: !exists };
  },

  // ==========================================
  // AUTH STUBS (Pure Open Access)
  // ==========================================
  async login() {
    return { success: true, token: 'local_token' };
  },
  async getMe() {
    return {
      _id: 'local_user',
      name: 'LearnVault Scholar',
      email: 'learner@learnvault.local',
      role: 'admin',
    };
  },
  async getAdminStats() {
    const topics = getStoredArray(STORAGE_KEYS.TOPICS);
    const docs = getStoredArray(STORAGE_KEYS.DOCUMENTS);
    const videos = getStoredArray(STORAGE_KEYS.VIDEOS);
    const projects = getStoredArray(STORAGE_KEYS.PROJECTS);
    return {
      totalTopics: topics.length,
      totalDocuments: docs.length,
      totalVideos: videos.length,
      totalProjects: projects.length,
    };
  },
  async getUsers() {
    return [{ _id: 'local_user', name: 'LearnVault Scholar', email: 'scholar@local', role: 'admin' }];
  },
  async createUser() {
    return { success: true };
  },
  async deleteUser() {
    return { success: true };
  },

  // ==========================================
  // BACKUP & RESTORE (For saving to Google Drive / Disk)
  // ==========================================
  exportBackup() {
    const data = {
      version: 2,
      exportedAt: new Date().toISOString(),
      topics: getStoredArray(STORAGE_KEYS.TOPICS),
      documents: getStoredArray(STORAGE_KEYS.DOCUMENTS),
      videos: getStoredArray(STORAGE_KEYS.VIDEOS),
      projects: getStoredArray(STORAGE_KEYS.PROJECTS),
      bookmarks: getStoredArray(STORAGE_KEYS.BOOKMARKS),
      notes: getStoredArray(STORAGE_KEYS.NOTES),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `LearnVault_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
  },

  async importBackup(jsonString) {
    try {
      const data = typeof jsonString === 'string' ? JSON.parse(jsonString) : jsonString;
      if (data.topics) setStoredArray(STORAGE_KEYS.TOPICS, data.topics);
      if (data.documents) setStoredArray(STORAGE_KEYS.DOCUMENTS, data.documents);
      if (data.videos) setStoredArray(STORAGE_KEYS.VIDEOS, data.videos);
      if (data.projects) setStoredArray(STORAGE_KEYS.PROJECTS, data.projects);
      if (data.bookmarks) setStoredArray(STORAGE_KEYS.BOOKMARKS, data.bookmarks);
      if (data.notes) setStoredArray(STORAGE_KEYS.NOTES, data.notes);
      return { success: true };
    } catch (err) {
      throw new Error('Invalid LearnVault backup JSON file.');
    }
  },
};
