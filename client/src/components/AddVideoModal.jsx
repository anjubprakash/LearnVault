import React, { useState, useEffect } from 'react';
import { X, Video, Play, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';

export const AddVideoModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTopicId,
}) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [channelName, setChannelName] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('');
  const [topicId, setTopicId] = useState(defaultTopicId || '');
  const [tags, setTags] = useState('');
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      api.getTopics().then(setTopics).catch(() => {});
      if (defaultTopicId) setTopicId(defaultTopicId);
      setError(null);
    }
  }, [isOpen, defaultTopicId]);

  if (!isOpen) return null;

  // Extract YouTube ID for preview
  const extractId = (url) => {
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? match[2] : null;
  };
  const previewId = extractId(youtubeUrl);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!youtubeUrl || !title || !topicId) {
      setError('Please provide a YouTube URL, Title, and Topic.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await api.addVideo({
        youtubeUrl: youtubeUrl.trim(),
        title: title.trim(),
        channelName: channelName.trim() || 'YouTube Educator',
        description: description.trim(),
        duration: duration.trim(),
        topic: topicId,
        tags: tags.split(',').map((t) => t.trim()).filter(Boolean),
      });

      onSuccess();
      onClose();
      // Reset
      setYoutubeUrl('');
      setTitle('');
      setChannelName('');
      setDescription('');
      setDuration('');
      setTags('');
    } catch (err) {
      setError(err.message || 'Failed to save video');
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
              <Video className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Save Educational Video</h3>
              <p className="text-xs text-slate-500">Embed YouTube tutorials directly into your topics</p>
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

          {/* YouTube URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">YouTube URL *</label>
            <input
              type="url"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
              required
            />
          </div>

          {/* Live Thumbnail Preview */}
          {previewId && (
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
              <div className="relative w-28 aspect-video rounded-lg overflow-hidden bg-slate-200 shrink-0">
                <img
                  src={`https://img.youtube.com/vi/${previewId}/hqdefault.jpg`}
                  alt="Thumbnail"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </div>
              <div className="text-xs">
                <p className="font-semibold text-purple-900">Valid YouTube Video detected</p>
                <p className="text-slate-500">Thumbnail will be automatically retrieved and stored.</p>
              </div>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Video Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. C# Complete Beginner Tutorial"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
              required
            />
          </div>

          {/* Channel Name & Duration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Channel Name</label>
              <input
                type="text"
                value={channelName}
                onChange={(e) => setChannelName(e.target.value)}
                placeholder="e.g. freeCodeCamp.org"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Duration (optional)</label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 45:30"
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
              />
            </div>
          </div>

          {/* Topic Select */}
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

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Short Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this tutorial teach?"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-slate-1000 focus:ring-2 focus:ring-purple-100"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Tags <span className="font-normal text-slate-400">(comma separated)</span>
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="e.g. C#, OOP, Beginner, Tutorial"
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
              disabled={loading || !youtubeUrl}
              className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Video'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
