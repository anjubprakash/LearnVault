import React, { useState, useEffect } from 'react';
import { X, FolderPlus, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

export const AddTopicModal = ({
  isOpen,
  onClose,
  onSuccess,
  parentTopicId,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Programming Languages');
  const [parentTopic, setParentTopic] = useState(parentTopicId || '');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      api.getTopics().then(setTopics).catch(() => {});
      if (parentTopicId) setParentTopic(parentTopicId);
      setError(null);
    }
  }, [isOpen, parentTopicId]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !category) {
      setError('Title and Category are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      await api.createTopic({
        title: title.trim(),
        description: description.trim() || `Everything I have learned about ${title.trim()}.`,
        category,
        parentTopic: parentTopic || null,
      });

      onSuccess();
      onClose();
      // Reset
      setTitle('');
      setDescription('');
      setParentTopic('');
    } catch (err) {
      setError(err.message || 'Failed to create topic');
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
              <FolderPlus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Create Learning Topic</h3>
              <p className="text-xs text-slate-500">Organize knowledge hierarchically</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Topic Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. C#, React, OOP, LINQ, Hooks"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100 bg-white"
              >
                <option value="Programming Languages">Programming Languages</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Databases">Databases</option>
                <option value="DevOps &amp; Tools">DevOps &amp; Tools</option>
                <option value="Concepts &amp; Architecture">Concepts &amp; Architecture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Parent Topic (Hierarchy)</label>
              <select
                value={parentTopic}
                onChange={(e) => {
                  setParentTopic(e.target.value);
                  const selected = topics.find((t) => t._id === e.target.value);
                  if (selected) setCategory(selected.category);
                }}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100 bg-white"
              >
                <option value="">None (Top-Level Topic)</option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.level > 0 ? `— ${t.title}` : t.title} ({t.category})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Everything I have learned about C#."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
            />
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
              {loading ? 'Creating...' : 'Create Topic'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
