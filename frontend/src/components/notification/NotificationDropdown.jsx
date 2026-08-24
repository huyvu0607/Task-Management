import React, { useEffect } from 'react';
import { CheckCheck, X, Trash2 } from 'lucide-react';
import { useNotification } from '../../context/NotificationContext';
import NotificationItem from './NotificationItem';

/**
 * NotificationDropdown Component
 * Dropdown hiển thị danh sách notifications
 */
const NotificationDropdown = ({ onClose }) => {
  const {
    notifications,
    loading,
    unreadCount,
    fetchNotifications,
    markAllAsRead,
    deleteAllRead,
  } = useNotification();

  // Fetch notifications khi dropdown mở
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
  };

  const handleDeleteAllRead = async () => {
    if (!window.confirm('Bạn có chắc muốn xóa tất cả notifications đã đọc?')) {
      return;
    }
    await deleteAllRead();
  };

  return (
    <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-gray-50 dark:bg-gray-900">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
            Notifications
          </h3>
          {unreadCount > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {unreadCount} unread
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {/* Mark all as read */}
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
              title="Mark all as read"
            >
              <CheckCheck className="w-4 h-4" />
              <span className="hidden sm:inline">Mark all</span>
            </button>
          )}

          {/* Delete all read */}
          {notifications.some(n => n.isRead) && (
            <button
              onClick={handleDeleteAllRead}
              className="text-xs text-gray-600 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete all read"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}

          {/* Close button */}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
            title="Close"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          // Loading state
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Loading notifications...
            </p>
          </div>
        ) : notifications.length === 0 ? (
          // Empty state
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCheck className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
              All caught up!
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              No new notifications
            </p>
          </div>
        ) : (
          // Notification list
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notifications.map((notification) => (
              <NotificationItem
                key={notification.id}
                notification={notification}
                onClose={onClose}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer - Show only when has notifications */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 text-center bg-gray-50 dark:bg-gray-900">
          <button
            onClick={onClose}
            className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;