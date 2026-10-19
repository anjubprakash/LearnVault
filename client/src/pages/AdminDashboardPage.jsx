import React, { useState, useEffect } from 'react';
import {
  Shield,
  LayoutDashboard,
  FolderTree,
  FileText,
  Video as VideoIcon,
  FolderGit2,
  StickyNote,
  Bookmark as BookmarkIcon,
  Users as UsersIcon,
  Settings as SettingsIcon,
  Plus,
  Upload,
  Edit3,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { UploadDocumentModal } from '../components/UploadDocumentModal.jsx';
import { AddTopicModal } from '../components/AddTopicModal.jsx';
import { AddVideoModal } from '../components/AddVideoModal.jsx';
import { AddProjectModal } from '../components/AddProjectModal.jsx';
import { AddNoteModal } from '../components/AddNoteModal.jsx';
import { AddBookmarkModal } from '../components/AddBookmarkModal.jsx';
import { EditMetadataModal } from '../components/EditMetadataModal.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';

export const AdminDashboardPage = () => {
  const { user, isAdmin } = useAuth();

  // Active admin section
  const [activeTab, setActiveTab] = useState('stats');

  // Platform stats
  const [adminStats, setAdminStats] = useState(null);
  const [topics, setTopics] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [projects, setProjects] = useState([]);
  const [notes, setNotes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Creation Modals
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [addTopicModalOpen, setAddTopicModalOpen] = useState(false);
  const [addVideoModalOpen, setAddVideoModalOpen] = useState(false);
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [addNoteModalOpen, setAddNoteModalOpen] = useState(false);
  const [addBookmarkModalOpen, setAddBookmarkModalOpen] = useState(false);

  // User management modal
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('user');
  const [userActionMsg, setUserActionMsg] = useState(null);

  // Edit / Delete states
  const [editingItem, setEditingItem] = useState(null);
  const [deletingItem, setDeletingItem] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [statsRes, topicsRes, docsRes, vidsRes, projsRes, notesRes, bmsRes, usersRes] = await Promise.all([
        api.getAdminStats(),
        api.getTopics(),
        api.getDocuments(),
        api.getVideos(),
        api.getProjects(),
        api.getNotes(),
        api.getBookmarks(),
        api.getUsers(),
      ]);

      setAdminStats(statsRes);
      setTopics(topicsRes);
      setDocuments(docsRes);
      setVideos(vidsRes);
      setProjects(projsRes);
      setNotes(notesRes);
      setBookmarks(bmsRes);
      setUsers(usersRes);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingItem) return;
    try {
      setDeleteLoading(true);
      if (deletingItem.type === 'topic') await api.deleteTopic(deletingItem.id);
      else if (deletingItem.type === 'document') await api.deleteDocument(deletingItem.id);
      else if (deletingItem.type === 'video') await api.deleteVideo(deletingItem.id);
      else if (deletingItem.type === 'project') await api.deleteProject(deletingItem.id);
      else if (deletingItem.type === 'note') await api.deleteNote(deletingItem.id);
      else if (deletingItem.type === 'bookmark') await api.deleteBookmark(deletingItem.id);
      else if (deletingItem.type === 'user') await api.deleteUser(deletingItem.id);

      setDeletingItem(null);
      loadAllData();
    } catch (error) {
      alert(error.message || 'Error deleting item');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.createUser({
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      setUserActionMsg('User account created successfully.');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
      loadAllData();
      setTimeout(() => setUserActionMsg(null), 3000);
    } catch (err) {
      alert(err.message || 'Error creating user');
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto py-20 text-center">
        <Shield className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Admin Privileges Required</h3>
        <p className="text-xs text-slate-500 mt-1">
          Only the administrator can access the management console.
        </p>
      </div>
    );
  }

  const navItems = [
    { key: 'stats', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'topics', label: 'Manage Topics', icon: FolderTree, count: topics.length },
    { key: 'documents', label: 'Manage Documents', icon: FileText, count: documents.length },
    { key: 'videos', label: 'Manage Videos', icon: VideoIcon, count: videos.length },
    { key: 'projects', label: 'Manage Projects', icon: FolderGit2, count: projects.length },
    { key: 'notes', label: 'Manage Notes', icon: StickyNote, count: notes.length },
    { key: 'bookmarks', label: 'Manage Bookmarks', icon: BookmarkIcon, count: bookmarks.length },
    { key: 'users', label: 'Users', icon: UsersIcon, count: users.length },
    { key: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center shadow-xs">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Admin Area</h2>
            <p className="text-xs text-slate-500">
              Manage learning topics, upload materials, curate videos, and maintain user access
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-slate-100 text-purple-800 text-xs font-bold">
            Administrator: {user?.name}
          </span>
        </div>
      </div>

      {/* Admin Layout: Sidebar Tabs + Content */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navigation Sidebar */}
        <aside className="lg:col-span-1 space-y-1 bg-white p-3 rounded-2xl border border-slate-200/80 shadow-xs h-fit">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-purple-50 hover:text-purple-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.count !== undefined && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </aside>

        {/* Content Area */}
        <main className="lg:col-span-3 space-y-6">
          {/* 1. DASHBOARD & OVERVIEW STATS */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500">Storage Used</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {formatFileSize(adminStats?.storage?.totalBytes || 0)}
                  </p>
                  <p className="text-[11px] text-purple-700 mt-1 font-medium">Clean Local Abstraction</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500">Total Document Views</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {adminStats?.storage?.totalViews || 0}
                  </p>
                  <p className="text-[11px] text-emerald-600 mt-1 font-medium">In-Website Reader</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs">
                  <span className="text-xs font-semibold text-slate-500">Total Downloads</span>
                  <p className="text-2xl font-bold text-slate-900 mt-1">
                    {adminStats?.storage?.totalDownloads || 0}
                  </p>
                  <p className="text-[11px] text-slate-500 mt-1">Original documents untouched</p>
                </div>
              </div>

              {/* Quick Actions Grid */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-slate-800">Quick Creation Tools</h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setUploadDocModalOpen(true)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-purple-600 mb-1" />
                    <span className="text-xs font-bold">Upload Document</span>
                  </button>
                  <button
                    onClick={() => setAddTopicModalOpen(true)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <FolderTree className="w-5 h-5 text-purple-600 mb-1" />
                    <span className="text-xs font-bold">Create Topic</span>
                  </button>
                  <button
                    onClick={() => setAddVideoModalOpen(true)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <VideoIcon className="w-5 h-5 text-purple-600 mb-1" />
                    <span className="text-xs font-bold">Add Video</span>
                  </button>
                  <button
                    onClick={() => setAddProjectModalOpen(true)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <FolderGit2 className="w-5 h-5 text-purple-600 mb-1" />
                    <span className="text-xs font-bold">Add Project</span>
                  </button>
                  <button
                    onClick={() => setAddNoteModalOpen(true)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <StickyNote className="w-5 h-5 text-purple-600 mb-1" />
                    <span className="text-xs font-bold">Add Note</span>
                  </button>
                  <button
                    onClick={() => setAddBookmarkModalOpen(true)}
                    className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-200/80 hover:border-purple-300 hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    <BookmarkIcon className="w-5 h-5 text-purple-600 mb-1" />
                    <span className="text-xs font-bold">Add Bookmark</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. MANAGE TOPICS */}
          {activeTab === 'topics' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manage Learning Topics</h3>
                  <p className="text-xs text-slate-500">Edit titles, hierarchy levels, categories, and paths</p>
                </div>
                <button
                  onClick={() => setAddTopicModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Create Topic</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Topic Title</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">Hierarchy Level</th>
                      <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {topics.map((t) => (
                      <tr key={t._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800">
                          {t.level > 0 ? `— ${t.title}` : t.title}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{t.category}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {t.level === 0 ? 'Top Level' : `Subtopic (L${t.level})`}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setEditingItem({ type: 'topic', item: t })}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg"
                            title="Edit Topic"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingItem({ type: 'topic', id: t._id, title: t.title })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg ml-1"
                            title="Delete Topic"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 3. MANAGE DOCUMENTS */}
          {activeTab === 'documents' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manage Documents</h3>
                  <p className="text-xs text-slate-500">
                    Update metadata (title, topic, tags) or delete documents. File content is strictly read-only.
                  </p>
                </div>
                <button
                  onClick={() => setUploadDocModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Document</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Document Title</th>
                      <th className="px-4 py-3">Topic</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Size</th>
                      <th className="px-4 py-3">Views / DLs</th>
                      <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {documents.map((doc) => (
                      <tr key={doc._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-800 line-clamp-1">{doc.title}</p>
                          <p className="text-[10px] text-slate-400">{doc.originalFilename}</p>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {typeof doc.topic === 'object' ? doc.topic?.title : 'Topic'}
                        </td>
                        <td className="px-4 py-3 uppercase font-bold text-purple-700">{doc.fileType}</td>
                        <td className="px-4 py-3 text-slate-500">{formatFileSize(doc.fileSize)}</td>
                        <td className="px-4 py-3 text-slate-500">
                          {doc.viewCount} / {doc.downloadCount}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setEditingItem({ type: 'document', item: doc })}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg"
                            title="Edit Metadata"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingItem({ type: 'document', id: doc._id, title: doc.title })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg ml-1"
                            title="Delete Document"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 4. MANAGE VIDEOS */}
          {activeTab === 'videos' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manage Videos</h3>
                  <p className="text-xs text-slate-500">Educational YouTube video references and metadata</p>
                </div>
                <button
                  onClick={() => setAddVideoModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Video</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Video</th>
                      <th className="px-4 py-3">Channel</th>
                      <th className="px-4 py-3">Topic</th>
                      <th className="px-4 py-3">Watches</th>
                      <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {videos.map((vid) => (
                      <tr key={vid._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800 line-clamp-1">
                          {vid.title}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{vid.channelName}</td>
                        <td className="px-4 py-3 text-purple-700 font-medium">
                          {typeof vid.topic === 'object' ? vid.topic?.title : 'Topic'}
                        </td>
                        <td className="px-4 py-3 text-slate-500">{vid.watchCount}</td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setEditingItem({ type: 'video', item: vid })}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg"
                            title="Edit Video"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingItem({ type: 'video', id: vid._id, title: vid.title })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg ml-1"
                            title="Delete Video"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 5. MANAGE PROJECTS */}
          {activeTab === 'projects' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manage Learning Projects</h3>
                  <p className="text-xs text-slate-500">Track and link practice projects</p>
                </div>
                <button
                  onClick={() => setAddProjectModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Project</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Project</th>
                      <th className="px-4 py-3">Tech Stack</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {projects.map((proj) => (
                      <tr key={proj._id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-800">{proj.title}</td>
                        <td className="px-4 py-3 text-slate-500">{proj.technology}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold text-[10px]">
                            {proj.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            onClick={() => setEditingItem({ type: 'project', item: proj })}
                            className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg"
                            title="Edit Project"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingItem({ type: 'project', id: proj._id, title: proj.title })}
                            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg ml-1"
                            title="Delete Project"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* 6. MANAGE NOTES */}
          {activeTab === 'notes' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manage Study Notes</h3>
                  <p className="text-xs text-slate-500">Quick takeaways and code notes</p>
                </div>
                <button
                  onClick={() => setAddNoteModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Note</span>
                </button>
              </div>

              <div className="space-y-3">
                {notes.map((note) => (
                  <div key={note._id} className="p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{note.title}</h4>
                      <p className="text-[11px] text-slate-400 line-clamp-1">{note.content}</p>
                    </div>
                    <button
                      onClick={() => setDeletingItem({ type: 'note', id: note._id, title: note.title })}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                      title="Delete Note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7. MANAGE BOOKMARKS */}
          {activeTab === 'bookmarks' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Manage Bookmarks</h3>
                  <p className="text-xs text-slate-500">Curate external documentation and repository links</p>
                </div>
                <button
                  onClick={() => setAddBookmarkModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Bookmark</span>
                </button>
              </div>

              <div className="space-y-3">
                {bookmarks.map((bm) => (
                  <div key={bm._id} className="p-4 rounded-xl border border-slate-200/80 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{bm.title}</h4>
                      <p className="text-[11px] text-slate-400">{bm.url}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingItem({ type: 'bookmark', item: bm })}
                        className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg"
                        title="Edit Bookmark"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingItem({ type: 'bookmark', id: bm._id, title: bm.title })}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg ml-1"
                        title="Delete Bookmark"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 8. USER MANAGEMENT */}
          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Private User Accounts</h3>
                    <p className="text-xs text-slate-500">LearnVault is private for you and your study friend</p>
                  </div>
                </div>

                {userActionMsg && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs rounded-xl flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{userActionMsg}</span>
                  </div>
                )}

                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 text-slate-600 font-bold uppercase text-[10px]">
                      <tr>
                        <th className="px-4 py-3 rounded-l-xl">User Name</th>
                        <th className="px-4 py-3">Email</th>
                        <th className="px-4 py-3">Role</th>
                        <th className="px-4 py-3 rounded-r-xl text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {users.map((u) => (
                        <tr key={u.id} className="hover:bg-slate-50">
                          <td className="px-4 py-3 font-semibold text-slate-800">{u.name}</td>
                          <td className="px-4 py-3 text-slate-500">{u.email}</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                                u.role === 'admin'
                                  ? 'bg-slate-100 text-purple-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {u.role === 'admin' ? 'Admin' : 'Friend / User'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {u.id !== user?.id && (
                              <button
                                onClick={() => setDeletingItem({ type: 'user', id: u.id, title: u.name })}
                                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                                title="Remove User"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Add Friend Form */}
              <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
                <h4 className="text-sm font-bold text-slate-800">Add Friend / Study Mate Account</h4>
                <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <input
                    type="text"
                    placeholder="Friend's Name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    required
                  />
                  <input
                    type="email"
                    placeholder="Email (e.g. friend@...)"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    required
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={newUserPassword}
                    onChange={(e) => setNewUserPassword(e.target.value)}
                    className="px-3.5 py-2 text-xs rounded-xl border border-slate-200"
                    required
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs"
                  >
                    Create Account
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* 9. SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-6">
              <div>
                <h3 className="text-base font-bold text-slate-900">LearnVault System Configuration</h3>
                <p className="text-xs text-slate-500">Repository storage and platform settings</p>
              </div>

              <div className="space-y-4 text-xs">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Storage Provider Engine</p>
                    <p className="text-slate-500 text-[11px]">
                      Currently utilizing Local Storage Provider abstraction with preserved original files.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-purple-600 text-white font-bold rounded-lg text-[10px]">
                    Active (Local)
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Document Editing Mode</p>
                    <p className="text-slate-500 text-[11px]">
                      Documents are read-only to preserve exact learning references.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-slate-100 text-purple-800 font-bold rounded-lg text-[10px]">
                    Read-Only Locked
                  </span>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Private Community Access</p>
                    <p className="text-slate-500 text-[11px]">
                      Restricted to authenticated Admin and Friend. No public or social feeds.
                    </p>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[10px]">
                    Private Vault
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Modals */}
      <UploadDocumentModal
        isOpen={uploadDocModalOpen}
        onClose={() => setUploadDocModalOpen(false)}
        onSuccess={loadAllData}
      />

      <AddTopicModal
        isOpen={addTopicModalOpen}
        onClose={() => setAddTopicModalOpen(false)}
        onSuccess={loadAllData}
      />

      <AddVideoModal
        isOpen={addVideoModalOpen}
        onClose={() => setAddVideoModalOpen(false)}
        onSuccess={loadAllData}
      />

      <AddProjectModal
        isOpen={addProjectModalOpen}
        onClose={() => setAddProjectModalOpen(false)}
        onSuccess={loadAllData}
      />

      <AddNoteModal
        isOpen={addNoteModalOpen}
        onClose={() => setAddNoteModalOpen(false)}
        onSuccess={loadAllData}
      />

      <AddBookmarkModal
        isOpen={addBookmarkModalOpen}
        onClose={() => setAddBookmarkModalOpen(false)}
        onSuccess={loadAllData}
      />

      <EditMetadataModal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        onSuccess={loadAllData}
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
