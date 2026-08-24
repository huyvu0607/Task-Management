import React, { useState, useRef, useEffect } from 'react';
import { Mail, Phone, MoreVertical, Trash2, Briefcase, Building2, AlertTriangle, X, Shield, Users } from 'lucide-react';
import { removeMember, updateMemberRole, getTeamMembers } from '../../api/teamApi';
import { useTeam } from '../../hooks/useTeam';
import { useToast } from '../ui/Toast';
import { useAuth } from '../../context/AuthContext';

const ROLE_COLORS = {
  ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400',
  MANAGER: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400',
  DEVELOPER: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400',
  DESIGNER: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400',
  QA: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400',
  MEMBER: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
  VIEWER: 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
};

const ROLES = [
  { value: 'ADMIN', label: 'Admin', description: 'Toàn quyền quản lý team', icon: Shield },
  { value: 'MANAGER', label: 'Manager', description: 'Quản lý dự án và thành viên', icon: Users },
  { value: 'DEVELOPER', label: 'Developer', description: 'Phát triển và code', icon: Briefcase },
  { value: 'DESIGNER', label: 'Designer', description: 'Thiết kế UI/UX', icon: Briefcase },
  { value: 'QA', label: 'QA', description: 'Kiểm thử và đảm bảo chất lượng', icon: Briefcase },
  { value: 'MEMBER', label: 'Member', description: 'Thành viên thông thường', icon: Users },
  { value: 'VIEWER', label: 'Viewer', description: 'Chỉ xem, không chỉnh sửa', icon: Users }
];

