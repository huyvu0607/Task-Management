// frontend/src/pages/Team.jsx
import React, { useState, useEffect } from 'react';
import { useTeam } from '../hooks/useTeam';
import { useAuth } from '../context/AuthContext';
import { getTeamMembers } from '../api/teamApi';
import TeamHeader from '../components/team/TeamHeader';
import SearchBar from '../components/team/SearchBar';
import RoleFilter from '../components/team/RoleFilter';
import TeamMemberGrid from '../components/team/TeamMemberGrid';
import InviteMemberModal from '../components/team/InviteMemberModal';
import CreateTeamModal from '../components/team/CreateTeamModal';
import { AlertTriangle } from 'lucide-react';

const Team = () => {
  const { currentTeam, refreshTeams } = useTeam();
  const { user } = useAuth();
  const [members, setMembers] = useState([]);
  const [filteredMembers, setFilteredMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showCreateTeamModal, setShowCreateTeamModal] = useState(false);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Stats data
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeMembers: 0,
    adminCount: 0
  });

  // Load members khi currentTeam thay đổi
  useEffect(() => {
    if (currentTeam?.id) {
      loadMembers();
    } else {
      setLoading(false);
    }
  }, [currentTeam]);

  // Tính currentUserRole ngay khi members hoặc user thay đổi
  useEffect(() => {
    const currentUserId = user?.userId || user?.id;
    
    if (members.length > 0 && currentUserId) {
      // Tìm member theo userId
      let currentMember = members.find(m => m.userId === currentUserId);
      
      // Fallback: Tìm theo user_id
      if (!currentMember) {
        currentMember = members.find(m => m.user_id === currentUserId);
      }
      
      // Fallback: Tìm theo email
      if (!currentMember && user?.email) {
        currentMember = members.find(m => m.email === user.email);
      }
      
      const role = currentMember?.role || null;
      setCurrentUserRole(role);
    }
  }, [members, user]);

  // Filter members khi search hoặc role thay đổi
  useEffect(() => {
    filterMembers();
  }, [members, searchQuery, selectedRole]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getTeamMembers(currentTeam.id);
      const membersList = response.data || [];
      
      setMembers(membersList);
      
      // Calculate stats
      const activeCount = membersList.filter(m => m.status === 'ACTIVE').length;
      const adminCount = membersList.filter(m => m.role === 'ADMIN').length;
      
      setStats({
        totalMembers: membersList.length,
        activeMembers: activeCount,
        adminCount: adminCount
      });
    } catch (err) {
      console.error('Error loading members:', err);
      setError(err.response?.data?.message || err.message || 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  };

  const filterMembers = () => {
    let filtered = [...members];

    // Filter by role
    if (selectedRole !== 'ALL') {
      filtered = filtered.filter(m => m.role === selectedRole);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.fullName?.toLowerCase().includes(query) ||
        m.email?.toLowerCase().includes(query) ||
        m.department?.toLowerCase().includes(query)
      );
    }

    setFilteredMembers(filtered);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handleRoleFilter = (role) => {
    setSelectedRole(role);
  };

  const handleInviteSuccess = () => {
    loadMembers();
    setShowInviteModal(false);
  };

  const handleCreateTeamSuccess = () => {
    refreshTeams();
    setShowCreateTeamModal(false);
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Đang tải team...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Không thể tải dữ liệu team
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-6">{error}</p>
          <button
            onClick={loadMembers}
            className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // No Team Selected State
  if (!currentTeam) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            Chọn một team để xem thành viên
          </p>
        </div>
      </div>
    );
  }

  // Main Content
  return (
    <div className="space-y-6">
      {/* Header with stats and actions */}
      <TeamHeader 
        stats={stats}
        onInviteMember={() => setShowInviteModal(true)}
        onCreateTeam={() => setShowCreateTeamModal(true)}
        userRole={currentUserRole}
      />

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <SearchBar 
          value={searchQuery}
          onChange={handleSearch}
          placeholder="Tìm kiếm thành viên..."
        />
        <RoleFilter 
          selectedRole={selectedRole}
          onRoleChange={handleRoleFilter}
          members={members}
        />
      </div>

      {/* Members Grid */}
      <TeamMemberGrid 
        members={filteredMembers}
        loading={false}
        onMemberUpdate={loadMembers}
        userRole={currentUserRole}
      />

      {/* Modals */}
      {showInviteModal && (
        <InviteMemberModal
          teamId={currentTeam.id}
          onClose={() => setShowInviteModal(false)}
          onSuccess={handleInviteSuccess}
        />
      )}

      {showCreateTeamModal && (
        <CreateTeamModal
          onClose={() => setShowCreateTeamModal(false)}
          onSuccess={handleCreateTeamSuccess}
        />
      )}
    </div>
  );
};

export default Team;