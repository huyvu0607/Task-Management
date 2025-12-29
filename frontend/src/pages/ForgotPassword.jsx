import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { authApi } from '../api/authApi';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email.trim() || !email.includes('@')) {
      setError('Vui lòng nhập email hợp lệ');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await authApi.forgotPassword(email);
      
      if (result.success) {
        // Chuyển sang trang check email với type='reset-password'
        navigate('/check-email', { 
          state: { 
            email,
            type: 'reset-password' 
          } 
        });
      } else {
        setError(result.message || 'Có lỗi xảy ra. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Khôi phục mật khẩu"
      subtitle="Đừng lo lắng, chúng tôi sẽ gửi hướng dẫn đặt lại mật khẩu qua email của bạn."
      leftContent={
        <div className="flex items-center justify-center">
          <div className="bg-gray-300 dark:bg-gray-700 rounded-full p-16">
            <Mail className="w-20 h-20 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <Link 
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại đăng nhập
        </Link>

        <div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Quên mật khẩu?</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                placeholder="name@company.com"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-black dark:focus:ring-white focus:border-transparent outline-none transition-all"
                required
              />
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
                Đang gửi...
              </>
            ) : (
              <>
                Gửi link đặt lại
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-gray-600 dark:text-gray-400 text-sm">
          Nhớ mật khẩu?{' '}
          <Link to="/login" className="font-semibold text-black dark:text-white hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;