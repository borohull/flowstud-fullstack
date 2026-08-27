import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Navbar from './components/Navbar';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CoursesList from './pages/courses/CoursesList';
import CourseDetail from './pages/courses/CourseDetail';
import AssignmentsList from './pages/assignments/AssignmentsList';
import AssignmentDetail from './pages/assignments/AssignmentDetail';
import SessionsList from './pages/sessions/SessionsList';
import SessionDetail from './pages/sessions/SessionDetail';
import TagsList from './pages/TagsList';
import Profile from './pages/Profile';
import SearchUsers from './pages/SearchUsers';
import UserProfile from './pages/UserProfile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminTags from './pages/admin/AdminTags';

const queryClient = new QueryClient();

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-base-200">
      <Navbar />
      <main className="container mx-auto px-4 py-6">
        {children}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected */}
            <Route path="/dashboard" element={
              <ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>
            } />
            <Route path="/courses" element={
              <ProtectedRoute><Layout><CoursesList /></Layout></ProtectedRoute>
            } />
            <Route path="/courses/:id" element={
              <ProtectedRoute><Layout><CourseDetail /></Layout></ProtectedRoute>
            } />
            <Route path="/assignments" element={
              <ProtectedRoute><Layout><AssignmentsList /></Layout></ProtectedRoute>
            } />
            <Route path="/assignments/:id" element={
              <ProtectedRoute><Layout><AssignmentDetail /></Layout></ProtectedRoute>
            } />
            <Route path="/sessions" element={
              <ProtectedRoute><Layout><SessionsList /></Layout></ProtectedRoute>
            } />
            <Route path="/sessions/:id" element={
              <ProtectedRoute><Layout><SessionDetail /></Layout></ProtectedRoute>
            } />
            <Route path="/tags" element={
              <ProtectedRoute><Layout><TagsList /></Layout></ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute><Layout><Profile /></Layout></ProtectedRoute>
            } />

            {/* Social */}
            <Route path="/search" element={
              <ProtectedRoute><Layout><SearchUsers /></Layout></ProtectedRoute>
            } />
            <Route path="/users/:username" element={
              <ProtectedRoute><Layout><UserProfile /></Layout></ProtectedRoute>
            } />

            {/* Admin */}
            <Route path="/admin" element={
              <AdminRoute><Layout><AdminDashboard /></Layout></AdminRoute>
            } />
            <Route path="/admin/users" element={
              <AdminRoute><Layout><AdminUsers /></Layout></AdminRoute>
            } />
            <Route path="/admin/tags" element={
              <AdminRoute><Layout><AdminTags /></Layout></AdminRoute>
            } />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}
