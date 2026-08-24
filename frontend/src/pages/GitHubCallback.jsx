import { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GitHubCallback = () => {
  const navigate = useNavigate();
  const { socialLogin } = useAuth();
  const [searchParams] = useSearchParams();

  const [error, setError] = useState('');
  const [status, setStatus] = useState('processing');

  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const handleGitHubCallback = async () => {
      try {
        const code = searchParams.get('code');
        const errorParam = searchParams.get('error');

        if (errorParam) {
          setError('Bạn đã hủy đăng nhập với GitHub');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        if (!code) {
          setError('Không nhận được mã xác thực từ GitHub');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        setStatus('exchanging');

        const tokenResponse = await fetch(
          'http://localhost:8081/api/auth/github/exchange-token',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code })
          }
        );

        if (!tokenResponse.ok) {
          const errorData = await tokenResponse.json().catch(() => ({}));
          throw new Error(errorData.message || 'Không thể xác thực với GitHub');
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData?.access_token;

        if (!accessToken) {
          throw new Error('Không nhận được access token từ GitHub');
        }

        setStatus('logging_in');

        const result = await socialLogin('github', accessToken);

        if (result.success) {
          setStatus('success');
          setTimeout(() => navigate('/dashboard'), 500);
        } else {
          setError(result.message || 'Đăng nhập thất bại');
          setStatus('error');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch (err) {
        setError(err?.message || 'Có lỗi xảy ra khi đăng nhập với GitHub');
        setStatus('error');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleGitHubCallback();
  }, []);

  const getStatusMessage = () => {
    switch (status) {
      case 'processing':
        return 'Đang xử lý...';
      case 'exchanging':
        return 'Đang xác thực với GitHub...';
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
              <div className="relative mb-4">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-black"></div>
                <svg
                  className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </div>

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

export default GitHubCallback;
