import React from "react";
import { Card } from "../../components/ui/Card";
import { BadgeCheck, CheckCircle2, XCircle } from "lucide-react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { Ticket } from "../../types"; // Adjust if needed

type DashboardContext = {
  tickets: Ticket[];
  loading: boolean;
  error: string | null;
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
};

export default function CompanyDashboard() {
  const { tickets, loading, error } = useOutletContext<DashboardContext>();
  const navigate = useNavigate();

  // Dashboard summary counts
  const summary = tickets.reduce(
    (counts, t) => {
      const status = (t.status || "").trim().toLowerCase();
      if (status === "in progress") counts.inProgress += 1;
      else if (status === "completed") counts.completed += 1;
      else if (status === "assigned") counts.assigned += 1;
      else if (status === "pending") counts.pending += 1;
      return counts;
    },
    { inProgress: 0, completed: 0, assigned: 0, pending: 0 }
  );

  const recentTickets = Array.isArray(tickets)
    ? tickets
        .slice()
        .sort(
          (a, b) =>
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        )
        .slice(0, 3)
    : [];

  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Ticket Summary</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <h3 className="text-base font-medium text-gray mb-2">In Progress</h3>
          <p className="text-4xl font-bold text-black">{summary.inProgress}</p>
        </Card>
        <Card>
          <h3 className="text-base font-medium text-gray mb-2">Completed</h3>
          <p className="text-4xl font-bold text-black">{summary.completed}</p>
        </Card>
        <Card>
          <h3 className="text-base font-medium text-gray mb-2">Assigned</h3>
          <p className="text-4xl font-bold text-black">{summary.assigned}</p>
        </Card>
        <Card>
          <h3 className="text-base font-medium text-gray mb-2">Pending</h3>
          <p className="text-4xl font-bold text-black">{summary.pending}</p>
        </Card>
      </div>

      {/* Recent Activity */}
      <section className="mb-8">
        <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
        {loading ? (
          <div className="text-gray">Loading…</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : tickets.length === 0 ? (
          <div className="bg-white rounded-xl p-6 shadow-card text-center text-gray-500">
            No tickets yet. Create your first ticket!
          </div>
        ) : (
          <ul className="space-y-3">
            {recentTickets.map((ticket) => {
              let Icon = BadgeCheck;
              let color = "text-primary";
              const statusText = ticket.status;
              if (ticket.status.toLowerCase() === "completed") {
                Icon = CheckCircle2;
                color = "text-green-600";
              } else if (ticket.status.toLowerCase() === "rejected") {
                Icon = XCircle;
                color = "text-primary";
              } else if (ticket.status.toLowerCase() === "in progress") {
                Icon = BadgeCheck;
                color = "text-primary";
              } else if (ticket.status.toLowerCase() === "assigned") {
                Icon = BadgeCheck;
                color = "text-primary";
              }
              return (
                <li
                  key={ticket._id}
                  className="flex items-center bg-white p-4 rounded-xl shadow-card"
                >
                  <Icon className={`mr-3 ${color}`} size={22} />
                  <span className="font-semibold mr-2">
                    Ticket #{ticket.ticketId}
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

      {/* Quick Actions */}
      <section>
        <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
        <div className="flex gap-4">
          <button
            className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition"
            onClick={() => navigate("/company/create-ticket")}
          >
            Create New Ticket
          </button>
          <button
            className="border border-primary text-primary px-6 py-2 rounded font-medium hover:bg-primary/10 transition"
            // onClick={} // TODO: wire up report download
          >
            Download Report
          </button>
        </div>
      </section>
    </div>
  );
}
