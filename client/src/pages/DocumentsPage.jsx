import React, { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Upload,
} from 'lucide-react';
import { api } from '../services/api.js';
import { DocumentCard } from '../components/DocumentCard.jsx';
import { DocumentViewerModal } from '../components/DocumentViewerModal.jsx';
import { VideoPlayerModal } from '../components/VideoPlayerModal.jsx';
import { UploadDocumentModal } from '../components/UploadDocumentModal.jsx';
import { EditMetadataModal } from '../components/EditMetadataModal.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';

export const DocumentsPage = () => {
  const [documents, setDocuments] = useState([]);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [loading, setLoading] = useState(true);

  // Modals
  const [activeDocViewer, setActiveDocViewer] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [deletingDoc, setDeletingDoc] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const [docsData, topicsData] = await Promise.all([
        api.getDocuments({
          topic: selectedTopic || undefined,
          category: selectedCategory || undefined,
          sort: sortBy,
        }),
        api.getTopics(),
      ]);
      setDocuments(docsData);
      setTopics(topicsData);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocuments();
    const handleRefresh = () => loadDocuments();
    window.addEventListener('learnvault:refresh-data', handleRefresh);
    return () => window.removeEventListener('learnvault:refresh-data', handleRefresh);
  }, [selectedTopic, selectedCategory, sortBy]);

  const handleDelete = async () => {
    if (!deletingDoc) return;
    try {
      setDeleteLoading(true);
      await api.deleteDocument(deletingDoc._id);
      setDeletingDoc(null);
      loadDocuments();
    } catch (error) {
      console.error('Error deleting doc:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredDocs = documents.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.originalFilename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.tags && doc.tags.some((t) => t.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesType = !selectedType || doc.fileType.toLowerCase() === selectedType.toLowerCase();
    return matchesSearch && matchesType;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Document Repository</h2>
          <p className="text-xs text-slate-500 mt-1">
            Read-only verified study materials, PDFs, reference guides, and cheat sheets with linked tutorials
          </p>
        </div>

        <button
          onClick={() => setUploadModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Upload className="w-4 h-4" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search documents by title, file, or tag..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 bg-slate-50/50"
            />
          </div>

          {/* Topic Filter */}
          <div>
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

          {/* File Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:border-purple-500"
            >
              <option value="">All File Types</option>
              <option value="pdf">PDF Documents</option>
              <option value="docx">Word (.docx)</option>
              <option value="pptx">PowerPoint (.pptx)</option>
              <option value="xlsx">Excel (.xlsx)</option>
              <option value="txt">Text (.txt)</option>
              <option value="md">Markdown (.md)</option>
              <option value="png">Images (.png, .jpg)</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:border-purple-500"
            >
              <option value="recent">Sort: Most Recent</option>
              <option value="views">Sort: Most Viewed</option>
              <option value="popular">Sort: Most Downloaded</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading documents...</div>
      ) : filteredDocs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No documents found</h4>
          <p className="text-xs text-slate-500 mt-1">Try resetting your filters or upload a new study document.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredDocs.map((doc) => (
            <DocumentCard
              key={doc._id}
              document={doc}
              onView={(d) => setActiveDocViewer(d)}
              onEdit={(d) => setEditingDoc(d)}
              onDelete={(d) => setDeletingDoc(d)}
              onWatchVideo={(v) => setActiveVideo(v)}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <DocumentViewerModal
        document={activeDocViewer}
        onClose={() => setActiveDocViewer(null)}
        onWatchVideo={(v) => setActiveVideo(v)}
      />

      <VideoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />

      <UploadDocumentModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        onSuccess={loadDocuments}
      />

      <EditMetadataModal
        isOpen={!!editingDoc}
        onClose={() => setEditingDoc(null)}
        onSuccess={loadDocuments}
        itemType="document"
        item={editingDoc}
      />

      <DeleteConfirmModal
        isOpen={!!deletingDoc}
        onClose={() => setDeletingDoc(null)}
        onConfirm={handleDelete}
        title="Delete Document"
        message={`Are you sure you want to delete "${deletingDoc?.title}"? The stored file will be removed permanently.`}
        loading={deleteLoading}
      />
    </div>
  );
};
