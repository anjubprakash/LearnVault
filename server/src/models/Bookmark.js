import mongoose from 'mongoose';

const BookmarkSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide bookmark title'],
      trim: true,
      index: true,
    },
    url: {
      type: String,
      required: [true, 'Please provide bookmark URL'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Please assign a topic'],
      index: true,
    },
    category: {
      type: String,
      enum: ['Documentation', 'Article', 'Tutorial', 'GitHub Repository', 'Tool', 'Website'],
      default: 'Documentation',
    },
    tags: {
      type: [String],
      default: [],
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

BookmarkSchema.index({
  title: 'text',
  description: 'text',
  url: 'text',
  tags: 'text',
});

export const Bookmark = mongoose.model('Bookmark', BookmarkSchema);
