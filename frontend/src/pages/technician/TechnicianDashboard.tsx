// src/pages/technician/TechnicianDashboard.tsx
import React, { useContext } from "react";
import { useOutletContext } from "react-router-dom";
import { AuthContext } from "../../contexts/AuthContext";
import { Loader2, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Ticket } from "../../types"; // Adjust the import path if needed

export default function TechnicianDashboard() {
  const { tickets, loading, error } = useOutletContext<{
    tickets: Ticket[];
    loading: boolean;
    error: string | null;
  }>();
  const { user } = useContext(AuthContext);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <Loader2 className="animate-spin mb-4" size={36} />
        <span className="text-gray-500">Loading dashboard...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh]">
        <span className="text-red-500 text-lg">{error}</span>
      </div>
    );
  }

  // Compute live stats from tickets
  const stats = {
    assigned: tickets.filter((t) => t.status === "Assigned").length,
    inProgress: tickets.filter((t) => t.status === "In Progress").length,
    completed: tickets.filter((t) => t.status === "Completed").length,
  };

  const techName = user?.name || "Technician";

  // Sort and slice to get recent 5 tickets
  const recentTickets = [...tickets]
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 5);

  return (
    <div className="w-full max-w-6xl mx-auto py-8 px-4">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-1">
          Welcome, <span className="text-primary">{techName}</span>
        </h1>
        <p className="text-gray-500">
          Here's an overview of your assigned tickets and progress.
        </p>
      </div>

      {/* Stat Cards - MATCH ADMIN STYLE */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-10">
        <StatCard label="In Progress" value={stats.inProgress} />
        <StatCard label="Assigned" value={stats.assigned} />
        <StatCard label="Completed" value={stats.completed} />
      </div>

      {/* Recent Tickets */}
      <div className="bg-white rounded-xl shadow-card border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Tickets</h2>
          <Link
            to="/technician/tickets"
            className="flex items-center gap-1 text-primary font-medium hover:underline"
          >
            View All Tickets <ArrowRight size={16} />
          </Link>
        </div>
        {recentTickets.length === 0 ? (
          <div className="text-gray-500">No tickets assigned yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 text-gray-700">
                  <th className="text-left py-2 px-3 font-medium">Title</th>
                  <th className="text-left py-2 px-3 font-medium">Company</th>
                  <th className="text-left py-2 px-3 font-medium">Status</th>
                  <th className="text-left py-2 px-3 font-medium">Created At</th>
                  <th className="text-left py-2 px-3 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket) => (
                  <tr key={ticket._id || ticket._id} className="border-b last:border-0">
                    <td className="py-2 px-3">{ticket.issueTitle}</td>
                    <td className="py-2 px-3">
                      {ticket.company?.companyName ||
                        ticket.company?.name ||
                        ""}
                    </td>
                    <td className="py-2 px-3">
                      <StatusPill status={ticket.status} />
                    </td>
                    <td className="py-2 px-3 text-gray-400 text-sm">
                      {ticket.createdAt
                        ? new Date(ticket.createdAt).toLocaleString()
                        : ""}
                    </td>
                    <td className="py-2 px-3">
                      <Link
                        to={`/technician/tickets/${ticket._id || ticket._id}`}
                        className="text-primary font-medium hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

// --- Stat Card (ADMIN STYLE) ---
function StatCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      className="
        bg-white rounded-2xl
        shadow-card
        border border-gray-200
        flex flex-col items-start
        px-8 py-6
        min-w-[180px]
        min-h-[120px]
        justify-center
      "
    >
      <div className="text-gray-500 text-lg mb-2">{label}</div>
      <div className="text-4xl font-bold text-black">{value}</div>
    </div>
  );
}

// --- Status Pill ---
function StatusPill({ status }: { status: string }) {
  const color =
    status === "Assigned"
      ? "bg-yellow-200 text-yellow-900"
      : status === "In Progress"
      ? "bg-blue-200 text-blue-900"
      : status === "Completed"
      ? "bg-green-200 text-green-900"
      : "bg-gray-200 text-gray-800";
  return (
    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${color}`}>
      {status}
    </span>
  );
}