// Confirmation Modal Component
const ConfirmModal = ({ isOpen, onClose, onConfirm, title, message, confirmText, isDestructive, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isDestructive ? 'bg-red-100 dark:bg-red-900/20' : 'bg-blue-100 dark:bg-blue-900/20'}`}>
              <AlertTriangle className={`w-5 h-5 ${isDestructive ? 'text-red-600 dark:text-red-400' : 'text-blue-600 dark:text-blue-400'}`} />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {title}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300">{message}</p>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50 ${
              isDestructive
                ? 'bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600'
                : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600'
            }`}
          >
            {loading ? 'Đang xử lý...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Role Change Modal Component
const RoleChangeModal = ({ isOpen, onClose, onConfirm, currentRole, memberName, loading }) => {
  const [selectedRole, setSelectedRole] = useState(currentRole);

  useEffect(() => {
    setSelectedRole(currentRole);
  }, [currentRole, isOpen]);

  if (!isOpen) return null;

  const handleConfirm = () => {
    if (selectedRole === currentRole) {
      onClose();
      return;
    }
    onConfirm(selectedRole);
  };

  const isCurrentAdmin = currentRole === 'ADMIN';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700">
              <Shield className="w-5 h-5 text-gray-700 dark:text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Thay đổi vai trò
            </h3>
          </div>
          <button onClick={onClose} disabled={loading} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        <div className="p-6">
          {isCurrentAdmin ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                    Không thể thay đổi vai trò Admin
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    Admin không thể thay đổi quyền của Admin khác. Chỉ có thể xóa hoặc để nguyên.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Chọn vai trò mới cho <span className="font-semibold text-gray-900 dark:text-white">{memberName}</span>
            </p>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {ROLES.map((role) => {
              const Icon = role.icon;
              const isSelected = selectedRole === role.value;
              const isDisabled = isCurrentAdmin;
              
              return (
                <button
                  key={role.value}
                  onClick={() => !isDisabled && setSelectedRole(role.value)}
                  disabled={loading || isDisabled}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                    isDisabled
                      ? 'opacity-50 cursor-not-allowed border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900'
                      : isSelected
                      ? 'border-gray-400 dark:border-gray-500 bg-gray-100 dark:bg-gray-700'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 bg-white dark:bg-gray-800'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${ROLE_COLORS[role.value]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {role.label}
                        </span>
                        {role.value === currentRole && (
                          <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400 rounded">
                            Hiện tại
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {role.description}
                      </p>
                    </div>
                    {isSelected && !isDisabled && (
                      <div className="flex-shrink-0">
                        <div className="w-5 h-5 bg-gray-600 dark:bg-gray-400 rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-white dark:text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
          >
            {isCurrentAdmin ? 'Đóng' : 'Hủy'}
          </button>
          {!isCurrentAdmin && (
            <button
              onClick={handleConfirm}
              disabled={loading || selectedRole === currentRole}
              className="px-4 py-2 text-sm font-medium text-white bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-500 rounded-lg transition-colors disabled:opacity-50"
            >
              {loading ? 'Đang cập nhật...' : 'Cập nhật vai trò'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const TeamMemberCard = ({ member, onUpdate, userRole, allMembers }) => {
  const { currentTeam } = useTeam();
  const { user } = useAuth();
  const toast = useToast();
  const [showMenu, setShowMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const menuRef = useRef(null);

  const isAdmin = userRole === 'ADMIN';
  const isSelf = user?.id === member.userId;
  
  // ✅ Đếm số admin trong team
  const adminCount = allMembers?.filter(m => m.role === 'ADMIN').length || 0;
  const isLastAdmin = isSelf && member.role === 'ADMIN' && adminCount === 1;
  
  // Debug log

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleRemoveMemberClick = () => {
    // ✅ Kiểm tra ngay khi bấm nút
    if (isLastAdmin) {
      toast.warning('Bạn là admin duy nhất. Hãy chỉ định admin khác trước khi rời team.');
      setShowMenu(false);
      return;
    }

    if (!isAdmin && !isSelf) {
      toast.error('Chỉ Admin mới có thể xóa thành viên khỏi team');
      setShowMenu(false);
      return;
    }

    setShowConfirmModal(true);
    setShowMenu(false);
  };

  const handleConfirmRemove = async () => {
    try {
      setLoading(true);
      await removeMember(currentTeam.id, member.id);
      
      if (isSelf) {
        // ✅ Nếu tự rời team → Reload lại toàn bộ team list và redirect
        toast.success('Đã rời khỏi team thành công');
        setShowConfirmModal(false);
        
        // Reload teams và chuyển về dashboard hoặc team đầu tiên
        window.location.href = '/team';
      } else {
        // ✅ Nếu xóa member khác → Chỉ reload danh sách members
        toast.success(`Đã xóa ${member.fullName} khỏi team thành công`);
        onUpdate();
        setShowConfirmModal(false);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      const errorMsg = error.response?.data?.message || error.message;
      
      if (errorMsg.includes('admin duy nhất') || errorMsg.includes('ít nhất 1 admin')) {
        toast.error('Team phải có ít nhất 1 admin. Hãy chỉ định admin khác trước.');
      } else if (errorMsg.includes('không có quyền')) {
        toast.error('Bạn không có quyền thực hiện thao tác này');
      } else {
        toast.error('Không thể thực hiện thao tác. Vui lòng thử lại.');
      }
      setShowConfirmModal(false);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeRoleClick = () => {
    if (!isAdmin) {
      toast.error('Chỉ Admin mới có thể thay đổi vai trò thành viên');
      setShowMenu(false);
      return;
    }

    setShowRoleModal(true);
    setShowMenu(false);
  };

  const handleConfirmRoleChange = async (newRole) => {
    try {
      setLoading(true);
      await updateMemberRole(currentTeam.id, member.id, { role: newRole });
      toast.success(`Đã thay đổi vai trò của ${member.fullName} thành ${newRole}`);
      onUpdate();
      setShowRoleModal(false);
    } catch (error) {
      console.error('Error updating role:', error);
      const errorMsg = error.response?.data?.message || error.message;
      
      if (errorMsg.includes('admin duy nhất') || errorMsg.includes('ít nhất 1 admin')) {
        toast.error('Team phải có ít nhất 1 admin. Hãy chỉ định admin khác trước.');
      } else {
        toast.error('Không thể thay đổi vai trò. Vui lòng thử lại.');
      }
      setShowRoleModal(false);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  // ✅ Kiểm tra có nên hiển thị option "Xóa/Rời team" không
  const canRemove = (isAdmin && !isSelf && member.role !== 'ADMIN') || (isSelf && !isLastAdmin);

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-all duration-200 hover:scale-[1.02]">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="relative">
              {member.avatarUrl ? (
                <img
                  src={member.avatarUrl}
                  alt={member.fullName}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                  <span className="text-lg font-bold text-gray-700 dark:text-gray-300">
                    {getInitials(member.fullName)}
                  </span>
                </div>
              )}
              {member.status === 'ACTIVE' && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse"></div>
              )}
            </div>
            
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {member.fullName}
                </h3>
                {isSelf && (
                  <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded">
                    Bạn
                  </span>
                )}
                
              </div>
              
              {member.jobTitle && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 font-medium mt-0.5">
                  <Briefcase className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
                  <span>{member.jobTitle}</span>
                </div>
              )}
              
              {member.department && (
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <Building2 className="w-3 h-3 mr-1.5 flex-shrink-0" />
                  <span>{member.department}</span>
                </div>
              )}
              
              {!member.jobTitle && !member.department && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  No position
                </p>
              )}
            </div>
          </div>

          {(isAdmin || isSelf) && (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                disabled={loading}
              >
                <MoreVertical className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>

              {showMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-10 overflow-hidden">
                  <div className="py-1">
                    {/* Thay đổi vai trò - Chỉ Admin và không phải chính mình và không phải Admin khác */}
                    {isAdmin && !isSelf && member.role !== 'ADMIN' && (
                      <button
                        onClick={handleChangeRoleClick}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                      >
                        <Shield className="w-4 h-4" />
                        <span>Thay đổi vai trò</span>
                      </button>
                    )}
                    
                    {/* Xem hồ sơ - Tất cả */}
                    <button
                      onClick={() => {
                        toast.info('Tính năng đang phát triển');
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Xem hồ sơ
                    </button>
                    
                    {/* Gửi tin nhắn - Chỉ khi không phải chính mình */}
                    {!isSelf && (
                      <button
                        onClick={() => {
                          toast.info('Tính năng đang phát triển');
                          setShowMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        Gửi tin nhắn
                      </button>
                    )}
                    
                    {/* ✅ Xóa khỏi team / Rời team - Chỉ hiển thị khi canRemove */}
                    {canRemove && (
                      <>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleRemoveMemberClick}
                          className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                          disabled={loading}
                        >
                          <Trash2 className="w-4 h-4" />
                          <span>{isSelf ? 'Rời khỏi team' : 'Xóa khỏi team'}</span>
                        </button>
                      </>
                    )}
                    
                    {/* ✅ Hiển thị thông báo nếu là admin duy nhất */}
                    {isLastAdmin && (
                      <>
                        <hr className="my-1 border-gray-200 dark:border-gray-700" />
                        <div className="px-4 py-2 text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-50 dark:bg-yellow-900/10">
                          <AlertTriangle className="w-3 h-3 inline mr-1" />
                          Chỉ định admin khác để rời team
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="mb-4">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
            ROLE_COLORS[member.role] || ROLE_COLORS.MEMBER
          }`}>
            {member.role}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
            <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
            <span className="truncate">{member.email}</span>
          </div>
          {member.phoneNumber && (
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
              <span>{member.phoneNumber}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {member.completedTasksCount || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tasks hoàn thành
            </p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {member.assignedTasksCount || 0}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Tasks được giao
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleConfirmRemove}
        title={isSelf ? "Rời khỏi team?" : "Xóa thành viên?"}
        message={
          isSelf
            ? "Bạn có chắc muốn rời khỏi team này? Bạn sẽ không thể truy cập các task và project của team nữa."
            : `Bạn có chắc muốn xóa ${member.fullName} khỏi team? Thành viên này sẽ mất quyền truy cập vào tất cả task và project của team.`
        }
        confirmText={isSelf ? "Rời team" : "Xóa thành viên"}
        isDestructive={true}
        loading={loading}
      />

      <RoleChangeModal
        isOpen={showRoleModal}
        onClose={() => setShowRoleModal(false)}
        onConfirm={handleConfirmRoleChange}
        currentRole={member.role}
        memberName={member.fullName}
        loading={loading}
      />
    </>
  );
};

export default TeamMemberCard;