import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ChevronLeft,
  ChevronRight,
  FileText,
  AlertCircle,
  Eye,
  Lock,
  Play,
  ExternalLink,
} from 'lucide-react';
import { api } from '../services/api.js';
import { driveService } from '../services/driveService.js';

const extractYouTubeId = (url) => {
  if (!url) return null;
  const match = url.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/);
  return match && match[2].length === 11 ? match[2] : null;
};

export const DocumentViewerModal = ({ document: doc, onClose, onWatchVideo }) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [textContent, setTextContent] = useState(null);
  const [loadingText, setLoadingText] = useState(false);

  useEffect(() => {
    if (!doc) return;
    setZoom(100);
    setCurrentPage(1);

    const isTextDoc = ['txt', 'md', 'markdown'].includes(doc.fileType?.toLowerCase());
    if (isTextDoc) {
      setLoadingText(true);
      api
        .getDocumentById(doc._id)
        .then((res) => {
          setTextContent(res.textContent);
        })
        .catch(() => {
          setTextContent(null);
        })
        .finally(() => {
          setLoadingText(false);
        });
    } else {
      setTextContent(null);
    }
  }, [doc]);

  if (!doc) return null;

  const fileType = (doc.fileType || 'pdf').toLowerCase();
  const isDrive = doc.isDrive || !!doc.driveFileId || fileType === 'gdrive' || driveService.isGoogleDriveUrl(doc.driveUrl);
  const isPdf = !isDrive && fileType === 'pdf';
  const isImage = !isDrive && ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(fileType);
  const isText = !isDrive && ['txt', 'md', 'markdown'].includes(fileType);
  const isOffice = !isDrive && ['docx', 'pptx', 'xlsx', 'doc', 'ppt', 'xls'].includes(fileType);

  const viewUrl = api.getDocumentViewUrl(doc._id);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 15, 200));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 15, 50));
  const handleZoomReset = () => setZoom(100);

  const handlePrevPage = () => setCurrentPage((prev) => Math.max(prev - 1, 1));
  const handleNextPage = () => setCurrentPage((prev) => prev + 1);

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4">
      <div
        className={`bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-200 transition-all duration-200 ${
          isFullscreen ? 'w-full h-full rounded-none' : 'w-full max-w-5xl h-[90vh]'
        }`}
      >
        {/* Top Header Bar */}
        <div className="px-5 py-3.5 border-b border-slate-200 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-100">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900 truncate">{doc.title}</h3>
                <span className="shrink-0 px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 text-[11px] font-semibold uppercase border border-purple-200">
                  {isDrive ? 'Google Drive' : doc.fileType}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  <Lock className="w-3 h-3 text-slate-400" /> Read-Only
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate">
                {doc.originalFilename} • {formatFileSize(doc.fileSize)} •{' '}
                {typeof doc.topic === 'object' ? doc.topic?.title : 'Study Topic'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Google Drive Link if attached */}
            {isDrive && (
              <a
                href={doc.driveUrl || driveService.getViewUrl(doc.driveFileId)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 text-xs font-semibold transition-colors shadow-2xs"
                title="Open directly in Google Drive"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Open in Drive</span>
              </a>
            )}

            {/* Watch Linked Video Button */}
            {(doc.relatedVideo || doc.videoUrl) && onWatchVideo && (
              <button
                onClick={() => {
                  if (doc.relatedVideo && typeof doc.relatedVideo === 'object') {
                    onWatchVideo(doc.relatedVideo);
                  } else if (doc.videoUrl) {
                    const ytId = extractYouTubeId(doc.videoUrl);
                    onWatchVideo({
                      _id: doc._id,
                      title: doc.videoTitle || `${doc.title} Tutorial Video`,
                      youtubeUrl: doc.videoUrl,
                      youtubeId: ytId || '',
                      thumbnailUrl: ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : '',
                      channelName: 'YouTube Educator',
                      topic: doc.topic,
                    });
                  }
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 hover:bg-purple-100 text-xs font-semibold transition-colors shadow-2xs"
                title="Watch associated video tutorial"
              >
                <Play className="w-3.5 h-3.5 fill-purple-600 text-purple-600" />
                <span className="hidden sm:inline">Watch Video</span>
              </button>
            )}

            {/* Download Button */}
            <button
              onClick={() => api.downloadDocument(doc)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 text-white hover:bg-purple-700 text-xs font-semibold shadow-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Download</span>
            </button>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar (Zoom & Navigation) */}
        {(isPdf || isImage || isText) && (
          <div className="px-5 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs text-slate-600 select-none">
            {/* Page Navigation */}
            {isPdf ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage <= 1}
                  className="p-1 rounded hover:bg-slate-200 disabled:opacity-30 disabled:hover:bg-transparent"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="font-medium text-slate-700">
                  Page <span className="text-purple-600 font-bold">{currentPage}</span>
                </span>
                <button
                  onClick={handleNextPage}
                  className="p-1 rounded hover:bg-slate-200"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-slate-500">
                <Eye className="w-3.5 h-3.5 text-purple-600" />
                <span>In-Website Preview</span>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleZoomOut}
                className="p-1 rounded hover:bg-slate-200 text-slate-600"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="w-12 text-center font-semibold text-slate-700">{zoom}%</span>
              <button
                onClick={handleZoomIn}
                className="p-1 rounded hover:bg-slate-200 text-slate-600"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={handleZoomReset}
                className="p-1 rounded hover:bg-slate-200 text-slate-500 ml-1"
                title="Reset Zoom"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Content Viewer Body */}
        <div className="flex-1 bg-slate-100 overflow-auto p-4 flex items-center justify-center relative">
          {isDrive ? (
            /* Google Drive Live Embedded Viewer */
            <div className="w-full h-full bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
              <iframe
                src={viewUrl || driveService.getPreviewUrl(doc.driveFileId)}
                title={doc.title}
                className="w-full h-full border-0"
                allow="autoplay"
              />
            </div>
          ) : isPdf ? (
            <div
              className="w-full h-full bg-white rounded-lg shadow-sm overflow-hidden flex flex-col transition-transform duration-150 origin-top"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <iframe
                src={`${viewUrl}#page=${currentPage}&zoom=${zoom}`}
                title={doc.title}
                className="w-full h-full border-0"
              />
            </div>
          ) : isImage ? (
            <div
              className="transition-transform duration-150 flex items-center justify-center"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              <img
                src={viewUrl}
                alt={doc.title}
                className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-sm"
              />
            </div>
          ) : isText ? (
            <div
              className="w-full max-w-3xl h-full bg-white rounded-xl shadow-xs p-6 overflow-auto border border-slate-200 transition-transform origin-top text-left"
              style={{ transform: `scale(${zoom / 100})` }}
            >
              {loadingText ? (
                <div className="text-center py-12 text-slate-400">Loading document text...</div>
              ) : textContent ? (
                <pre className="font-mono text-sm leading-relaxed text-slate-800 whitespace-pre-wrap font-normal">
                  {textContent}
                </pre>
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <p>Document content could not be previewed directly as plain text.</p>
                  <button
                    onClick={() => api.downloadDocument(doc)}
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-semibold"
                  >
                    <Download className="w-4 h-4" /> Download File
                  </button>
                </div>
              )}
            </div>
          ) : isOffice ? (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
              <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center mb-4 border border-purple-100">
                <FileText className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">Preview Unavailable</h4>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Direct in-browser preview is unavailable for <span className="font-semibold uppercase">{doc.fileType}</span> binary documents.
                You can download the original file to view it in Microsoft Office or your preferred application.
              </p>
              <button
                onClick={() => api.downloadDocument(doc)}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700 shadow-sm transition-colors"
              >
                <Download className="w-4 h-4" /> Download Original Document ({formatFileSize(doc.fileSize)})
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 max-w-md text-center">
              <AlertCircle className="w-12 h-12 text-amber-500 mx-auto mb-3" />
              <h4 className="text-base font-bold text-slate-900 mb-1">Preview Unavailable</h4>
              <p className="text-xs text-slate-500 mb-6">
                Preview is not supported for this file type ({doc.fileType}).
              </p>
              <button
                onClick={() => api.downloadDocument(doc)}
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-purple-600 text-white font-semibold text-sm hover:bg-purple-700"
              >
                <Download className="w-4 h-4" /> Download Document
              </button>
            </div>
          )}
        </div>

        {/* Footer info notice */}
        <div className="px-5 py-2.5 bg-white border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500">
          <span>
            Uploaded on {new Date(doc.createdAt).toLocaleDateString()} • {doc.viewCount || 0} views • {doc.downloadCount || 0} downloads
          </span>
          <span className="text-purple-600 font-semibold">
            {isDrive ? 'Google Drive Cloud Storage' : 'LearnVault Safe In-Browser Mode'}
          </span>
        </div>
      </div>
    </div>
  );
};
