import React, { useState, useEffect } from 'react';
import { X, Edit3, AlertCircle, Lock } from 'lucide-react';
import { api } from '../services/api.js';

export const EditMetadataModal = ({
  isOpen,
  onClose,
  onSuccess,
  itemType,
  item,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [topicId, setTopicId] = useState('');
  const [tags, setTags] = useState('');
  const [technology, setTechnology] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [driveFolderUrl, setDriveFolderUrl] = useState('');
  const [status, setStatus] = useState('Completed');
  const [url, setUrl] = useState('');
  const [channelName, setChannelName] = useState('');

  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && item) {
      api.getTopics().then(setTopics).catch(() => {});

      setTitle(item.title || '');
      setDescription(item.description || '');
      setCategory(item.category || 'Programming Languages');
      setTopicId(typeof item.topic === 'object' ? item.topic?._id : item.topic || '');
      setTags(item.tags ? (Array.isArray(item.tags) ? item.tags.join(', ') : item.tags) : '');
      setTechnology(item.technology || '');
      setGithubUrl(item.githubUrl || '');
      setDriveFolderUrl(item.driveFolderUrl || '');
      setStatus(item.status || 'Completed');
      setUrl(item.url || '');
      setChannelName(item.channelName || '');
      setError(null);
    }
  }, [isOpen, item]);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title) {
      setError('Title is required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const parsedTags = tags.split(',').map((t) => t.trim()).filter(Boolean);

      if (itemType === 'document') {
        // Explicitly updates METADATA ONLY! File content is untouched!
        await api.updateDocumentMetadata(item._id, {
          title: title.trim(),
          description: description.trim(),
          category,
          topic: topicId,
          tags: parsedTags,
        });
      } else if (itemType === 'video') {
        await api.updateVideo(item._id, {
          title: title.trim(),
          description: description.trim(),
          channelName: channelName.trim(),
          topic: topicId,
          tags: parsedTags,
        });
      } else if (itemType === 'project') {
        await api.updateProject(item._id, {
          title: title.trim(),
          description: description.trim(),
          technology: technology.trim(),
          status: status,
          githubUrl: githubUrl.trim(),
          driveFolderUrl: driveFolderUrl.trim(),
          topic: topicId,
        });
      } else if (itemType === 'topic') {
        await api.updateTopic(item._id, {
          title: title.trim(),
          description: description.trim(),
          category,
          parentTopic: topicId || null,
        });
      } else if (itemType === 'bookmark') {
        await api.updateBookmark(item._id, {
          title: title.trim(),
          url: url.trim(),
          description: description.trim(),
          category: category,
          topic: topicId,
          tags: parsedTags,
        });
      }

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to update metadata');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200/80 my-8">
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-purple-700 flex items-center justify-center">
              <Edit3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Edit {itemType.charAt(0).toUpperCase() + itemType.slice(1)} Metadata
              </h3>
              <p className="text-xs text-slate-500">Update descriptive details and associations</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Read-Only Notice for Documents */}
        {itemType === 'document' && (
          <div className="mx-6 mt-4 p-2.5 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center gap-2 text-xs text-purple-800">
            <Lock className="w-4 h-4 text-purple-600 shrink-0" />
            <span>
              <strong>Note:</strong> Original document file contents remain strictly untouched and preserved. Only metadata is edited.
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
              required
            />
          </div>

          {itemType === 'project' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Technology Stack</label>
              <input
                type="text"
                value={technology}
                onChange={(e) => setTechnology(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          )}

          {itemType === 'project' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white"
                >
                  <option value="Completed">Completed</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Planning">Planning</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
                />
              </div>
            </div>
          )}

          {itemType === 'project' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Google Drive Storage / Folder Link <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <input
                type="url"
                value={driveFolderUrl}
                onChange={(e) => setDriveFolderUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/... (leave empty to search Drive by project name)"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
          )}

          {itemType === 'video' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Channel Name</label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
          )}

          {itemType === 'bookmark' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
          )}

          {itemType !== 'topic' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic</label>
              <select
                value={topicId}
                onChange={(e) => setTopicId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white"
              >
                <option value="">Select Topic</option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.title} ({t.category})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 bg-white"
            >
              <option value="Programming Languages">Programming Languages</option>
              <option value="Frontend">Frontend</option>
              <option value="Backend">Backend</option>
              <option value="Databases">Databases</option>
              <option value="DevOps & Tools">DevOps & Tools</option>
              <option value="Concepts & Architecture">Concepts & Architecture</option>
              <option value="Documentation">Documentation</option>
              <option value="GitHub Repository">GitHub Repository</option>
              <option value="Tutorial">Tutorial</option>
              <option value="Tool">Tool</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000"
            />
          </div>

          {itemType !== 'topic' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200"
              />
            </div>
          )}

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
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
