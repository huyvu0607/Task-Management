import React, { useState, useEffect } from 'react';
import { X, Users, Loader2 } from 'lucide-react';
import { createTeam } from '../../api/teamApi';
import { useToast } from '../ui/Toast';

const CreateTeamModal = ({ onClose, onSuccess }) => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const teamName = formData.name.trim();

    if (!teamName) {
      const msg = 'Vui lòng nhập tên team';
      setError(msg);
      toast.error(msg);
      return;
    }

    if (teamName.length < 3) {
      const msg = 'Tên team phải có ít nhất 3 ký tự';
      setError(msg);
      toast.error(msg);
      return;
    }

    try {
      setLoading(true);
      setError('');

      await createTeam(formData);

      toast.success(`Team "${teamName}" đã được tạo thành công!`);
      onSuccess();
    } catch (err) {
      const errorMsg =
        err.response?.data?.message ||
        'Không thể tạo team. Vui lòng thử lại.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(onClose, 300);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [loading]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
      }`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        animation: isClosing ? 'fadeOut 0.2s ease-out' : 'fadeIn 0.2s ease-out'
      }}
      onClick={!loading ? handleClose : undefined}
    >
      <div
        className={`bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{
          animation: isClosing
            ? 'scaleOut 0.3s ease-out'
            : 'scaleIn 0.3s ease-out'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="w-12 h-12 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center">
            <Users className="w-6 h-6 text-white dark:text-gray-900" />
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Tạo Team Mới
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              Bắt đầu cộng tác với đội nhóm của bạn
            </p>
          </div>
          <button
            onClick={handleClose}
            disabled={loading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Team name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Tên Team <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              maxLength={100}
              autoFocus
              disabled={loading}
              placeholder="Ví dụ: Marketing Team, Dev Team..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700
                border border-gray-300 dark:border-gray-600 rounded-lg
                text-gray-900 dark:text-white placeholder-gray-500
                dark:placeholder-gray-400 focus:outline-none focus:ring-2
                focus:ring-gray-900 dark:focus:ring-white transition-all"
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {formData.name.length}/100 ký tự
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              maxLength={500}
              disabled={loading}
              placeholder="Mô tả ngắn về mục đích và nhiệm vụ của team..."
              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-700
                border border-gray-300 dark:border-gray-600 rounded-lg
                text-gray-900 dark:text-white placeholder-gray-500
                dark:placeholder-gray-400 focus:outline-none focus:ring-2
                focus:ring-gray-900 dark:focus:ring-white resize-none transition-all"
            />
            <p className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
              {formData.description.length}/500 ký tự
            </p>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20
                border border-red-200 dark:border-red-800 rounded-lg"
              style={{ animation: 'shake 0.4s ease-in-out' }}
            >
              <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mt-0.5">
                <span className="text-white text-xs font-bold">!</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600
                text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100
                dark:hover:bg-gray-700 font-medium transition-colors"
            >
              Hủy
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.name.trim()}
              className="flex-1 px-4 py-3 bg-gray-900 dark:bg-white
                text-white dark:text-gray-900 rounded-lg hover:bg-gray-800
                dark:hover:bg-gray-100 font-medium transition-all
                flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Đang tạo...</span>
                </>
              ) : (
                <>
                  <Users className="w-5 h-5" />
                  <span>Tạo Team</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes scaleOut {
          from { opacity: 1; transform: scale(1); }
          to { opacity: 0; transform: scale(0.95); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
      `}</style>
    </div>
  );
};

export default CreateTeamModal;
