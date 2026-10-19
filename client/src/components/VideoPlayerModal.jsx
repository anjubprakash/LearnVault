import React, { useEffect } from 'react';
import { X, ExternalLink, Eye, Play } from 'lucide-react';
import { api } from '../services/api.js';

export const VideoPlayerModal = ({ video, onClose }) => {
  useEffect(() => {
    if (video) {
      api.recordVideoWatch(video._id).catch(() => {});
    }
  }, [video]);

  if (!video) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-3 sm:p-6">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden border border-slate-200 flex flex-col max-h-[95vh]">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 flex items-center justify-between gap-3 bg-white">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <Play className="w-4 h-4 fill-purple-600 text-purple-600" />
            </div>
            <h3 className="text-base font-bold text-slate-900 truncate">{video.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Embedded YouTube Player Iframe */}
        <div className="relative w-full aspect-video bg-black">
          <iframe
            src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1&rel=0`}
            title={video.title}
            className="absolute inset-0 w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Video Info Details */}
        <div className="p-5 overflow-y-auto">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <p className="text-sm font-bold text-purple-600">{video.channelName}</p>
              <p className="text-xs text-slate-500">
                Topic: {typeof video.topic === 'object' ? video.topic?.title : 'Study Topic'}{' '}
                {video.duration && `• Duration: ${video.duration}`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200/60">
                <Eye className="w-3.5 h-3.5 text-purple-600" />
                {(video.watchCount || 0) + 1} views
              </span>
              <a
                href={video.youtubeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-purple-600 font-medium hover:underline transition-colors"
              >
                <span>Open in YouTube</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {video.description && (
            <p className="mt-3 text-xs leading-relaxed text-slate-600 whitespace-pre-wrap">
              {video.description}
            </p>
          )}

          {video.tags && video.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {video.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-medium border border-slate-200/60"
                >
                  #{t}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
