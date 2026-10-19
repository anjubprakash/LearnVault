import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { api } from '../services/api.js';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { DocumentCard } from '../components/DocumentCard.jsx';
import { VideoCard } from '../components/VideoCard.jsx';
import { ProjectCard } from '../components/ProjectCard.jsx';
import { BookmarkCard } from '../components/BookmarkCard.jsx';
import { DocumentViewerModal } from '../components/DocumentViewerModal.jsx';
import { VideoPlayerModal } from '../components/VideoPlayerModal.jsx';

export const FavoritesPage = () => {
  const { favoriteKeys } = useFavorites();
  const [activeTab, setActiveTab] = useState('all');
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [activeDoc, setActiveDoc] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const res = await api.getFavorites();
      setDocuments(res.documents || []);
      setVideos(res.videos || []);
      setProjects(res.projects || []);
      setBookmarks(res.bookmarks || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFavorites();
  }, [favoriteKeys]);

  const totalCount = documents.length + videos.length + projects.length + bookmarks.length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Saved Favorites</h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Quick-access collection of your essential study materials, videos, and projects
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'all', label: 'All Favorites', count: totalCount },
          { key: 'documents', label: 'Documents', count: documents.length },
          { key: 'videos', label: 'Videos', count: videos.length },
          { key: 'projects', label: 'Projects', count: projects.length },
          { key: 'bookmarks', label: 'Bookmarks', count: bookmarks.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-purple-600 text-purple-900 bg-slate-50 rounded-t-xl'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                activeTab === tab.key ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading favorites...</div>
      ) : totalCount === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center max-w-md mx-auto">
          <Star className="w-12 h-12 text-amber-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No favorites yet</h4>
          <p className="text-xs text-slate-500 mt-1">
            Click the star icon on any document, video, project, or bookmark to save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Documents */}
          {(activeTab === 'all' || activeTab === 'documents') && documents.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-200/80 pb-2">
                Favorited Documents ({documents.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onView={(d) => setActiveDoc(d)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Videos */}
          {(activeTab === 'all' || activeTab === 'videos') && videos.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-200/80 pb-2">
                Favorited Videos ({videos.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((vid) => (
                  <VideoCard
                    key={vid._id}
                    video={vid}
                    onWatch={(v) => setActiveVideo(v)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {(activeTab === 'all' || activeTab === 'projects') && projects.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-200/80 pb-2">
                Favorited Projects ({projects.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((proj) => (
                  <ProjectCard key={proj._id} project={proj} />
                ))}
              </div>
            </div>
          )}

          {/* Bookmarks */}
          {(activeTab === 'all' || activeTab === 'bookmarks') && bookmarks.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-slate-800 border-b border-slate-200/80 pb-2">
                Favorited Bookmarks ({bookmarks.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bm) => (
                  <BookmarkCard key={bm._id} bookmark={bm} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modals */}
      <DocumentViewerModal
        document={activeDoc}
        onClose={() => setActiveDoc(null)}
      />

      <VideoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
};
