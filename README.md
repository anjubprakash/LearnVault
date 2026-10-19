# LearnVault 📚
**Modern Personal Learning & Knowledge-Management Platform**
*(Pure JavaScript MERN Stack: MongoDB • Express • React • Node.js)*

LearnVault is a private, focused study repository and document reference platform built for pair-learning between you and your study partner. It enables you to organize, reference, and preserve everything you study across programming languages, frameworks, concepts, tools, and projects.

---

## 🎨 Design System
- **Colors**: Strictly White, Light Lilac / Soft Lavender accents (`#8b5cf6`, `#7c3aed`, `#f3e8ff`), Dark slate text (`#0f172a`), and Subtle borders (`#f1f0f7`).
- **Tone**: Calm, clean, minimal, distraction-free study environment.
- **Responsiveness**: Fully responsive across Desktop, Laptop, Tablet, and Mobile devices.

---

## 🚀 Key Features

1. **Hierarchical Knowledge Structure**
   - Topics organized by category and nested hierarchies (e.g. `Programming Languages → C# → OOP in C# → LINQ`, `Frontend → React → React Hooks`).
   - Dedicated Topic Details page with tabs: **Overview**, **Documents**, **Videos**, **Notes**, **Related Projects**, and **Useful Links**.

2. **In-Website Read-Only Document Viewer**
   - Click **[View Document]** to read files directly in the browser without forcing immediate download.
   - Built-in PDF viewer with **Page navigation**, **Zoom in / Zoom out / Reset (100%)**, **Fullscreen**, and **Download**.
   - Direct text & Markdown readers for notes and cheat sheets.
   - Fallback preview card for office binary formats (`DOCX`, `PPTX`, `XLSX`) with one-click original download.
   - **Strict Read-Only Guarantee**: Uploaded document files are preserved and never edited.

3. **Document Download**
   - Every document provides both **[View]** and **[Download]** buttons.
   - Downloads original uploaded files untouched while tracking download and view counters.

4. **Educational Video Hub**
   - Save educational YouTube tutorials with automatic thumbnail retrieval.
   - In-app embedded YouTube player modal with watch tracking.
   - Connected directly to respective learning topics.

5. **Learning Projects Showcase**
   - Track practice projects with status badges (`Completed`, `In Progress`, `Planning`), technology stack tags, GitHub repositories, and links to connected study documents and videos.

6. **Curated Bookmarks & References**
   - Save official documentation, GitHub repositories, articles, and tools organized by topic.

7. **Global Search**
   - Fast real-time multi-model search across **Topics**, **Documents**, **Videos**, **Projects**, **Notes**, and **Bookmarks** with instant category filtering.

8. **Dashboard & "Continue Learning"**
   - Overview metrics: Total Topics, Documents, Videos, Projects, Recently Added, Recently Viewed.
   - **Continue Learning**: Quick-resume cards showing the last opened topic and subtopic.
   - **Recent Activity**: Timeline of documents viewed/downloaded, videos watched, and resources added.

9. **Favorites / Bookmarked Items**
   - Instant star toggle on any document, video, project, or bookmark with a dedicated **Favorites** collection page.

10. **Role-Based User Access & Admin Area**
    - **Admin Account**: Full CRUD permissions, upload documents, add videos/projects/notes/bookmarks, edit metadata (renaming/categorizing), manage users.
    - **Friend / User Account**: Can view, read, watch, download, favorite, search. Cannot modify or delete repository content.
    - **Storage Provider Abstraction**: Modular backend storage provider (`LocalStorageProvider`) easily adaptable to S3 or cloud storage.

---

## 🔑 Demo Accounts

LearnVault comes pre-seeded with rich sample materials for C#, React, Node.js, MongoDB, etc.

| Role | Email | Password |
|---|---|---|
| **Admin** | `admin@learnvault.local` | `adminpassword123` |
| **Friend** | `friend@learnvault.local` | `friendpassword123` |

*(The login page features convenient one-click quick-login buttons for both roles)*

---

## 🛠️ Technology Stack (Pure JavaScript MERN)

- **Database**: MongoDB (Mongoose 8)
- **Backend**: Node.js (ES Modules), Express.js, Multer, JWT, Bcrypt
- **Frontend**: React 19 (JSX), Vite, Tailwind CSS v4, Lucide Icons
- **Architecture**: Modular storage abstraction provider (`LocalStorageProvider`), REST APIs, JWT authentication middleware

---

## 🏃 Running the Application

Both servers are currently running live:

- **Frontend Application**: [http://localhost:5173](http://localhost:5173)
- **Backend API Server**: [http://localhost:5000](http://localhost:5000)

### Manual Start Commands:

#### 1. Backend Server
```bash
cd server
npm run dev       # Runs server with hot reload on http://localhost:5000
npm run seed      # Seeds initial topics, documents, videos, projects, bookmarks
```

#### 2. Frontend Client
```bash
cd client
npm run dev       # Runs Vite development server on http://localhost:5173
```
