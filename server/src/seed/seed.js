import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { User } from '../models/User.js';
import { Topic } from '../models/Topic.js';
import { DocumentItem } from '../models/Document.js';
import { Video } from '../models/Video.js';
import { Project } from '../models/Project.js';
import { Note } from '../models/Note.js';
import { Bookmark } from '../models/Bookmark.js';
import { Activity } from '../models/Activity.js';
import { Favorite } from '../models/Favorite.js';

dotenv.config();

// Helper to create a valid minimal PDF buffer
function createMinimalPdfBuffer(title, subtitle, bullets) {
  const streamContent = [
    'BT',
    '/F1 22 Tf',
    '50 720 Td',
    `(${title.replace(/[\(\)]/g, '')}) Tj`,
    '/F1 13 Tf',
    '0 -36 Td',
    `(${subtitle.replace(/[\(\)]/g, '')}) Tj`,
    '0 -24 Td',
    '(Key Study Points:) Tj',
    ...bullets.map((b) => `0 -20 Td\n(  * ${b.replace(/[\(\)]/g, '')}) Tj`),
    '0 -30 Td',
    '(Read-only verified study reference preserved in LearnVault.) Tj',
    'ET',
  ].join('\n');

  const streamLength = Buffer.byteLength(streamContent, 'utf-8');

  let body = `%PDF-1.4\n`;
  const offsets = [0];

  offsets.push(Buffer.byteLength(body, 'utf-8'));
  body += `1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;

  offsets.push(Buffer.byteLength(body, 'utf-8'));
  body += `2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n`;

  offsets.push(Buffer.byteLength(body, 'utf-8'));
  body += `3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>\nendobj\n`;

  offsets.push(Buffer.byteLength(body, 'utf-8'));
  body += `4 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`;

  offsets.push(Buffer.byteLength(body, 'utf-8'));
  body += `5 0 obj\n<< /Length ${streamLength} >>\nstream\n${streamContent}\nendstream\nendobj\n`;

  const startxref = Buffer.byteLength(body, 'utf-8');
  body += `xref\n0 6\n0000000000 65535 f \n`;
  for (let i = 1; i <= 5; i++) {
    body += `${offsets[i].toString().padStart(10, '0')} 00000 n \n`;
  }
  body += `trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${startxref}\n%%EOF\n`;

  return Buffer.from(body, 'utf-8');
}

export const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/learnvault';
    await mongoose.connect(mongoUri);
    console.log('[Seed JS] Connected to MongoDB');

    const uploadDir = path.resolve(process.cwd(), process.env.UPLOAD_DIR || 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // Clear existing collections
    await Promise.all([
      User.deleteMany({}),
      Topic.deleteMany({}),
      DocumentItem.deleteMany({}),
      Video.deleteMany({}),
      Project.deleteMany({}),
      Note.deleteMany({}),
      Bookmark.deleteMany({}),
      Activity.deleteMany({}),
      Favorite.deleteMany({}),
    ]);
    console.log('[Seed JS] Cleared existing data');

    // 1. Seed Users (Admin and Friend)
    const adminUser = new User({
      name: 'LearnVault Admin',
      email: 'admin@learnvault.local',
      password: 'adminpassword123',
      role: 'admin',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=admin',
    });
    await adminUser.save();

    const friendUser = new User({
      name: 'Alex StudyMate',
      email: 'friend@learnvault.local',
      password: 'friendpassword123',
      role: 'user',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=alex',
    });
    await friendUser.save();
    console.log('[Seed JS] Created Admin & Friend accounts');

    // 2. Seed Topics with Hierarchy
    const topicCSharp = await Topic.create({
      title: 'C#',
      description: 'Everything I have learned about C# and the .NET ecosystem.',
      category: 'Programming Languages',
      parentTopic: null,
      level: 0,
      path: 'Programming Languages / C#',
      order: 1,
      icon: 'Code2',
      colorAccent: '#8b5cf6',
      createdBy: adminUser._id,
    });

    const topicOOP = await Topic.create({
      title: 'OOP in C#',
      description: 'Object-Oriented Programming principles: Encapsulation, Inheritance, Polymorphism, and Abstraction.',
      category: 'Programming Languages',
      parentTopic: topicCSharp._id,
      level: 1,
      path: 'Programming Languages / C# / OOP in C#',
      order: 1,
      icon: 'Boxes',
      colorAccent: '#a855f7',
      createdBy: adminUser._id,
    });

    const topicLINQ = await Topic.create({
      title: 'LINQ',
      description: 'Language Integrated Query in C# for collections, SQL, XML, and complex data querying.',
      category: 'Programming Languages',
      parentTopic: topicCSharp._id,
      level: 1,
      path: 'Programming Languages / C# / LINQ',
      order: 2,
      icon: 'SearchCode',
      colorAccent: '#9333ea',
      createdBy: adminUser._id,
    });

    await Topic.create({
      title: 'JavaScript',
      description: 'Modern ES6+ concepts, Event Loop, Promises, Async/Await, and prototypes.',
      category: 'Programming Languages',
      parentTopic: null,
      level: 0,
      path: 'Programming Languages / JavaScript',
      order: 2,
      icon: 'FileCode',
      colorAccent: '#8b5cf6',
      createdBy: adminUser._id,
    });

    await Topic.create({
      title: 'Python',
      description: 'Python fundamentals, data structures, scripting, and backend development.',
      category: 'Programming Languages',
      parentTopic: null,
      level: 0,
      path: 'Programming Languages / Python',
      order: 3,
      icon: 'Terminal',
      colorAccent: '#7c3aed',
      createdBy: adminUser._id,
    });

    // Frontend: React
    const topicReact = await Topic.create({
      title: 'React',
      description: 'Component architecture, Virtual DOM, state management, and modern React 19.',
      category: 'Frontend',
      parentTopic: null,
      level: 0,
      path: 'Frontend / React',
      order: 1,
      icon: 'Atom',
      colorAccent: '#8b5cf6',
      createdBy: adminUser._id,
    });

    const topicReactHooks = await Topic.create({
      title: 'React Hooks',
      description: 'Deep dive into useState, useEffect, useMemo, useCallback, useRef, and custom hooks.',
      category: 'Frontend',
      parentTopic: topicReact._id,
      level: 1,
      path: 'Frontend / React / React Hooks',
      order: 1,
      icon: 'Sparkles',
      colorAccent: '#a855f7',
      createdBy: adminUser._id,
    });

    await Topic.create({
      title: 'Angular',
      description: 'Angular architecture, TypeScript components, Dependency Injection, and RxJS.',
      category: 'Frontend',
      parentTopic: null,
      level: 0,
      path: 'Frontend / Angular',
      order: 2,
      icon: 'Layers',
      colorAccent: '#7e22ce',
      createdBy: adminUser._id,
    });

    // Backend: Node.js & Express
    const topicNode = await Topic.create({
      title: 'Node.js',
      description: 'Server-side JavaScript runtime, event-driven I/O, streams, and cluster module.',
      category: 'Backend',
      parentTopic: null,
      level: 0,
      path: 'Backend / Node.js',
      order: 1,
      icon: 'Server',
      colorAccent: '#8b5cf6',
      createdBy: adminUser._id,
    });

    const topicExpress = await Topic.create({
      title: 'Express',
      description: 'Express middleware architecture, REST API design, routing, and security.',
      category: 'Backend',
      parentTopic: topicNode._id,
      level: 1,
      path: 'Backend / Node.js / Express',
      order: 1,
      icon: 'Cpu',
      colorAccent: '#9333ea',
      createdBy: adminUser._id,
    });

    // Databases: MongoDB & SQL Server
    const topicMongo = await Topic.create({
      title: 'MongoDB',
      description: 'Document database, aggregation pipelines, schema design, and indexing strategies.',
      category: 'Databases',
      parentTopic: null,
      level: 0,
      path: 'Databases / MongoDB',
      order: 1,
      icon: 'Database',
      colorAccent: '#8b5cf6',
      createdBy: adminUser._id,
    });

    await Topic.create({
      title: 'SQL Server',
      description: 'Relational database management, T-SQL queries, stored procedures, and indexing.',
      category: 'Databases',
      parentTopic: null,
      level: 0,
      path: 'Databases / SQL Server',
      order: 2,
      icon: 'TableProperties',
      colorAccent: '#7e22ce',
      createdBy: adminUser._id,
    });

    console.log('[Seed JS] Created Topics & Hierarchies');

    // 3. Create Sample Files & Seed Documents
    const saveSeedFile = (filename, buffer) => {
      const storedFilename = `seed-${Date.now()}-${filename}`;
      const filePath = path.join(uploadDir, storedFilename);
      fs.writeFileSync(filePath, buffer);
      return { storedFilename, filePath };
    };

    // Document 1: C# Basics.pdf
    const doc1Pdf = createMinimalPdfBuffer(
      'C# Basics: Comprehensive Primer',
      'LearnVault Master Reference Sheet for C# Core Fundamentals',
      [
        'Strong typing: Value types (int, float, bool, struct) vs Reference types (string, class, record)',
        'Control structures, pattern matching with switch expressions, and null-coalescing operators',
        'Namespaces, using declarations, and top-level statements introduced in modern C#',
        'Memory stack vs heap allocations and Garbage Collection basics',
      ]
    );
    const doc1File = saveSeedFile('csharp-basics.pdf', doc1Pdf);
    const doc1 = await DocumentItem.create({
      title: 'C# Basics - Complete Reference',
      description: 'Comprehensive foundational guide covering value types, reference types, and modern C# syntax.',
      topic: topicCSharp._id,
      category: 'Programming Languages',
      tags: ['C#', 'Fundamentals', 'Types', 'Syntax'],
      originalFilename: 'C# Basics.pdf',
      storedFilename: doc1File.storedFilename,
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: doc1Pdf.length,
      filePath: doc1File.filePath,
      downloadCount: 14,
      viewCount: 42,
      lastViewedAt: new Date(Date.now() - 2 * 3600 * 1000),
      uploadedBy: adminUser._id,
    });

    // Document 2: OOP in C#.pdf
    const doc2Pdf = createMinimalPdfBuffer(
      'OOP Concepts in C#',
      'Encapsulation, Inheritance, Polymorphism & Abstraction',
      [
        'Encapsulation: private fields, properties with { get; init; }, record types for immutability',
        'Inheritance: virtual, override, sealed keywords, protected access modifiers',
        'Polymorphism: method overloading and method overriding',
        'Abstraction: abstract classes vs interfaces, default interface methods',
      ]
    );
    const doc2File = saveSeedFile('csharp-oop.pdf', doc2Pdf);
    const doc2 = await DocumentItem.create({
      title: 'OOP Concepts in C#.pdf',
      description: 'Detailed study notes explaining object-oriented programming principles and design patterns in C#.',
      topic: topicOOP._id,
      category: 'Programming Languages',
      tags: ['OOP', 'Classes', 'Objects', 'Inheritance', 'Polymorphism'],
      originalFilename: 'OOP Concepts in C#.pdf',
      storedFilename: doc2File.storedFilename,
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: doc2Pdf.length,
      filePath: doc2File.filePath,
      downloadCount: 18,
      viewCount: 65,
      lastViewedAt: new Date(Date.now() - 3 * 3600 * 1000),
      uploadedBy: adminUser._id,
    });

    // Document 3: LINQ Notes.pdf
    const doc3Pdf = createMinimalPdfBuffer(
      'LINQ Notes & Query Syntax',
      'Query Expressions vs Method Syntax in .NET',
      [
        'Deferred execution vs Immediate execution (.ToList(), .ToArray(), .Count())',
        'Filtering & Projections: .Where(), .Select(), .SelectMany()',
        'Joining & Grouping: .GroupBy(), .Join(), .GroupJoin()',
        'Aggregations: .Aggregate(), .Sum(), .Average()',
      ]
    );
    const doc3File = saveSeedFile('linq-notes.pdf', doc3Pdf);
    const doc3 = await DocumentItem.create({
      title: 'LINQ Notes & Query Syntax.pdf',
      description: 'Summary of LINQ operations, deferred execution differences, and performance tips.',
      topic: topicLINQ._id,
      category: 'Programming Languages',
      tags: ['LINQ', 'Queries', 'Collections', 'Deferred Execution'],
      originalFilename: 'LINQ Notes.pdf',
      storedFilename: doc3File.storedFilename,
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: doc3Pdf.length,
      filePath: doc3File.filePath,
      downloadCount: 9,
      viewCount: 31,
      lastViewedAt: new Date(Date.now() - 24 * 3600 * 1000),
      uploadedBy: adminUser._id,
    });

    // Document 4: React Basics.pdf
    const doc5Pdf = createMinimalPdfBuffer(
      'React Architecture & Components',
      'Fundamental React Concepts, Props, and JSX',
      [
        'Declarative UI: UI = f(state)',
        'Component lifecycle and reconciliation with React Fiber',
        'Props vs State: unidirectional data flow',
        'Keys in lists and how diffing works',
      ]
    );
    const doc5File = saveSeedFile('react-basics.pdf', doc5Pdf);
    const doc5 = await DocumentItem.create({
      title: 'React Basics & Architecture Guide.pdf',
      description: 'Foundational guide to React component architecture, props, state, and rendering cycle.',
      topic: topicReact._id,
      category: 'Frontend',
      tags: ['React', 'Frontend', 'Components', 'Virtual DOM'],
      originalFilename: 'React Basics.pdf',
      storedFilename: doc5File.storedFilename,
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: doc5Pdf.length,
      filePath: doc5File.filePath,
      downloadCount: 16,
      viewCount: 58,
      lastViewedAt: new Date(Date.now() - 5 * 3600 * 1000),
      uploadedBy: adminUser._id,
    });

    // Document 5: React Hooks Guide.pdf
    const doc6Pdf = createMinimalPdfBuffer(
      'React Hooks Master Class Notes',
      'useState, useEffect, useMemo, useCallback, useRef',
      [
        'Rules of Hooks: call only at top level, only from React functions',
        'useEffect dependency array: empty array, specific deps, cleanup function',
        'useMemo for caching expensive computations',
        'useCallback for caching function references',
      ]
    );
    const doc6File = saveSeedFile('react-hooks.pdf', doc6Pdf);
    const doc6 = await DocumentItem.create({
      title: 'React Hooks Complete Notes.pdf',
      description: 'In-depth notes on React built-in hooks and custom hook composition patterns.',
      topic: topicReactHooks._id,
      category: 'Frontend',
      tags: ['React', 'Hooks', 'useState', 'useEffect', 'Performance'],
      originalFilename: 'Hooks Notes.pdf',
      storedFilename: doc6File.storedFilename,
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: doc6Pdf.length,
      filePath: doc6File.filePath,
      downloadCount: 25,
      viewCount: 89,
      lastViewedAt: new Date(Date.now() - 1 * 3600 * 1000),
      uploadedBy: adminUser._id,
    });

    // Document 6: Express Middleware Guide.txt
    const doc7Txt = Buffer.from(
      `EXPRESS MIDDLEWARE ARCHITECTURE NOTES\n=====================================\n\n1. Middleware Function Signature:\n   (req, res, next) => { ... next(); }\n\n2. Order of Execution:\n   Middleware executes sequentially in the order registered via app.use().\n\n3. Error-handling Middleware:\n   Must have 4 arguments: (err, req, res, next).\n\n4. Common Middleware Chain:\n   - Request logger\n   - CORS\n   - Body Parsers (express.json())\n   - JWT Authentication\n   - Route Handlers\n   - Global Error Handler\n`,
      'utf-8'
    );
    const doc7File = saveSeedFile('express-middleware.txt', doc7Txt);
    const doc7 = await DocumentItem.create({
      title: 'Express Middleware & Architecture Notes',
      description: 'Architectural overview of Express request pipeline, error handling, and security middlewares.',
      topic: topicExpress._id,
      category: 'Backend',
      tags: ['Express', 'Node.js', 'Middleware', 'REST API'],
      originalFilename: 'Express Middleware Notes.txt',
      storedFilename: doc7File.storedFilename,
      fileType: 'txt',
      mimeType: 'text/plain',
      fileSize: doc7Txt.length,
      filePath: doc7File.filePath,
      downloadCount: 11,
      viewCount: 37,
      lastViewedAt: new Date(Date.now() - 18 * 3600 * 1000),
      uploadedBy: adminUser._id,
    });

    // Document 7: MongoDB Indexing Guide.pdf
    const doc8Pdf = createMinimalPdfBuffer(
      'MongoDB Schema Design & Indexes',
      'B-Tree Indexes, Compound Indexes, and Aggregation Pipeline',
      [
        'Embedding vs Referencing guidelines for 1:N and N:N relations',
        'Index types: Single field, Compound (ESR rule: Equality, Sort, Range), TTL indexes',
        'Aggregation pipeline stages: $match, $group, $lookup, $project, $unwind',
      ]
    );
    const doc8File = saveSeedFile('mongodb-indexing.pdf', doc8Pdf);
    const doc8 = await DocumentItem.create({
      title: 'MongoDB Schema Design & Indexing.pdf',
      description: 'Data modeling strategies and aggregation query optimization in MongoDB.',
      topic: topicMongo._id,
      category: 'Databases',
      tags: ['MongoDB', 'NoSQL', 'Indexing', 'Aggregations', 'Schema'],
      originalFilename: 'MongoDB Indexing Guide.pdf',
      storedFilename: doc8File.storedFilename,
      fileType: 'pdf',
      mimeType: 'application/pdf',
      fileSize: doc8Pdf.length,
      filePath: doc8File.filePath,
      downloadCount: 15,
      viewCount: 47,
      lastViewedAt: new Date(Date.now() - 8 * 3600 * 1000),
      uploadedBy: adminUser._id,
    });

    console.log('[Seed JS] Created Study Documents');

    // 4. Seed Educational YouTube Videos
    const video1 = await Video.create({
      title: 'C# Tutorial For Beginners - Full Course',
      description: 'Comprehensive C# beginner tutorial explaining syntax, object-oriented concepts, and Visual Studio setup.',
      youtubeUrl: 'https://www.youtube.com/watch?v=GhQdlIFylQ8',
      youtubeId: 'GhQdlIFylQ8',
      thumbnailUrl: 'https://img.youtube.com/vi/GhQdlIFylQ8/hqdefault.jpg',
      channelName: 'freeCodeCamp.org',
      topic: topicCSharp._id,
      tags: ['C#', 'Beginner', 'Full Course', '.NET'],
      duration: '4:31:00',
      watchCount: 12,
      lastWatchedAt: new Date(Date.now() - 24 * 3600 * 1000),
      addedBy: adminUser._id,
    });

    const video2 = await Video.create({
      title: 'Object Oriented Programming (OOP) in C#',
      description: 'Detailed walkthrough of Classes, Inheritance, Polymorphism, and Abstraction in modern C#.',
      youtubeUrl: 'https://www.youtube.com/watch?v=IFayqJP3LA0',
      youtubeId: 'IFayqJP3LA0',
      thumbnailUrl: 'https://img.youtube.com/vi/IFayqJP3LA0/hqdefault.jpg',
      channelName: 'IAmTimCorey',
      topic: topicOOP._id,
      tags: ['C#', 'OOP', 'Inheritance', 'Design'],
      duration: '48:15',
      watchCount: 8,
      lastWatchedAt: new Date(Date.now() - 48 * 3600 * 1000),
      addedBy: adminUser._id,
    });

    const video4 = await Video.create({
      title: 'React 19 Full Course 2026',
      description: 'Build modern responsive React web applications from scratch with hooks, state, and component styling.',
      youtubeUrl: 'https://www.youtube.com/watch?v=CgkZ7MvWUAA',
      youtubeId: 'CgkZ7MvWUAA',
      thumbnailUrl: 'https://img.youtube.com/vi/CgkZ7MvWUAA/hqdefault.jpg',
      channelName: 'Web Dev Simplified',
      topic: topicReact._id,
      tags: ['React', 'JavaScript', 'Frontend', 'Components'],
      duration: '2:15:30',
      watchCount: 28,
      lastWatchedAt: new Date(Date.now() - 6 * 3600 * 1000),
      addedBy: adminUser._id,
    });

    console.log('[Seed JS] Created Educational Videos');

    // 5. Seed Projects
    const project1 = await Project.create({
      title: 'Employee Management System',
      technology: 'C#, .NET 9, SQL Server, Entity Framework Core',
      description: 'Full-stack enterprise employee management system with role-based access, department scheduling, and payroll reporting.',
      status: 'Completed',
      githubUrl: 'https://github.com/learnvault/employee-mgmt-system',
      demoUrl: 'https://employee-system-demo.learnvault.local',
      topic: topicCSharp._id,
      relatedDocuments: [doc1._id, doc2._id, doc3._id],
      relatedVideos: [video1._id, video2._id],
      createdBy: adminUser._id,
    });

    await Project.create({
      title: 'E-commerce Admin Dashboard',
      technology: 'React 19, JavaScript, Tailwind CSS, Vite',
      description: 'Responsive knowledge-driven analytics and order management dashboard built with React components and custom hooks.',
      status: 'Completed',
      githubUrl: 'https://github.com/learnvault/ecommerce-dashboard',
      demoUrl: 'https://ecommerce-demo.learnvault.local',
      topic: topicReact._id,
      relatedDocuments: [doc5._id, doc6._id],
      relatedVideos: [video4._id],
      createdBy: adminUser._id,
    });

    await Project.create({
      title: 'API Gateway & Microservices Hub',
      technology: 'Node.js, Express, MongoDB, JWT, Docker',
      description: 'Centralized API Gateway implementing rate limiting, JWT token validation, request routing, and microservice orchestration.',
      status: 'In Progress',
      githubUrl: 'https://github.com/learnvault/api-gateway-service',
      demoUrl: '',
      topic: topicNode._id,
      relatedDocuments: [doc7._id, doc8._id],
      relatedVideos: [],
      createdBy: adminUser._id,
    });

    console.log('[Seed JS] Created Projects');

    // 6. Seed Notes
    await Note.create({
      title: 'C# Memory Management & Struct vs Class Notes',
      content: `### Value Types vs Reference Types\n- **Value Types**: Stack allocated, copied by value. Includes \`int\`, \`double\`, \`bool\`, \`struct\`.\n- **Reference Types**: Heap allocated, copied by reference pointer. Includes \`class\`, \`string\`.\n\n### Garbage Collection (GC) in .NET\n- **Gen 0**: Short-lived objects\n- **Gen 1**: Buffer between short-lived and long-lived\n- **Gen 2**: Long-lived objects`,
      topic: topicCSharp._id,
      tags: ['C#', 'Memory', 'GC', 'Performance'],
      isPinned: true,
      createdBy: adminUser._id,
    });

    await Note.create({
      title: 'React Hooks Golden Rules & Clean Cleanup',
      content: `### useEffect Cleanup Function\nAlways return a cleanup function when subscribing to web sockets, timers, or event listeners:\n\`\`\`javascript\nuseEffect(() => {\n  const handler = () => console.log('scrolling');\n  window.addEventListener('scroll', handler);\n  return () => window.removeEventListener('scroll', handler);\n}, []);\n\`\`\`\n\n### When to use useMemo vs useCallback\n- Use \`useMemo\` to cache the **result** of an expensive computation.\n- Use \`useCallback\` to cache the **function definition** itself between renders.`,
      topic: topicReactHooks._id,
      tags: ['React', 'Hooks', 'useEffect', 'Best Practices'],
      isPinned: true,
      createdBy: adminUser._id,
    });

    console.log('[Seed JS] Created Study Notes');

    // 7. Seed Bookmarks
    await Bookmark.create({
      title: 'Microsoft Official C# Documentation',
      url: 'https://learn.microsoft.com/en-us/dotnet/csharp/',
      description: 'The definitive documentation for C# programming language specifications, guides, and tutorials.',
      topic: topicCSharp._id,
      category: 'Documentation',
      tags: ['C#', '.NET', 'Official', 'Microsoft'],
      createdBy: adminUser._id,
    });

    await Bookmark.create({
      title: 'React Official Documentation (react.dev)',
      url: 'https://react.dev',
      description: 'Interactive documentation for modern React with Hooks, Server Components, and best practices.',
      topic: topicReact._id,
      category: 'Documentation',
      tags: ['React', 'Official', 'Frontend'],
      createdBy: adminUser._id,
    });

    await Bookmark.create({
      title: 'MongoDB Documentation Manual',
      url: 'https://www.mongodb.com/docs/manual/',
      description: 'Comprehensive documentation on MongoDB database architecture, indexing, and aggregations.',
      topic: topicMongo._id,
      category: 'Documentation',
      tags: ['MongoDB', 'NoSQL', 'Database'],
      createdBy: adminUser._id,
    });

    console.log('[Seed JS] Created Bookmarks');

    // 8. Seed Activities for Dashboard
    await Activity.create({
      user: adminUser._id,
      actionType: 'view_document',
      entityId: doc2._id.toString(),
      entityType: 'document',
      entityTitle: 'OOP Concepts in C#.pdf',
      topic: topicCSharp._id,
      topicTitle: 'C#',
      metadata: { fileType: 'pdf', fileSize: doc2.fileSize },
      createdAt: new Date(Date.now() - 2 * 3600 * 1000),
    });

    await Activity.create({
      user: adminUser._id,
      actionType: 'open_topic',
      entityId: topicCSharp._id.toString(),
      entityType: 'topic',
      entityTitle: 'C#',
      topic: topicCSharp._id,
      topicTitle: 'C#',
      createdAt: new Date(Date.now() - 3 * 3600 * 1000),
    });

    await Activity.create({
      user: adminUser._id,
      actionType: 'open_topic',
      entityId: topicReact._id.toString(),
      entityType: 'topic',
      entityTitle: 'React',
      topic: topicReact._id,
      topicTitle: 'React',
      createdAt: new Date(Date.now() - 4 * 3600 * 1000),
    });

    // 9. Seed Favorites
    await Favorite.create({
      user: adminUser._id,
      itemType: 'document',
      itemId: doc2._id,
    });
    await Favorite.create({
      user: adminUser._id,
      itemType: 'project',
      itemId: project1._id,
    });

    console.log('[Seed JS] Database seeded successfully with pure JavaScript MERN backend!');
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('[Seed JS] Error during seeding:', error);
    process.exit(1);
  }
};

if (import.meta.url === `file://${process.argv[1]}` || process.argv[1]?.endsWith('seed.js')) {
  seedDatabase();
}
