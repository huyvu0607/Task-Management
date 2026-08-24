import React, { useState } from 'react';
import { Download, Trash2, FileText, FileSpreadsheet, File, X } from 'lucide-react';
import { useToast } from '../ui/Toast';

/**
 * AttachmentList Component
 * Hiển thị danh sách attachments với image preview modal
 */
const AttachmentList = ({ attachments, onDelete, canDelete = false }) => {
  const toast = useToast();
  const [previewImage, setPreviewImage] = useState(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  // Get file icon based on type
  const getFileIcon = (mimeType) => {
    if (mimeType?.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (mimeType?.includes('sheet') || mimeType?.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    }
    if (mimeType?.includes('word') || mimeType?.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes || bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Handle download
  const handleDownload = (attachment) => {
    if (attachment.previewUrl) {
      window.open(attachment.previewUrl, '_blank');
    }
  };

  // Handle delete
  const handleDelete = async (attachmentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa file này?')) {
      return;
    }

    if (onDelete) {
      onDelete(attachmentId);
    }
  };

  // Handle image click - open preview
  const handleImageClick = (attachment) => {
    setPreviewImage(attachment);
  };

  // Close preview
  const closePreview = () => {
    setPreviewImage(null);
  };

  return (
    <>
      <div className="mt-2 space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
          >
            {/* ✅ Thumbnail image với click handler */}
            <div className="flex-shrink-0">
              {attachment.isImage && attachment.previewUrl ? (
                <img
                  src={attachment.previewUrl}
                  alt={attachment.fileName}
                  className="w-12 h-12 rounded object-cover cursor-pointer hover:opacity-80 transition-all hover:scale-105"
                  onClick={() => handleImageClick(attachment)}
                  title="Click để xem full size"
                />
              ) : (
                getFileIcon(attachment.mimeType)
              )}
            </div>

            {/* File info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {attachment.fileName}
              </p>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span>{attachment.fileSizeFormatted || formatFileSize(attachment.fileSize)}</span>
                {attachment.uploadedBy && (
                  <>
                    <span>•</span>
                    <span>by {attachment.uploadedBy.fullName}</span>
                  </>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex-shrink-0 flex items-center gap-1">
              {/* Download button */}
              <button
                onClick={() => handleDownload(attachment)}
                className="p-1.5 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded text-blue-600 dark:text-blue-400 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>

              {/* Delete button */}
              {(canDelete || attachment.canDelete) && (
                <button
                  onClick={() => handleDelete(attachment.id)}
                  className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-600 dark:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ✅ Image Preview Modal với animation */}
      {previewImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
          onClick={closePreview}
        >
          {/* Close button */}
          <button
            onClick={closePreview}
            className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Image container với animation */}
          <div
            className="relative max-w-[90vw] max-h-[90vh] animate-zoom-in"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={previewImage.previewUrl}
              alt={previewImage.fileName}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
            />
            
            {/* Image info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
              <p className="text-white font-medium">{previewImage.fileName}</p>
              <p className="text-white/70 text-sm">
                {previewImage.fileSizeFormatted || formatFileSize(previewImage.fileSize)}
                {previewImage.uploadedBy && ` • by ${previewImage.uploadedBy.fullName}`}
              </p>
            </div>
          </div>

          {/* Download button trong modal */}
          <button
            onClick={() => handleDownload(previewImage)}
            className="absolute bottom-4 right-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      )}

      {/* ✅ CSS Animations */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes zoom-in {
          from {
            opacity: 0;
            transform: scale(0.5);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }

        .animate-zoom-in {
          animation: zoom-in 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </>
  );
};

export default AttachmentList;