import React, { useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { Search, Moon, Sun, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import InvitationBadge from '../team/InvitationBadge';
import NotificationBell from '../notification/NotificationBell'; // ← Import NotificationBell

const Header = () => {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Xác định theme thực tế đang hiển thị
  const effectiveTheme = useMemo(() => {
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
    }
    return theme;
  }, [theme]);

  // Toggle giữa light và dark (bỏ qua system mode ở header)
  const handleThemeToggle = () => {
    setTheme(effectiveTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-white dark:bg-gray-800 sticky top-0 z-10">
      <div
        className="h-16 px-4 flex items-center justify-between
        border-b border-gray-200 dark:border-gray-700"
      >
        {/* Search */}
        <div className="flex-1 max-w-lg">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-gray-700
                border border-gray-300 dark:border-gray-600 rounded-lg text-sm
                focus:outline-none focus:ring-2 focus:ring-gray-900
                dark:focus:ring-white dark:text-white"
            />
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-3">
          {/* Theme Toggle */}
          <button
            onClick={handleThemeToggle}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            title={
              effectiveTheme === 'dark'
                ? 'Chuyển sang chế độ sáng'
                : 'Chuyển sang chế độ tối'
            }
          >
            {effectiveTheme === 'dark' ? (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          {/* Invitations */}
          <InvitationBadge />

          {/* ✅ Notifications - Thay bằng NotificationBell component */}
          <NotificationBell />

          {/* User Info */}
          <div className="flex items-center space-x-3 pl-3 border-l border-gray-200 dark:border-gray-700">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user?.fullName || user?.username || 'User'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email || ''}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              title="Đăng xuất"
            >
              <LogOut className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;