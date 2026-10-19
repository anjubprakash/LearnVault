import React, { useState, useEffect } from 'react';
import {
  FolderTree,
  Search,
  Plus,
} from 'lucide-react';
import { api } from '../services/api.js';
import { TopicCard } from '../components/TopicCard.jsx';
import { AddTopicModal } from '../components/AddTopicModal.jsx';

export const StudyMaterialsPage = () => {
  const [topics, setTopics] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [addTopicModalOpen, setAddTopicModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const categories = [
    'All',
    'Programming Languages',
    'Frontend',
    'Backend',
    'Databases',
    'DevOps & Tools',
    'Concepts & Architecture',
  ];

  const loadTopics = async () => {
    try {
      setLoading(true);
      const data = await api.getTopics();
      setTopics(data);
    } catch (error) {
      console.error('Error fetching topics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTopics();
    const handleRefresh = () => loadTopics();
    window.addEventListener('learnvault:refresh-data', handleRefresh);
    return () => window.removeEventListener('learnvault:refresh-data', handleRefresh);
  }, []);

  const filteredTopics = topics.filter((t) => {
    const matchesCategory = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">Study Materials</h2>
          <p className="text-xs text-slate-500 mt-1">
            Categorized &amp; hierarchical knowledge library for technologies we are mastering
          </p>
        </div>

        <button
          onClick={() => setAddTopicModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Create Topic</span>
        </button>
      </div>

      {/* Filter and Search Bar (Small Category Navbar) */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search topics..."
            className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-500 focus:ring-2 focus:ring-purple-100 bg-slate-50/50"
          />
        </div>
      </div>

      {/* Topics Grid Directly on the Body */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 text-sm">Loading topics library...</div>
      ) : filteredTopics.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
          <FolderTree className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No topics found</h4>
          <p className="text-xs text-slate-500 mt-1">Try adjusting your search or category filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {filteredTopics.map((topic) => (
            <TopicCard key={topic._id} topic={topic} />
          ))}
        </div>
      )}

      <AddTopicModal
        isOpen={addTopicModalOpen}
        onClose={() => setAddTopicModalOpen(false)}
        onSuccess={loadTopics}
      />
    </div>
  );
};
