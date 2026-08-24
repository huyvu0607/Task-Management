import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { notificationApi } from '../api/notificationApi';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);

  // ========== FETCH UNREAD COUNT ==========
  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const result = await notificationApi.countUnread();
      if (result.success) {
        setUnreadCount(result.data?.data || 0);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  }, [user]);

  // ========== FETCH UNREAD NOTIFICATIONS ==========
  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const result = await notificationApi.getUnread();
      if (result.success) {
        setNotifications(result.data?.data || []);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications([]);
    }
    setLoading(false);
  }, [user]);

  // ========== MARK AS READ ==========
  const markAsRead = async (id) => {
    try {
      const result = await notificationApi.markAsRead(id);
      if (result.success) {
        // Giảm unread count
        setUnreadCount((prev) => Math.max(0, prev - 1));
        
        // Update notification status
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking as read:', error);
      return false;
    }
  };

  // ========== MARK ALL AS READ ==========
  const markAllAsRead = async () => {
    try {
      const result = await notificationApi.markAllAsRead();
      if (result.success) {
        // Reset unread count
        setUnreadCount(0);
        
        // Update all notifications status
        setNotifications((prev) =>
          prev.map((n) => ({ ...n, isRead: true }))
        );
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking all as read:', error);
      return false;
    }
  };

  // ========== DELETE NOTIFICATION ==========
  const deleteNotification = async (id) => {
    try {
      const result = await notificationApi.delete(id);
      if (result.success) {
        // Remove from list
        setNotifications((prev) => prev.filter((n) => n.id !== id));
        
        // Update count if was unread
        const notification = notifications.find((n) => n.id === id);
        if (notification && !notification.isRead) {
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting notification:', error);
      return false;
    }
  };

  // ========== DELETE ALL READ ==========
  const deleteAllRead = async () => {
    try {
      const result = await notificationApi.deleteAllRead();
      if (result.success) {
        // Remove all read notifications
        setNotifications((prev) => prev.filter((n) => !n.isRead));
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting all read:', error);
      return false;
    }
  };

  // ========== REFRESH ALL DATA ==========
  const refreshAll = useCallback(async () => {
    await Promise.all([
      fetchUnreadCount(),
      fetchNotifications(),
    ]);
  }, [fetchUnreadCount, fetchNotifications]);

  // ========== POLLING UNREAD COUNT ==========
  useEffect(() => {
    if (user) {
      // Initial fetch
      fetchUnreadCount();

      // Poll every 30 seconds
      const interval = setInterval(fetchUnreadCount, 30000);

      return () => clearInterval(interval);
    } else {
      // Clear data when user logs out
      setUnreadCount(0);
      setNotifications([]);
    }
  }, [user, fetchUnreadCount]);

  const value = {
    // State
    unreadCount,
    notifications,
    loading,

    // Actions
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAllRead,
    refreshCount: fetchUnreadCount,
    refreshAll,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};