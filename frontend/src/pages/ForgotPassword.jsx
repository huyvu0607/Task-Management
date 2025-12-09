import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

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
      // TODO: Tích hợp API forgot password khi Backend có
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Chuyển sang trang check email với email đã nhập
      navigate('/check-email', { state: { email } });
    } catch (err) {
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
          <div className="bg-gray-300 rounded-full p-16">
            <Mail className="w-20 h-20 text-gray-600" />
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <Link 
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại đăng nhập
        </Link>

        <div>
          <h2 className="text-3xl font-bold text-gray-900">Quên mật khẩu?</h2>
          <p className="text-gray-600 mt-2">
            Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu.
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
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
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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

        <p className="text-center text-gray-600 text-sm">
          Nhớ mật khẩu?{' '}
          <Link to="/login" className="font-semibold text-black hover:underline">
            Đăng nhập
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default ForgotPassword;