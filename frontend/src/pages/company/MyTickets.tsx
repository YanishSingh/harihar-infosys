/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../utils/axiosConfig";
import { Card } from "../../components/ui/Card";
import { User } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

interface TicketLog {
  updatedBy?: { _id: string; name: string };
  updateNote: string;
  timestamp: string;
}
interface Technician {
  _id: string;
  name: string;
}
interface Ticket {
  _id: string;
  ticketId: string;
  issueTitle: string;
  status: "Pending" | "Assigned" | "In Progress" | "Completed";
  createdAt: string;
  updatedAt: string;
  assignedTo?: Technician;
  requestorName?: string;
  logs: TicketLog[];
}

const columns = [
  { status: "Pending", label: "Pending" },
  { status: "Assigned", label: "Assigned" },
  { status: "In Progress", label: "In Progress" },
  { status: "Completed", label: "Completed" },
] as const;

export default function MyTickets() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get("tickets/company", { params: { page: 1, limit: 100 } })
      .then((res: any) => {
        setTickets(Array.isArray(res.data) ? res.data : res.data?.data || []);
      })
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  }, []);

  // Group tickets by status
  const grouped = Object.fromEntries(
    columns.map(col => [
      col.status,
      tickets
        .filter(t => t.status === col.status)
        .sort((a, b) => +new Date(b.updatedAt) - +new Date(a.updatedAt)),
    ])
  ) as Record<typeof columns[number]["status"], Ticket[]>;

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <h2 className="text-3xl font-bold mb-8 ml-16">My Tickets</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 relative">
        {columns.map(({ status, label }, i) => (
          <React.Fragment key={status}>
            {/* Column */}
            <div className="flex flex-col relative z-10">
              <div className="text-lg font-bold mb-4 text-center text-primary tracking-wide">{label}</div>
              <div className="flex flex-col gap-4">
                {loading ? (
                  <Card className="py-10 text-center">Loading…</Card>
                ) : grouped[status].length === 0 ? (
                  <Card className="py-10 text-center text-gray-400">No tickets</Card>
                ) : (
                  grouped[status].map(ticket => (
                    <TicketCard key={ticket._id} ticket={ticket} />
                  ))
                )}
              </div>
            </div>
            {/* Vertical divider */}
            {i < columns.length - 1 && (
              <div
                className="hidden md:block absolute top-0 h-full w-px bg-gray-200"
                style={{
                  left: `calc(${((i + 1) / columns.length) * 100}% - 0.5px)`,
                  zIndex: 1,
                }}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

// --- Ticket Card component with log badge ---
function TicketCard({ ticket }: { ticket: Ticket }) {
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  // Unique key for each ticket's "read logs" in localStorage
  const storageKey = `ticket-logs-read-${ticket._id}`;

  // On mount, calculate unread logs based on last read timestamp
  useEffect(() => {
    const lastRead = localStorage.getItem(storageKey);
    const lastReadTime = lastRead ? parseInt(lastRead) : 0;
    // If no logs, unread is zero
    if (!ticket.logs?.length) {
      setUnreadCount(0);
    } else {
      // Count only logs after lastReadTime
      const unread = ticket.logs.filter(
        (log) => new Date(log.timestamp).getTime() > lastReadTime
      ).length;
      setUnreadCount(unread);
    }
    // eslint-disable-next-line
  }, [ticket.logs, ticket._id]);

  // On click, mark all logs as read (store latest log timestamp)
  const handleCardClick = (e: React.MouseEvent) => {
    // Mark as read and navigate
    if (ticket.logs?.length) {
      const lastLog = ticket.logs[ticket.logs.length - 1];
      if (lastLog && lastLog.timestamp) {
        localStorage.setItem(storageKey, `${new Date(lastLog.timestamp).getTime()}`);
        setUnreadCount(0);
      }
    }
    navigate(`/company/tickets/${ticket._id}`);
  };

  return (
    <div
      className="relative bg-white rounded-xl shadow p-4 border border-gray-200 hover:shadow-lg hover:border-primary/50 hover:ring-2 hover:ring-primary/40 focus:ring-2 focus:ring-primary transition-all min-h-[120px] flex flex-col justify-between cursor-pointer group"
      style={{ boxSizing: "border-box" }}
      onClick={handleCardClick}
      tabIndex={0}
      aria-label={`View details of ticket ${ticket.ticketId}`}
      role="button"
    >
      {/* Notification Bubble for unread logs */}
      {unreadCount > 0 && (
        <span
          className="absolute -top-3 -right-3 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shadow-lg border-2 border-white"
          title={`${unreadCount} unread update${unreadCount === 1 ? "" : "s"}`}
        >
          {unreadCount}
        </span>
      )}
      <div className="flex justify-between items-center mb-1">
        <span className="text-xs text-gray-400 font-semibold">#{ticket.ticketId}</span>
        <span className="text-xs text-gray-400">{formatDate(ticket.updatedAt)}</span>
      </div>
      <div className="font-bold text-lg mb-1 break-words group-hover:text-primary transition">{ticket.issueTitle}</div>
      {/* Ticket Created By */}
      {ticket.requestorName && (
        <div className="text-xs text-gray-500 mb-1">
          Ticket Created By: <span className="font-medium">{ticket.requestorName}</span>
        </div>
      )}
      {ticket.assignedTo?.name && (
        <div className="flex items-center gap-1 text-sm text-gray-700 mt-1">
          <User className="inline-block" size={16} />
          <span>{ticket.assignedTo.name}</span>
        </div>
      )}
    </div>
  );
}

function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
}
