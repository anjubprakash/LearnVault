import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Folder,
  FileText,
  Video as VideoIcon,
  FolderGit2,
  StickyNote,
  Bookmark as BookmarkIcon,
  ChevronRight,
  Upload,
  Plus,
  GitBranch,
  Info,
  Trash2,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { DocumentCard } from '../components/DocumentCard.jsx';
import { VideoCard } from '../components/VideoCard.jsx';
import { ProjectCard } from '../components/ProjectCard.jsx';
import { BookmarkCard } from '../components/BookmarkCard.jsx';
import { DocumentViewerModal } from '../components/DocumentViewerModal.jsx';
import { VideoPlayerModal } from '../components/VideoPlayerModal.jsx';
import { UploadDocumentModal } from '../components/UploadDocumentModal.jsx';
import { AddVideoModal } from '../components/AddVideoModal.jsx';
import { AddProjectModal } from '../components/AddProjectModal.jsx';
import { AddNoteModal } from '../components/AddNoteModal.jsx';
import { AddBookmarkModal } from '../components/AddBookmarkModal.jsx';
import { EditMetadataModal } from '../components/EditMetadataModal.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';

export const TopicDetailsPage = () => {
  const { id } = useParams();
  const { isAdmin } = useAuth();

  const [topic, setTopic] = useState(null);
  const [breadcrumbs, setBreadcrumbs] = useState([]);
  const [subtopics, setSubtopics] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [notes, setNotes] = useState([]);
  const [projects, setProjects] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab State: 'overview' | 'documents' | 'videos' | 'notes' | 'projects' | 'bookmarks'
  const [activeTab, setActiveTab] = useState('overview');

  // Modals state
  const [activeDocViewer, setActiveDocViewer] = useState(null);
  const [activeVideoPlayer, setActiveVideoPlayer] = useState(null);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [addVideoModalOpen, setAddVideoModalOpen] = useState(false);
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [addBookmarkModalOpen, setAddBookmarkModalOpen] = useState(false);

  // Edit / Delete states
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadTopicData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await api.getTopicById(id);
      setTopic(data.topic);
      setBreadcrumbs(data.breadcrumbs || []);
      setSubtopics(data.subtopics || []);
      setDocuments(data.documents || []);
      setVideos(data.videos || []);
      setNotes(data.notes || []);
      setProjects(data.projects || []);
      setBookmarks(data.bookmarks || []);
    } catch (error) {
      console.error('Error fetching topic:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopicData();
    const handleRefresh = () => loadTopicData();
    window.addEventListener('learnvault:refresh-data', handleRefresh);
    return () => window.removeEventListener('learnvault:refresh-data', handleRefresh);
  }, [id]);

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      setDeleteLoading(true);
      if (deletingItem.type === 'document') await api.deleteDocument(deletingItem.id);
      else if (deletingItem.type === 'video') await api.deleteVideo(deletingItem.id);
      else if (deletingItem.type === 'project') await api.deleteProject(deletingItem.id);
      else if (deletingItem.type === 'note') await api.deleteNote(deletingItem.id);
      else if (deletingItem.type === 'bookmark') await api.deleteBookmark(deletingItem.id);

      setDeletingItem(null);
      loadTopicData();
    } catch (error) {
      console.error('Error deleting item:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-24 text-slate-400">Loading topic materials...</div>;
  }

  if (!topic) {
    return (
      <div className="max-w-4xl mx-auto py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800">Topic not found</h2>
        <Link to="/study-materials" className="text-purple-600 text-sm font-semibold underline mt-2 block">
          Return to Study Materials
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb Trail */}
      <nav className="flex items-center gap-1.5 text-xs text-slate-500 overflow-x-auto scrollbar-none">
        <Link to="/study-materials" className="hover:text-purple-600 font-medium">
          Study Materials
        </Link>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
        <span className="text-purple-700 font-semibold">{topic.category}</span>
        {breadcrumbs.map((crumb) => (
          <React.Fragment key={crumb.id}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            {crumb.id === topic._id ? (
              <span className="font-bold text-slate-800">{crumb.title}</span>
            ) : (
              <Link to={`/topics/${crumb.id}`} className="hover:text-purple-600">
                {crumb.title}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Topic Header Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-full bg-slate-100 text-purple-800 text-xs font-bold">
                {topic.category}
              </span>
              {subtopics.length > 0 && (
                <span className="inline-flex items-center gap-1 text-xs text-purple-700 bg-purple-50 px-2.5 py-1 rounded-full font-medium">
                  <GitBranch className="w-3 h-3 text-purple-600" />
                  {subtopics.length} subtopics
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {topic.title}
            </h1>

            <p className="text-sm text-slate-600 max-w-2xl leading-relaxed">
              {topic.description || `Everything I have learned about ${topic.title}.`}
            </p>
          </div>

          {/* Fast Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            <button
              onClick={() => setUploadDocModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
            >
              <Upload className="w-3.5 h-3.5" />
              <span>Upload Document</span>
            </button>
            <button
              onClick={() => setAddVideoModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-50 hover:bg-slate-100 text-purple-800 text-xs font-bold border border-purple-200 transition-colors"
            >
              <VideoIcon className="w-3.5 h-3.5 text-purple-600" />
              <span>Add Video</span>
            </button>
          </div>
        </div>

        {/* Subtopics chips if any */}
        {subtopics.length > 0 && (
          <div className="mt-6 pt-5 border-t border-slate-100 flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-1">
              Subtopics:
            </span>
            {subtopics.map((sub) => (
              <Link
                key={sub._id}
                to={`/topics/${sub._id}`}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 hover:bg-slate-100 text-purple-900 text-xs font-semibold border border-slate-200/80 transition-colors"
              >
                <Folder className="w-3.5 h-3.5 text-purple-600" />
                <span>{sub.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-slate-200/80 flex items-center gap-2 overflow-x-auto scrollbar-none">
        {[
          { key: 'overview', label: 'Overview', icon: Info, count: null },
          { key: 'documents', label: 'Documents', icon: FileText, count: documents.length },
          { key: 'videos', label: 'Videos', icon: VideoIcon, count: videos.length },
          { key: 'notes', label: 'Notes', icon: StickyNote, count: notes.length },
          { key: 'projects', label: 'Related Projects', icon: FolderGit2, count: projects.length },
          { key: 'bookmarks', label: 'Useful Links', icon: BookmarkIcon, count: bookmarks.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                isActive
                  ? 'border-purple-600 text-purple-900 bg-slate-50 rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className="w-4 h-4 text-purple-600" />
              <span>{tab.label}</span>
              {tab.count !== null && (
                <span
                  className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                    isActive ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Content Area */}
      <div>
        {/* 1. OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Summary Card */}
              <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-slate-900">Topic Overview</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {topic.description || `Everything I have learned about ${topic.title}.`}
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                    <span className="block text-xl font-bold text-purple-900">{documents.length}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Documents</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                    <span className="block text-xl font-bold text-purple-900">{videos.length}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Videos</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                    <span className="block text-xl font-bold text-purple-900">{projects.length}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Projects</span>
                  </div>
                  <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-center">
                    <span className="block text-xl font-bold text-purple-900">{notes.length}</span>
                    <span className="text-[11px] text-slate-500 font-medium">Notes</span>
                  </div>
                </div>
              </div>

              {/* Hierarchy Tree Card */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3">
                <h3 className="text-base font-bold text-slate-900">Knowledge Hierarchy</h3>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2 p-2 rounded-lg bg-purple-50 text-purple-900 font-bold">
                    <Folder className="w-4 h-4 text-purple-600" />
                    <span>{topic.title}</span>
                  </div>
                  {subtopics.map((sub) => (
                    <Link
                      key={sub._id}
                      to={`/topics/${sub._id}`}
                      className="flex items-center gap-2 pl-6 py-1.5 text-slate-600 hover:text-purple-700 hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-purple-400" />
                      <span>{sub.title}</span>
                    </Link>
                  ))}
                  {subtopics.length === 0 && (
                    <p className="text-xs text-slate-400 pl-2">No nested subtopics yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Preview of Documents in this topic */}
            {documents.length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-slate-800">Featured Study Documents</h4>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className="text-xs font-semibold text-purple-600 hover:underline"
                  >
                    View all ({documents.length})
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {documents.slice(0, 4).map((doc) => (
                    <DocumentCard
                      key={doc._id}
                      document={doc}
                      onView={(d) => setActiveDocViewer(d)}
                      onEdit={(d) => setEditingItem({ type: 'document', item: d })}
                      onDelete={(d) => setDeletingItem({ type: 'document', id: d._id, title: d.title })}
                      onWatchVideo={(v) => setActiveVideoPlayer(v)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 2. DOCUMENTS TAB */}
        {activeTab === 'documents' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Topic Study Documents</h3>
                <p className="text-xs text-slate-500">Read-only reference materials, PDFs, and guides</p>
              </div>
              <button
                onClick={() => setUploadDocModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Document</span>
              </button>
            </div>

            {documents.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No documents yet</h4>
                <p className="text-xs text-slate-500 mt-1">Upload PDF or reference guides for this topic.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onView={(d) => setActiveDocViewer(d)}
                    onEdit={(d) => setEditingItem({ type: 'document', item: d })}
                    onDelete={(d) => setDeletingItem({ type: 'document', id: d._id, title: d.title })}
                    onWatchVideo={(v) => setActiveVideoPlayer(v)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 3. VIDEOS TAB */}
        {activeTab === 'videos' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Educational Videos</h3>
                <p className="text-xs text-slate-500">Watch tutorials directly inside LearnVault</p>
              </div>
              <button
                onClick={() => setAddVideoModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Video</span>
              </button>
            </div>

            {videos.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                <VideoIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No videos saved yet</h4>
                <p className="text-xs text-slate-500 mt-1">Add YouTube tutorials related to {topic.title}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {videos.map((vid) => (
                  <VideoCard
                    key={vid._id}
                    video={vid}
                    onWatch={(v) => setActiveVideoPlayer(v)}
                    onEdit={(v) => setEditingItem({ type: 'video', item: v })}
                    onDelete={(v) => setDeletingItem({ type: 'video', id: v._id, title: v.title })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 4. NOTES TAB */}
        {activeTab === 'notes' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Topic Study Notes</h3>
                <p className="text-xs text-slate-500">Important takeaways, concepts, and code notes</p>
              </div>
              <button
                onClick={() => setAddNoteModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Note</span>
              </button>
            </div>

            {notes.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                <StickyNote className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No notes written yet</h4>
                <p className="text-xs text-slate-500 mt-1">Write quick Markdown study notes for {topic.title}.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {notes.map((note) => (
                  <div
                    key={note._id}
                    className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-900">{note.title}</h4>
                        {note.isPinned && (
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-purple-800 text-[10px] font-bold">
                            Pinned
                          </span>
                        )}
                      </div>
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setDeletingItem({ type: 'note', id: note._id, title: note.title })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                            title="Delete Note"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 font-mono text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {note.content}
                    </div>

                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {note.tags.map((t, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-medium"
                          >
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 5. PROJECTS TAB */}
        {activeTab === 'projects' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Projects Built with {topic.title}</h3>
                <p className="text-xs text-slate-500">Hands-on implementations and repositories</p>
              </div>
              <button
                onClick={() => setAddProjectModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Project</span>
              </button>
            </div>

            {projects.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No projects added yet</h4>
                <p className="text-xs text-slate-500 mt-1">Record projects where you applied {topic.title}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {projects.map((proj) => (
                  <ProjectCard
                    key={proj._id}
                    project={proj}
                    onOpenDoc={(d) => setActiveDocViewer(d)}
                    onWatchVideo={(v) => setActiveVideoPlayer(v)}
                    onEdit={(p) => setEditingItem({ type: 'project', item: p })}
                    onDelete={(p) => setDeletingItem({ type: 'project', id: p._id, title: p.title })}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* 6. BOOKMARKS TAB */}
        {activeTab === 'bookmarks' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">Useful Links &amp; Documentation</h3>
                <p className="text-xs text-slate-500">Official documentation, repositories, and articles</p>
              </div>
              <button
                onClick={() => setAddBookmarkModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Link</span>
              </button>
            </div>

            {bookmarks.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                <BookmarkIcon className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h4 className="text-base font-bold text-slate-800">No bookmarks saved yet</h4>
                <p className="text-xs text-slate-500 mt-1">Bookmark official docs and tutorials for {topic.title}.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {bookmarks.map((bm) => (
                  <BookmarkCard
                    key={bm._id}
                    bookmark={bm}
                    onEdit={(b) => setEditingItem({ type: 'bookmark', item: b })}
                    onDelete={(b) => setDeletingItem({ type: 'bookmark', id: b._id, title: b.title })}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

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
        isOpen={uploadDocModalOpen}
        onClose={() => setUploadDocModalOpen(false)}
        onSuccess={loadTopicData}
        defaultTopicId={topic._id}
      />

      <AddVideoModal
        isOpen={addVideoModalOpen}
        onClose={() => setAddVideoModalOpen(false)}
        onSuccess={loadTopicData}
        defaultTopicId={topic._id}
      />

      <AddProjectModal
        isOpen={addProjectModalOpen}
        onClose={() => setAddProjectModalOpen(false)}
        onSuccess={loadTopicData}
        defaultTopicId={topic._id}
      />

      <AddNoteModal
        isOpen={addNoteModalOpen}
        onClose={() => setAddNoteModalOpen(false)}
        onSuccess={loadTopicData}
        defaultTopicId={topic._id}
      />

      <AddBookmarkModal
        isOpen={addBookmarkModalOpen}
        onClose={() => setAddBookmarkModalOpen(false)}
        onSuccess={loadTopicData}
        defaultTopicId={topic._id}
      />

      <EditMetadataModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSuccess={loadTopicData}
        itemType={editingItem?.type}
        item={editingItem?.item}
      />

      <DeleteConfirmModal
        isOpen={!!deletingItem}
        onClose={() => setDeletingItem(null)}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${deletingItem?.type || 'item'}`}
        message={`Are you sure you want to delete "${deletingItem?.title}"?`}
        loading={deleteLoading}
      />
    </div>
  );
};
