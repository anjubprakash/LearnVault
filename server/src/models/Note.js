import mongoose from 'mongoose';

const NoteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a note title'],
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: [true, 'Please provide note content'],
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
    isPinned: {
      type: Boolean,
      default: false,
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

NoteSchema.index({
  title: 'text',
  content: 'text',
  tags: 'text',
});

export const Note = mongoose.model('Note', NoteSchema);
