import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import topicRoutes from './routes/topicRoutes.js';
import documentRoutes from './routes/documentRoutes.js';
import videoRoutes from './routes/videoRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import noteRoutes from './routes/noteRoutes.js';
import bookmarkRoutes from './routes/bookmarkRoutes.js';
import searchRoutes from './routes/searchRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import favoriteRoutes from './routes/favoriteRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

dotenv.config();

const __serverFilename = fileURLToPath(import.meta.url);
const __serverDirname = path.dirname(__serverFilename);
const uploadDir = path.resolve(__serverDirname, '../uploads');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static uploads directory
app.use('/uploads', express.static(uploadDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/topics', topicRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/bookmarks', bookmarkRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    app: 'LearnVault Backend (MERN Stack)',
    timestamp: new Date().toISOString(),
  });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[LearnVault Server] Running on http://localhost:${PORT}`);
    console.log(`[LearnVault Server] Uploads directory: ${uploadDir}`);
  });
});
