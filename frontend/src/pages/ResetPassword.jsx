import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { authApi } from '../api/authApi';

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [loading, setLoading] = useState(false);
  const [validating, setValidating] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPassword, setShowPassword] = useState({
    new: false,
    confirm: false
  });

  // Validate token khi component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('Token không hợp lệ');
        setValidating(false);
        return;
      }

      try {
        const result = await authApi.validateResetToken(token);
        
        if (result.success) {
          setTokenValid(true);
        } else {
          setError(result.message || 'Token không hợp lệ hoặc đã hết hạn');
        }
      } catch (err) {
        console.error('Validate token error:', err);
        setError('Không thể xác thực token');
      } finally {
        setValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Mật khẩu phải có ít nhất 8 ký tự';
    }
    if (!/[A-Z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ hoa';
    }
    if (!/[a-z]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 chữ thường';
    }
    if (!/[0-9]/.test(password)) {
      return 'Mật khẩu phải có ít nhất 1 số';
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    const passwordError = validatePassword(formData.newPassword);
    if (passwordError) {
      setError(passwordError);
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authApi.resetPassword(
        token,
        formData.newPassword,
        formData.confirmPassword
      );

      if (result.success) {
        setSuccess(true);
        // Chuyển về login sau 3 giây
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      } else {
        setError(result.message || 'Không thể đặt lại mật khẩu');
      }
    } catch (err) {
      console.error('Reset password error:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (validating) {
    return (
      <AuthLayout
        title="Đặt lại mật khẩu"
        subtitle="Đang xác thực token..."
        leftContent={
          <div className="flex items-center justify-center">
            <div className="bg-gray-300 dark:bg-gray-700 rounded-full p-16">
              <Lock className="w-20 h-20 text-gray-600 dark:text-gray-400" />
            </div>
          </div>
        }
      >
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black dark:border-white"></div>
        </div>
      </AuthLayout>
    );
  }

  // Token invalid
  if (!tokenValid) {
    return (
      <AuthLayout
        title="Đặt lại mật khẩu"
        subtitle="Token không hợp lệ"
        leftContent={
          <div className="flex items-center justify-center">
            <div className="bg-red-100 dark:bg-red-900/30 rounded-full p-16">
              <AlertCircle className="w-20 h-20 text-red-600 dark:text-red-400" />
            </div>
          </div>
        }
      >
        <div className="space-y-6 text-center">
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg">
            {error}
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Link đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
          </p>
          <Link
            to="/forgot-password"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Gửi lại link đặt lại mật khẩu
          </Link>
        </div>
      </AuthLayout>
    );
  }

  // Success state
  if (success) {
    return (
      <AuthLayout
        title="Đặt lại mật khẩu"
        subtitle="Thành công!"
        leftContent={
          <div className="flex items-center justify-center">
            <div className="bg-green-100 dark:bg-green-900/30 rounded-full p-16">
              <CheckCircle2 className="w-20 h-20 text-green-600 dark:text-green-400" />
            </div>
          </div>
        }
      >
        <div className="space-y-6 text-center">
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg">
            Đặt lại mật khẩu thành công!
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Bạn có thể đăng nhập với mật khẩu mới. Đang chuyển hướng...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black dark:border-white"></div>
          </div>
        </div>
      </AuthLayout>
    );
  }

  // Reset password form
  return (
    <AuthLayout
      title="Đặt lại mật khẩu"
      subtitle="Nhập mật khẩu mới của bạn"
      leftContent={
        <div className="flex items-center justify-center">
          <div className="bg-gray-300 dark:bg-gray-700 rounded-full p-16">
            <Lock className="w-20 h-20 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Tạo mật khẩu mới</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Mật khẩu mới phải khác với mật khẩu đã sử dụng trước đó.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Mật khẩu mới
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword.new ? 'text' : 'password'}
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword.new ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường và số
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Xác nhận mật khẩu
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showPassword.confirm ? 'text' : 'password'}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="w-full pl-10 pr-12 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                {showPassword.confirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white dark:border-black"></div>
                Đang xử lý...
              </>
            ) : (
              'Đặt lại mật khẩu'
            )}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          <Link to="/login" className="font-semibold text-black dark:text-white hover:underline">
            Quay lại đăng nhập
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ResetPassword;