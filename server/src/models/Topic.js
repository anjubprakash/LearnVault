import mongoose from 'mongoose';
import slugify from 'slugify';

const TopicSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a topic title'],
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Please provide a category'],
      enum: ['Programming Languages', 'Frontend', 'Backend', 'Databases', 'DevOps & Tools', 'Concepts & Architecture'],
      default: 'Programming Languages',
      index: true,
    },
    parentTopic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      default: null,
      index: true,
    },
    level: {
      type: Number,
      default: 0,
    },
    path: {
      type: String,
      default: '',
    },
    order: {
      type: Number,
      default: 0,
    },
    icon: {
      type: String,
      default: 'Folder',
    },
    colorAccent: {
      type: String,
      default: '#8b5cf6',
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

TopicSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    const baseSlug = slugify(this.title, { lower: true, strict: true });
    this.slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;
  }
  next();
});

export const Topic = mongoose.model('Topic', TopicSchema);
