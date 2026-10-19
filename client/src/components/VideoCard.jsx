import React from 'react';
import { Play, Star, Eye, Edit3, Trash2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export const VideoCard = ({
  video,
  onWatch,
  onEdit,
  onDelete,
}) => {
  const { isAdmin } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite('video', video._id);
  const topicTitle = typeof video.topic === 'object' ? video.topic?.title : 'Study Topic';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Thumbnail Container */}
        <div
          onClick={() => onWatch(video)}
          className="relative aspect-video w-full bg-slate-900 cursor-pointer overflow-hidden group/thumb"
        >
          <img
            src={video.thumbnailUrl}
            alt={video.title}
            className="w-full h-full object-cover group-hover/thumb:scale-105 transition-transform duration-300"
            onError={(e) => {
              e.target.src = `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg`;
            }}
          />
          <div className="absolute inset-0 bg-slate-900/30 group-hover/thumb:bg-slate-900/10 transition-colors flex items-center justify-center">
            <div className="w-12 h-12 rounded-full bg-purple-600/90 text-white flex items-center justify-center shadow-lg group-hover/thumb:scale-110 transition-transform">
              <Play className="w-5 h-5 fill-white ml-0.5" />
            </div>
          </div>

          {video.duration && (
            <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-slate-950/80 text-white text-[10px] font-bold flex items-center gap-1 backdrop-blur-xs">
              <Clock className="w-3 h-3 text-purple-300" />
              {video.duration}
            </span>
          )}

          {/* Favorite Button on Thumbnail */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleFavorite('video', video._id);
            }}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 backdrop-blur-xs hover:bg-white text-slate-700 transition-colors"
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${favorited ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
          </button>
        </div>

        {/* Video Metadata */}
        <div className="p-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2 py-0.5 rounded-md bg-purple-50 text-purple-700 text-[11px] font-bold truncate max-w-[150px] border border-purple-100/60">
              {topicTitle}
            </span>
            <span className="text-[11px] text-slate-400">•</span>
            <span className="text-[11px] font-medium text-slate-600 truncate">
              {video.channelName || 'YouTube Educator'}
            </span>
          </div>

          <h4
            onClick={() => onWatch(video)}
            className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors cursor-pointer line-clamp-2 mb-2 leading-snug"
          >
            {video.title}
          </h4>

          {video.description && (
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
              {video.description}
            </p>
          )}

          {/* Tags */}
          {video.tags && video.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {video.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] rounded font-medium border border-slate-200/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Bar: [Watch] button and Views */}
      <div className="px-4 pb-4 pt-1 flex items-center justify-between border-t border-slate-100 mt-1">
        <span className="text-[11px] text-slate-400 flex items-center gap-1">
          <Eye className="w-3.5 h-3.5 text-purple-500" />
          {video.watchCount || 0} views
        </span>

        <div className="flex items-center gap-2">
          {isAdmin && (onEdit || onDelete) && (
            <div className="flex items-center gap-1 pr-1 border-r border-slate-200">
              {onEdit && (
                <button
                  onClick={() => onEdit(video)}
                  className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition-colors"
                  title="Edit Video"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(video)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                  title="Delete Video"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}

          <button
            onClick={() => onWatch(video)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Play className="w-3 h-3 fill-white" />
            <span>Watch</span>
          </button>
        </div>
      </div>
    </div>
  );
};
