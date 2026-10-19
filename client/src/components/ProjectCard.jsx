import React from 'react';
import {
  FileText,
  Video,
  Star,
  ExternalLink,
  Edit3,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useFavorites } from '../context/FavoritesContext.jsx';
import { driveService } from '../services/driveService.js';

const GithubIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const DriveIcon = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 87.3 78" fill="none">
    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.9 2.5 3.2 3.3l12.3-21.3H0c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
    <path d="M43.65 25 29.35 0c-1.3.8-2.4 1.9-3.2 3.3L1.2 45.65c-.8 1.4-1.2 2.95-1.2 4.5h25.95z" fill="#05a6f0"/>
    <path d="M73.55 76.8c1.3-.8 2.4-1.9 3.2-3.3l1.6-2.75c.8-1.4 1.2-2.95 1.2-4.5H53.6l6.65 11.5c1.4.05 2.85-.35 4.15-1.05z" fill="#ea4335"/>
    <path d="M43.65 25 57.95 0H29.35z" fill="#00832d"/>
    <path d="M57.95 0c-1.35 0-2.7.35-3.95 1.05L43.65 25l12.3 21.3h25.95c0-1.55-.4-3.1-1.2-4.5L62.1 3.3C61.3 1.9 60.2.8 58.9 0z" fill="#2684fc"/>
    <path d="M53.6 46.3 41.3 25 29.35 46.3z" fill="#00ac47"/>
    <path d="M80.7 46.3H53.6l-12.3 21.3 6.65 11.5h27.95c1.55 0 3.1-.4 4.5-1.2 1.4-.8 2.5-1.9 3.3-3.3z" fill="#ffba00"/>
  </svg>
);

export const ProjectCard = ({
  project,
  onOpenDoc,
  onWatchVideo,
  onEdit,
  onDelete,
}) => {
  const { isAdmin } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const favorited = isFavorite('project', project._id);

  const topicTitle = typeof project.topic === 'object' ? project.topic?.title : 'Study Topic';

  const statusConfig = {
    Completed: {
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2,
    },
    'In Progress': {
      bg: 'bg-purple-50 text-purple-700 border-purple-200',
      icon: Clock,
    },
    Planning: {
      bg: 'bg-slate-100 text-slate-700 border-slate-200',
      icon: Sparkles,
    },
  }[project.status] || {
    bg: 'bg-purple-50 text-purple-700 border-purple-200',
    icon: CheckCircle2,
  };

  const StatusIcon = statusConfig.icon;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group">
      <div>
        {/* Top Header: Topic, Status, Favorite */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-800 text-[11px] font-bold border border-slate-200/60">
              {topicTitle}
            </span>
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold border ${statusConfig.bg}`}
            >
              <StatusIcon className="w-3 h-3" />
              {project.status}
            </span>
          </div>

          <button
            onClick={() => toggleFavorite('project', project._id)}
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

        {/* Project Name */}
        <h4 className="text-base font-bold text-slate-900 group-hover:text-purple-600 transition-colors mb-1">
          {project.title}
        </h4>

        {/* Technology Stack Badges */}
        <p className="text-xs font-semibold text-purple-600 mb-2">
          {project.technology}
        </p>

        {/* Description */}
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 mb-4">
          {project.description || 'Hands-on practice project created while studying new technologies.'}
        </p>

        {/* Related Documents / Videos Previews */}
        {((project.relatedDocuments && project.relatedDocuments.length > 0) ||
          (project.relatedVideos && project.relatedVideos.length > 0)) && (
          <div className="space-y-1.5 mb-4 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Connected Learning Material:
            </p>

            {project.relatedDocuments && project.relatedDocuments.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.relatedDocuments.map((doc) => (
                  <button
                    key={doc._id}
                    onClick={() => onOpenDoc && onOpenDoc(doc)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-[11px] font-medium hover:border-purple-300 transition-colors"
                  >
                    <FileText className="w-3 h-3 text-purple-600" />
                    <span className="truncate max-w-[120px]">{doc.title}</span>
                  </button>
                ))}
              </div>
            )}

            {project.relatedVideos && project.relatedVideos.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {project.relatedVideos.map((vid) => (
                  <button
                    key={vid._id}
                    onClick={() => onWatchVideo && onWatchVideo(vid)}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-800 text-[11px] font-medium hover:border-purple-300 transition-colors"
                  >
                    <Video className="w-3 h-3 text-purple-600" />
                    <span className="truncate max-w-[120px]">{vid.title}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Action Links & Admin Controls */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {project.githubUrl ? (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shadow-xs transition-colors"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          ) : (
            <span className="text-xs text-slate-400">Local repo</span>
          )}

          {project.demoUrl && (
            <a
              href={project.demoUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 text-slate-800 text-xs font-semibold hover:bg-slate-200 border border-slate-200/80 transition-colors"
            >
              <span>Demo</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          )}

          {/* Google Drive Storage Folder / Search */}
          <a
            href={driveService.getProjectDriveUrl(project)}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/80 text-xs font-semibold shadow-2xs transition-colors"
            title={`Open Google Drive storage for ${project.title}`}
          >
            <DriveIcon className="w-3.5 h-3.5" />
            <span>Drive</span>
          </a>
        </div>

        {isAdmin && (onEdit || onDelete) && (
          <div className="flex items-center gap-1">
            {onEdit && (
              <button
                onClick={() => onEdit(project)}
                className="p-1.5 text-slate-400 hover:text-purple-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Edit Project"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(project)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="Delete Project"
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
