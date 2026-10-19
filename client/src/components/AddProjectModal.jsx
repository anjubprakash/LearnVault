import React, { useState, useEffect } from 'react';
import { X, FolderGit2, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

export const AddProjectModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTopicId,
}) => {
  const [title, setTitle] = useState('');
  const [technology, setTechnology] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('Completed');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [topicId, setTopicId] = useState(defaultTopicId || '');
  const [selectedDocs, setSelectedDocs] = useState([]);
  const [selectedVideos, setSelectedVideos] = useState([]);

  const [topics, setTopics] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      api.getTopics().then(setTopics).catch(() => {});
      api.getDocuments().then(setDocuments).catch(() => {});
      api.getVideos().then(setVideos).catch(() => {});
      if (defaultTopicId) setTopicId(defaultTopicId);
      setError(null);
    }
  }, [isOpen, defaultTopicId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !technology || !topicId) {
      setError('Title, Technology Stack, and Topic are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.createProject({
        title: title.trim(),
        technology: technology.trim(),
        description: description.trim(),
        status,
        githubUrl: githubUrl.trim(),
        demoUrl: demoUrl.trim(),
        driveFolderUrl: driveFolderUrl.trim(),
        topic: topicId,
        relatedDocuments: selectedDocs,
        relatedVideos: selectedVideos,
      });

      onSuccess();
      onClose();
      // Reset
      setTitle('');
      setTechnology('');
      setDescription('');
      setGithubUrl('');
      setDemoUrl('');
      setDriveFolderUrl('');
      setSelectedDocs([]);
      setSelectedVideos([]);
    } catch (err) {
      setError(err.message || 'Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200/80 my-8">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-purple-700 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Learning Project</h3>
              <p className="text-xs text-slate-500">Track projects built while studying new technologies</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Project Name *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Employee Management System"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Technology Stack *</label>
              <input
                type="text"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                placeholder="e.g. C#, .NET 9, SQL Server"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100 bg-white"
              >
                <option value="Completed">Completed</option>
                <option value="In Progress">In Progress</option>
                <option value="Planning">Planning</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Learning Topic *</label>
            <select
              value={topicId}
              onChange={(e) => setTopicId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100 bg-white"
              required
            >
              <option value="">Select Topic</option>
              {topics.map((t) => (
                <option key={t._id} value={t._id}>
                  {t.title} ({t.category})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub Repository URL</label>
            <input
              type="url"
              value={githubUrl}
              onChange={(e) => setGithubUrl(e.target.value)}
              placeholder="https://github.com/..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Live Demo / Documentation Link</label>
            <input
              type="url"
              value={demoUrl}
              onChange={(e) => setDemoUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Drive Folder / Storage Link <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <input
              type="url"
              value={driveFolderUrl}
              onChange={(e) => setDriveFolderUrl(e.target.value)}
              placeholder="https://drive.google.com/drive/folders/... (or leave blank to search Drive by project name)"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              If left blank, LearnVault will automatically open a Google Drive search filtered for this project's title.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What did you learn and build in this project?"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          {/* Connect Related Study Documents */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Connect Related Documents <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
              {documents.length === 0 ? (
                <p className="text-xs text-slate-400">No documents uploaded yet.</p>
              ) : (
                documents.map((d) => (
                  <label key={d._id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-purple-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedDocs.includes(d._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedDocs([...selectedDocs, d._id]);
                        else setSelectedDocs(selectedDocs.filter((id) => id !== d._id));
                      }}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="truncate">{d.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Connect Related Videos */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Connect Related Videos <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <div className="max-h-28 overflow-y-auto border border-slate-200 rounded-xl p-2 space-y-1 bg-slate-50">
              {videos.length === 0 ? (
                <p className="text-xs text-slate-400">No videos saved yet.</p>
              ) : (
                videos.map((v) => (
                  <label key={v._id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:bg-purple-50 p-1 rounded">
                    <input
                      type="checkbox"
                      checked={selectedVideos.includes(v._id)}
                      onChange={(e) => {
                        if (e.target.checked) setSelectedVideos([...selectedVideos, v._id]);
                        else setSelectedVideos(selectedVideos.filter((id) => id !== v._id));
                      }}
                      className="rounded text-purple-600 focus:ring-purple-500"
                    />
                    <span className="truncate">{v.title}</span>
                  </label>
                ))
              )}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shadow-sm disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Save Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
