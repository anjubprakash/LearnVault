import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Upload,
  FileUp,
  CheckCircle2,
  AlertCircle,
  FileText,
  Video as VideoIcon,
  Link2,
  Film,
  Play,
  HardDrive,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.js';
import { driveService } from '../services/driveService.js';

export const UploadDocumentModal = ({
  isOpen,
  onClose,
  onSuccess,
  defaultTopicId,
}) => {
  // Source: 'local' | 'drive'
  const [sourceType, setSourceType] = useState('local');
  const [driveUrl, setDriveUrl] = useState('');

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [topicId, setTopicId] = useState(defaultTopicId || '');
  const [category, setCategory] = useState('Programming Languages');
  const [tags, setTags] = useState('');
  const [topics, setTopics] = useState([]);
  const [allVideos, setAllVideos] = useState([]);

  // Video Linking State: 'none' | 'existing' | 'link'
  const [videoLinkMode, setVideoLinkMode] = useState('none');
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [pastedVideoUrl, setPastedVideoUrl] = useState('');
  const [pastedVideoTitle, setPastedVideoTitle] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      Promise.all([api.getTopics(), api.getVideos()])
        .then(([topicsData, videosData]) => {
          setTopics(topicsData || []);
          setAllVideos(videosData || []);
        })
        .catch(() => {});

      if (defaultTopicId) setTopicId(defaultTopicId);
      setError(null);
      setSuccessMsg(null);
    }
  }, [isOpen, defaultTopicId]);

  if (!isOpen) return null;

  const extractYouTubeId = (url) => {
    if (!url) return null;
    const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
    return match && match[2].length === 11 ? match[2] : null;
  };

  const detectedDriveId = driveService.extractDriveFileId(driveUrl);
  const previewVideoId = extractYouTubeId(pastedVideoUrl);
  const selectedVideoObj = allVideos.find((v) => v._id === selectedVideoId);

  const handleFileSelect = (selectedFile) => {
    setFile(selectedFile);
    if (!title) {
      const nameWithoutExt = selectedFile.name.replace(/\.[^/.]+$/, '');
      setTitle(nameWithoutExt);
    }
    setError(null);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (sourceType === 'local' && !file) {
      setError('Please select or drop a file to upload.');
      return;
    }

    if (sourceType === 'drive' && !driveUrl.trim()) {
      setError('Please enter a Google Drive file link.');
      return;
    }

    if (sourceType === 'drive' && !detectedDriveId) {
      setError('Please enter a valid Google Drive file share link (e.g. https://drive.google.com/file/d/.../view).');
      return;
    }

    if (!topicId) {
      setError('Please select a topic for this document.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.uploadDocument({
        file: sourceType === 'local' ? file : null,
        driveUrl: sourceType === 'drive' ? driveUrl.trim() : '',
        title: title.trim() || (file ? file.name : 'Google Drive Document'),
        description: description.trim(),
        topic: topicId,
        category,
        tags,
        relatedVideo: videoLinkMode === 'existing' ? selectedVideoId : null,
        videoUrl: videoLinkMode === 'link' ? pastedVideoUrl.trim() : '',
        videoTitle: videoLinkMode === 'link' ? pastedVideoTitle.trim() : '',
      });

      setSuccessMsg(res.message || 'Document saved successfully.');

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        // Reset state
        setFile(null);
        setDriveUrl('');
        setTitle('');
        setDescription('');
        setTags('');
        setVideoLinkMode('none');
        setSelectedVideoId('');
        setPastedVideoUrl('');
        setPastedVideoTitle('');
        setSuccessMsg(null);
      }, 700);
    } catch (err) {
      setError(err.message || 'Failed to save document.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 my-8 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add Study Document</h3>
              <p className="text-xs text-slate-500">Upload from device or connect directly from Google Drive</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Storage Source Switch: Local Upload vs Google Drive */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">Document Source</label>
            <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setSourceType('local')}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  sourceType === 'local'
                    ? 'bg-white text-purple-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <FileUp className="w-3.5 h-3.5" />
                <span>Upload From Device</span>
              </button>

              <button
                type="button"
                onClick={() => setSourceType('drive')}
                className={`py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                  sourceType === 'drive'
                    ? 'bg-white text-purple-900 shadow-2xs font-bold'
                    : 'text-slate-600 hover:text-purple-700'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5 text-purple-600" />
                <span>Connect Google Drive</span>
              </button>
            </div>
          </div>

          {/* Source Option A: Local File Drag & Drop */}
          {sourceType === 'local' && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-colors ${
                isDragging
                  ? 'border-purple-600 bg-purple-50/50'
                  : file
                  ? 'border-purple-300 bg-purple-50/30'
                  : 'border-slate-200 hover:border-purple-300 hover:bg-slate-50'
              }`}
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                className="hidden"
                accept=".pdf,.docx,.pptx,.xlsx,.txt,.md,.markdown,.png,.jpg,.jpeg,.webp"
              />
              {file ? (
                <div className="flex items-center justify-center gap-3">
                  <FileText className="w-8 h-8 text-purple-600" />
                  <div className="text-left">
                    <p className="text-sm font-semibold text-slate-900">{file.name}</p>
                    <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB • Click to change file</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-1">
                  <FileUp className="w-8 h-8 text-purple-500 mx-auto mb-1.5" />
                  <p className="text-sm font-semibold text-slate-800">
                    Drag &amp; Drop file here or <span className="text-purple-600 underline">Choose File</span>
                  </p>
                  <p className="text-[11px] text-slate-400">
                    PDF, DOCX, PPTX, XLSX, TXT, Markdown, Images (Saved in Browser Storage)
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Source Option B: Google Drive Link Input */}
          {sourceType === 'drive' && (
            <div className="space-y-3 p-4 bg-purple-50/40 rounded-2xl border border-purple-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Google Drive File Link *
                </label>
                <div className="relative">
                  <HardDrive className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="url"
                    value={driveUrl}
                    onChange={(e) => {
                      setDriveUrl(e.target.value);
                      if (!title && e.target.value) {
                        setTitle('Google Drive Study Document');
                      }
                    }}
                    placeholder="https://drive.google.com/file/d/1BxiMVs.../view?usp=sharing"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 bg-white"
                  />
                </div>
              </div>

              {detectedDriveId ? (
                <div className="flex items-center gap-2 p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-xs">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <p className="font-bold">Google Drive File Detected</p>
                    <p className="text-[11px] text-emerald-700">
                      ID: <span className="font-mono">{detectedDriveId.slice(0, 16)}...</span> • Direct in-website preview and download enabled!
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-[11px] text-slate-500 leading-relaxed">
                  <p>
                    Tip: In Google Drive, click <strong>Share → Copy link</strong> on any file.
                  </p>
                  <a
                    href={driveService.getRootDriveFolderUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-purple-600 hover:text-purple-700 font-semibold underline shrink-0"
                  >
                    <span>Open My Drive Folder</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Document Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title *</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. C# OOP Concepts &amp; Inheritance"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
              required
            />
          </div>

          {/* Topic & Category Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Topic *</label>
              <select
                value={topicId}
                onChange={(e) => {
                  setTopicId(e.target.value);
                  const selected = topics.find((t) => t._id === e.target.value);
                  if (selected) setCategory(selected.category);
                }}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white"
                required
              >
                <option value="">Select a Topic</option>
                {topics.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.level > 0 ? `— ${t.title}` : t.title} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-white"
              >
                <option value="Programming Languages">Programming Languages</option>
                <option value="Frontend">Frontend</option>
                <option value="Backend">Backend</option>
                <option value="Databases">Databases</option>
                <option value="DevOps &amp; Tools">DevOps &amp; Tools</option>
                <option value="Concepts &amp; Architecture">Concepts &amp; Architecture</option>
              </select>
            </div>
          </div>

          {/* VIDEO LINKING SECTION */}
          <div className="pt-2 border-t border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <VideoIcon className="w-4 h-4 text-purple-600" />
                <span>Link Tutorial Video (Optional)</span>
              </label>
              <span className="text-[11px] text-slate-400">Pair this document with a video</span>
            </div>

            {/* Mode Selector Tabs */}
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setVideoLinkMode('none')}
                className={`py-1.5 rounded-lg font-semibold transition-all ${
                  videoLinkMode === 'none'
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                No Video
              </button>
              <button
                type="button"
                onClick={() => setVideoLinkMode('existing')}
                className={`py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                  videoLinkMode === 'existing'
                    ? 'bg-white text-purple-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-purple-700'
                }`}
              >
                <Film className="w-3 h-3" />
                <span>Saved Videos ({allVideos.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setVideoLinkMode('link')}
                className={`py-1.5 rounded-lg font-semibold transition-all flex items-center justify-center gap-1 ${
                  videoLinkMode === 'link'
                    ? 'bg-white text-purple-700 shadow-2xs font-bold'
                    : 'text-slate-500 hover:text-purple-700'
                }`}
              >
                <Link2 className="w-3 h-3" />
                <span>Paste Link</span>
              </button>
            </div>

            {/* Mode A: Select from existing saved videos */}
            {videoLinkMode === 'existing' && (
              <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <label className="block text-[11px] font-semibold text-slate-700">
                  Select from all uploaded/saved videos:
                </label>
                {allVideos.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">
                    No videos saved in the library yet. You can paste a video link instead!
                  </p>
                ) : (
                  <select
                    value={selectedVideoId}
                    onChange={(e) => setSelectedVideoId(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-purple-500"
                  >
                    <option value="">-- Choose a Saved Video --</option>
                    {allVideos.map((vid) => (
                      <option key={vid._id} value={vid._id}>
                        {vid.title} ({vid.channelName || 'YouTube'})
                      </option>
                    ))}
                  </select>
                )}

                {selectedVideoObj && (
                  <div className="flex items-center gap-3 p-2.5 bg-white rounded-lg border border-slate-200 mt-2">
                    <img
                      src={selectedVideoObj.thumbnailUrl}
                      alt={selectedVideoObj.title}
                      className="w-16 aspect-video object-cover rounded shrink-0 bg-slate-200"
                    />
                    <div className="min-w-0 text-left">
                      <p className="text-xs font-bold text-slate-900 truncate">{selectedVideoObj.title}</p>
                      <p className="text-[10px] text-purple-600 font-medium">{selectedVideoObj.channelName}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mode B: Paste a YouTube Video Link */}
            {videoLinkMode === 'link' && (
              <div className="space-y-2.5 p-3 bg-slate-50 rounded-xl border border-slate-200/80">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    YouTube Video URL:
                  </label>
                  <input
                    type="url"
                    value={pastedVideoUrl}
                    onChange={(e) => setPastedVideoUrl(e.target.value)}
                    placeholder="https://www.youtube.com/watch?v=..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>

                {previewVideoId && (
                  <div className="flex items-center gap-3 p-2 bg-white rounded-lg border border-slate-200">
                    <div className="relative w-20 aspect-video rounded overflow-hidden bg-slate-200 shrink-0">
                      <img
                        src={`https://img.youtube.com/vi/${previewVideoId}/hqdefault.jpg`}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <Play className="w-3 h-3 text-white fill-white" />
                      </div>
                    </div>
                    <div className="text-[11px]">
                      <p className="font-semibold text-purple-700">Valid YouTube link attached</p>
                      <p className="text-slate-500">Will be linked to this document &amp; saved to library</p>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Video Title <span className="font-normal text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={pastedVideoTitle}
                    onChange={(e) => setPastedVideoTitle(e.target.value)}
                    placeholder="e.g. C# Beginners Tutorial - Crash Course"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-hidden focus:border-purple-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What does this study document cover?"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
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
              placeholder="e.g. OOP, Classes, Inheritance, C#"
              className="w-full px-3.5 py-2 text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition-all"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shadow-sm transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Document'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
