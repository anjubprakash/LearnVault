import { Activity } from '../models/Activity.js';
import { Topic } from '../models/Topic.js';
import { DocumentItem } from '../models/Document.js';
import { Video } from '../models/Video.js';
import { Project } from '../models/Project.js';

export const getActivities = async (req, res) => {
  try {
    const userId = req.user?._id;

    const recentActivities = await Activity.find(userId ? { user: userId } : {})
      .sort({ createdAt: -1 })
      .limit(20);

    const recentlyViewedDocs = await DocumentItem.find({ viewCount: { $gt: 0 }, lastViewedAt: { $exists: true } })
      .populate('topic', 'title slug')
      .sort({ lastViewedAt: -1 })
      .limit(6);

    const recentlyAddedDocs = await DocumentItem.find()
      .populate('topic', 'title slug')
      .populate('relatedVideo')
      .sort({ createdAt: -1 })
      .limit(6);

    const recentlyWatchedVideos = await Video.find({ watchCount: { $gt: 0 }, lastWatchedAt: { $exists: true } })
      .populate('topic', 'title slug')
      .sort({ lastWatchedAt: -1 })
      .limit(6);

    const recentlyAddedVideos = await Video.find()
      .populate('topic', 'title slug')
      .sort({ createdAt: -1 })
      .limit(6);

    const recentlyAddedProjects = await Project.find()
      .populate('topic', 'title slug')
      .sort({ createdAt: -1 })
      .limit(6);

    const topicActivities = await Activity.find({
      ...(userId ? { user: userId } : {}),
      actionType: { $in: ['open_topic', 'view_document'] },
    })
      .sort({ createdAt: -1 })
      .limit(30);

    const seenTopics = new Set();
    const continueLearningItems = [];

    for (const act of topicActivities) {
      if (act.topic) {
        const topicIdStr = act.topic.toString();
        if (!seenTopics.has(topicIdStr)) {
          seenTopics.add(topicIdStr);
          const topicDoc = await Topic.findById(act.topic);
          if (topicDoc) {
            continueLearningItems.push({
              topicId: topicDoc._id.toString(),
              topicTitle: topicDoc.title,
              topicSlug: topicDoc.slug,
              lastAction: act.actionType === 'view_document' ? 'Last viewed' : 'Last opened',
              lastOpenedTitle: act.entityTitle || topicDoc.title,
              updatedAt: act.createdAt,
            });
          }
        }
      }
      if (continueLearningItems.length >= 4) break;
    }

    if (continueLearningItems.length < 3) {
      const topTopics = await Topic.find({ _id: { $nin: Array.from(seenTopics) } }).limit(4 - continueLearningItems.length);
      for (const t of topTopics) {
        continueLearningItems.push({
          topicId: t._id.toString(),
          topicTitle: t.title,
          topicSlug: t.slug,
          lastAction: 'Start Learning',
          lastOpenedTitle: t.description || t.title,
          updatedAt: t.updatedAt,
        });
      }
    }

    res.json({
      recentActivities,
      recentlyViewedDocs,
      recentlyAddedDocs,
      recentlyWatchedVideos,
      recentlyAddedVideos,
      recentlyAddedProjects,
      continueLearning: continueLearningItems,
    });
  } catch (error) {
    console.error('getActivities error:', error);
    res.status(500).json({ message: 'Error retrieving activities' });
  }
};
