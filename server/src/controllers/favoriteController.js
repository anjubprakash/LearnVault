import { Favorite } from '../models/Favorite.js';
import { DocumentItem } from '../models/Document.js';
import { Video } from '../models/Video.js';
import { Project } from '../models/Project.js';
import { Bookmark } from '../models/Bookmark.js';

export const getFavorites = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const favorites = await Favorite.find({ user: userId }).sort({ createdAt: -1 });

    const docIds = favorites.filter((f) => f.itemType === 'document').map((f) => f.itemId);
    const videoIds = favorites.filter((f) => f.itemType === 'video').map((f) => f.itemId);
    const projectIds = favorites.filter((f) => f.itemType === 'project').map((f) => f.itemId);
    const bookmarkIds = favorites.filter((f) => f.itemType === 'bookmark').map((f) => f.itemId);

    const [docs, videos, projects, bookmarks] = await Promise.all([
      DocumentItem.find({ _id: { $in: docIds } }).populate('topic', 'title slug'),
      Video.find({ _id: { $in: videoIds } }).populate('topic', 'title slug'),
      Project.find({ _id: { $in: projectIds } }).populate('topic', 'title slug'),
      Bookmark.find({ _id: { $in: bookmarkIds } }).populate('topic', 'title slug'),
    ]);

    const favoriteIdSet = favorites.map((f) => `${f.itemType}:${f.itemId.toString()}`);

    res.json({
      favoritesList: favorites,
      favoriteKeys: favoriteIdSet,
      documents: docs,
      videos,
      projects,
      bookmarks,
      counts: {
        documents: docs.length,
        videos: videos.length,
        projects: projects.length,
        bookmarks: bookmarks.length,
        total: docs.length + videos.length + projects.length + bookmarks.length,
      },
    });
  } catch (error) {
    console.error('getFavorites error:', error);
    res.status(500).json({ message: 'Error retrieving favorites' });
  }
};

export const toggleFavorite = async (req, res) => {
  try {
    const userId = req.user?._id;
    const { itemType, itemId } = req.body;

    if (!userId || !itemType || !itemId) {
      return res.status(400).json({ message: 'Item type and itemId are required' });
    }

    const existing = await Favorite.findOne({ user: userId, itemType, itemId });

    if (existing) {
      await Favorite.findByIdAndDelete(existing._id);
      res.json({ isFavorite: false, message: 'Removed from favorites' });
    } else {
      await Favorite.create({
        user: userId,
        itemType,
        itemId,
      });
      res.json({ isFavorite: true, message: 'Added to favorites' });
    }
  } catch (error) {
    console.error('toggleFavorite error:', error);
    res.status(500).json({ message: 'Error updating favorite' });
  }
};
