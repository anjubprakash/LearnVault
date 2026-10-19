import { Video } from '../models/Video.js';
import { Topic } from '../models/Topic.js';
import { Activity } from '../models/Activity.js';

export const extractYouTubeId = (url) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

export const getVideos = async (req, res) => {
  try {
    const { topic, search, tag } = req.query;
    const filter = {};

    if (topic) filter.topic = topic;
    if (tag) filter.tags = tag;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { channelName: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(String(search), 'i')] } },
      ];
    }

    const videos = await Video.find(filter)
      .populate('topic', 'title slug category')
      .populate('addedBy', 'name role')
      .sort({ createdAt: -1 });

    res.json(videos);
  } catch (error) {
    console.error('getVideos error:', error);
    res.status(500).json({ message: 'Error retrieving videos' });
  }
};

export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id).populate('topic', 'title slug category');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error retrieving video' });
  }
};

export const addVideo = async (req, res) => {
  try {
    const { title, description, youtubeUrl, channelName, topic, tags, duration } = req.body;

    if (!youtubeUrl || !title || !topic) {
      return res.status(400).json({ message: 'YouTube URL, title, and topic are required' });
    }

    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      return res.status(400).json({ message: 'Invalid YouTube URL. Please provide a valid YouTube link.' });
    }

    const topicObj = await Topic.findById(topic);
    if (!topicObj) {
      return res.status(400).json({ message: 'Selected topic does not exist.' });
    }

    const thumbnailUrl = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    const tagList = tags
      ? (typeof tags === 'string' ? tags.split(',') : tags).map((t) => t.trim()).filter(Boolean)
      : [];

    const video = new Video({
      title: title.trim(),
      description: description?.trim() || '',
      youtubeUrl: youtubeUrl.trim(),
      youtubeId,
      thumbnailUrl,
      channelName: channelName?.trim() || 'YouTube Educator',
      topic: topicObj._id,
      tags: tagList,
      duration: duration || '',
      addedBy: req.user?._id,
    });

    await video.save();

    if (req.user) {
      await Activity.create({
        user: req.user._id,
        actionType: 'add_video',
        entityId: video._id.toString(),
        entityType: 'video',
        entityTitle: video.title,
        topic: topicObj._id,
        topicTitle: topicObj.title,
      });
    }

    res.status(201).json(video);
  } catch (error) {
    console.error('addVideo error:', error);
    res.status(500).json({ message: error.message || 'Error adding video' });
  }
};

export const recordWatch = async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id).populate('topic', 'title');

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    video.watchCount += 1;
    video.lastWatchedAt = new Date();
    await video.save();

    if (req.user) {
      const topicTitle = video.topic?.title || '';
      await Activity.create({
        user: req.user._id,
        actionType: 'watch_video',
        entityId: video._id.toString(),
        entityType: 'video',
        entityTitle: video.title,
        topic: video.topic,
        topicTitle,
      });
    }

    res.json({ message: 'Watch recorded', video });
  } catch (error) {
    res.status(500).json({ message: 'Error recording watch' });
  }
};

export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, youtubeUrl, channelName, topic, tags, duration } = req.body;

    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    if (title) video.title = title.trim();
    if (description !== undefined) video.description = description.trim();
    if (channelName) video.channelName = channelName.trim();
    if (duration !== undefined) video.duration = duration;

    if (youtubeUrl && youtubeUrl !== video.youtubeUrl) {
      const newYtId = extractYouTubeId(youtubeUrl);
      if (newYtId) {
        video.youtubeUrl = youtubeUrl.trim();
        video.youtubeId = newYtId;
        video.thumbnailUrl = `https://img.youtube.com/vi/${newYtId}/hqdefault.jpg`;
      }
    }

    if (topic) {
      const topicObj = await Topic.findById(topic);
      if (topicObj) video.topic = topicObj._id;
    }

    if (tags !== undefined) {
      video.tags = (typeof tags === 'string' ? tags.split(',') : tags).map((t) => t.trim()).filter(Boolean);
    }

    await video.save();
    res.json(video);
  } catch (error) {
    res.status(500).json({ message: 'Error updating video' });
  }
};

export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    await Video.findByIdAndDelete(id);
    res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting video' });
  }
};
