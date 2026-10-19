import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FolderTree,
  FileText,
  Video,
  FolderGit2,
  Sparkles,
  ArrowRight,
  Upload,
  BookOpen,
  Link2,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DocumentCard } from '../components/DocumentCard.jsx';
import { VideoCard } from '../components/VideoCard.jsx';
import { DocumentViewerModal } from '../components/DocumentViewerModal.jsx';
import { VideoPlayerModal } from '../components/VideoPlayerModal.jsx';
import { UploadDocumentModal } from '../components/UploadDocumentModal.jsx';
import { AddVideoModal } from '../components/AddVideoModal.jsx';

export const DashboardPage = () => {
  const { user } = useAuth();

  const [stats, setStats] = useState({
    totalTopics: 0,
    totalDocs: 0,
    totalVideos: 0,
    totalProjects: 0,
  });

  const [continueLearning, setContinueLearning] = useState([]);
  const [recentlyAddedDocs, setRecentlyAddedDocs] = useState([]);
  const [recentlyWatchedVideos, setRecentlyWatchedVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [activeDocViewer, setActiveDocViewer] = useState(null);
  const [activeVideoPlayer, setActiveVideoPlayer] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [addVideoModalOpen, setAddVideoModalOpen] = useState(false);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [topics, docs, videos, projects, activityData] = await Promise.all([
        api.getTopics(),
        api.getDocuments(),
        api.getVideos(),
        api.getProjects(),
        api.getActivities(),
      ]);

      setStats({
        totalTopics: topics.length,
        totalDocs: docs.length,
        totalVideos: videos.length,
        totalProjects: projects.length,
      });

      setContinueLearning(activityData.continueLearning || []);
      setRecentlyAddedDocs(activityData.recentlyAddedDocs || docs.slice(0, 4));
      setRecentlyWatchedVideos(activityData.recentlyWatchedVideos || videos.slice(0, 6));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
    const handleRefresh = () => loadDashboardData();
    window.addEventListener('learnvault:refresh-data', handleRefresh);
    return () => window.removeEventListener('learnvault:refresh-data', handleRefresh);
  }, []);

  const formatTimeAgo = (dateStr) => {
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) return 'Just now';
    if (diffHours === 1) return '1 hour ago';
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays} days ago`;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Welcome Banner - Modern Executive Slate Palette */}
      <div className="bg-linear-to-r from-slate-900 via-slate-800 to-purple-950 rounded-3xl p-6 sm:p-8 text-white shadow-md relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 backdrop-blur-md text-purple-200 text-xs font-semibold mb-3 border border-purple-500/30">
            <Sparkles className="w-3.5 h-3.5 text-purple-300" />
            <span>Private Knowledge Vault</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Welcome to LearnVault
          </h2>
          <p className="text-slate-300 text-sm mt-2 leading-relaxed font-normal">
            A private, centralized learning repository designed for us to store and reference everything we learn while studying new technologies, frameworks, and projects.
          </p>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3 mt-6">
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-slate-100 transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-purple-600" />
              <span>Upload Document</span>
            </button>
            <button
              onClick={() => setAddVideoModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-colors shadow-xs"
            >
              <Video className="w-3.5 h-3.5" />
              <span>Add Video</span>
            </button>
          </div>
        </div>

        {/* Subtle decorative glow */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-linear-to-l from-purple-500/15 to-transparent pointer-events-none" />
      </div>

      {/* ============================================================ */}
      {/* WHAT IS LEARNVAULT? / HOW IT WORKS EXPLANATION SECTION */}
      {/* ============================================================ */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2 border border-purple-100">
            <BookOpen className="w-3.5 h-3.5" />
            <span>About LearnVault</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            How This Learning Repository Works
          </h3>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
            Whenever we learn something new, we create a learning topic and store the related study material right here. It gives us one single, organized place to remember and reference concepts without having to search through scattered folders or browser tabs.
          </p>
        </div>

        {/* 4 Feature Explanation Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          {/* 1. Categorized Topics */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/70 p-5 space-y-2.5 hover:border-purple-200 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-100">
              <FolderTree className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">1. Topic-Based Library</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Organized by category (Programming Languages, Frontend, Backend, Databases). Each topic (e.g. C#, React) has its own dedicated hub.
            </p>
          </div>

          {/* 2. Read-Only Documents */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/70 p-5 space-y-2.5 hover:border-purple-200 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-100">
              <FileText className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">2. In-Browser Viewer</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              PDFs and notes can be previewed directly inside the website with zoom, page navigation, and fullscreen—or downloaded in original format.
            </p>
          </div>

          {/* 3. Video Tutorial Pairing */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/70 p-5 space-y-2.5 hover:border-purple-200 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-100">
              <Link2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">3. Document-Video Pairing</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              When uploading a document, easily attach an existing or new YouTube video. Theory and practical video tutorials are kept side-by-side.
            </p>
          </div>

          {/* 4. Practical Projects */}
          <div className="bg-slate-50/80 rounded-2xl border border-slate-200/70 p-5 space-y-2.5 hover:border-purple-200 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold border border-purple-100">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-bold text-slate-900">4. Hands-on Projects</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Store real-world projects created while studying, linked directly to their topics and GitHub repositories for easy future recall.
            </p>
          </div>
        </div>
      </section>

      {/* 1. Overview Stat Cards - 4 Crisp Professional Cards */}
      <section>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100">
              <FolderTree className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalTopics}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Total Topics</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100">
              <FileText className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalDocs}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Total Documents</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100">
              <Video className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalVideos}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Total Videos</p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 transition-colors">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-3 border border-purple-100">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <p className="text-3xl font-extrabold text-slate-900">{stats.totalProjects}</p>
            <p className="text-xs font-semibold text-slate-500 mt-1">Total Projects</p>
          </div>
        </div>
      </section>

      {/* 2. "Continue Learning" Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Continue Learning</h3>
            <p className="text-xs text-slate-500">Pick up right where you and your friend left off</p>
          </div>
          <Link
            to="/study-materials"
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
          >
            <span>Explore all topics</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {continueLearning.map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:border-purple-300 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="font-semibold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">{item.lastAction}</span>
                  <span>{formatTimeAgo(item.updatedAt)}</span>
                </div>
                <h4 className="text-lg font-bold text-slate-900 mb-1">{item.topicTitle}</h4>
                <p className="text-xs text-slate-500 line-clamp-1 mb-4">
                  Last opened: <span className="font-semibold text-slate-700">{item.lastOpenedTitle}</span>
                </p>
              </div>

              <Link
                to={`/topics/${item.topicId}`}
                className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-slate-50 hover:bg-purple-50 text-slate-800 hover:text-purple-700 text-xs font-bold border border-slate-200 hover:border-purple-200 transition-colors"
              >
                <span>Open Topic</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* 3. "Recently Added" Study Materials */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Recently Added Study Materials</h3>
            <p className="text-xs text-slate-500">Latest documents, notes, and references uploaded to the vault</p>
          </div>
          <Link
            to="/documents"
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
          >
            <span>View all documents</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentlyAddedDocs.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center">
            <FileText className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No documents in the vault yet</p>
            <p className="text-[11px] text-slate-400 mt-0.5 mb-3">Upload your study notes or connect files directly from your Google Drive.</p>
            <button
              onClick={() => setUploadModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload or Connect Drive</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentlyAddedDocs.map((doc) => (
              <DocumentCard
                key={doc._id}
                document={doc}
                onView={(d) => setActiveDocViewer(d)}
                onWatchVideo={(v) => setActiveVideoPlayer(v)}
              />
            ))}
          </div>
        )}
      </section>

      {/* 4. Educational Tutorials Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Educational Tutorials</h3>
            <p className="text-xs text-slate-500">Hand-picked YouTube study guides &amp; lectures embedded in LearnVault</p>
          </div>
          <Link
            to="/videos"
            className="text-xs font-semibold text-purple-600 hover:text-purple-800 flex items-center gap-1 transition-colors"
          >
            <span>View all videos</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {recentlyWatchedVideos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onWatch={(v) => setActiveVideoPlayer(v)}
            />
          ))}
        </div>
      </section>

      {/* Modals */}
      <DocumentViewerModal
        document={activeDocViewer}
        onClose={() => setActiveDocViewer(null)}
        onWatchVideo={(v) => setActiveVideoPlayer(v)}
      />

      <VideoPlayerModal
        video={activeVideoPlayer}
        onClose={() => setActiveVideoPlayer(null)}
      />

      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={loadDashboardData}
      />

      <AddVideoModal
        isOpen={addVideoModalOpen}
        onClose={() => setAddVideoModalOpen(false)}
        onSuccess={loadDashboardData}
      />
    </div>
  );
};
