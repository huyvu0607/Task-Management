import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, ArrowLeft, RefreshCw } from 'lucide-react';
import AuthLayout from '../components/AuthLayout';

const CheckEmail = () => {
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const email = location.state?.email || 'example@gmail.com';

  const handleResend = async () => {
    setLoading(true);
    try {
      // TODO: Tích hợp API resend email khi Backend có
      await new Promise(resolve => setTimeout(resolve, 1500));
      alert('Email đã được gửi lại!');
    } catch (err) {
      alert('Có lỗi xảy ra. Vui lòng thử lại!');
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
            <CheckCircle className="w-20 h-20 text-gray-600" />
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        <Link 
          to="/forgot-password"
          className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Quay lại đăng nhập
        </Link>

        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-gray-900">Kiểm tra email</h2>
            <p className="text-gray-600 mt-3">
              Chúng tôi đã gửi link đặt lại mật khẩu đến
            </p>
            <p className="font-semibold text-gray-900 mt-1">{email}</p>
          </div>
        </div>

        <button
          onClick={() => window.open('mailto:', '_blank')}
          className="w-full bg-black text-white py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
        >
          Gửi lại email
        </button>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Không nhận được email?{' '}
            <button
              onClick={handleResend}
              disabled={loading}
              className="font-semibold text-black hover:underline inline-flex items-center gap-1"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                'Thử lại'
              )}
            </button>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default CheckEmail;