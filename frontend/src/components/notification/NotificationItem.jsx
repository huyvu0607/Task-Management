import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { useNotification } from '../../context/NotificationContext';
import { useNavigate } from 'react-router-dom';
import { 
  MessageCircle, 
  UserPlus, 
  AlertCircle, 
  CheckCircle, 
  Clock,
  X 
} from 'lucide-react';

/**
 * NotificationItem Component
 * Single notification item trong dropdown
 */
const NotificationItem = ({ notification, onClose }) => {
  const { markAsRead, deleteNotification } = useNotification();
  const navigate = useNavigate();

  // ✅ Handle click notification - Navigate và mở tab Comments
  const handleClick = async () => {
    try {
      console.log('🔔 Notification clicked:', notification);
      
      // 1. Mark as read nếu chưa đọc
      if (!notification.isRead) {
        await markAsRead(notification.id);
      }

      // 2. Đóng dropdown TRƯỚC KHI navigate
      if (onClose) {
        onClose();
      }

      // 3. Xác định taskId và projectId
      const taskId = notification.relatedTaskId;
      const projectId = notification.relatedProjectId;

      console.log('🎯 Task ID:', taskId);
      console.log('📁 Project ID:', projectId);

      if (!taskId) {
        console.warn('⚠️ Không có taskId, không thể navigate');
        return;
      }

      // 4. Navigate với delay nhỏ để đảm bảo dropdown đã đóng
      setTimeout(() => {
        if (projectId) {
          // ✅ Navigate tới project tasks page với state để mở task modal
          const projectTasksPath = `/projects/${projectId}/tasks`;
          console.log('🚀 Navigating to:', projectTasksPath);
          console.log('📦 With state:', { openTaskId: taskId, activeTab: 'comments' });

          navigate(projectTasksPath, {
            state: {
              openTaskId: taskId,
              activeTab: 'comments',
              scrollToComment: notification.relatedCommentId
            }
          });
        } 
        // ✅ Fallback: Nếu không có projectId
        else if (notification.linkUrl) {
          console.log('📍 Using linkUrl:', notification.linkUrl);
          navigate(notification.linkUrl, {
            state: {
              openTaskId: taskId,
              activeTab: 'comments'
            }
          });
        } 
        // ✅ Fallback cuối
        else if (taskId) {
          const fallbackPath = `/tasks/${taskId}`;
          console.log('⚠️ Fallback navigation:', fallbackPath);
          navigate(fallbackPath, {
            state: {
              activeTab: 'comments'
            }
          });
        }
      }, 100);

    } catch (error) {
      console.error('❌ Error handling notification click:', error);
    }
  };

  // Handle delete
  const handleDelete = async (e) => {
    e.stopPropagation(); // Prevent triggering handleClick
    try {
      await deleteNotification(notification.id);
    } catch (error) {
      console.error('❌ Error deleting notification:', error);
    }
  };

  // Get icon based on notification type
  const getIcon = () => {
    const iconClass = "w-5 h-5";
    switch (notification.type) {
      case 'MENTION':
        return <MessageCircle className={`${iconClass} text-blue-500`} />;
      case 'NEW_COMMENT':
        return <MessageCircle className={`${iconClass} text-green-500`} />;
      case 'TASK_ASSIGNED':
        return <UserPlus className={`${iconClass} text-purple-500`} />;
      case 'TASK_DUE':
        return <AlertCircle className={`${iconClass} text-orange-500`} />;
      case 'TASK_COMPLETED':
        return <CheckCircle className={`${iconClass} text-green-500`} />;
      default:
        return <Clock className={`${iconClass} text-gray-500`} />;
    }
  };

  // Format time ago
  const timeAgo = notification.createdAt 
    ? formatDistanceToNow(new Date(notification.createdAt), {
        addSuffix: true,
        locale: vi,
      })
    : '';

  return (
    <div
      onClick={handleClick}
      className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative group ${
        !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title */}
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {notification.title}
          </p>

          {/* Message */}
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
            {notification.message}
          </p>

          {/* Meta info */}
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
            {/* Time */}
            <span>{timeAgo}</span>

            {/* Related task/project */}
            {(notification.relatedTaskTitle || notification.relatedProjectName) && (
              <>
                <span>•</span>
                <span className="truncate">
                  {notification.relatedTaskTitle || notification.relatedProjectName}
                </span>
              </>
            )}
          </div>
        </div>

        {/* Delete button - Show on hover */}
        <button
          onClick={handleDelete}
          className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-all"
          title="Xóa"
        >
          <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>

        {/* Unread indicator */}
        {!notification.isRead && (
          <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full"></div>
        )}
      </div>

      {/* Related user avatar (if exists) */}
      {notification.relatedUser && (
        <div className="mt-2 flex items-center gap-2">
          {notification.relatedUser.avatarUrl ? (
            <img
              src={notification.relatedUser.avatarUrl}
              alt={notification.relatedUser.fullName}
              className="w-6 h-6 rounded-full"
            />
          ) : (
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-medium">
              {notification.relatedUser.fullName?.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="text-xs text-gray-600 dark:text-gray-400">
            {notification.relatedUser.fullName}
          </span>
        </div>
      )}
    </div>
  );
};

export default NotificationItem;