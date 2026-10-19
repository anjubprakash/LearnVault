import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Video } from './models/Video.js';
import { Topic } from './models/Topic.js';

dotenv.config();

const newVideos = [
  {
    title: 'JavaScript Tutorial for Beginners: 30-Minute Crash Course',
    description: 'Learn JavaScript basics in this beginner-friendly tutorial. Covers variables, constants, primitive types, dynamic typing, objects, arrays, and functions.',
    youtubeUrl: 'https://www.youtube.com/watch?v=W6NZfCO5SIk',
    youtubeId: 'W6NZfCO5SIk',
    thumbnailUrl: 'https://img.youtube.com/vi/W6NZfCO5SIk/hqdefault.jpg',
    channelName: 'Programming with Mosh',
    topicTitle: 'JavaScript',
    tags: ['JavaScript', 'Web Development', 'Beginner', 'ES6'],
    duration: '48:16',
    watchCount: 35,
  },
  {
    title: 'Python Full Course for Beginners [Tutorial]',
    description: 'Python tutorial for beginners - Learn Python for data science, automation, machine learning and web development with hands-on coding exercises.',
    youtubeUrl: 'https://www.youtube.com/watch?v=_uQrJ0TkZlc',
    youtubeId: '_uQrJ0TkZlc',
    thumbnailUrl: 'https://img.youtube.com/vi/_uQrJ0TkZlc/hqdefault.jpg',
    channelName: 'Programming with Mosh',
    topicTitle: 'Python',
    tags: ['Python', 'Programming', 'Backend', 'Data Science'],
    duration: '1:00:15',
    watchCount: 42,
  },
  {
    title: 'Node.js Tutorial for Beginners: Learn Node in 1 Hour',
    description: 'Master Node.js architecture, modules, events, HTTP server creation, and npm packages to build high-performance backend systems.',
    youtubeUrl: 'https://www.youtube.com/watch?v=TlB_eWDSMt4',
    youtubeId: 'TlB_eWDSMt4',
    thumbnailUrl: 'https://img.youtube.com/vi/TlB_eWDSMt4/hqdefault.jpg',
    channelName: 'Programming with Mosh',
    topicTitle: 'Node.js',
    tags: ['Node.js', 'Backend', 'JavaScript', 'Runtime', 'NPM'],
    duration: '1:18:49',
    watchCount: 29,
  },
  {
    title: 'Learn Express JS in 35 Minutes',
    description: 'Express.js crash course explaining how to create routes, middleware, handle requests, JSON payloads, and organize REST API endpoints.',
    youtubeUrl: 'https://www.youtube.com/watch?v=SccSCuHhOw0',
    youtubeId: 'SccSCuHhOw0',
    thumbnailUrl: 'https://img.youtube.com/vi/SccSCuHhOw0/hqdefault.jpg',
    channelName: 'Web Dev Simplified',
    topicTitle: 'Express',
    tags: ['Express', 'Node.js', 'REST API', 'Backend', 'Middleware'],
    duration: '35:05',
    watchCount: 19,
  },
  {
    title: 'MongoDB Crash Course',
    description: 'Learn the fundamentals of MongoDB NoSQL database including document schemas, queries, projection, indexing, and Mongoose ORM usage.',
    youtubeUrl: 'https://www.youtube.com/watch?v=ofme2o29ngU',
    youtubeId: 'ofme2o29ngU',
    thumbnailUrl: 'https://img.youtube.com/vi/ofme2o29ngU/hqdefault.jpg',
    channelName: 'Web Dev Simplified',
    topicTitle: 'MongoDB',
    tags: ['MongoDB', 'NoSQL', 'Database', 'Mongoose', 'CRUD'],
    duration: '30:45',
    watchCount: 24,
  },
  {
    title: 'SQL Tutorial - Full Database Course for Beginners',
    description: 'Comprehensive introduction to relational databases and SQL queries: tables, keys, SELECT, JOIN, GROUP BY, subqueries, and database design.',
    youtubeUrl: 'https://www.youtube.com/watch?v=HXV3zeRR3h4',
    youtubeId: 'HXV3zeRR3h4',
    thumbnailUrl: 'https://img.youtube.com/vi/HXV3zeRR3h4/hqdefault.jpg',
    channelName: 'freeCodeCamp.org',
    topicTitle: 'SQL Server',
    tags: ['SQL', 'Relational Database', 'SQL Server', 'Queries', 'Joins'],
    duration: '4:20:38',
    watchCount: 51,
  },
  {
    title: 'React Hooks Explained - Complete Guide with Examples',
    description: 'In-depth guide on useState, useEffect, useRef, useMemo, useCallback, and custom hooks with clean practical component examples.',
    youtubeUrl: 'https://www.youtube.com/watch?v=TNhaISOUy6Q',
    youtubeId: 'TNhaISOUy6Q',
    thumbnailUrl: 'https://img.youtube.com/vi/TNhaISOUy6Q/hqdefault.jpg',
    channelName: 'Web Dev Simplified',
    topicTitle: 'React Hooks',
    tags: ['React', 'Hooks', 'Frontend', 'useState', 'useEffect'],
    duration: '28:10',
    watchCount: 38,
  },
  {
    title: 'LINQ Tutorial: Learn C# LINQ in 30 Minutes',
    description: 'Learn Language Integrated Query (LINQ) in C#: filtering, ordering, grouping, projections, Select, Where, Any, All, and lambda method syntax.',
    youtubeUrl: 'https://www.youtube.com/watch?v=58X48uXqfvg',
    youtubeId: '58X48uXqfvg',
    thumbnailUrl: 'https://img.youtube.com/vi/58X48uXqfvg/hqdefault.jpg',
    channelName: 'freeCodeCamp.org',
    topicTitle: 'LINQ',
    tags: ['LINQ', 'C#', '.NET', 'Collections', 'Lambda'],
    duration: '32:40',
    watchCount: 16,
  },
  {
    title: 'Angular Crash Course for Beginners',
    description: 'Learn Angular from scratch: components, services, dependency injection, routing, HTTP client, and TypeScript data models.',
    youtubeUrl: 'https://www.youtube.com/watch?v=3dHNOWTI7H8',
    youtubeId: '3dHNOWTI7H8',
    thumbnailUrl: 'https://img.youtube.com/vi/3dHNOWTI7H8/hqdefault.jpg',
    channelName: 'Traversy Media',
    topicTitle: 'Angular',
    tags: ['Angular', 'TypeScript', 'Frontend', 'SPA', 'Components'],
    duration: '1:52:43',
    watchCount: 22,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learnvault');
  console.log('Connected to MongoDB');

  const topics = await Topic.find({});
  const topicMap = new Map();
  topics.forEach((t) => topicMap.set(t.title, t._id));

  let inserted = 0;
  for (const vData of newVideos) {
    const existing = await Video.findOne({ youtubeId: vData.youtubeId });
    if (existing) {
      console.log(`Video already exists: "${vData.title}"`);
      continue;
    }

    const topicId = topicMap.get(vData.topicTitle);
    if (!topicId) {
      console.warn(`Topic not found for "${vData.topicTitle}", skipping video "${vData.title}"`);
      continue;
    }

    await Video.create({
      title: vData.title,
      description: vData.description,
      youtubeUrl: vData.youtubeUrl,
      youtubeId: vData.youtubeId,
      thumbnailUrl: vData.thumbnailUrl,
      channelName: vData.channelName,
      topic: topicId,
      tags: vData.tags,
      duration: vData.duration,
      watchCount: vData.watchCount,
      lastWatchedAt: new Date(),
      addedBy: new mongoose.Types.ObjectId('6abcf492b60b0cbd442a2169'),
    });
    console.log(`Added video: "${vData.title}"`);
    inserted++;
  }

  console.log(`\nSuccessfully added ${inserted} educational videos.`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
