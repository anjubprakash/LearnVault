import { Topic } from '../models/Topic.js';
import { DocumentItem } from '../models/Document.js';
import { Video } from '../models/Video.js';
import { Project } from '../models/Project.js';
import { Note } from '../models/Note.js';
import { Bookmark } from '../models/Bookmark.js';

export const globalSearch = async (req, res) => {
  try {
    const query = typeof req.query.q === 'string' ? req.query.q.trim() : '';

    if (!query) {
      return res.json({
        topics: [],
        documents: [],
        videos: [],
        projects: [],
        notes: [],
        bookmarks: [],
        totalResults: 0,
      });
    }

    const regex = new RegExp(query, 'i');

    const [topics, documents, videos, projects, notes, bookmarks] = await Promise.all([
      Topic.find({
        $or: [{ title: regex }, { description: regex }, { category: regex }],
      })
        .select('title slug description category level path icon colorAccent')
        .limit(10),

      DocumentItem.find({
        $or: [{ title: regex }, { description: regex }, { originalFilename: regex }, { tags: { $in: [regex] } }],
      })
        .populate('topic', 'title slug')
        .limit(15),

      Video.find({
        $or: [{ title: regex }, { description: regex }, { channelName: regex }, { tags: { $in: [regex] } }],
      })
        .populate('topic', 'title slug')
        .limit(15),

      Project.find({
        $or: [{ title: regex }, { technology: regex }, { description: regex }],
      })
        .populate('topic', 'title slug')
        .limit(10),

      Note.find({
        $or: [{ title: regex }, { content: regex }, { tags: { $in: [regex] } }],
      })
        .populate('topic', 'title slug')
        .limit(10),

      Bookmark.find({
        $or: [{ title: regex }, { url: regex }, { description: regex }, { tags: { $in: [regex] } }],
      })
        .populate('topic', 'title slug')
        .limit(10),
    ]);

    const totalResults =
      topics.length + documents.length + videos.length + projects.length + notes.length + bookmarks.length;

    res.json({
      query,
      topics,
      documents,
      videos,
      projects,
      notes,
      bookmarks,
      totalResults,
    });
  } catch (error) {
    console.error('globalSearch error:', error);
    res.status(500).json({ message: 'Error performing global search' });
  }
};
