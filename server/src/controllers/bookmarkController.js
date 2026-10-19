import { Bookmark } from '../models/Bookmark.js';
import { Topic } from '../models/Topic.js';

export const getBookmarks = async (req, res) => {
  try {
    const { topic, category, search } = req.query;
    const filter = {};

    if (topic) filter.topic = topic;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { url: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(String(search), 'i')] } },
      ];
    }

    const bookmarks = await Bookmark.find(filter)
      .populate('topic', 'title slug category')
      .sort({ createdAt: -1 });

    res.json(bookmarks);
  } catch (error) {
    console.error('getBookmarks error:', error);
    res.status(500).json({ message: 'Error retrieving bookmarks' });
  }
};

export const createBookmark = async (req, res) => {
  try {
    const { title, url, description, topic, category, tags } = req.body;

    if (!title || !url || !topic) {
      return res.status(400).json({ message: 'Title, URL, and Topic are required' });
    }

    const topicObj = await Topic.findById(topic);
    if (!topicObj) {
      return res.status(400).json({ message: 'Selected topic does not exist' });
    }

    const tagList = tags
      ? (typeof tags === 'string' ? tags.split(',') : tags).map((t) => t.trim()).filter(Boolean)
      : [];

    const bookmark = new Bookmark({
      title: title.trim(),
      url: url.trim(),
      description: description?.trim() || '',
      topic: topicObj._id,
      category: category || 'Documentation',
      tags: tagList,
      createdBy: req.user?._id,
    });

    await bookmark.save();
    const populated = await Bookmark.findById(bookmark._id).populate('topic', 'title slug category');
    res.status(201).json(populated);
  } catch (error) {
    console.error('createBookmark error:', error);
    res.status(500).json({ message: error.message || 'Error creating bookmark' });
  }
};

export const updateBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url, description, topic, category, tags } = req.body;

    const bookmark = await Bookmark.findById(id);
    if (!bookmark) {
      return res.status(404).json({ message: 'Bookmark not found' });
    }

    if (title) bookmark.title = title.trim();
    if (url) bookmark.url = url.trim();
    if (description !== undefined) bookmark.description = description.trim();
    if (category) bookmark.category = category;
    if (topic) {
      const topicObj = await Topic.findById(topic);
      if (topicObj) bookmark.topic = topicObj._id;
    }
    if (tags !== undefined) {
      bookmark.tags = (typeof tags === 'string' ? tags.split(',') : tags).map((t) => t.trim()).filter(Boolean);
    }

    await bookmark.save();
    const populated = await Bookmark.findById(bookmark._id).populate('topic', 'title slug category');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating bookmark' });
  }
};

export const deleteBookmark = async (req, res) => {
  try {
    const { id } = req.params;
    await Bookmark.findByIdAndDelete(id);
    res.json({ message: 'Bookmark deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting bookmark' });
  }
};
