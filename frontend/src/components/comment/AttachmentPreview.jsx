import React from 'react';
import { X, FileText, FileSpreadsheet, File, Image as ImageIcon } from 'lucide-react';

/**
 * AttachmentPreview Component
 * Preview file đã upload (trước khi submit comment)
 */
const AttachmentPreview = ({ file, onRemove }) => {
  // Get file icon based on type
  const getFileIcon = () => {
    const type = file.type;
    
    if (type.startsWith('image/')) {
      return <ImageIcon className="w-5 h-5 text-blue-500" />;
    }
    if (type.includes('pdf')) {
      return <FileText className="w-5 h-5 text-red-500" />;
    }
    if (type.includes('sheet') || type.includes('excel')) {
      return <FileSpreadsheet className="w-5 h-5 text-green-500" />;
    }
    if (type.includes('word') || type.includes('document')) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    return <File className="w-5 h-5 text-gray-500" />;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Generate preview URL for images
  const previewUrl = file.type.startsWith('image/') 
    ? URL.createObjectURL(file) 
    : null;

  return (
    <div className="relative group">
      {previewUrl ? (
        // Image preview
        <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
          <img
            src={previewUrl}
            alt={file.name}
            className="w-full h-full object-cover"
          />
          {/* Remove button overlay */}
          <button
            onClick={onRemove}
            className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
            title="Remove"
          >
            <X className="w-6 h-6 text-white" />
          </button>
        </div>
      ) : (
        // File preview
        <div className="relative w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center gap-3">
          {/* File icon */}
          <div className="flex-shrink-0">
            {getFileIcon()}
          </div>
          
          {/* File info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              {file.name}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {formatFileSize(file.size)}
            </p>
          </div>

          {/* Remove button */}
          <button
            onClick={onRemove}
            className="flex-shrink-0 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Remove"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      )}
    </div>
  );
};

export default AttachmentPreview;