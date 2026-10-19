import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a project title'],
      trim: true,
      index: true,
    },
    technology: {
      type: String,
      required: [true, 'Please specify technology stack (e.g. C#, .NET, SQL Server)'],
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    status: {
      type: String,
      enum: ['Planning', 'In Progress', 'Completed'],
      default: 'Completed',
      index: true,
    },
    githubUrl: {
      type: String,
      default: '',
      trim: true,
    },
    demoUrl: {
      type: String,
      default: '',
      trim: true,
    },
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Topic',
      required: [true, 'Please assign a primary topic'],
      index: true,
    },
    relatedDocuments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'DocumentItem',
      },
    ],
    relatedVideos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Video',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  },
  {
    timestamps: true,
  }
);

ProjectSchema.index({
  title: 'text',
  technology: 'text',
  description: 'text',
});

export const Project = mongoose.model('Project', ProjectSchema);
