import React from 'react';
import { Link } from 'react-router-dom';
import {
  Folder,
  ChevronRight,
  GitBranch,
} from 'lucide-react';

export const TopicCard = ({ topic }) => {
  const counts = topic.counts || {
    documents: 0,
    videos: 0,
    projects: 0,
    notes: 0,
    bookmarks: 0,
  };

  return (
    <Link
      to={`/topics/${topic._id}`}
      className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-purple-300 transition-all flex flex-col justify-between group relative overflow-hidden text-left"
    >
      <div>
        {/* Top Header: Category & Level Indicator */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[11px] font-semibold border border-slate-200/60">
            {topic.category}
          </span>

          {topic.parentTopic && (
            <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100">
              <GitBranch className="w-3 h-3 text-purple-500" />
              <span>Subtopic</span>
            </span>
          )}
        </div>

        {/* Topic Title & Path */}
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100 group-hover:scale-105 transition-transform">
            <Folder className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors">
              {topic.title}
            </h4>
            {topic.path && topic.level > 0 && (
              <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{topic.path}</p>
            )}
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
          {topic.description || `Everything I have learned about ${topic.title}.`}
        </p>
      </div>

      {/* Footer Stats Pills */}
      <div>
        <div className="grid grid-cols-4 gap-1.5 py-2.5 border-t border-slate-100 text-center text-[10px] text-slate-600">
          <div className="bg-slate-50 rounded-lg p-1 border border-slate-100">
            <span className="block font-bold text-slate-800">{counts.documents}</span>
            <span className="text-slate-400">Docs</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-1 border border-slate-100">
            <span className="block font-bold text-slate-800">{counts.videos}</span>
            <span className="text-slate-400">Videos</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-1 border border-slate-100">
            <span className="block font-bold text-slate-800">{counts.projects}</span>
            <span className="text-slate-400">Projects</span>
          </div>
          <div className="bg-slate-50 rounded-lg p-1 border border-slate-100">
            <span className="block font-bold text-slate-800">{counts.notes}</span>
            <span className="text-slate-400">Notes</span>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between text-xs font-semibold text-purple-600 group-hover:text-purple-700">
          <span>Open Topic</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </div>
      </div>
    </Link>
  );
};
