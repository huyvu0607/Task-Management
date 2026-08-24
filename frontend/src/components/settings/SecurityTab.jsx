import React, { useState } from 'react';
import { authApi } from '../../api/authApi';
import { Eye, EyeOff, Lock, Loader2, CheckCircle } from 'lucide-react';
import { useToast } from '../ui/Toast';

const SecurityTab = () => {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const togglePasswordVisibility = (field) => {
    setShowPassword({
      ...showPassword,
      [field]: !showPassword[field],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.oldPassword || !formData.newPassword || !formData.confirmPassword) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      setLoading(false);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Mật khẩu xác nhận không khớp');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
      setLoading(false);
      return;
    }

    try {
      const result = await authApi.changePassword(
        formData.oldPassword,
        formData.newPassword,
        formData.confirmPassword
      );

      if (result.success) {
        toast.success('Đổi mật khẩu thành công! Vui lòng đăng nhập lại.');
        setFormData({
          oldPassword: '',
          newPassword: '',
          confirmPassword: '',
        });
      } else {
        toast.error(result.message || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Change password error:', error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra khi đổi mật khẩu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Change Password Section */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Bảo Mật Tài Khoản
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Quản lý mật khẩu và bảo mật tài khoản
        </p>
      </div>

      {/* Change Password Form */}
      <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
        {/* Old Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mật khẩu hiện tại
          </label>
          <div className="relative">
            <input
              type={showPassword.old ? 'text' : 'password'}
              name="oldPassword"
              value={formData.oldPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('old')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword.old ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showPassword.new ? 'text' : 'password'}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('new')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword.new ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Tối thiểu 8 ký tự, bao gồm chữ hoa, chữ thường và số
          </p>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showPassword.confirm ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-2 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => togglePasswordVisibility('confirm')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              {showPassword.confirm ? (
                <EyeOff className="w-5 h-5" />
              ) : (
                <Eye className="w-5 h-5" />
              )}
            </button>
          </div>
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
                <span>Đang cập nhật...</span>
              </>
            ) : (
              <>
                <Lock className="w-5 h-5" />
                <span>Cập nhật mật khẩu</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Active Sessions (Optional - placeholder for now) */}
      <div className="pt-8 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Phiên đăng nhập
        </h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Chrome trên Windows
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Hoạt động • Hà Nội, Việt Nam
                </p>
              </div>
            </div>
            <span className="text-xs font-medium text-green-600 dark:text-green-400">
              Hiện tại
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SecurityTab;