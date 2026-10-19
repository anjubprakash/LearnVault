import React from 'react';
import {
  Eye,
  Download,
  Star,
  Edit3,
  Trash2,
  Play,
  Film,
  HardDrive,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { driveService } from '../services/driveService.js';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
};

export const DocumentCard = ({
  document: doc,
  onView,
  onEdit,
  onDelete,
  onWatchVideo,
}) => {
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite('document', doc._id);

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const topicTitle = typeof doc.topic === 'object' ? doc.topic?.title : 'Study Topic';
  const hasLinkedVideo = !!(doc.relatedVideo || doc.videoUrl);
  const isDrive = doc.isDrive || !!doc.driveFileId || driveService.isGoogleDriveUrl(doc.driveUrl);

  const handleWatchLinkedVideo = () => {
    if (!onWatchVideo) return;
    if (doc.relatedVideo && typeof doc.relatedVideo === 'object') {
      onWatchVideo(doc.relatedVideo);
    } else if (doc.videoUrl) {
      const ytId = extractYouTubeId(doc.videoUrl);
      onWatchVideo({
        _id: doc._id,
        title: doc.videoTitle || `${doc.title} Tutorial Video`,
        youtubeUrl: doc.videoUrl,
        youtubeId: ytId || '',
        thumbnailUrl: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '',
        channelName: 'YouTube Educator',
        topic: doc.topic,
      });
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Badge, Topic, Favorite */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            {isDrive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-bold tracking-wide border border-purple-200">
                <HardDrive className="w-3 h-3 text-purple-700" />
                <span>Google Drive</span>
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold uppercase tracking-wider border border-slate-200/60">
                {doc.fileType}
              </span>
            )}
            <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[11px] font-medium truncate max-w-[130px] border border-slate-100">
              {topicTitle}
            </span>
          </div>

          <button
            onClick={() => toggleFavorite('document', doc._id)}
            className={`p-1.5 rounded-lg transition-colors ${
              favorited
                ? 'text-amber-500 hover:text-amber-600'
                : 'text-slate-300 hover:text-amber-400'
            }`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${favorited ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Title & Description */}
        <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1 mb-1">
          {doc.title}
        </h4>
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {doc.description || 'Study reference material preserved in LearnVault.'}
        </p>

        {/* Tags */}
        {doc.tags && doc.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {doc.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] rounded font-medium border border-purple-100"
              >
                #{tag}
              </span>
            ))}
            {doc.tags.length > 3 && (
              <span className="text-[10px] text-slate-400">+{doc.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Linked Video Section if Present */}
        {hasLinkedVideo && (
          <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-6 h-6 rounded-lg bg-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Play className="w-3 h-3 fill-white ml-0.5" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] font-bold text-slate-900 truncate">
                  {doc.relatedVideo?.title || doc.videoTitle || 'Linked Tutorial Video'}
                </p>
                <span className="text-[9px] text-purple-600 font-semibold flex items-center gap-0.5">
                  <Film className="w-2.5 h-2.5" /> Video Attached
                </span>
              </div>
            </div>
            {onWatchVideo && (
              <button
                onClick={handleWatchLinkedVideo}
                className="px-2.5 py-1 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold shadow-2xs transition-colors shrink-0"
              >
                Watch
              </button>
            )}
          </div>
        )}
      </div>

      <div>
        {/* File Stats */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 py-2.5 border-t border-slate-100">
          <span>{formatFileSize(doc.fileSize)}</span>
          <div className="flex items-center gap-2.5">
            <span className="flex items-center gap-1" title="Views">
              <Eye className="w-3.5 h-3.5 text-purple-500" />
              {doc.viewCount || 0}
            </span>
            <span className="flex items-center gap-1" title="Downloads">
              <Download className="w-3.5 h-3.5 text-slate-400" />
              {doc.downloadCount || 0}
            </span>
          </div>
        </div>

        {/* Action Buttons: [View] & [Download] */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={() => onView(doc)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View</span>
          </button>

          <button
            onClick={() => api.downloadDocument(doc)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold border border-slate-200/80 transition-colors"
            title="Download original file"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Download</span>
          </button>

          {/* Action Controls */}
          {(onEdit || onDelete) && (
            <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
              {onEdit && (
                <button
                  onClick={() => onEdit(doc)}
                  className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Edit Metadata"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(doc)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete Document"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
