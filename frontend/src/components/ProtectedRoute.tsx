// src/components/ProtectedRoute.tsx
import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: Array<'Admin' | 'Company' | 'Technician'>;
}

export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, loading } = useContext(AuthContext);

  if (loading) {
    return <div className="p-4 text-center">Loading…</div>;
  }

  if (!user) {
    // Not logged in
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Logged in but wrong role
    return <Navigate to="/" replace />;
  }

  // Authorized → render child routes
  return <Outlet />;
}
