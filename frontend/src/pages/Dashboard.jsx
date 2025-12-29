import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dashboardApi } from '../api/dashboardApi';

import StatCard from '../components/dashboard/StatCard';
import TasksList from '../components/dashboard/TasksList';
import ActivityFeed from '../components/dashboard/ActivityFeed';

import {
  CheckSquare,
  Clock,
  AlertTriangle,
  TrendingUp
} from 'lucide-react';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [error, setError] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await dashboardApi.getPersonalDashboard();

      if (response.success) {
        setDashboardData(response.data);
      } else {
        setError(response.message || 'Failed to load dashboard data');
      }
    } catch (err) {
      if (err.response?.status === 401) {
        await logout();
        navigate('/login');
      } else {
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to load dashboard'
        );
      }
    } finally {
      setLoading(false);
    }
  }, [logout, navigate]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Oops! Something went wrong
          </h2>
          <p className="text-red-600 dark:text-red-400 mb-6">
            {error}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchDashboardData}
              className="px-6 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleLogout}
              className="px-6 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Extract data
  const stats = dashboardData?.stats || {
    totalTasks: 0,
    inProgress: 0,
    overdue: 0,
    completed: 0
  };

  const myTasks = dashboardData?.myTasks || {
    tasks: [],
    pendingCount: 0,
    completedCount: 0
  };

  const recentActivities = dashboardData?.recentActivities || [];

  return (
    <>
      {/* Welcome Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Welcome back, {user?.fullName || user?.username}! Here's what's happening.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <StatCard
          title="Total Tasks"
          value={stats.totalTasks}
          change={stats.changeFromLastMonth}
          changeLabel="from last month"
          icon={CheckSquare}
          iconBgColor="bg-gray-100 dark:bg-gray-700"
          iconColor="text-gray-900 dark:text-white"
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          change={stats.dueToday}
          changeLabel="due today"
          icon={Clock}
          iconBgColor="bg-yellow-100 dark:bg-yellow-900/30"
          iconColor="text-yellow-600"
        />
        <StatCard
          title="Overdue"
          value={stats.overdue}
          change={stats.overdueChangeFromLastWeek}
          changeLabel="from last week"
          icon={AlertTriangle}
          iconBgColor="bg-red-100 dark:bg-red-900/30"
          iconColor="text-red-600"
        />
        <StatCard
          title="Completed"
          value={stats.completed}
          change={stats.completedThisWeek}
          changeLabel="this week"
          icon={TrendingUp}
          iconBgColor="bg-green-100 dark:bg-green-900/30"
          iconColor="text-green-600"
        />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TasksList myTasks={myTasks} />
        </div>
        <div className="lg:col-span-1">
          <ActivityFeed recentActivities={recentActivities} />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
