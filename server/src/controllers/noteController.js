import { Note } from '../models/Note.js';
import { Topic } from '../models/Topic.js';

export const getNotes = async (req, res) => {
  try {
    const { topic, search } = req.query;
    const filter = {};

    if (topic) filter.topic = topic;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(String(search), 'i')] } },
      ];
    }

    const notes = await Note.find(filter)
      .populate('topic', 'title slug category')
      .sort({ isPinned: -1, createdAt: -1 });

    res.json(notes);
  } catch (error) {
    console.error('getNotes error:', error);
    res.status(500).json({ message: 'Error retrieving notes' });
  }
};

export const getNoteById = async (req, res) => {
  try {
    const { id } = req.params;
    const note = await Note.findById(id).populate('topic', 'title slug category');
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving note' });
  }
};

export const createNote = async (req, res) => {
  try {
    const { title, content, topic, tags, isPinned } = req.body;

    if (!title || !content || !topic) {
      return res.status(400).json({ message: 'Title, content, and topic are required' });
    }

    const topicObj = await Topic.findById(topic);
    if (!topicObj) {
      return res.status(400).json({ message: 'Selected topic does not exist' });
    }

    const tagList = tags
      ? (typeof tags === 'string' ? tags.split(',') : tags).map((t) => t.trim()).filter(Boolean)
      : [];

    const note = new Note({
      title: title.trim(),
      content: content.trim(),
      topic: topicObj._id,
      tags: tagList,
      isPinned: Boolean(isPinned),
      createdBy: req.user?._id,
    });

    await note.save();
    const populated = await Note.findById(note._id).populate('topic', 'title slug category');
    res.status(201).json(populated);
  } catch (error) {
    console.error('createNote error:', error);
    res.status(500).json({ message: error.message || 'Error creating note' });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, topic, tags, isPinned } = req.body;

    const note = await Note.findById(id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }

    if (title) note.title = title.trim();
    if (content !== undefined) note.content = content.trim();
    if (isPinned !== undefined) note.isPinned = Boolean(isPinned);
    if (topic) {
      const topicObj = await Topic.findById(topic);
      if (topicObj) note.topic = topicObj._id;
    }
    if (tags !== undefined) {
      note.tags = (typeof tags === 'string' ? tags.split(',') : tags).map((t) => t.trim()).filter(Boolean);
    }

    await note.save();
    const populated = await Note.findById(note._id).populate('topic', 'title slug category');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: 'Error updating note' });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { id } = req.params;
    await Note.findByIdAndDelete(id);
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note' });
  }
};
