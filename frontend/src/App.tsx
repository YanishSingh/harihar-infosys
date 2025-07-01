// src/App.tsx
import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

// Placeholder dashboards until we build them
const AdminDashboard   = () => <div className="p-4">Admin Dashboard</div>;
const CompanyDashboard = () => <div className="p-4">Company Dashboard</div>;

export default function App() {
  const { user, loading } = useContext(AuthContext);

  // While we’re checking `me()`, show a spinner (or blank)
  if (loading) return <div className="p-4 text-center">Loading…</div>;

  // Helper to pick the right dashboard path
  const dashboardPath = user
    ? user.role === 'Admin'
      ? '/admin'
      : '/company'
    : '/login';

  return (
    <Routes>
      {/* Root: redirect to login or appropriate dashboard */}
      <Route
        path="/"
        element={<Navigate to={dashboardPath} replace />}
      />

      {/* Public */}
      <Route
        path="/login"
        element={
          user
            ? <Navigate to={dashboardPath} replace />
            : <Login />
        }
      />
      <Route
        path="/register"
        element={
          user
            ? <Navigate to={dashboardPath} replace />
            : <Register />
        }
      />

      {/* Admin-only */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin" element={<AdminDashboard />} />
      </Route>

      {/* Company-only */}
      <Route element={<ProtectedRoute allowedRoles={['Company']} />}>
        <Route path="/company" element={<CompanyDashboard />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
