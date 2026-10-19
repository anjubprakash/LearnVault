import React from 'react';
import { ExternalLink, Star, Edit3, Trash2, Globe } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';

export const BookmarkCard = ({
  bookmark,
  onEdit,
  onDelete,
}) => {
  const { isAdmin } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite('bookmark', bookmark._id);

  const topicTitle = typeof bookmark.topic === 'object' ? bookmark.topic?.title : 'Study Topic';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Header: Category Badge, Topic, Favorite */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200/60">
              {bookmark.category}
            </span>
            <span className="px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 text-[11px] font-medium truncate max-w-[130px] border border-slate-100">
              {topicTitle}
            </span>
          </div>

          <button
            onClick={() => toggleFavorite('bookmark', bookmark._id)}
            className={`p-1.5 rounded-lg transition-colors ${
              favorited ? 'text-amber-500 hover:text-amber-600' : 'text-slate-300 hover:text-amber-400'
            }`}
            title={favorited ? 'Remove from favorites' : 'Add to favorites'}
          >
            <Star className={`w-4 h-4 ${favorited ? 'fill-amber-400' : ''}`} />
          </button>
        </div>

        {/* Title & URL preview */}
        <div className="flex items-start gap-2.5 mb-2">
          <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 mt-0.5 border border-purple-100">
            <Globe className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-sm font-bold text-slate-900 group-hover:text-purple-600 transition-colors line-clamp-1">
              {bookmark.title}
            </h4>
            <p className="text-[11px] text-slate-400 truncate mt-0.5">{bookmark.url}</p>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
          {bookmark.description || 'Saved reference link and documentation.'}
        </p>

        {/* Tags */}
        {bookmark.tags && bookmark.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {bookmark.tags.slice(0, 3).map((tag, idx) => (
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

      {/* Action Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
        <a
          href={bookmark.url}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white text-xs font-semibold hover:bg-purple-700 shadow-xs transition-colors"
        >
          <span>Visit Reference</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        {isAdmin && (onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(bookmark)}
                className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Edit Bookmark"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(bookmark)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete Bookmark"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
