import { useState, useEffect } from 'react';
import { TeamContext } from './TeamContext';
import { getMyTeams, getMyRole } from '../api/teamApi';
import { useAuth } from './AuthContext';

export function TeamProvider({ children }) {
  const { user, isAuthenticated } = useAuth();

  const [teams, setTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load teams khi user authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadTeams();
    } else {
      setTeams([]);
      setCurrentTeam(null);
      setUserRole(null);
      setLoading(false);
      setError(null);
    }
  }, [isAuthenticated, user]);

  // Fetch user role khi currentTeam thay đổi
  useEffect(() => {
    if (currentTeam?.id && user) {
      fetchUserRole(currentTeam.id);
    } else {
      setUserRole(null);
    }
  }, [currentTeam, user]);

  // Fetch role của user trong team hiện tại
  const fetchUserRole = async (teamId) => {
    try {
      console.log('🔍 Fetching role for team:', teamId);
      const response = await getMyRole(teamId);
      const role = response?.data ?? response;
      console.log('✅ User role:', role);
      setUserRole(role);
    } catch (error) {
      console.error('❌ Fetch role error:', error);
      setUserRole(null);
    }
  };

  // Load danh sách teams của user
  const loadTeams = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await getMyTeams();
      const teamsList = response?.data || [];

      setTeams(teamsList);

      if (teamsList.length > 0) {
        const savedTeamId = localStorage.getItem('currentTeamId');

        const teamToSelect =
          teamsList.find(t => t.id === Number(savedTeamId)) ||
          teamsList[0];

        setCurrentTeam(teamToSelect);
        localStorage.setItem('currentTeamId', teamToSelect.id);
      } else {
        setCurrentTeam(null);
        setUserRole(null);
      }
    } catch (err) {
      setError(err?.message || 'Failed to load teams');
      setTeams([]);
      setCurrentTeam(null);
      setUserRole(null);
    } finally {
      setLoading(false);
    }
  };

  // Chuyển team
  const switchTeam = (team) => {
    console.log('🔄 Switching team to:', team.name);
    setCurrentTeam(team);
    localStorage.setItem('currentTeamId', team.id);
  };

  // Refresh teams (sau khi tạo/xóa team)
  const refreshTeams = async () => {
    await loadTeams();
  };

  // Create currentTeamMember object for compatibility
  const currentTeamMember = userRole ? {
    role: userRole,
    teamId: currentTeam?.id,
    userId: user?.id,
  } : null;

  const value = {
    teams,
    currentTeam,
    userRole,
    currentTeamMember,
    switchTeam,
    refreshTeams,
    loading,
    error,
    hasTeams: teams.length > 0,
    isLoading: loading
  };

  return (
    <TeamContext.Provider value={value}>
      {children}
    </TeamContext.Provider>
  );
}