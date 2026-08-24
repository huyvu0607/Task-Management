import React, { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import AttachmentPreview from './AttachmentPreview';
import { useToast } from '../ui/Toast';

/**
 * AttachmentUploader Component
 * Upload files với drag & drop
 */
const AttachmentUploader = ({ onFilesChange, maxFiles = 5, maxSize = 10 }) => {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const toast = useToast();

  // Max file size in bytes (default 10MB)
  const maxSizeBytes = maxSize * 1024 * 1024;

  // Allowed file types
  const allowedTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
  ];

  // Validate file
  const validateFile = (file) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      toast.error(`File "${file.name}" không được hỗ trợ. Chỉ hỗ trợ PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF`);
      return false;
    }

    // Check file size
    if (file.size > maxSizeBytes) {
      toast.error(`File "${file.name}" quá lớn. Tối đa ${maxSize}MB`);
      return false;
    }

    return true;
  };

  // Handle file selection
  const handleFiles = (newFiles) => {
    const fileArray = Array.from(newFiles);

    // Check max files
    if (files.length + fileArray.length > maxFiles) {
      toast.error(`Chỉ được upload tối đa ${maxFiles} files`);
      return;
    }

    // Validate and filter files
    const validFiles = fileArray.filter(validateFile);

    if (validFiles.length > 0) {
      const updatedFiles = [...files, ...validFiles];
      setFiles(updatedFiles);
      onFilesChange?.(updatedFiles);
    }
  };

  // Handle drag events
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle drop
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  // Handle file input change
  const handleChange = (e) => {
    e.preventDefault();
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
    }
  };

  // Remove file
  const removeFile = (index) => {
    const updatedFiles = files.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    onFilesChange?.(updatedFiles);
  };

  // Open file picker
  const openFilePicker = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-3">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFilePicker}
        className={`relative border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.gif"
          onChange={handleChange}
          className="hidden"
        />

        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Click hoặc kéo thả file vào đây
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Tối đa {maxFiles} files, mỗi file không quá {maxSize}MB
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG, GIF
        </p>
      </div>

      {/* File Previews */}
      {files.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Files đã chọn ({files.length}/{maxFiles})
            </p>
            {files.length > 0 && (
              <button
                onClick={() => {
                  setFiles([]);
                  onFilesChange?.([]);
                }}
                className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
              >
                Xóa tất cả
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 gap-2">
            {files.map((file, index) => (
              <AttachmentPreview
                key={index}
                file={file}
                onRemove={() => removeFile(index)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttachmentUploader;