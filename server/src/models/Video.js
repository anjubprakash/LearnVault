import mongoose from 'mongoose';

const VideoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a video title'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    youtubeUrl: {
      type: String,
      required: [true, 'Please provide a YouTube URL'],
      trim: true,
    },
    youtubeId: {
      type: String,
      required: true,
      index: true,
    },
    thumbnailUrl: {
      type: String,
      required: true,
    },
    channelName: {
      type: String,
      default: 'YouTube Educator',
      trim: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Please assign a topic'],
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    duration: {
      type: String,
      default: '',
    },
    watchCount: {
      type: Number,
      default: 0,
    },
    lastWatchedAt: {
      type: Date,
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

VideoSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  channelName: 'text',
});

export const Video = mongoose.model('Video', VideoSchema);
