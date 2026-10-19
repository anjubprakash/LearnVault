import mongoose from 'mongoose';

const DocumentItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a document title'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Please provide a topic'],
      index: true,
    },
    category: {
      type: String,
      default: 'Programming Languages',
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    originalFilename: {
      type: String,
      required: true,
    },
    storedFilename: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      required: true,
      lowercase: true,
      index: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    viewCount: {
      type: Number,
      default: 0,
    },
    lastViewedAt: {
      type: Date,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    relatedVideo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      default: null,
    },
    videoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    videoTitle: {
      type: String,
      default: '',
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

DocumentItemSchema.index({
  title: 'text',
  description: 'text',
  tags: 'text',
  originalFilename: 'text',
});

export const DocumentItem = mongoose.model('DocumentItem', DocumentItemSchema);
