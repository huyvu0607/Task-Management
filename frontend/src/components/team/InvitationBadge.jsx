// frontend/src/components/team/InvitationBadge.jsx
import React, { useState, useEffect } from 'react';
import { getMyInvitations } from '../../api/teamApi';
import { useAuth } from '../../context/AuthContext';
import { Mail, Clock, User, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const InvitationBadge = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [invitationCount, setInvitationCount] = useState(0);
  const [invitations, setInvitations] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      loadInvitations();
      
      // Auto refresh every 5 minutes
      const interval = setInterval(loadInvitations, 300000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated]);

  const loadInvitations = async () => {
    try {
      setLoading(true);
      const response = await getMyInvitations();
      const invitationsList = response.data || [];
      setInvitations(invitationsList);
      setInvitationCount(invitationsList.length);
    } catch (error) {
      console.error('Error loading invitations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewInvitation = (token) => {
    setShowDropdown(false);
    navigate(`/accept-invitation?token=${token}`);
  };

  const getRoleBadgeStyle = (role) => {
    const styles = {
      ADMIN: 'bg-gray-900 text-white dark:bg-white dark:text-gray-900',
      MEMBER: 'bg-gray-200 text-gray-900 dark:bg-gray-700 dark:text-white',
      VIEWER: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
    };
    return styles[role] || styles.MEMBER;
  };

  if (!isAuthenticated || invitationCount === 0) {
    return null;
  }

  return (
    <div className="relative">
      {/* Button */}
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2.5 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200"
        title="Lời mời tham gia team"
      >
        <Mail className="w-5 h-5" />
        {invitationCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 bg-red-500 text-white text-xs font-semibold rounded-full flex items-center justify-center">
            {invitationCount > 9 ? '9+' : invitationCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowDropdown(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute right-0 mt-3 w-[360px] bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
            
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                    Lời mời tham gia team
                  </h3>
                </div>
                <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-xs font-medium rounded-md">
                  {invitationCount}
                </span>
              </div>
            </div>

            {/* Invitations List */}
            <div className="max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-3 border-gray-300 dark:border-gray-600 border-t-gray-900 dark:border-t-white rounded-full animate-spin"></div>
                  <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Đang tải...</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {invitations.map((invitation) => (
                    <button
                      key={invitation.id}
                      onClick={() => handleViewInvitation(invitation.token)}
                      className="group w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors text-left"
                    >
                      <div className="flex items-start gap-3">
                        {/* Avatar/Icon */}
                        <div className="flex-shrink-0">
                          <div className="w-11 h-11 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center">
                            <Mail className="w-5 h-5 text-white dark:text-gray-900" />
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate mb-1">
                            {invitation.teamName}
                          </p>
                          
                          <div className="flex items-center gap-1.5 text-sm text-gray-600 dark:text-gray-400 mb-2">
                            <User className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">
                              {invitation.inviterName || invitation.inviterEmail}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-0.5 ${getRoleBadgeStyle(invitation.role)} text-xs font-medium rounded`}>
                              {invitation.role}
                            </span>
                            {invitation.createdAt && (
                              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-500">
                                <Clock className="w-3 h-3" />
                                Mới
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Arrow Icon */}
                        <ChevronRight className="w-5 h-5 text-gray-400 dark:text-gray-500 group-hover:text-gray-900 dark:group-hover:text-white transition-colors flex-shrink-0 mt-2" />
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            {!loading && invitations.length > 0 && (
              <div className="px-4 py-2.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750">
                <p className="text-xs text-center text-gray-600 dark:text-gray-400">
                  Click vào lời mời để xem chi tiết và chấp nhận
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default InvitationBadge;