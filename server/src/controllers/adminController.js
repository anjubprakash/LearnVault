import { User } from '../models/User.js';
import { Topic } from '../models/Topic.js';
import { DocumentItem } from '../models/Document.js';
import { Video } from '../models/Video.js';
import { Project } from '../models/Project.js';
import { Note } from '../models/Note.js';
import { Bookmark } from '../models/Bookmark.js';

export const getAdminStats = async (req, res) => {
  try {
    const [
      topicCount,
      docCount,
      videoCount,
      projectCount,
      noteCount,
      bookmarkCount,
      userCount,
      docStats,
      categories,
    ] = await Promise.all([
      Topic.countDocuments(),
      DocumentItem.countDocuments(),
      Video.countDocuments(),
      Project.countDocuments(),
      Note.countDocuments(),
      Bookmark.countDocuments(),
      User.countDocuments(),
      DocumentItem.aggregate([
        {
          $group: {
            _id: null,
            totalSize: { $sum: '$fileSize' },
            totalDownloads: { $sum: '$downloadCount' },
            totalViews: { $sum: '$viewCount' },
          },
        },
      ]),
      Topic.aggregate([
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
          },
        },
      ]),
    ]);

    const storageStats = docStats[0] || { totalSize: 0, totalDownloads: 0, totalViews: 0 };

    res.json({
      counts: {
        topics: topicCount,
        documents: docCount,
        videos: videoCount,
        projects: projectCount,
        notes: noteCount,
        bookmarks: bookmarkCount,
        users: userCount,
      },
      storage: {
        totalBytes: storageStats.totalSize,
        totalDownloads: storageStats.totalDownloads,
        totalViews: storageStats.totalViews,
      },
      categories,
    });
  } catch (error) {
    console.error('getAdminStats error:', error);
    res.status(500).json({ message: 'Error retrieving admin stats' });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving users' });
  }
};

export const createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists' });
    }

    const user = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role === 'admin' ? 'admin' : 'user',
    });

    await user.save();
    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Error creating user' });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.user?._id.toString() === id) {
      return res.status(400).json({ message: 'You cannot delete your own account' });
    }

    await User.findByIdAndDelete(id);
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting user' });
  }
};
