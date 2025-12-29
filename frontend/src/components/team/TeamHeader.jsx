// frontend/src/components/team/TeamHeader.jsx
import React from 'react';
import { Users, UserCheck, Shield, Plus } from 'lucide-react';
import { useTeam } from '../../context/TeamContext';
import PendingInvitationsDropdown from './PendingInvitationsDropdown';

const TeamHeader = ({ stats, onInviteMember, onCreateTeam, userRole }) => {
  const { currentTeam } = useTeam();

  return (
    <div className="space-y-6">
      {/* Title Section with Background */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0 mr-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {currentTeam?.name || 'Team'}
                </h1>
                <p className="text-sm text-gray-300 mt-0.5">
                  {currentTeam?.description || 'Quản lý thành viên nhóm của bạn'}
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-shrink-0">
            {/* Pending Invitations Dropdown */}
            {(userRole === 'ADMIN' || userRole === 'MANAGER') && (
              <PendingInvitationsDropdown teamId={currentTeam?.id} />
            )}

            {/* Add Member Button */}
            <button
              onClick={onInviteMember}
              className="flex items-center gap-2 px-5 py-3 bg-white text-gray-900 rounded-xl hover:bg-gray-100 transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="w-5 h-5" />
              <span>Thêm thành viên</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total Members */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Tổng thành viên
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.totalMembers}
              </p>
            </div>
            <div className="w-14 h-14 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        {/* Active Members */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Đang hoạt động
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.activeMembers}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-50 dark:bg-green-900/20 rounded-xl flex items-center justify-center">
              <UserCheck className="w-7 h-7 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </div>

        {/* Admin Count */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                Quản trị viên
              </p>
              <p className="text-4xl font-bold text-gray-900 dark:text-white">
                {stats.adminCount}
              </p>
            </div>
            <div className="w-14 h-14 bg-gray-900 dark:bg-white rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-white dark:text-gray-900" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamHeader;