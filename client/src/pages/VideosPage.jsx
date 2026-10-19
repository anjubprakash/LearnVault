import React, { useState, useEffect } from 'react';
import { Video as VideoIcon, Search, Plus } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { VideoCard } from '../components/VideoCard.jsx';
import { VideoPlayerModal } from '../components/VideoPlayerModal.jsx';
import { AddVideoModal } from '../components/AddVideoModal.jsx';
import { EditMetadataModal } from '../components/EditMetadataModal.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';

export const VideosPage = () => {
  const { isAdmin } = useAuth();
  const [videos, setVideos] = useState([]);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [activeVideo, setActiveVideo] = useState(null);
  const [addVideoModalOpen, setAddVideoModalOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState(null);
  const [deletingVideo, setDeletingVideo] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadVideos = async () => {
    try {
      setLoading(true);
      const [videosData, topicsData] = await Promise.all([
        api.getVideos({
          topic: selectedTopic || undefined,
        }),
        api.getTopics(),
      ]);
      setVideos(videosData);
      setTopics(topicsData);
    } catch (error) {
      console.error('Error loading videos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVideos();
    const handleRefresh = () => loadVideos();
    window.addEventListener('learnvault:refresh-data', handleRefresh);
    return () => window.removeEventListener('learnvault:refresh-data', handleRefresh);
  }, [selectedTopic]);

  const handleDelete = async () => {
    if (!deletingVideo) return;
    try {
      setDeleteLoading(true);
      await api.deleteVideo(deletingVideo._id);
      setDeletingVideo(null);
      loadVideos();
    } catch (error) {
      console.error('Error deleting video:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.channelName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.tags && v.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Educational Videos</h2>
          <p className="text-xs text-slate-500 mt-1">
            Hand-picked YouTube lectures, tutorials, and crash courses embedded inside LearnVault
          </p>
        </div>

        <button
          onClick={() => setAddVideoModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Video</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search videos by title, channel, or tag..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 bg-slate-50/50"
          />
        </div>

        <div className="w-full sm:w-64">
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:border-purple-500"
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Videos Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading educational videos...</div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center">
          <VideoIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No videos found</h4>
          <p className="text-xs text-slate-500 mt-1">Add YouTube tutorials or adjust your search.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => (
            <VideoCard
              key={video._id}
              video={video}
              onWatch={(v) => setActiveVideo(v)}
              onEdit={(v) => setEditingVideo(v)}
              onDelete={(v) => setDeletingVideo(v)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <VideoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />

      <AddVideoModal
        isOpen={addVideoModalOpen}
        onClose={() => setAddVideoModalOpen(false)}
        onSuccess={loadVideos}
      />

      <EditMetadataModal
        isOpen={!!editingVideo}
        onClose={() => setEditingVideo(null)}
        onSuccess={loadVideos}
        itemType="video"
        item={editingVideo}
      />

      <DeleteConfirmModal
        isOpen={!!deletingVideo}
        onClose={() => setDeletingVideo(null)}
        onConfirm={handleDelete}
        title="Delete Video"
        message={`Are you sure you want to remove "${deletingVideo?.title}" from your learning library?`}
        loading={deleteLoading}
      />
    </div>
  );
};
