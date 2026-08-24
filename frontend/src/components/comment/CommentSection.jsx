import React, { useState, useEffect } from 'react';
import { MessageCircle } from 'lucide-react';
import CommentForm from './CommentForm';
import CommentList from './CommentList';
import { commentApi } from '../../api/commentApi';
import { useToast } from '../ui/Toast';

/**
 * CommentSection Component
 * Main container cho comment system
 * Tích hợp vào TaskDetailModal
 */
const CommentSection = ({ taskId, initialCommentCount = 0 }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentCount, setCommentCount] = useState(initialCommentCount);
  const toast = useToast();

  // Fetch comments
  const fetchComments = async () => {
    if (!taskId) return;

    setLoading(true);
    const result = await commentApi.getByTask(taskId);

    if (result.success) {
      const fetchedComments = result.data?.data || [];
      setComments(fetchedComments);
      setCommentCount(fetchedComments.length);
    } else {
      toast.error(result.message);
      setComments([]);
    }
    setLoading(false);
  };

  // Load comments on mount
  useEffect(() => {
    fetchComments();
  }, [taskId]);

  // Handle comment created
  const handleCommentCreated = (newComment) => {
    setComments([newComment, ...comments]);
    setCommentCount(commentCount + 1);
  };

  // Handle comment updated
  const handleCommentUpdate = (updatedComment) => {
    setComments(comments.map(c => 
      c.id === updatedComment.id ? updatedComment : c
    ));
  };

  // Handle comment deleted
  const handleCommentDelete = (commentId) => {
    setComments(comments.filter(c => c.id !== commentId));
    setCommentCount(Math.max(0, commentCount - 1));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 pb-4 border-b border-gray-200 dark:border-gray-700">
        <MessageCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Comments
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          ({commentCount})
        </span>
      </div>

      {/* Comment Form */}
      <div>
        <CommentForm
          taskId={taskId}
          onCommentCreated={handleCommentCreated}
        />
      </div>

      {/* Comments List */}
      <div>
        <CommentList
          comments={comments}
          loading={loading}
          onUpdate={handleCommentUpdate}
          onDelete={handleCommentDelete}
        />
      </div>
    </div>
  );
};

export default CommentSection;