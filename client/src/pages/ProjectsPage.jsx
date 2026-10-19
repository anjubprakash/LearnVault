import React, { useState, useEffect } from 'react';
import { FolderGit2, Search, Plus } from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { ProjectCard } from '../components/ProjectCard.jsx';
import { DocumentViewerModal } from '../components/DocumentViewerModal.jsx';
import { VideoPlayerModal } from '../components/VideoPlayerModal.jsx';
import { AddProjectModal } from '../components/AddProjectModal.jsx';
import { EditMetadataModal } from '../components/EditMetadataModal.jsx';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal.jsx';

export const ProjectsPage = () => {
  const { isAdmin } = useAuth();
  const [projects, setProjects] = useState([]);
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [loading, setLoading] = useState(true);

  // Modals
  const [activeDoc, setActiveDoc] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);
  const [addProjectModalOpen, setAddProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [deletingProject, setDeletingProject] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const [projectsData, topicsData] = await Promise.all([
        api.getProjects({
          topic: selectedTopic || undefined,
          status: selectedStatus || undefined,
        }),
        api.getTopics(),
      ]);
      setProjects(projectsData);
      setTopics(topicsData);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, [selectedTopic, selectedStatus]);

  const handleDelete = async () => {
    if (!deletingProject) return;
    try {
      setDeleteLoading(true);
      await api.deleteProject(deletingProject._id);
      setDeletingProject(null);
      loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.technology.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Learning Projects</h2>
          <p className="text-xs text-slate-500 mt-1">
            Real-world projects created to put our learning into practice
          </p>
        </div>

        <button
          onClick={() => setAddProjectModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Project</span>
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
            placeholder="Search projects by name, technology, or stack..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 bg-slate-50/50"
          />
        </div>

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

        <div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:outline-hidden focus:border-purple-500"
          >
            <option value="">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="In Progress">In Progress</option>
            <option value="Planning">Planning</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Loading learning projects...</div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center">
          <FolderGit2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No projects found</h4>
          <p className="text-xs text-slate-500 mt-1">Record a project you built while studying.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onOpenDoc={(d) => setActiveDoc(d)}
              onWatchVideo={(v) => setActiveVideo(v)}
              onEdit={(p) => setEditingProject(p)}
              onDelete={(p) => setDeletingProject(p)}
            />
          ))}
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

      <AddProjectModal
        isOpen={addProjectModalOpen}
        onClose={() => setAddProjectModalOpen(false)}
        onSuccess={loadProjects}
      />

      <EditMetadataModal
        isOpen={!!editingProject}
        onClose={() => setEditingProject(null)}
        onSuccess={loadProjects}
        itemType="project"
        item={editingProject}
      />

      <DeleteConfirmModal
        isOpen={!!deletingProject}
        onClose={() => setDeletingProject(null)}
        onConfirm={handleDelete}
        title="Delete Project"
        message={`Are you sure you want to delete "${deletingProject?.title}"?`}
        loading={deleteLoading}
      />
    </div>
  );
};
