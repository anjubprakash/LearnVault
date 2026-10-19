import mongoose from 'mongoose';

const FavoriteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    itemType: {
      type: String,
      enum: ['document', 'video', 'project', 'bookmark', 'note'],
      required: true,
      index: true,
    },
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

FavoriteSchema.index({ user: 1, itemType: 1, itemId: 1 }, { unique: true });

export const Favorite = mongoose.model('Favorite', FavoriteSchema);
