import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  FolderTree,
  FileText,
  Video,
  FolderGit2,
  StickyNote,
  Bookmark,
  ArrowRight,
} from 'lucide-react';
import { api } from '../services/api.js';
import { DocumentCard } from '../components/DocumentCard.jsx';
import { VideoCard } from '../components/VideoCard.jsx';
import { ProjectCard } from '../components/ProjectCard.jsx';
import { BookmarkCard } from '../components/BookmarkCard.jsx';
import { DocumentViewerModal } from '../components/DocumentViewerModal.jsx';
import { VideoPlayerModal } from '../components/VideoPlayerModal.jsx';

export const SearchPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');

  // Modals
  const [activeDoc, setActiveDoc] = useState(null);
  const [activeVideo, setActiveVideo] = useState(null);

  const performSearch = async (searchTerm) => {
    if (!searchTerm.trim()) {
      setResults(null);
      return;
    }
    try {
      setLoading(true);
      const res = await api.search(searchTerm.trim());
      setResults(res);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      setSearchParams({ q: query.trim() });
      performSearch(query.trim());
    }
  };

  const totalResults = results?.totalResults || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header & Input */}
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Global Knowledge Search
        </h2>
        <p className="text-xs text-slate-500">
          Find anything across topics, documents, videos, projects, notes, and bookmarks
        </p>

        <form onSubmit={handleSubmit} className="relative mt-4">
          <Search className="w-5 h-5 text-purple-600 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type technology, concept, or document name (e.g. LINQ, React, OOP)..."
            className="w-full pl-12 pr-28 py-3.5 text-sm rounded-2xl border-2 border-purple-200 focus:outline-hidden focus:border-purple-600 focus:ring-4 focus:ring-purple-100 shadow-sm bg-white"
            autoFocus
          />
          <button
            type="submit"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            Search
          </button>
        </form>

        {/* Quick Suggestion Pills */}
        <div className="flex items-center justify-center gap-2 pt-1 flex-wrap">
          <span className="text-xs text-slate-400">Quick searches:</span>
          {['C#', 'LINQ', 'OOP', 'React', 'Hooks', 'Express', 'MongoDB'].map((term) => (
            <button
              key={term}
              onClick={() => {
                setQuery(term);
                setSearchParams({ q: term });
                performSearch(term);
              }}
              className="text-xs text-purple-700 bg-purple-50 hover:bg-slate-100 px-2.5 py-1 rounded-lg font-medium transition-colors"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Filter Tabs for Results */}
      {results && (
        <div className="border-b border-slate-200/80 flex items-center justify-between pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
            {[
              { id: 'all', label: 'All Results', count: totalResults },
              { id: 'topics', label: 'Topics', count: results.topics.length },
              { id: 'documents', label: 'Documents', count: results.documents.length },
              { id: 'videos', label: 'Videos', count: results.videos.length },
              { id: 'projects', label: 'Projects', count: results.projects.length },
              { id: 'notes', label: 'Notes', count: results.notes.length },
              { id: 'bookmarks', label: 'Bookmarks', count: results.bookmarks.length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  activeFilter === tab.id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-purple-50 text-purple-800 hover:bg-slate-100'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-400 font-medium hidden sm:inline">
            Found {totalResults} matches for "{results.query}"
          </span>
        </div>
      )}

      {/* Results Display */}
      {loading ? (
        <div className="text-center py-20 text-slate-400">Searching your LearnVault...</div>
      ) : results && totalResults === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-16 text-center max-w-lg mx-auto">
          <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No matches found for "{results.query}"</h4>
          <p className="text-xs text-slate-500 mt-1">
            Check the spelling or try searching for a broader term like C#, React, or MongoDB.
          </p>
        </div>
      ) : results ? (
        <div className="space-y-10">
          {/* Topics Results */}
          {(activeFilter === 'all' || activeFilter === 'topics') && results.topics.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                <FolderTree className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Topics ({results.topics.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.topics.map((t) => (
                  <Link
                    key={t._id}
                    to={`/topics/${t._id}`}
                    className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-purple-300 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                        {t.category}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">{t.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">{t.description}</p>
                    </div>
                    <ArrowRight className="w-4 h-4 text-purple-600 shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Documents Results */}
          {(activeFilter === 'all' || activeFilter === 'documents') && results.documents.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Documents ({results.documents.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {results.documents.map((doc) => (
                  <DocumentCard
                    key={doc._id}
                    document={doc}
                    onView={(d) => setActiveDoc(d)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Videos Results */}
          {(activeFilter === 'all' || activeFilter === 'videos') && results.videos.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                <Video className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Videos ({results.videos.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.videos.map((vid) => (
                  <VideoCard
                    key={vid._id}
                    video={vid}
                    onWatch={(v) => setActiveVideo(v)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Projects Results */}
          {(activeFilter === 'all' || activeFilter === 'projects') && results.projects.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                <FolderGit2 className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Projects ({results.projects.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.projects.map((proj) => (
                  <ProjectCard key={proj._id} project={proj} />
                ))}
              </div>
            </div>
          )}

          {/* Notes Results */}
          {(activeFilter === 'all' || activeFilter === 'notes') && results.notes.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                <StickyNote className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Notes ({results.notes.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.notes.map((note) => (
                  <div
                    key={note._id}
                    className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-2"
                  >
                    <h4 className="text-sm font-bold text-slate-900">{note.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-3 font-mono bg-slate-50 p-2.5 rounded-lg whitespace-pre-wrap">
                      {note.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Bookmarks Results */}
          {(activeFilter === 'all' || activeFilter === 'bookmarks') && results.bookmarks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2">
                <Bookmark className="w-4 h-4 text-purple-600" />
                <h3 className="text-base font-bold text-slate-800">
                  Bookmarks ({results.bookmarks.length})
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.bookmarks.map((bm) => (
                  <BookmarkCard key={bm._id} bookmark={bm} />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}

      {/* Modals */}
      <DocumentViewerModal
        document={activeDoc}
        onClose={() => setActiveDoc(null)}
      />

      <VideoPlayerModal
        video={activeVideo}
        onClose={() => setActiveVideo(null)}
      />
    </div>
  );
};
