import React from 'react';
import { MessageCircle } from 'lucide-react';
import CommentItem from './CommentItem';

/**
 * CommentList Component
 * Hiển thị danh sách comments
 */
const CommentList = ({ comments, loading, onUpdate, onDelete }) => {
  // Loading state
  if (loading) {
    return (
      <div className="py-8 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Loading comments...
        </p>
      </div>
    );
  }

  // Empty state
  if (!comments || comments.length === 0) {
    return (
      <div className="py-8 text-center">
        <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
          <MessageCircle className="w-8 h-8 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
          No comments yet
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Be the first to comment on this task
        </p>
      </div>
    );
  }

  // Comments list
  return (
    <div className="space-y-1 divide-y divide-gray-200 dark:divide-gray-700">
      {comments.map((comment) => (
        <CommentItem
          key={comment.id}
          comment={comment}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default CommentList;