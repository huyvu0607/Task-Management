// frontend/src/components/team/TeamSwitcher.jsx
import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useTeam } from '../../hooks/useTeam';
import { ChevronDown, Check, Plus, Users, Settings, Trash2, MoreVertical, AlertTriangle, X } from 'lucide-react';
import { deleteTeam } from '../../api/teamApi';
import { useToast } from '../ui/Toast';
import CreateTeamModal from './CreateTeamModal';
import EditTeamModal from './EditTeamModal';

// Confirmation Modal Component
const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, teamName, loading }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900/20">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Xóa Team?
            </h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Bạn có chắc muốn xóa team <span className="font-semibold text-gray-900 dark:text-white">"{teamName}"</span>?
          </p>
          <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <p className="text-sm text-red-800 dark:text-red-300 font-medium">
              ⚠️ Cảnh báo: Hành động này không thể hoàn tác!
            </p>
            <ul className="mt-2 text-xs text-red-700 dark:text-red-400 space-y-1 list-disc list-inside">
              <li>Tất cả tasks trong team sẽ bị xóa</li>
              <li>Tất cả members sẽ mất quyền truy cập</li>
              <li>Dữ liệu không thể khôi phục</li>
            </ul>
          </div>
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
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600 rounded-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Đang xóa...' : 'Xóa Team'}
          </button>
        </div>
      </div>
    </div>
  );
};

