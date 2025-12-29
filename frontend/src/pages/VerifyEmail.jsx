import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, XCircle, Loader, ArrowRight } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';
import { authApi } from '../api/authApi';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Token không hợp lệ');
      return;
    }

    let isMounted = true;
    let hasVerified = false;

    const verifyEmail = async () => {
      if (hasVerified) return;
      hasVerified = true;

      try {
        const result = await authApi.verifyEmailToken(token);
        
        if (!isMounted) return;
        
        if (result.success) {
          setStatus('success');
          setMessage(result.message || 'Email đã được xác nhận thành công!');
          
          setTimeout(() => {
            navigate('/login');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.message || 'Xác nhận email thất bại');
        }
      } catch (err) {
        if (!isMounted) return;
        
        setStatus('error');
        setMessage('Token không hợp lệ hoặc đã hết hạn');
      }
    };

    verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [token, navigate]);

  const renderContent = () => {
    if (status === 'loading') {
      return (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full">
            <Loader className="w-12 h-12 text-gray-600 dark:text-gray-400 animate-spin" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Đang xác nhận...</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3">
              Vui lòng đợi trong giây lát
            </p>
          </div>
        </div>
      );
    }

    if (status === 'success') {
      return (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Xác nhận thành công!</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3">{message}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây...
            </p>
          </div>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
          >
            Đăng nhập ngay
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full">
            <XCircle className="w-12 h-12 text-red-600 dark:text-red-400" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Xác nhận thất bại</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-3">{message}</p>
          </div>

          <div className="space-y-3">
            <Link
              to="/register"
              className="block w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-medium hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Đăng ký lại
            </Link>
            
            <Link
              to="/login"
              className="block w-full border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white py-3 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              Quay lại đăng nhập
            </Link>
          </div>

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Cần trợ giúp? Liên hệ: <a href="mailto:support@taskflow.com" className="text-black dark:text-white hover:underline">support@taskflow.com</a>
          </p>
        </div>
      );
    }
  };

  return (
    <AuthLayout
      title="Xác nhận email"
      subtitle="Đang xác thực tài khoản của bạn"
      leftContent={
        <div className="flex items-center justify-center">
          <div className="bg-gray-300 dark:bg-gray-700 rounded-full p-16">
            <CheckCircle className="w-20 h-20 text-gray-600 dark:text-gray-400" />
          </div>
        </div>
      }
    >
      {renderContent()}
    </AuthLayout>
  );
};

export default VerifyEmail;