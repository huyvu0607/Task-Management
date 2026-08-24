// frontend/src/components/team/InviteMemberModal.jsx
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { sendTeamInvitation } from '../../api/teamApi'; // ✅ ĐỔI THÀNH sendTeamInvitation
import { useToast } from '../ui/Toast';

const ROLES = ['ADMIN', 'MANAGER', 'DEVELOPER', 'DESIGNER', 'QA', 'MEMBER', 'VIEWER'];

const InviteMemberModal = ({ teamId, onClose, onSuccess }) => {
  const toast = useToast();
  const [formData, setFormData] = useState({
    email: '',
    role: 'MEMBER'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isClosing, setIsClosing] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.email.trim()) {
      setError('Vui lòng nhập email');
      toast.error('Vui lòng nhập email');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Email không hợp lệ');
      toast.error('Email không hợp lệ');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // ✅ GỌI sendTeamInvitation thay vì inviteMember
      await sendTeamInvitation(teamId, formData);
      
      // ✅ CẬP NHẬT message cho phù hợp với flow invitation
      toast.success(`Lời mời đã được gửi đến ${formData.email}`);
      onSuccess();
    } catch (err) {
      console.error('Error sending invitation:', err);
      const errorMsg = err.response?.data?.message || 'Không thể gửi lời mời. Vui lòng thử lại.';
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
    setTimeout(() => {
      onClose();
    }, 300);
  };

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && !loading) {
        handleClose();
      }
    };
    
    const handleClickOutside = (e) => {
      if (showRoleDropdown && !e.target.closest('.relative')) {
        setShowRoleDropdown(false);
      }
    };
    
    window.addEventListener('keydown', handleEsc);
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      window.removeEventListener('keydown', handleEsc);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [loading, showRoleDropdown]);

  return (
    <div 
      className={`fixed top-0 left-0 right-0 bottom-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        isClosing ? 'bg-opacity-0' : 'bg-opacity-50'
      }`}
      style={{ 
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        animation: isClosing ? 'fadeOut 0.3s ease-out' : 'fadeIn 0.3s ease-out',
        margin: 0
      }}
      onClick={!loading ? handleClose : undefined}
    >
      <div 
        className={`bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-2xl transition-all duration-300 ${
          isClosing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
        }`}
        style={{ animation: isClosing ? 'zoomOut 0.3s ease-out' : 'zoomIn 0.3s ease-out' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Mời thành viên mới
          </h2>
          <button
            onClick={handleClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            disabled={loading}
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="example@company.com"
              className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all"
              required
              autoFocus
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Email lời mời sẽ được gửi đến địa chỉ này
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vai trò *
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white text-left focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all flex items-center justify-between"
                disabled={loading}
              >
                <span>{formData.role}</span>
                <svg 
                  className={`w-5 h-5 transition-transform ${showRoleDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showRoleDropdown && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto">
                  {ROLES.map(role => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, role }));
                        setShowRoleDropdown(false);
                      }}
                      className={`w-full px-4 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors ${
                        formData.role === role 
                          ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-medium' 
                          : 'text-gray-900 dark:text-white'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {error && (
            <div 
              className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              style={{ animation: 'shake 0.4s ease-in-out' }}
            >
              <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="flex-1 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '📧 Đang gửi...' : 'Gửi lời mời'}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeOut {
          from { opacity: 1; }
          to { opacity: 0; }
        }
        @keyframes zoomIn {
          from { 
            opacity: 0;
            transform: scale(0.9);
          }
          to { 
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes zoomOut {
          from { 
            opacity: 1;
            transform: scale(1);
          }
          to { 
            opacity: 0;
            transform: scale(0.9);
          }
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

export default InviteMemberModal;