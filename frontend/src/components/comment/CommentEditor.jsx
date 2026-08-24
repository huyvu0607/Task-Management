import React, { useState } from 'react';
import { X, Check } from 'lucide-react';
import MentionInput from './MentionInput';
import { commentApi } from '../../api/commentApi';
import { useToast } from '../ui/Toast';

/**
 * CommentEditor Component
 * Inline editor cho edit comment
 */
const CommentEditor = ({ comment, onSave, onCancel }) => {
  const [content, setContent] = useState(comment.content || '');
  const [saving, setSaving] = useState(false);
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
    return [...new Set(userIds)]; // Remove duplicates
  };

  // Handle save
  const handleSave = async () => {
    // Validate
    if (!content.trim()) {
      toast.error('Comment không được để trống');
      return;
    }

    if (content.length > 1000) {
      toast.error('Comment không được quá 1000 ký tự');
      return;
    }

    setSaving(true);
    const result = await commentApi.update(comment.id, {
      content: content.trim(),
      mentionedUserIds: extractMentionedUserIds(),
    });

    if (result.success) {
      toast.success('Đã cập nhật comment');
      onSave?.(result.data?.data);
    } else {
      toast.error(result.message);
    }
    setSaving(false);
  };

  // Handle key press
  const handleKeyPress = (e) => {
    // Save on Ctrl/Cmd + Enter
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSave();
    }

    // Cancel on Escape
    if (e.key === 'Escape') {
      e.preventDefault();
      onCancel?.();
    }
  };

  return (
    <div className="space-y-3" onKeyDown={handleKeyPress}>
      {/* Editor */}
      <MentionInput
        value={content}
        onChange={setContent}
        placeholder="Edit comment..."
        maxLength={1000}
        onMentionSelect={handleMentionSelect}
        className="min-h-[80px]"
      />

      {/* Actions */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Press Ctrl+Enter to save, Esc to cancel
        </p>

        <div className="flex items-center gap-2">
          {/* Cancel */}
          <button
            onClick={onCancel}
            disabled={saving}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 
              hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={saving || !content.trim()}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 
              hover:bg-blue-700 rounded-lg transition-colors
              disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Saving...
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommentEditor;