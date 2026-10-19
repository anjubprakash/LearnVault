import React, { useState } from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  BookOpen,
  LayoutDashboard,
  FolderTree,
  Video,
  FileText,
  FolderGit2,
  Upload,
  Menu,
  X,
  Settings,
} from 'lucide-react';
import { UploadDocumentModal } from './UploadDocumentModal.jsx';
import { DriveSettingsModal } from './DriveSettingsModal.jsx';
import { driveService } from '../services/driveService.js';

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

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [uploadDocModalOpen, setUploadDocModalOpen] = useState(false);
  const [driveModalOpen, setDriveModalOpen] = useState(false);

  // Main navigation links only (Bookmarks & Search removed as requested)
  const navLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/study-materials', label: 'Study Materials', icon: FolderTree },
    { to: '/projects', label: 'Projects', icon: FolderGit2 },
    { to: '/videos', label: 'Videos', icon: Video },
    { to: '/documents', label: 'Documents', icon: FileText },
  ];

  return (
    <>
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <div className="flex items-center gap-8">
              <Link to="/" className="flex items-center gap-2.5 group shrink-0">
                <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold tracking-tight text-slate-900 leading-none">
                    Learn<span className="text-purple-600">Vault</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase mt-0.5">
                    Knowledge Repository
                  </span>
                </div>
              </Link>

              {/* Desktop Navigation Links */}
              <nav className="hidden lg:flex items-center gap-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === '/'}
                      className={({ isActive }) =>
                        `flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                          isActive
                            ? 'bg-slate-100 text-slate-900 shadow-2xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 opacity-70" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </nav>
            </div>

            {/* Right Action: Connected Google Drive & Upload Doc */}
            <div className="hidden lg:flex items-center gap-2.5">
              {/* Connected Google Drive Quick Access & Settings */}
              <div className="flex items-center bg-purple-50 rounded-xl p-0.5 border border-purple-200/80 shadow-2xs">
                <a
                  href={driveService.getRootDriveFolderUrl()}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-purple-700 hover:text-purple-900 text-xs font-bold rounded-lg hover:bg-purple-100 transition-colors"
                  title="Open Connected Google Drive Folder"
                >
                  <DriveIcon className="w-3.5 h-3.5" />
                  <span>My Drive</span>
                </a>
                <button
                  onClick={() => setDriveModalOpen(true)}
                  className="p-1.5 text-purple-600 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition-colors"
                  title="Google Drive Storage Settings"
                >
                  <Settings className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={() => setUploadDocModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors"
                title="Upload Study Document"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Doc</span>
              </button>
            </div>

            {/* Mobile Actions */}
            <div className="flex lg:hidden items-center gap-2">
              <button
                onClick={() => setDriveModalOpen(true)}
                className="p-2 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100"
                title="Google Drive Settings"
              >
                <DriveIcon className="w-4 h-4" />
              </button>
              <button
                onClick={() => setUploadDocModalOpen(true)}
                className="p-2 text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100"
                title="Upload Document"
              >
                <Upload className="w-4 h-4" />
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1 shadow-lg">
            <div className="py-2 border-b border-slate-100 mb-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setUploadDocModalOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-purple-600 text-white"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Doc</span>
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  setDriveModalOpen(true);
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold rounded-xl bg-purple-50 text-purple-700 border border-purple-200"
              >
                <DriveIcon className="w-3.5 h-3.5" />
                <span>Drive</span>
              </button>
            </div>

            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.to === '/'}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive
                        ? 'bg-slate-100 text-slate-900 font-semibold'
                        : 'text-slate-600 hover:bg-slate-50'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 text-purple-600" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </div>
        )}
      </header>

      {/* Global Upload Document Modal */}
      <UploadDocumentModal
        isOpen={uploadDocModalOpen}
        onClose={() => setUploadDocModalOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new CustomEvent('learnvault:refresh-data'));
        }}
      />

      {/* Global Google Drive Settings Modal */}
      <DriveSettingsModal
        isOpen={driveModalOpen}
        onClose={() => setDriveModalOpen(false)}
        onSaved={() => {
          // Trigger re-render of components using drive links
          window.dispatchEvent(new CustomEvent('learnvault:refresh-data'));
        }}
      />
    </>
  );
};
