/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { Card } from "../../components/ui/Card";
import { BadgeCheck, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Ticket } from "../../types";

type DashboardContext = {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
};

export default function AdminDashboard() {
  const { tickets, loading, error } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();

  // Helper to extract company name robustly
  function getCompanyName(ticket: Ticket): string {
  // If the company field is an object, return its companyName property
  if ((ticket as any).company && typeof (ticket as any).company === "object") {
    return (ticket as any).company.companyName || (ticket as any).company.name || "Unknown Company";
  }
  // If the companyName is present directly
  if ((ticket as any).companyName) return (ticket as any).companyName;
  // If just a name
  if ((ticket as any).company) return String((ticket as any).company);
  return "Unknown Company";
}

  // Stats
  const summary = tickets.reduce(
    (counts, t) => {
      const status = (t.status || "").trim().toLowerCase();
      if (status === "open") counts.open += 1;
      else if (status === "in progress") counts.inProgress += 1;
      else if (status === "assigned") counts.assigned += 1;
      else if (status === "completed") counts.completed += 1;
      else if (status === "pending") counts.pending += 1;
      return counts;
    },
    { open: 0, inProgress: 0, assigned: 0, completed: 0, pending: 0 }
  );

  const recentTickets = Array.isArray(tickets)
    ? tickets
        .slice()
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
    : [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Admin Dashboard</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
        <Card>
          <h3 className="text-base font-medium text-gray mb-2">Open</h3>
          <p className="text-4xl font-bold text-black">{summary.open}</p>
        </Card>
        <Card>
          <h3 className="text-base font-medium text-gray mb-2">In Progress</h3>
          <p className="text-4xl font-bold text-black">{summary.inProgress}</p>
        </Card>
        <Card>
          <h3 className="text-base font-medium text-gray mb-2">Assigned</h3>
          <p className="text-4xl font-bold text-black">{summary.assigned}</p>
        </Card>
        <Card>
          <h3 className="text-base font-medium text-gray mb-2">Completed</h3>
          <p className="text-4xl font-bold text-black">{summary.completed}</p>
        </Card>
        <Card>
          <h3 className="text-base font-medium text-gray mb-2">Pending</h3>
          <p className="text-4xl font-bold text-black">{summary.pending}</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <button
            className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition"
            onClick={() => navigate("/admin/companies")}
          >
            Manage Companies
          </button>
          <button
            className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition"
            onClick={() => navigate("/admin/tickets")}
          >
            View All Tickets
          </button>
          <button
            className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition"
            onClick={() => navigate("/admin/technicians")}
          >
            Technicians
          </button>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <h3 className="text-xl font-bold mb-4">Recent Ticket Activity</h3>
        {loading ? (
          <div className="text-gray">Loading…</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-card text-center text-gray-500">
            No tickets yet!
          </div>
        ) : (
          <ul className="space-y-3">
            {recentTickets.map((ticket) => {
              let Icon = BadgeCheck;
              let color = "text-primary";
              const statusText = ticket.status;
              if (statusText.toLowerCase() === "completed") {
                Icon = CheckCircle2;
                color = "text-green-600";
              } else if (statusText.toLowerCase() === "rejected") {
                Icon = XCircle;
                color = "text-primary";
              }
              return (
                <li
                  key={ticket._id}
                  className="flex items-center bg-white p-4 rounded-xl shadow-card cursor-pointer hover:bg-gray-50 transition"
                  onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                  title="View Ticket Details"
                >
                  <Icon className={`mr-3 ${color}`} size={22} />
                  <span className="font-semibold mr-2">
                    Ticket #{ticket.ticketId}
                  </span>
                  <span className="mr-2 text-sm text-gray-600 font-medium">
                    [{getCompanyName(ticket)}]
                  </span>
                  <span className="flex-1">
                    {ticket.issueTitle} — {statusText}
                  </span>
                  <span className="text-gray text-sm">
                    {new Date(ticket.updatedAt).toLocaleString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
