import React, { useState, useEffect } from 'react';
import { Bookmark, Search, Plus } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { BookmarkCard } from '../components/BookmarkCard.jsx';
import { AddBookmarkModal } from '../components/AddBookmarkModal.jsx';
import { EditMetadataModal } from '../components/EditMetadataModal.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';

export const BookmarksPage = () => {
  const { isAdmin } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [addBookmarkModalOpen, setAddBookmarkModalOpen] = useState(false);
  const [editingBookmark, setEditingBookmark] = useState(null);
  const [deletingBookmark, setDeletingBookmark] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadBookmarks = async () => {
    try {
      setLoading(true);
      const [bms, ts] = await Promise.all([
        api.getBookmarks({
          topic: selectedTopic || undefined,
          category: selectedCategory || undefined,
        }),
        api.getTopics(),
      ]);
      setBookmarks(bms);
      setTopics(ts);
    } catch (error) {
      console.error('Error loading bookmarks:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBookmarks();
  }, [selectedTopic, selectedCategory]);

  const handleDelete = async () => {
    if (!deletingBookmark) return;
    try {
      setDeleteLoading(true);
      await api.deleteBookmark(deletingBookmark._id);
      setDeletingBookmark(null);
      loadBookmarks();
    } catch (error) {
      console.error('Error deleting bookmark:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredBookmarks = bookmarks.filter((b) => {
    const matchesSearch =
      b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.url.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.tags && b.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Bookmarks &amp; References</h2>
          <p className="text-xs text-slate-500 mt-1">
            Official documentation, GitHub repositories, tutorials, and developer tools
          </p>
        </div>

        <button
          onClick={() => setAddBookmarkModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bookmark</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search bookmarks by title, link, or tag..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 bg-slate-50/50"
          />
        </div>

        <div>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:border-slate-1000"
          >
            <option value="">All Topics</option>
            {topics.map((t) => (
              <option key={t._id} value={t._id}>
                {t.title}
              </option>
            ))}
          </select>
        </div>

        <div>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:border-slate-1000"
          >
            <option value="">All Categories</option>
            <option value="Documentation">Documentation</option>
            <option value="GitHub Repository">GitHub Repository</option>
            <option value="Tutorial">Tutorial</option>
            <option value="Article">Article</option>
            <option value="Tool">Tool</option>
            <option value="Website">Website</option>
          </select>
        </div>
      </div>

      {/* Bookmarks Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading bookmarks...</div>
      ) : filteredBookmarks.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center">
          <Bookmark className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No bookmarks saved yet</h4>
          <p className="text-xs text-slate-500 mt-1">Save useful documentation and cheat sheets.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookmarks.map((bookmark) => (
            <BookmarkCard
              key={bookmark._id}
              bookmark={bookmark}
              onEdit={(b) => setEditingBookmark(b)}
              onDelete={(b) => setDeletingBookmark(b)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <AddBookmarkModal
        isOpen={addBookmarkModalOpen}
        onClose={() => setAddBookmarkModalOpen(false)}
        onSuccess={loadBookmarks}
      />

      <EditMetadataModal
        isOpen={!!editingBookmark}
        onClose={() => setEditingBookmark(null)}
        onSuccess={loadBookmarks}
        itemType="bookmark"
        item={editingBookmark}
      />

      <DeleteConfirmModal
        isOpen={!!deletingBookmark}
        onClose={() => setDeletingBookmark(null)}
        onConfirm={handleDelete}
        title="Delete Bookmark"
        message={`Are you sure you want to delete "${deletingBookmark?.title}"?`}
        loading={deleteLoading}
      />
    </div>
  );
};
