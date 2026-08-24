// frontend/src/components/team/PendingInvitationsDropdown.jsx
import React, { useState, useEffect } from 'react';
import {
  getTeamPendingInvitations,
  cancelInvitation,
  resendInvitation
} from '../../api/teamApi';
import { useToast } from '../ui/Toast';
import {
  Mail,
  Clock,
  X,
  RefreshCw,
  Loader,
  ChevronDown,
  UserPlus
} from 'lucide-react';

const RESEND_COOLDOWN_SECONDS = 60;

const PendingInvitationsDropdown = ({ teamId }) => {
  const toast = useToast();

  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [processingId, setProcessingId] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);

  /* ===================== LOAD DATA ===================== */
  useEffect(() => {
    if (teamId) {
      loadInvitations();
    }
  }, [teamId]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const res = await getTeamPendingInvitations(teamId);
      setInvitations(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  /* ===================== FORCE RERENDER EACH SECOND ===================== */
  const [, forceTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => {
      forceTick(t => t + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  /* ===================== COOLDOWN ===================== */
  const getRemainingSeconds = (lastResentAt) => {
    if (!lastResentAt) return 0;

    const last = new Date(lastResentAt.replace(' ', 'T')).getTime();
    const now = Date.now();

    const passed = Math.floor((now - last) / 1000);
    return Math.max(0, RESEND_COOLDOWN_SECONDS - passed);
  };

  /* ===================== ACTIONS ===================== */
  const handleCancel = async (id, email) => {
    if (!window.confirm(`Bạn có chắc muốn hủy lời mời gửi đến ${email}?`)) return;

    setProcessingId(id);
    try {
      await cancelInvitation(id);
      toast.success('Đã hủy lời mời');
      loadInvitations();
    } catch {
      toast.error('Không thể hủy lời mời');
    } finally {
      setProcessingId(null);
    }
  };

  const handleResend = async (id, email) => {
    setProcessingId(id);
    try {
      const res = await resendInvitation(id);
      toast.success(`Đã gửi lại email lời mời đến ${email}`);

      // update invitation with new lastResentAt
      setInvitations(prev =>
        prev.map(i => (i.id === id ? res.data : i))
      );
    } catch {
      toast.error('Không thể gửi lại lời mời');
    } finally {
      setProcessingId(null);
    }
  };

  /* ===================== HELPERS ===================== */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (mins < 1) return 'Vừa xong';
    if (mins < 60) return `${mins} phút trước`;
    if (hours < 24) return `${hours} giờ trước`;
    if (days < 7) return `${days} ngày trước`;

    return date.toLocaleDateString('vi-VN');
  };

  const getRoleBadgeStyle = (role) => {
    const styles = {
      ADMIN: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
      MANAGER: 'bg-gray-700 text-white dark:bg-gray-300 dark:text-gray-900',
      MEMBER: 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white',
      VIEWER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    };
    return styles[role] || styles.MEMBER;
  };

  /* ===================== ESC CLOSE ===================== */
  useEffect(() => {
    const onEsc = e => e.key === 'Escape' && setShowDropdown(false);
    window.addEventListener('keydown', onEsc);
    return () => window.removeEventListener('keydown', onEsc);
  }, []);

  /* ===================== RENDER ===================== */
  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => setShowDropdown(v => !v)}
        className="relative flex items-center gap-2 px-4 py-2.5
                   bg-gray-800 hover:bg-gray-700 text-white
                   border border-gray-700 rounded-lg font-medium"
      >
        <UserPlus className="w-5 h-5" />
        <span>Lời mời</span>

        {invitations.length > 0 && (
          <span className="px-2 py-0.5 bg-red-600 text-white
                           text-xs font-semibold rounded-full">
            {invitations.length}
          </span>
        )}

        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            showDropdown ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />

          <div className="absolute right-0 mt-2 w-[420px]
                          bg-white dark:bg-gray-800
                          rounded-xl shadow-xl border
                          border-gray-200 dark:border-gray-700
                          z-50 overflow-hidden">

            {/* Header */}
            <div className="px-4 py-3 border-b">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  <h3 className="text-sm font-semibold">
                    Lời mời đang chờ xác nhận
                  </h3>
                </div>
                <span className="px-2 py-1 bg-gray-100 text-xs rounded-md">
                  {invitations.length}
                </span>
              </div>
            </div>

            {/* List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="py-12 flex flex-col items-center">
                  <Loader className="w-8 h-8 animate-spin mb-2" />
                  <p className="text-sm text-gray-500">Đang tải...</p>
                </div>
              ) : (
                invitations.map(inv => {
                  const remain = getRemainingSeconds(inv.lastResentAt);
                  const isCooldown = remain > 0;

                  return (
                    <div
                      key={inv.id}
                      className="p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex gap-3">
                        <div className="w-10 h-10 bg-gray-900 rounded-lg
                                        flex items-center justify-center">
                          <Mail className="w-5 h-5 text-white" />
                        </div>

                        <div className="flex-1">
                          <p className="font-medium truncate">
                            {inv.invitedEmail}
                          </p>

                          <div className="flex items-center gap-2 mb-1">
                            <span
                              className={`px-2 py-0.5 text-xs rounded
                              ${getRoleBadgeStyle(inv.role)}`}
                            >
                              {inv.role}
                            </span>
                            <span className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="w-3 h-3" />
                              {formatDate(inv.createdAt)}
                            </span>
                          </div>

                          <p className="text-xs text-gray-500">
                            Mời bởi: {inv.inviterName}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          <button
                            onClick={() =>
                              handleResend(inv.id, inv.invitedEmail)
                            }
                            disabled={processingId === inv.id || isCooldown}
                            className="p-2 rounded-lg hover:bg-gray-100
                                       disabled:opacity-50"
                            title={
                              isCooldown
                                ? `Vui lòng chờ ${remain}s`
                                : 'Gửi lại'
                            }
                          >
                            {processingId === inv.id ? (
                              <Loader className="w-4 h-4 animate-spin" />
                            ) : isCooldown ? (
                              <span className="text-xs font-medium">
                                {remain}s
                              </span>
                            ) : (
                              <RefreshCw className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() =>
                              handleCancel(inv.id, inv.invitedEmail)
                            }
                            disabled={processingId === inv.id}
                            className="p-2 text-red-600 hover:bg-red-50
                                       rounded-lg disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PendingInvitationsDropdown;
