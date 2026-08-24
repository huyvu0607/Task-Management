import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TeamProvider } from './context/TeamProvider';
import { NotificationProvider } from './context/NotificationContext'; // ← Import NotificationProvider
import PrivateRoute from './components/PrivateRoute';
import PublicRoute from './components/PublicRoute';
import MainLayout from './components/layout/MainLayout';
import { ToastProvider } from './components/ui/Toast';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import CheckEmail from './pages/CheckEmail';
import VerifyEmail from './pages/VerifyEmail';
import GoogleCallback from './pages/GoogleCallback';
import GitHubCallback from './pages/GitHubCallback';
import Settings from './pages/Settings';
import Team from './pages/Team';
import Projects from './pages/Projects';
import AcceptInvitation from './pages/AcceptInvitation';
import ProjectTasks from './pages/ProjectTasks';
import MyTasks from './pages/MyTasks';

function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <Router>
          <AuthProvider>
            {/* ✅ TeamProvider bên trong AuthProvider */}
            <TeamProvider>
              {/* ✅ NotificationProvider bên trong TeamProvider */}
              <NotificationProvider>
                <Routes>
                  {/* ========== PUBLIC ROUTES ========== */}
                  <Route path="/login" element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  } />
                  
                  <Route path="/register" element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  } />
                  
                  <Route path="/forgot-password" element={
                    <PublicRoute>
                      <ForgotPassword />
                    </PublicRoute>
                  } />
                  
                  <Route path="/reset-password" element={
                    <PublicRoute>
                      <ResetPassword />
                    </PublicRoute>
                  } />
                  
                  {/* ========== EMAIL VERIFICATION ROUTES ========== */}
                  <Route path="/check-email" element={<CheckEmail />} />
                  <Route path="/verify-email" element={<VerifyEmail />} />
                  
                  {/* ========== OAUTH CALLBACK ROUTES ========== */}
                  <Route path="/auth/google/callback" element={<GoogleCallback />} />
                  <Route path="/auth/github/callback" element={<GitHubCallback />} />

                  {/* ========== PROTECTED ROUTES WITH LAYOUT ========== */}
                  <Route element={
                    <PrivateRoute>
                      <MainLayout />
                    </PrivateRoute>
                  }>
                    {/* Các route này sẽ render bên trong MainLayout */}
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/projects" element={<Projects />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/team" element={<Team />} />
                    <Route path="/projects/:projectId/tasks" element={<ProjectTasks />} />
                    <Route path="/tasks" element={<MyTasks />} />
                    <Route path="/accept-invitation" element={<AcceptInvitation />} />
                  </Route>
                              
                  {/* ========== DEFAULT & 404 ROUTES ========== */}
                  <Route path="/" element={<Navigate to="/login" replace />} />
                  <Route path="*" element={<Navigate to="/login" replace />} />
                </Routes>
              </NotificationProvider>
            </TeamProvider>
          </AuthProvider>
        </Router>
      </ToastProvider>
    </ThemeProvider>
  );
}

export default App;