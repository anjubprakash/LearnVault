import mongoose from 'mongoose';

const ActivitySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actionType: {
      type: String,
      enum: ['view_document', 'download_document', 'add_document', 'watch_video', 'add_video', 'add_project', 'open_topic'],
      required: true,
      index: true,
    },
    entityId: {
      type: String,
      required: true,
    },
    entityType: {
      type: String,
      enum: ['document', 'video', 'project', 'topic', 'note', 'bookmark'],
      required: true,
      index: true,
    },
    entityTitle: {
      type: String,
      required: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      index: true,
    },
    topicTitle: {
      type: String,
      default: '',
    },
    subtopicTitle: {
      type: String,
      default: '',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ActivitySchema.index({ user: 1, createdAt: -1 });

export const Activity = mongoose.model('Activity', ActivitySchema);
