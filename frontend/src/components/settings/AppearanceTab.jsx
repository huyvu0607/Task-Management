import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Monitor, Save, Loader2 } from 'lucide-react';
import { useToast } from '../ui/Toast';

const AppearanceTab = () => {
  const toast = useToast();
  const { theme, setTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  
  const [settings, setSettings] = useState({
    language: 'vi',
    timezone: 'Asia/Ho_Chi_Minh',
    dateFormat: 'DD/MM/YYYY',
  });

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate API call
    setTimeout(() => {
      toast.success('Cài đặt giao diện đã được lưu!');
      setLoading(false);
    }, 1000);
  };

  const themeOptions = [
    {
      value: 'light',
      label: 'Sáng',
      icon: Sun,
      gradient: 'from-amber-50 to-orange-100',
      iconBg: 'bg-gradient-to-br from-amber-100 to-orange-200',
      borderColor: 'border-orange-300',
    },
    {
      value: 'dark',
      label: 'Tối',
      icon: Moon,
      gradient: 'from-slate-700 to-slate-900',
      iconBg: 'bg-gradient-to-br from-slate-600 to-slate-800',
      borderColor: 'border-slate-600',
    },
    {
      value: 'system',
      label: 'Hệ thống',
      icon: Monitor,
      gradient: 'from-gray-200 via-gray-300 to-gray-400',
      iconBg: 'bg-gradient-to-br from-gray-300 to-gray-500',
      borderColor: 'border-gray-400',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Giao Diện & Ngôn Ngữ
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Tùy chỉnh giao diện và ngôn ngữ hiển thị
        </p>
      </div>

      {/* Theme Selection */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Chế độ hiển thị
        </h3>
        <div className="grid grid-cols-3 gap-4">
          {themeOptions.map((option) => {
            const Icon = option.icon;
            const isActive = theme === option.value;
            return (
              <button
                key={option.value}
                onClick={() => handleThemeChange(option.value)}
                className={`group relative p-4 border-2 rounded-xl transition-all hover:scale-105 ${
                  isActive
                    ? 'border-gray-900 dark:border-white shadow-lg'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div className="flex flex-col items-center space-y-4">
                  {/* Gradient Background Preview */}
                  <div className={`w-full h-24 rounded-lg bg-gradient-to-br ${option.gradient} flex items-center justify-center relative overflow-hidden`}>
                    {/* Icon in center */}
                    <div className={`w-14 h-14 rounded-full ${option.iconBg} flex items-center justify-center shadow-lg`}>
                      <Icon className="w-7 h-7 text-white" />
                    </div>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-white dark:bg-gray-900 rounded-full flex items-center justify-center shadow-md">
                        <div className="w-3 h-3 bg-gray-900 dark:bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>

                  {/* Label */}
                  <div className="text-center">
                    <p className={`text-sm font-medium ${
                      isActive
                        ? 'text-gray-900 dark:text-white'
                        : 'text-gray-700 dark:text-gray-300'
                    }`}>
                      {option.label}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Other Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          {/* Language */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Ngôn ngữ
            </label>
            <select
              name="language"
              value={settings.language}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
            >
              <option value="vi">Tiếng Việt</option>
              <option value="en">English</option>
            </select>
          </div>

          {/* Timezone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Múi giờ
            </label>
            <select
              name="timezone"
              value={settings.timezone}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
            >
              <option value="Asia/Ho_Chi_Minh">Việt Nam (GMT+7)</option>
              <option value="Asia/Bangkok">Bangkok (GMT+7)</option>
              <option value="Asia/Singapore">Singapore (GMT+8)</option>
              <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
            </select>
          </div>
        </div>

        {/* Date Format */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Định dạng ngày
          </label>
          <select
            name="dateFormat"
            value={settings.dateFormat}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end">
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

export default AppearanceTab;