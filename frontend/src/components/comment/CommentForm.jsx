import React, { useState } from 'react';
import { Paperclip, Send, X } from 'lucide-react';
import MentionInput from './MentionInput';
import AttachmentUploader from './AttachmentUploader';
import { commentApi } from '../../api/commentApi';
import { useToast } from '../ui/Toast';

/**
 * CommentForm Component
 * Form tạo comment mới
 */
const CommentForm = ({ taskId, onCommentCreated }) => {
  const [content, setContent] = useState('');
  const [files, setFiles] = useState([]);
  const [showAttachmentUploader, setShowAttachmentUploader] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [mentionedUsers, setMentionedUsers] = useState([]);
  const toast = useToast();

  // Handle mention select
  const handleMentionSelect = (member) => {
    if (!mentionedUsers.find(u => u.id === member.id)) {
      setMentionedUsers([...mentionedUsers, member]);
    }
  };

  // Extract mentioned user IDs from content
  const extractMentionedUserIds = () => {
    const mentions = content.match(/@(\w+)/g) || [];
    const userIds = mentions
      .map(mention => {
        const username = mention.substring(1);
        const user = mentionedUsers.find(u => u.username === username);
        return user?.id;
      })
      .filter(Boolean);
    return [...new Set(userIds)];
  };

  // Handle submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!content.trim()) {
      toast.error('Comment không được để trống');
      return;
    }

    if (content.length > 1000) {
      toast.error('Comment không được quá 1000 ký tự');
      return;
    }

    setSubmitting(true);

    try {
      // 1. Create comment
      const commentResult = await commentApi.create({
        taskId,
        content: content.trim(),
        mentionedUserIds: extractMentionedUserIds(),
      });

      if (!commentResult.success) {
        toast.error(commentResult.message);
        setSubmitting(false);
        return;
      }

      const newComment = commentResult.data?.data;

      // 2. Upload attachments (if any)
      if (files.length > 0) {
        const uploadResult = await commentApi.uploadMultiple(
          files,
          newComment.id,
          taskId
        );

        if (!uploadResult.success) {
          toast.error('Upload files thất bại: ' + uploadResult.message);
        }
      }

      // 3. Success
      toast.success('Đã tạo comment thành công');
      
      // Reset form
      setContent('');
      setFiles([]);
      setMentionedUsers([]);
      setShowAttachmentUploader(false);

      // Callback
      onCommentCreated?.(newComment);

    } catch (error) {
      console.error('Error creating comment:', error);
      toast.error('Có lỗi xảy ra khi tạo comment');
    }

    setSubmitting(false);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    // Submit on Ctrl/Cmd + Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Clear form
  const handleClear = () => {
    setContent('');
    setFiles([]);
    setMentionedUsers([]);
    setShowAttachmentUploader(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3" onKeyDown={handleKeyPress}>
      {/* Comment Input */}
      <MentionInput
        value={content}
        onChange={setContent}
        placeholder="Write a comment... (use @ to mention someone)"
        maxLength={1000}
        onMentionSelect={handleMentionSelect}
      />

      {/* Attachment Uploader */}
      {showAttachmentUploader && (
        <div className="relative">
          <AttachmentUploader
            onFilesChange={setFiles}
            maxFiles={5}
            maxSize={10}
          />
          {/* Close button */}
          <button
            type="button"
            onClick={() => {
              setShowAttachmentUploader(false);
              setFiles([]);
            }}
            className="absolute top-2 right-2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-between">
        {/* Left: Attach button */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowAttachmentUploader(!showAttachmentUploader)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 
              dark:hover:bg-gray-700 rounded-lg transition-colors"
            title="Attach files"
          >
            <Paperclip className="w-5 h-5" />
          </button>

          {files.length > 0 && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {files.length} file(s) attached
            </span>
          )}
        </div>

        {/* Right: Submit buttons */}
        <div className="flex items-center gap-2">
          {/* Clear button - show when has content or files */}
          {(content.trim() || files.length > 0) && (
            <button
              type="button"
              onClick={handleClear}
              disabled={submitting}
              className="px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 
                hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors
                disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Clear
            </button>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 
              hover:bg-blue-700 rounded-lg transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {submitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Posting...
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                Comment
              </>
            )}
          </button>
        </div>
      </div>

      {/* Helper text */}
      <p className="text-xs text-gray-500 dark:text-gray-400">
        Press Ctrl+Enter to submit
      </p>
    </form>
  );
};

export default CommentForm;