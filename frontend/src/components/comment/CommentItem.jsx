import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Edit2, Trash2, MoreVertical } from 'lucide-react';
import CommentEditor from './CommentEditor';
import AttachmentList from './AttachmentList';
import { commentApi } from '../../api/commentApi';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';

/**
 * CommentItem Component - FIXED VERSION
 * Single comment với actions (edit, delete)
 */
const CommentItem = ({ comment, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showActions, setShowActions] = useState(false);
  const { user } = useAuth();
  const toast = useToast();

  // ✅ FIX 1: Sử dụng canEdit/canDelete từ backend hoặc check đúng comment.user.id
  const canEdit = comment.canEdit ?? (user?.id === comment.user?.id);
  const canDelete = comment.canDelete ?? (user?.id === comment.user?.id || user?.role === 'ADMIN');

  // Format time ago
  const timeAgo = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), {
        addSuffix: true,
        locale: vi,
      })
    : '';

  // Highlight mentions in content
  const renderContent = () => {
    const content = comment.content || '';
    const parts = content.split(/(@\w+)/g);

    return parts.map((part, index) => {
      if (part.startsWith('@')) {
        return (
          <span
            key={index}
            className="text-blue-600 dark:text-blue-400 font-medium hover:underline cursor-pointer"
          >
            {part}
          </span>
        );
      }
      return <span key={index}>{part}</span>;
    });
  };

  // Handle edit save
  const handleEditSave = (updatedComment) => {
    setIsEditing(false);
    onUpdate?.(updatedComment);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa comment này?')) {
      return;
    }

    const result = await commentApi.delete(comment.id);
    if (result.success) {
      toast.success('Đã xóa comment');
      onDelete?.(comment.id);
    } else {
      toast.error(result.message);
    }
  };

  // ✅ FIX 2: Refresh comment từ backend sau khi xóa attachment
  const handleDeleteAttachment = async (attachmentId) => {
    if (!window.confirm('Bạn có chắc muốn xóa file này?')) {
      return;
    }

    const result = await commentApi.deleteAttachment(attachmentId);
    if (result.success) {
      toast.success('Đã xóa file');
      
      // Option 1: Update local state (nhanh hơn)
      const updatedComment = {
        ...comment,
        attachments: comment.attachments?.filter(a => a.id !== attachmentId),
        attachmentCount: Math.max(0, (comment.attachmentCount || 0) - 1)
      };
      onUpdate?.(updatedComment);

      // Option 2: Fetch lại từ backend (chính xác hơn - uncomment nếu muốn dùng)
      // const refreshResult = await commentApi.getById(comment.id);
      // if (refreshResult.success) {
      //   onUpdate?.(refreshResult.data);
      // }
    } else {
      toast.error(result.message);
    }
  };

  return (
    <div className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 p-4 rounded-lg transition-colors">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          {comment.user?.avatarUrl ? (
            <img
              src={comment.user.avatarUrl}
              alt={comment.user.fullName}
              className="w-10 h-10 rounded-full"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium">
              {comment.user?.fullName?.charAt(0).toUpperCase() || 'U'}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-1">
            <div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {comment.user?.fullName || 'Unknown User'}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {timeAgo}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 italic">
                  (edited)
                </span>
              )}
            </div>

            {/* Actions dropdown */}
            {(canEdit || canDelete) && (
              <div className="relative">
                <button
                  onClick={() => setShowActions(!showActions)}
                  className="p-1 opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-all"
                >
                  <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                </button>

                {showActions && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-10">
                    {canEdit && (
                      <button
                        onClick={() => {
                          setIsEditing(true);
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 rounded-t-lg"
                      >
                        <Edit2 className="w-4 h-4" />
                        Edit
                      </button>
                    )}
                    {canDelete && (
                      <button
                        onClick={() => {
                          handleDelete();
                          setShowActions(false);
                        }}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 rounded-b-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content or Editor */}
          {isEditing ? (
            <CommentEditor
              comment={comment}
              onSave={handleEditSave}
              onCancel={() => setIsEditing(false)}
            />
          ) : (
            <>
              {/* Comment text */}
              <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                {renderContent()}
              </div>

              {/* ✅ FIX 3: Attachments sẽ render nếu backend đã trả về attachments array */}
              {comment.attachments && comment.attachments.length > 0 && (
                <AttachmentList
                  attachments={comment.attachments}
                  onDelete={handleDeleteAttachment}
                  canDelete={canDelete}
                />
              )}
            </>
          )}
        </div>
      </div>

      {/* Close actions dropdown when click outside */}
      {showActions && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
};

export default CommentItem;