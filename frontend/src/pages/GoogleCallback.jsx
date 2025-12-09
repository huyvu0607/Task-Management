import { useEffect, useState, useRef } from 'react';  
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Component xử lý Google OAuth callback
 * Route: /auth/google/callback
 * 
 * Flow:
 * 1. Nhận code từ Google OAuth
 * 2. Exchange code -> access_token qua backend
 * 3. Login với access_token
 * 4. Redirect đến dashboard
 */
const GoogleCallback = () => {
  const navigate = useNavigate();
  const { socialLogin } = useAuth();
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');
  const [status, setStatus] = useState('processing'); // processing, exchanging, logging_in, success, error
  const hasRun = useRef(false);

  useEffect(() => {
    // ✅ Chỉ chạy 1 lần duy nhất
     if (hasRun.current) return;
    hasRun.current = true;

    const handleGoogleCallback = async () => {
      try {
        setStatus('processing');
        
        // Lấy code từ URL query params
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        console.log('=== Google OAuth Callback ===');
        console.log('Code received:', code ? 'Yes' : 'No');
        console.log('Error param:', errorParam || 'None');

        // Kiểm tra nếu user từ chối quyền
        if (errorParam) {
          console.error('User denied Google authorization');
          setError('Bạn đã hủy đăng nhập với Google');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Kiểm tra có code không
        if (!code) {
          console.error('No authorization code received');
          setError('Không nhận được mã xác thực từ Google');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        console.log('Step 1: Exchanging code for access token...');
        setStatus('exchanging');

        // Bước 1: Exchange code -> access_token qua backend
        // ⚠️ CHÚ Ý: Port 8081 (không phải 8080)
        const tokenResponse = await fetch('http://localhost:8081/api/auth/google/exchange-token', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ code })
        });

        console.log('Token exchange response status:', tokenResponse.status);

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json().catch(() => ({}));
          console.error('Token exchange failed:', errorData);
          throw new Error(errorData.message || 'Không thể xác thực với Google');
        }

        const tokenData = await tokenResponse.json();
        console.log('Token data received:', tokenData ? 'Yes' : 'No');
        
        const accessToken = tokenData.access_token;

        if (!accessToken) {
          console.error('No access token in response');
          throw new Error('Không nhận được access token từ Google');
        }

        console.log('Step 2: Logging in with access token...');
        setStatus('logging_in');

        // Bước 2: Login với access token
        const result = await socialLogin('google', accessToken);
        console.log('Social login result:', result.success ? 'Success' : 'Failed');

        if (result.success) {
          setStatus('success');
          console.log('✅ Google login successful! Redirecting to dashboard...');
          // Delay nhỏ để user thấy success message
          setTimeout(() => navigate('/dashboard'), 500);
        } else {
          console.error('Social login failed:', result.message);
          setError(result.message || 'Đăng nhập thất bại');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
        }

      } catch (err) {
        console.error('❌ Google callback error:', err);
        setError(err.message || 'Có lỗi xảy ra khi đăng nhập với Google');
        setStatus('error');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleGoogleCallback();
  }, []); // Chỉ chạy lần đầu khi mount

  // Helper function để hiển thị message theo status
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
        {/* Error State */}
        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-red-600 font-medium text-center mb-2">{error}</p>
            <p className="text-red-500 text-sm text-center">Đang chuyển về trang đăng nhập...</p>
          </div>
        )}

        {/* Success State */}
        {status === 'success' && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 shadow-sm">
            <div className="flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className="text-green-600 font-medium text-center mb-2">Đăng nhập thành công!</p>
            <p className="text-green-500 text-sm text-center">Đang chuyển đến dashboard...</p>
          </div>
        )}

        {/* Loading States (processing, exchanging, logging_in) */}
        {['processing', 'exchanging', 'logging_in'].includes(status) && (
          <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
            <div className="flex flex-col items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mb-4"></div>
              <p className="text-gray-900 font-medium text-center mb-2">
                {getStatusMessage()}
              </p>
              <p className="text-gray-500 text-sm text-center">
                Vui lòng đợi trong giây lát
              </p>
              
              {/* Progress indicator */}
              <div className="mt-4 w-full">
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
                      width: status === 'processing' ? '33%' : 
                             status === 'exchanging' ? '66%' : 
                             status === 'logging_in' ? '100%' : '0%'
                    }}
                  ></div>
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