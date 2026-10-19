import { DRIVE_CONFIG } from '../config/driveConfig.js';

// Google Drive integration service for LearnVault (Zero Backend)
export const driveService = {
  // Extract Google Drive File ID from diverse URL formats
  extractDriveFileId(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();

    // Standard file link: /file/d/{id}/...
    const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (fileMatch && fileMatch[1]) return fileMatch[1];

    // Query param id: ?id={id} or &id={id}
    const idParamMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idParamMatch && idParamMatch[1]) return idParamMatch[1];

    // Docs / Sheets / Slides link: /document/d/{id} or /spreadsheets/d/{id}
    const docMatch = trimmed.match(/\/(document|spreadsheets|presentation)\/d\/([a-zA-Z0-9_-]+)/);
    if (docMatch && docMatch[2]) return docMatch[2];

    // Direct ID check if alphanumeric of typical drive ID length (25-45 chars)
    if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
      return trimmed;
    }

    return null;
  },

  // Extract Google Drive Folder ID from diverse URL formats
  extractDriveFolderId(url) {
    if (!url || typeof url !== 'string') return null;
    const trimmed = url.trim();

    const folderMatch = trimmed.match(/\/folders\/([a-zA-Z0-9_-]+)/);
    if (folderMatch && folderMatch[1]) return folderMatch[1];

    if (/^[a-zA-Z0-9_-]{25,45}$/.test(trimmed)) {
      return trimmed;
    }

    return null;
  },

  // Check if a URL is a Google Drive URL
  isGoogleDriveUrl(url) {
    if (!url) return false;
    return /drive\.google\.com|docs\.google\.com/.test(url);
  },

  // Get embedded preview URL for iframe rendering
  getPreviewUrl(fileId) {
    if (!fileId) return '';
    return `https://drive.google.com/file/d/${fileId}/preview`;
  },

  // Get direct download link for Google Drive files
  getDirectDownloadUrl(fileId) {
    if (!fileId) return '';
    return `https://drive.google.com/uc?export=download&id=${fileId}`;
  },

  // Get direct link to view in Google Drive
  getViewUrl(fileId) {
    if (!fileId) return '';
    return `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
  },

  // Get configured Root Drive folder (checks localStorage first, falls back to DRIVE_CONFIG)
  getRootDriveFolder() {
    try {
      const stored = localStorage.getItem('learnvault_drive_root');
      if (stored && stored.trim()) return stored.trim();
    } catch {}
    return (DRIVE_CONFIG.MY_DRIVE_FOLDER_URL || '').trim();
  },

  // Get direct web URL for user's configured root Drive folder
  getRootDriveFolderUrl() {
    const raw = this.getRootDriveFolder();
    if (!raw) return 'https://drive.google.com';
    if (raw.startsWith('http://') || raw.startsWith('https://')) return raw;
    return `https://drive.google.com/drive/folders/${raw}`;
  },

  setRootDriveFolder(urlOrId) {
    try {
      localStorage.setItem('learnvault_drive_root', (urlOrId || '').trim());
      return true;
    } catch {
      return false;
    }
  },

  // Generate Google Drive search or folder URL using project name
  getProjectDriveUrl(project) {
    if (!project) return this.getRootDriveFolderUrl();

    // 1. If explicit Drive Folder URL is configured on the project
    if (project.driveFolderUrl && project.driveFolderUrl.trim()) {
      return project.driveFolderUrl.trim();
    }

    // 2. If Drive Folder ID is configured on the project
    if (project.driveFolderId && project.driveFolderId.trim()) {
      return `https://drive.google.com/drive/folders/${project.driveFolderId.trim()}`;
    }

    // 3. If a specific root folder is configured, open that folder directly
    const rootFolderId = this.extractDriveFolderId(this.getRootDriveFolder());
    const searchTerm = project.title || project.name || '';

    if (rootFolderId) {
      return `https://drive.google.com/drive/folders/${rootFolderId}`;
    }

    // 4. Default: global Drive search by project name
    return `https://drive.google.com/drive/search?q=${encodeURIComponent(searchTerm || 'LearnVault')}`;
  },
};
