import React, { useState } from 'react';
import { Save, Loader2 } from 'lucide-react';
import { useToast } from '../ui/Toast';

const NotificationTab = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    taskReminders: true,
    projectUpdates: true,
    weeklyReports: false,
  });

  const handleToggle = (key) => {
    setSettings({
      ...settings,
      [key]: !settings[key],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Cài đặt thông báo đã được lưu!');
      setLoading(false);
    }, 1000);
  };

  const notificationOptions = [
    {
      key: 'emailNotifications',
      title: 'Thông báo qua Email',
      description: 'Nhận thông báo qua email',
    },
    {
      key: 'pushNotifications',
      title: 'Thông báo đẩy',
      description: 'Nhận thông báo trên trình duyệt',
    },
    {
      key: 'taskReminders',
      title: 'Nhắc nhở task',
      description: 'Nhận nhắc nhở về các task sắp đến hạn',
    },
    {
      key: 'projectUpdates',
      title: 'Cập nhật dự án',
      description: 'Nhận thông báo khi có cập nhật trong dự án',
    },
    {
      key: 'weeklyReports',
      title: 'Báo cáo tuần',
      description: 'Nhận email tổng hợp hoạt động hàng tuần',
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Cài Đặt Thông Báo
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Quản lý cách bạn nhận thông báo
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Notification Options */}
        <div className="space-y-4">
          {notificationOptions.map((option) => (
            <div
              key={option.key}
              className="flex items-center justify-between py-4 border-b border-gray-200 dark:border-gray-700 last:border-0"
            >
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 dark:text-white">
                  {option.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {option.description}
                </p>
              </div>
              <ToggleSwitch
                checked={settings[option.key]}
                onChange={() => handleToggle(option.key)}
              />
            </div>
          ))}
        </div>

        {/* Submit Button */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <>
                <Save className="w-5 h-5" />
                <span>Lưu thay đổi</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

// Toggle Switch Component
const ToggleSwitch = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white focus:ring-offset-2 ${
        checked ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full transition-transform ${
          checked
            ? 'translate-x-6 bg-white dark:bg-gray-900'
            : 'translate-x-1 bg-white dark:bg-gray-300'
        }`}
      />
    </button>
  );
};

export default NotificationTab;