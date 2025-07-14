import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import Login from './pages/Login';
import Register from './pages/Register';

import AdminDashboard from './pages/admin/AdminDashboard';
import CompanyDashboard from './pages/company/CompanyDashboard';
import CreateTicket from './pages/company/CreateTicket';
import MyTickets from './pages/company/MyTickets';
import CompanyProfile from './pages/company/CompanyProfile';
import TechnicianDashboard from './pages/technician/TechnicianDashboard';
import CompanyLayout from './pages/company/CompanyLayout';

import * as Tooltip from '@radix-ui/react-tooltip'; // <-- Add this line
import TicketDetail from './pages/TicketDetail';
import AdminLayout from './pages/admin/AdminLayout';
import Companies from './pages/admin/Companies';
import Technicians from './pages/admin/Technicians';
import CompanyDetail from "./pages/admin/CompanyDetail";
import AdminTickets from './pages/admin/AdminTickets';
import CompanyTicketsPage from './pages/admin/CompanyTicketsPage';
import TechnicianDetail from './pages/admin/TechniciansDetail';
import AdminProfile from './pages/admin/Profile';
import TechnicianLayout from './pages/technician/TechnicianLayout';
import TechnicianTicketsBoard from './pages/technician/TechnicianTicketBoard';
import TechnicianProfile from './pages/technician/TechnicianProfile';

export default function App() {
  const { user, loading } = useContext(AuthContext);

  if (loading) return <div className="p-4 text-center">Loading…</div>;

  const dashboardPath = user
    ? user.role === 'Admin'
      ? '/admin'
      : user.role === 'Technician'
        ? '/technician'
        : '/company'
    : '/login';

  return (
    <Tooltip.Provider delayDuration={100}>
      <Routes>
        <Route path="/" element={<Navigate to={dashboardPath} replace />} />
        <Route
          path="/login"
          element={user ? <Navigate to={dashboardPath} replace /> : <Login />}
        />
        <Route
          path="/register"
          element={user ? <Navigate to={dashboardPath} replace /> : <Register />}
        />

        {/* Admin-only */}
        <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
  <Route path="/admin" element={<AdminLayout />}>
    <Route index element={<AdminDashboard />} />
    <Route path="tickets/:id" element={<TicketDetail />} />
    <Route path="/admin/companies" element={<Companies />} />
    <Route path="/admin/technicians" element={<Technicians />} />
    <Route path="companies/:id" element={<CompanyDetail />} />
    <Route path="/admin/tickets" element={<AdminTickets />} />
    <Route path="/admin/tickets/company/:companyId" element={<CompanyTicketsPage />} />
    <Route path="/admin/tickets/:ticketId" element={<TicketDetail />} />
    <Route path="/admin/technicians/:id" element={<TechnicianDetail />} />
    <Route path="profile" element={<AdminProfile />} />
  </Route>
</Route>

        {/* Technician-only */}
<Route element={<ProtectedRoute allowedRoles={['Technician']} />}>
  <Route path="/technician" element={<TechnicianLayout />}>
    <Route index element={<TechnicianDashboard />} />
    <Route path="tickets" element={<TechnicianTicketsBoard />} />
    <Route path="tickets/:id" element={<TicketDetail />} />
    <Route path="profile" element={<TechnicianProfile />} />
 
          
        </Route>
</Route>

        {/* Company-only: nested layout */}
        <Route element={<ProtectedRoute allowedRoles={['Company']} />}>
          <Route path="/company" element={<CompanyLayout />}>
            <Route index element={<CompanyDashboard />} />
            <Route path="create-ticket" element={<CreateTicket />} />
            <Route path="my-tickets" element={<MyTickets />} />
            <Route path="profile" element={<CompanyProfile />} />
            <Route path="tickets/:id" element={<TicketDetail />} />
          </Route>
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Tooltip.Provider>
  );
}
