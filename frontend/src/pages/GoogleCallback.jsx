import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const { socialLogin } = useAuth();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState('');
  const [status, setStatus] = useState('processing');

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleGoogleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('Bạn đã hủy đăng nhập với Google');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (!code) {
          setError('Không nhận được mã xác thực từ Google');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        setStatus('exchanging');

        const tokenResponse = await fetch(
          'http://localhost:8081/api/auth/google/exchange-token',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          }
        );

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Không thể xác thực với Google');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData?.access_token;

        if (!accessToken) {
          throw new Error('Không nhận được access token từ Google');
        }

        setStatus('logging_in');

        const result = await socialLogin('google', accessToken);

        if (result.success) {
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 500);
        } else {
          setError(result.message || 'Đăng nhập thất bại');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (err) {
        setError(err?.message || 'Có lỗi xảy ra khi đăng nhập với Google');
        setStatus('error');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleGoogleCallback();
  }, []);

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Đang xử lý...';
      case 'exchanging':
        return 'Đang xác thực với Google...';
      case 'logging_in':
        return 'Đang đăng nhập...';
      case 'success':
        return 'Đăng nhập thành công!';
      case 'error':
        return error;
      default:
        return 'Đang xử lý...';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full px-6">
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-medium text-center mb-2">{error}</p>
            <p className="text-red-500 text-sm text-center">
              Đang chuyển về trang đăng nhập...
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium text-center mb-2">
              Đăng nhập thành công!
            </p>
            <p className="text-green-500 text-sm text-center">
              Đang chuyển đến dashboard...
            </p>
          </div>
        )}

        {['processing', 'exchanging', 'logging_in'].includes(status) && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>

              <p className="text-gray-900 font-medium mb-2">
                {getStatusMessage()}
              </p>
              <p className="text-gray-500 text-sm mb-4">
                Vui lòng đợi trong giây lát
              </p>

              <div className="w-full">
                <div className="flex justify-between text-xs text-gray-400 mb-1">
                  <span className={status === 'processing' ? 'text-black font-medium' : ''}>
                    Xử lý
                  </span>
                  <span className={status === 'exchanging' ? 'text-black font-medium' : ''}>
                    Xác thực
                  </span>
                  <span className={status === 'logging_in' ? 'text-black font-medium' : ''}>
                    Đăng nhập
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div
                    className="bg-black h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width:
                        status === 'processing'
                          ? '33%'
                          : status === 'exchanging'
                          ? '66%'
                          : status === 'logging_in'
                          ? '100%'
                          : '0%'
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;
