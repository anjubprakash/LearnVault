import React, { useState, useEffect } from 'react';
import { X, HardDrive, CheckCircle2, ExternalLink, Info } from 'lucide-react';
import { driveService } from '../services/driveService.js';

const DriveIcon = ({ className = 'w-4 h-4' }) => (
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

export const DriveSettingsModal = ({ isOpen, onClose, onSaved }) => {
  const [folderUrl, setFolderUrl] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFolderUrl(driveService.getRootDriveFolder());
      setSavedSuccess(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    driveService.setRootDriveFolder(folderUrl);
    setSavedSuccess(true);
    if (onSaved) onSaved();
    setTimeout(() => {
      onClose();
    }, 900);
  };

  const detectedFolderId = driveService.extractDriveFolderId(folderUrl);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border border-slate-200 my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center border border-purple-100">
              <DriveIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Connect Your Google Drive</h3>
              <p className="text-xs text-slate-500">Link your personal Google Drive storage folder</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSave} className="p-6 space-y-4">
          {savedSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Google Drive folder link updated successfully!</span>
            </div>
          )}

          {/* Quick Guide */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 text-xs text-slate-600 space-y-2">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-purple-600" />
              How to get your Google Drive Folder link:
            </p>
            <ol className="list-decimal list-inside space-y-1 text-[11px] text-slate-600 pl-1">
              <li>Open Google Drive and create a folder (e.g. <strong>"LearnVault Storage"</strong>).</li>
              <li>Right-click the folder → <strong>Share → Share</strong>.</li>
              <li>Under General access, change to <strong>"Anyone with the link can view"</strong>.</li>
              <li>Click <strong>Copy link</strong> and paste it below.</li>
            </ol>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Google Drive Folder URL or Folder ID
            </label>
            <div className="relative">
              <input
                type="text"
                value={folderUrl}
                onChange={(e) => setFolderUrl(e.target.value)}
                placeholder="https://drive.google.com/drive/folders/1abc...xyz"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 focus:outline-hidden focus:border-purple-600 focus:ring-2 focus:ring-purple-100 bg-white"
              />
            </div>
            {detectedFolderId && (
              <p className="text-[11px] text-emerald-600 font-semibold mt-1.5 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Folder ID detected: <span className="font-mono">{detectedFolderId}</span>
              </p>
            )}
          </div>

          {folderUrl && (
            <div className="flex justify-end">
              <a
                href={driveService.getRootDriveFolderUrl()}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-700 font-semibold"
              >
                <span>Test &amp; Open in Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Buttons */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs transition-colors"
            >
              Save Google Drive Link
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
