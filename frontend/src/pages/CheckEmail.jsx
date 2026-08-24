import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowLeft, RefreshCw, Mail, Clock } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { authApi } from '../api/authApi';

const CheckEmail = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0); // Countdown timer
  
  const email = location.state?.email || 'example@gmail.com';
  const type = location.state?.type || 'register';

  // Countdown effect
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0) return; // Không cho gửi nếu còn countdown

    setLoading(true);
    setMessage('');
    setError('');

    try {
      let result;
      
      if (type === 'reset-password') {
        result = await authApi.forgotPassword(email);
      } else {
        result = await authApi.resendVerificationEmail(email);
      }
      
      if (result.success) {
        setMessage('Email đã được gửi lại! Vui lòng kiểm tra hộp thư.');
        setCountdown(60); // Bắt đầu countdown 60 giây
      } else {
        setError(result.message || 'Không thể gửi lại email');
      }
    } catch (err) {
      console.error('Resend email error:', err);
      setError('Có lỗi xảy ra. Vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenEmail = () => {
    const domain = email.split('@')[1]?.toLowerCase();
    
    const emailProviders = {
      'gmail.com': 'https://mail.google.com',
      'outlook.com': 'https://outlook.live.com',
      'hotmail.com': 'https://outlook.live.com',
      'yahoo.com': 'https://mail.yahoo.com',
    };

    const url = emailProviders[domain] || 'mailto:';
    window.open(url, '_blank');
  };

  const getContent = () => {
    if (type === 'reset-password') {
      return {
        title: 'Khôi phục mật khẩu',
        subtitle: 'Kiểm tra hộp thư email của bạn để tiếp tục.',
        description: 'Chúng tôi đã gửi link đặt lại mật khẩu đến',
        backLink: '/forgot-password',
        backText: 'Quay lại'
      };
    } else {
      return {
        title: 'Xác nhận email',
        subtitle: 'Kiểm tra hộp thư email của bạn để tiếp tục.',
        description: 'Chúng tôi đã gửi link xác nhận đến',
        backLink: '/register',
        backText: 'Quay lại'
      };
    }
  };

  const content = getContent();

  return (
    <AuthLayout
      title={content.title}
      subtitle={content.subtitle}
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
          to={content.backLink}
          className="inline-flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-black dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          {content.backText}
        </Link>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Kiểm tra email</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              {content.description}
            </p>
            <p className="font-semibold text-gray-900 dark:text-white mt-1">{email}</p>
          </div>
        </div>

        {message && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        )}

        <button
          onClick={handleOpenEmail}
          className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
        >
          <Mail className="w-5 h-5" />
          Mở email
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
              Không nhận được email?
            </span>
          </div>
        </div>

        <div className="text-center space-y-3">
          <button
            onClick={handleResend}
            disabled={loading || countdown > 0}
            className="inline-flex items-center gap-2 text-sm font-semibold text-black dark:text-white hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Đang gửi...
              </>
            ) : countdown > 0 ? (
              <>
                <Clock className="w-4 h-4" />
                Gửi lại sau {countdown}s
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                Gửi lại email
              </>
            )}
          </button>

          {countdown > 0 && (
            <div className="flex justify-center">
              <div className="w-48 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-black dark:bg-white h-full transition-all duration-1000 ease-linear"
                  style={{ width: `${(countdown / 60) * 100}%` }}
                ></div>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500 dark:text-gray-400">
            Kiểm tra cả thư mục spam/junk nếu không thấy email
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            💡 <strong>Mẹo:</strong> Thêm <span className="font-mono text-xs">noreply@taskflow.com</span> vào danh bạ để không bỏ lỡ email quan trọng.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default CheckEmail;