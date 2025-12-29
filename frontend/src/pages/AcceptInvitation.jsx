// frontend/src/pages/AcceptInvitation.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { getInvitationByToken, acceptInvitation, rejectInvitation } from '../api/teamApi';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../components/ui/Toast';
import { Mail, Users, Shield, Loader, ArrowRight, XCircle, X } from 'lucide-react';

export default function AcceptInvitation() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const toast = useToast();
  
  const [invitation, setInvitation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token không hợp lệ');
      setLoading(false);
      return;
    }

    // Nếu chưa login, redirect đến login và giữ token
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/accept-invitation?token=${token}`)}`);
      return;
    }

    loadInvitation();
  }, [token, isAuthenticated]);

  const loadInvitation = async () => {
    try {
      setLoading(true);
      const response = await getInvitationByToken(token);
      setInvitation(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Không thể tải thông tin lời mời');
    } finally {
      setLoading(false);
    }
  };

  const handleAccept = async () => {
    setProcessing(true);
    try {
      await acceptInvitation(token);
      toast.success('Bạn đã tham gia team thành công!');
      handleClose();
      setTimeout(() => {
        navigate('/team');
        window.location.reload(); // Reload để cập nhật sidebar
      }, 300);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể chấp nhận lời mời';
      setError(errorMsg);
      toast.error(errorMsg);
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    setProcessing(true);
    try {
      await rejectInvitation(token);
      toast.success('Đã từ chối lời mời');
      handleClose();
      setTimeout(() => navigate('/dashboard'), 300);
    } catch (err) {
      const errorMsg = err.response?.data?.message || 'Không thể từ chối lời mời';
      setError(errorMsg);
      toast.error(errorMsg);
      setProcessing(false);
    }
  };

  const handleClose = () => {
    if (!processing) {
      setIsClosing(true);
      setTimeout(() => {
        navigate('/dashboard');
      }, 300);
    }
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !processing) handleClose();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [processing]);

  if (loading) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        style={{ margin: 0 }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center max-w-md">
          <Loader className="w-12 h-12 animate-spin text-gray-900 dark:text-white mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin lời mời...</p>
        </div>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div 
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
          isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
        }`}
        style={{ 
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          backdropFilter: 'blur(4px)',
          margin: 0
        }}
        onClick={handleClose}
      >
        <div 
          className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 text-center max-w-md w-full transition-all duration-300 ${
            isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Lỗi</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={handleClose}
            className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
      }`}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(4px)',
        margin: 0
      }}
      onClick={!processing ? handleClose : undefined}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-2xl transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center">
              <Mail className="w-6 h-6 text-white dark:text-gray-900" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Lời mời tham gia Team
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                Bạn được mời tham gia vào một team mới
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            disabled={processing}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Team Info */}
          <div className="p-5 bg-gray-900 dark:bg-white rounded-xl">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 dark:bg-gray-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Users className="w-7 h-7 text-white dark:text-gray-900" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-bold text-white dark:text-gray-900 truncate">
                  {invitation.teamName}
                </h3>
                <p className="text-sm text-gray-300 dark:text-gray-600 mt-1">
                  Được mời bởi {invitation.inviterName || invitation.inviterEmail}
                </p>
              </div>
            </div>
          </div>

          {/* User Email */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Mail className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-600 dark:text-gray-400">Email được mời</p>
              <p className="font-medium text-gray-900 dark:text-white truncate mt-0.5">
                {invitation.invitedEmail}
              </p>
            </div>
          </div>

          {/* Role Info */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
            <Shield className="w-5 h-5 text-gray-600 dark:text-gray-400 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 dark:text-gray-400">Vai trò trong team</p>
              <span className="inline-block mt-1.5 px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium rounded-lg">
                {invitation.role}
              </span>
            </div>
          </div>

          {/* Warning if different email */}
          {user && invitation.invitedEmail !== user.email && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
                ⚠️ Lưu ý: Lời mời được gửi đến <strong>{invitation.invitedEmail}</strong> nhưng bạn đang đăng nhập với <strong>{user.email}</strong>
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-3">
            <button
              onClick={handleReject}
              disabled={processing}
              className="flex-1 px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {processing ? 'Đang xử lý...' : 'Từ chối'}
            </button>
            <button
              onClick={handleAccept}
              disabled={processing}
              className="flex-1 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  Đang xử lý...
                </>
              ) : (
                <>
                  Chấp nhận
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="px-6 pb-6">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Bạn có thể thay đổi quyết định của mình sau trong phần quản lý team
          </p>
        </div>
      </div>
    </div>
  );
}