const TeamSwitcher = ({ sidebarOpen }) => {
  const { teams, currentTeam, switchTeam, refreshTeams, userRole } = useTeam();
  const toast = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [teamToDelete, setTeamToDelete] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef(null);
  const menuButtonRef = useRef(null);

  const isCurrentUserAdmin = userRole === 'ADMIN';

  // Close dropdown khi click outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Kiểm tra xem click có nằm trong menu không
      const isMenuClick = event.target.closest('.team-menu-dropdown');
      if (isMenuClick) return;
      
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
        setOpenMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleTeamSelect = (team) => {
    switchTeam(team);
    setIsOpen(false);
    setOpenMenuId(null);
  };

  const handleCreateTeam = () => {
    setIsOpen(false);
    setShowCreateModal(true);
  };

  const handleEditTeam = () => {
    if (!isCurrentUserAdmin) {
      toast.error('Chỉ Admin mới có thể chỉnh sửa team');
      return;
    }
    setIsOpen(false);
    setOpenMenuId(null);
    setShowEditModal(true);
  };

  const handleDeleteTeamClick = (team) => {
    if (!isCurrentUserAdmin) {
      toast.error('Chỉ Admin mới có thể xóa team');
      return;
    }
    setTeamToDelete(team);
    setShowDeleteModal(true);
    setIsOpen(false);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = async () => {
    if (!teamToDelete) return;

    try {
      setLoading(true);
      await deleteTeam(teamToDelete.id);
      toast.success(`Đã xóa team "${teamToDelete.name}" thành công`);
      
      // Reload teams và chuyển về team đầu tiên (nếu còn)
      await refreshTeams();
      setShowDeleteModal(false);
      setTeamToDelete(null);
      
      // Redirect về trang team
      window.location.href = '/team';
    } catch (error) {
      console.error('Error deleting team:', error);
      const errorMsg = error.response?.data?.message || error.message;
      
      if (errorMsg.includes('không có quyền')) {
        toast.error('Bạn không có quyền xóa team này');
      } else {
        toast.error('Không thể xóa team. Vui lòng thử lại.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSuccess = () => {
    refreshTeams();
    setShowCreateModal(false);
  };

  const handleEditSuccess = () => {
    refreshTeams();
    setShowEditModal(false);
  };

  const toggleMenu = (e, teamId) => {
    e.stopPropagation();
    
    if (openMenuId === teamId) {
      setOpenMenuId(null);
      return;
    }
    
    // Calculate position
    const rect = e.currentTarget.getBoundingClientRect();
    setMenuPosition({
      top: rect.top,
      left: rect.right + 8 // 8px spacing
    });
    
    setOpenMenuId(teamId);
  };

  // Nếu sidebar đóng, chỉ hiện icon
  if (!sidebarOpen) {
    return (
      <>
        <div className="px-2 py-3 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors relative"
            title={currentTeam?.name || 'Select Team'}
          >
            <Users className="w-5 h-5 text-gray-600 dark:text-gray-400 mx-auto" />
            {teams.length > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 bg-gray-600 dark:bg-gray-400 rounded-full"></span>
            )}
          </button>
        </div>

        {/* Modals */}
        {showCreateModal && (
          <CreateTeamModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateSuccess}
          />
        )}
        {showEditModal && currentTeam && (
          <EditTeamModal
            team={currentTeam}
            onClose={() => setShowEditModal(false)}
            onSuccess={handleEditSuccess}
          />
        )}
        {showDeleteModal && (
          <ConfirmDeleteModal
            isOpen={showDeleteModal}
            onClose={() => {
              setShowDeleteModal(false);
              setTeamToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
            teamName={teamToDelete?.name}
            loading={loading}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div ref={dropdownRef} className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 relative">
        {/* Current Team Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
        >
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
              <Users className="w-4 h-4 text-white dark:text-gray-900" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {currentTeam?.name || 'Select Team'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {teams.length} team{teams.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <ChevronDown 
            className={`w-4 h-4 text-gray-400 transition-transform flex-shrink-0 ${
              isOpen ? 'transform rotate-180' : ''
            }`} 
          />
        </button>

        {/* Dropdown Menu */}
        {isOpen && (
          <div className="absolute left-4 right-4 top-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            {/* Teams List */}
            <div className="py-2">
              <div className="px-3 py-2">
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Your Teams
                </p>
              </div>
              
              {teams.length === 0 ? (
                <div className="px-3 py-4 text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    No teams yet
                  </p>
                  <p className="text-xs text-gray-400">
                    Create your first team to get started
                  </p>
                </div>
              ) : (
                teams.map((team) => (
                  <div key={team.id} className="relative group">
                    <div className="flex items-center justify-between px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                      <button
                        onClick={() => handleTeamSelect(team)}
                        className="flex items-center space-x-3 flex-1 min-w-0"
                      >
                        <div className="w-8 h-8 bg-gray-900 dark:bg-white rounded-lg flex items-center justify-center flex-shrink-0">
                          <span className="text-white dark:text-gray-900 text-xs font-bold">
                            {team.name?.charAt(0).toUpperCase() || 'T'}
                          </span>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {team.name}
                          </p>
                          {team.memberCount !== undefined && (
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {team.memberCount} member{team.memberCount !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </button>
                      
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {currentTeam?.id === team.id && (
                          <Check className="w-4 h-4 text-gray-900 dark:text-white" />
                        )}
                        
                        {/* Menu button - Chỉ hiển thị cho team hiện tại */}
                        {currentTeam?.id === team.id && isCurrentUserAdmin && (
                          <button
                            ref={menuButtonRef}
                            onClick={(e) => toggleMenu(e, team.id)}
                            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors opacity-0 group-hover:opacity-100"
                          >
                            <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Team Menu Dropdown - Using Portal */}
                    {openMenuId === team.id && currentTeam?.id === team.id && createPortal(
                      <div 
                        className="team-menu-dropdown fixed bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl z-[9999] min-w-[180px]"
                        style={{
                          top: `${menuPosition.top}px`,
                          left: `${menuPosition.left}px`
                        }}
                      >
                        <div className="py-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditTeam();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
                          >
                            <Settings className="w-4 h-4" />
                            <span>Chỉnh sửa team</span>
                          </button>
                          <hr className="my-1 border-gray-200 dark:border-gray-700" />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTeamClick(team);
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors flex items-center gap-2"
                          >
                            <Trash2 className="w-4 h-4" />
                            <span>Xóa team</span>
                          </button>
                        </div>
                      </div>,
                      document.body
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Create Team Button */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-2">
              <button
                onClick={handleCreateTeam}
                className="w-full flex items-center space-x-3 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
              >
                <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Create Team
                </span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {showCreateModal && (
        <CreateTeamModal
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Edit Team Modal */}
      {showEditModal && currentTeam && (
        <EditTeamModal
          team={currentTeam}
          onClose={() => setShowEditModal(false)}
          onSuccess={handleEditSuccess}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setTeamToDelete(null);
          }}
          onConfirm={handleConfirmDelete}
          teamName={teamToDelete?.name}
          loading={loading}
        />
      )}
    </>
  );
};

export default TeamSwitcher;