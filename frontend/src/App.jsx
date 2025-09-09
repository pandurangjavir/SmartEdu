import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Chatbot from './pages/Chatbot';
import AIServices from './pages/AIServices';
import StudentServices from './pages/StudentServices';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import LoadingSpinner from './components/LoadingSpinner';
import TeacherDashboard from './pages/TeacherDashboard';
import HODDashboard from './pages/HODDashboard';
import RoleLanding from './pages/RoleLanding';
import TeacherAttendance from './pages/TeacherAttendance';
import TeacherMaterials from './pages/TeacherMaterials';
import TeacherAssignments from './pages/TeacherAssignments';
import TeacherPerformance from './pages/TeacherPerformance';
import HODMembers from './pages/HODMembers';
import HODReports from './pages/HODReports';
import HODAnalytics from './pages/HODAnalytics';
import HODTasks from './pages/HODTasks';
import AdminUsers from './pages/AdminUsers';

const PrivateRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const routeForRole = (role) => {
    if (role === 'admin') return '/admin';
    if (role === 'teacher') return '/teacher';
    if (role === 'hod') return '/hod';
    return '/dashboard';
  };

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to={routeForRole(user?.role)} />;
  }

  return children;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex">
        <Sidebar />
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

function App() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<RoleLanding />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <PrivateRoute>
              <AppLayout>
                <Dashboard />
              </AppLayout>
            </PrivateRoute>
          } />

          {/* Role-specific dashboards */}
          <Route path="/teacher" element={
            <PrivateRoute allowedRoles={['teacher']}>
              <AppLayout>
                <TeacherDashboard />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/teacher/attendance" element={
            <PrivateRoute allowedRoles={['teacher']}>
              <AppLayout>
                <TeacherAttendance />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/teacher/materials" element={
            <PrivateRoute allowedRoles={['teacher']}>
              <AppLayout>
                <TeacherMaterials />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/teacher/assignments" element={
            <PrivateRoute allowedRoles={['teacher']}>
              <AppLayout>
                <TeacherAssignments />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/teacher/performance" element={
            <PrivateRoute allowedRoles={['teacher']}>
              <AppLayout>
                <TeacherPerformance />
              </AppLayout>
            </PrivateRoute>
          } />

          <Route path="/hod" element={
            <PrivateRoute allowedRoles={['hod']}>
              <AppLayout>
                <HODDashboard />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/hod/members" element={
            <PrivateRoute allowedRoles={['hod']}>
              <AppLayout>
                <HODMembers />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/hod/reports" element={
            <PrivateRoute allowedRoles={['hod']}>
              <AppLayout>
                <HODReports />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/hod/analytics" element={
            <PrivateRoute allowedRoles={['hod']}>
              <AppLayout>
                <HODAnalytics />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/hod/tasks" element={
            <PrivateRoute allowedRoles={['hod']}>
              <AppLayout>
                <HODTasks />
              </AppLayout>
            </PrivateRoute>
          } />
          
          <Route path="/chatbot" element={
            <PrivateRoute>
              <AppLayout>
                <Chatbot />
              </AppLayout>
            </PrivateRoute>
          } />
          
          <Route path="/ai-services" element={
            <PrivateRoute>
              <AppLayout>
                <AIServices />
              </AppLayout>
            </PrivateRoute>
          } />
          
          <Route path="/student-services" element={
            <PrivateRoute>
              <AppLayout>
                <StudentServices />
              </AppLayout>
            </PrivateRoute>
          } />
          
          <Route path="/admin" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AppLayout>
                <AdminPanel />
              </AppLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/users" element={
            <PrivateRoute allowedRoles={['admin']}>
              <AppLayout>
                <AdminUsers />
              </AppLayout>
            </PrivateRoute>
          } />
          
          <Route path="/profile" element={
            <PrivateRoute>
              <AppLayout>
                <Profile />
              </AppLayout>
            </PrivateRoute>
          } />
          
          {/* Default redirect */}
          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App; 