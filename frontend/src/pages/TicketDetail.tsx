/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import api from "../utils/axiosConfig";
import { Card } from "../components/ui/Card";
import { User, ChevronLeft } from "lucide-react";
import clsx from "clsx";

// Types
interface TicketLog {
  _id: string;
  updatedBy?: { _id: string; name: string; role: string };
  updateNote: string;
  timestamp: string;
  displayName?: string;
}
interface TechnicianUser {
  _id: string;
  name: string;
  pendingCount: number;
}
interface Branch {
  province: string;
  city: string;
  municipality: string;
  place: string;
  phone: string;
  isHeadOffice: boolean;
}
interface Company {
  _id: string;
  companyName: string;
}
interface Ticket {
  _id: string;
  ticketId: string;
  issueTitle: string;
  issueDescription: string;
  status: "Pending" | "Assigned" | "In Progress" | "Completed";
  issueType: "Remote" | "Physical";
  branch?: Branch;
  anyDeskId?: string;
  requestorName?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: TechnicianUser;
  logs: TicketLog[];
  company?: Company;
}

const STATUS_OPTIONS: Ticket["status"][] = [
  "Pending", "Assigned", "In Progress", "Completed"
];

// Allowed status transitions for technician
const TECHNICIAN_STATUS_TRANSITIONS: Record<
  Ticket["status"],
  Ticket["status"][]
> = {
  Pending: [],
  Assigned: ["Assigned", "In Progress"], // Assigned → In Progress
  "In Progress": ["Assigned", "In Progress", "Completed"], // In Progress ↔ Assigned or → Completed
  Completed: ["In Progress", "Completed"], // Completed → In Progress (backward)
};

export default function TicketDetail() {
  const { user } = useContext(AuthContext);
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [logText, setLogText] = useState("");
  const [logLoading, setLogLoading] = useState(false);
  const [error, setError] = useState("");
  const [logDisplayName, setLogDisplayName] = useState("");
  const [allTechnicians, setAllTechnicians] = useState<TechnicianUser[]>([]);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [technicianUpdating, setTechnicianUpdating] = useState(false);

  // Fetch ticket
  const fetchTicket = () => {
    setLoading(true);
    api
      .get(`/tickets/${id}`)
      .then((res: any) => setTicket(res.data || res))
      .catch(() => setTicket(null))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTicket();
    // eslint-disable-next-line
  }, [id]);

  // Fetch all technicians for Admin, with their pending ticket counts
  useEffect(() => {
    if (user?.role === "Admin") {
      api.get("/users/technicians")
        .then(res => {
          const sorted = (res.data || []).sort(
            (a: TechnicianUser, b: TechnicianUser) =>
              (a.pendingCount ?? 0) - (b.pendingCount ?? 0)
          );
          setAllTechnicians(sorted);
        })
        .catch(() => setAllTechnicians([]));
    }
  }, [user]);

  // Set default log display name for Company
  useEffect(() => {
    if (!user || !ticket) return;
    if (user.role === "Company") {
      setLogDisplayName(user.name);
    }
  }, [ticket, user]);

  function canAddLog(): boolean {
    if (!user || !ticket) return false;
    if (user.role === "Admin") return true;
    if (user.role === "Company") {
      return ticket.status !== "Pending";
    }
    if (user.role === "Technician") {
      return (
        ticket.assignedTo?._id === user._id &&
        ticket.status !== "Pending"
      );
    }
    return false;
  }

  // Add log handler
  async function handleAddLog(e: React.FormEvent) {
    e.preventDefault();
    if (!logText.trim() || !ticket) return;
    setLogLoading(true);
    setError("");
    try {
      const payload: any = { updateNote: logText.trim() };
      if (user?.role === "Company" && ticket.requestorName) {
        payload.displayName = logDisplayName;
      }
      await api.post(`/tickets/${ticket._id}/logs`, payload);
      fetchTicket();
      setLogText("");
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
        "Failed to add log. Please try again."
      );
    } finally {
      setLogLoading(false);
    }
  }

  // Admin: change status
  async function handleStatusChangeAdmin(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!ticket) return;
    const newStatus = e.target.value as Ticket["status"];
    if (newStatus === ticket.status) return;
    setStatusUpdating(true);
    try {
      await api.patch(`/tickets/${ticket._id}/status`, { status: newStatus });
      fetchTicket();
    } catch {}
    setStatusUpdating(false);
  }

  // Technician: change status
  async function handleStatusChangeTechnician(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!ticket) return;
    const newStatus = e.target.value as Ticket["status"];
    if (newStatus === ticket.status) return;
    setStatusUpdating(true);
    try {
      await api.put(`/tickets/${ticket._id}/status`, {
        status: newStatus,
        updateNote: `Status changed to ${newStatus}`
      });
      fetchTicket();
    } catch {}
    setStatusUpdating(false);
  }

  // Admin: assign technician
  async function handleTechnicianChange(e: React.ChangeEvent<HTMLSelectElement>) {
    if (!ticket) return;
    const technicianId = e.target.value;
    setTechnicianUpdating(true);
    try {
      await api.patch(`/tickets/${ticket._id}/assign`, { technicianId });
      fetchTicket();
    } catch {}
    setTechnicianUpdating(false);
  }

  if (loading) {
    return (
      <div className="p-10 text-center text-gray-400 text-xl">
        Loading ticket details…
      </div>
    );
  }
  if (!ticket) {
    return (
      <div className="p-10 text-center text-red-600 text-lg">
        Ticket not found or you don't have permission.
      </div>
    );
  }

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <button
        className="mb-6 flex items-center gap-2 text-primary hover:underline text-sm font-medium"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={18} /> Back to {user?.role === "Admin" ? "Tickets" : "My Tickets"}
      </button>

      <div className="mb-8">
        <h2 className="text-3xl font-bold mb-1 flex items-center gap-2">
          Ticket #{ticket.ticketId}
          <span
            className={clsx(
              "text-xs px-3 py-1 rounded-full font-semibold ml-2",
              {
                "bg-yellow-100 text-yellow-700": ticket.status === "Pending",
                "bg-blue-100 text-blue-700": ticket.status === "Assigned",
                "bg-purple-100 text-purple-700": ticket.status === "In Progress",
                "bg-green-100 text-green-700": ticket.status === "Completed",
              }
            )}
          >
            {ticket.status}
          </span>
        </h2>
        <div className="text-lg font-semibold text-gray-800 mb-1">
          {ticket.issueTitle}
        </div>
        <div className="text-gray-500 mb-3">
          {formatDateTime(ticket.createdAt)}
        </div>
      </div>

      {/* Ticket Details */}
      <Card className="mb-8 p-6 max-w-2xl">
        {user?.role === "Admin" && ticket.company && (
          <div className="mb-3">
            <span className="block text-sm font-medium text-gray-600 mb-1">Company:</span>
            <span className="text-gray-800 font-semibold">{ticket.company.companyName}</span>
          </div>
        )}

        <div className="mb-3">
          <span className="block text-sm font-medium text-gray-600 mb-1">Description:</span>
          <div className="text-gray-800">{ticket.issueDescription}</div>
        </div>
        {ticket.requestorName && (
          <div className="mb-3">
            <span className="block text-sm font-medium text-gray-600 mb-1">Ticket Created By:</span>
            <div className="text-gray-800">{ticket.requestorName}</div>
          </div>
        )}
        <div className="mb-3">
          <span className="block text-sm font-medium text-gray-600 mb-1">Issue Type:</span>
          <span>{ticket.issueType}</span>
        </div>
        {ticket.issueType === "Physical" && ticket.branch && (
          <div className="mb-3">
            <span className="block text-sm font-medium text-gray-600 mb-1">
              Branch:
            </span>
            <div className="text-gray-800 text-sm">
              {ticket.branch.province}, {ticket.branch.city}, {ticket.branch.municipality}, {ticket.branch.place} ({ticket.branch.phone}){" "}
              {ticket.branch.isHeadOffice && (
                <span className="text-xs text-primary ml-1">[Head Office]</span>
              )}
            </div>
          </div>
        )}
        {ticket.issueType === "Remote" && (
          <div className="mb-3">
            <span className="block text-sm font-medium text-gray-600 mb-1">
              AnyDesk ID:
            </span>
            <span>{ticket.anyDeskId}</span>
          </div>
        )}

        {/* Assigned Technician */}
        <div className="mb-4 flex items-center">
          <span className="block text-sm font-medium text-gray-600 mb-1 mr-2">Assigned Technician:</span>
          {ticket.assignedTo?.name ? (
            <span className="flex items-center gap-1 text-gray-800 text-sm">
              <User size={16} className="inline" /> {ticket.assignedTo.name}
            </span>
          ) : (
            <span className="text-gray-400 text-sm">Not yet assigned</span>
          )}
        </div>

        {/* Admin: Controls */}
        {user?.role === "Admin" && (
          <div className="flex flex-wrap gap-6 mb-2">
            {/* Change Status */}
            <div>
              <label className="block text-xs mb-1">Status:</label>
              <select
                className="border rounded px-2 py-1"
                value={ticket.status}
                disabled={statusUpdating}
                onChange={handleStatusChangeAdmin}
              >
                {STATUS_OPTIONS.map(opt => (
                  <option
                    key={opt}
                    value={opt}
                    disabled={opt === ticket.status}
                  >
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            {/* Assign Technician */}
            <div>
              <label className="block text-xs mb-1">Assign Technician:</label>
              <select
                className="border rounded px-2 py-1"
                value={ticket.assignedTo?._id || ""}
                disabled={technicianUpdating}
                onChange={handleTechnicianChange}
              >
                <option value="">Not Assigned</option>
                {allTechnicians.length === 0 ? (
                  <option disabled>No technicians found</option>
                ) : (
                  allTechnicians.map((tech) => (
                    <option key={tech._id} value={tech._id}>
                      {tech.name} ({tech.pendingCount ?? 0} pending)
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        )}

        {/* Technician: Status Change */}
        {user?.role === "Technician" &&
          ticket.assignedTo?._id === user._id && (
            <div className="flex flex-wrap gap-6 mb-2">
              <div>
                <label className="block text-xs mb-1">Change Status:</label>
                <select
                  className="border rounded px-2 py-1"
                  value={ticket.status}
                  disabled={statusUpdating}
                  onChange={handleStatusChangeTechnician}
                >
                  {TECHNICIAN_STATUS_TRANSITIONS[ticket.status].map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
      </Card>

      {/* Logs Section */}
      <div className="max-w-2xl">
        <div className="text-xl font-semibold mb-3">Logs & Updates</div>
        <div className="flex flex-col gap-3 mb-6">
          {ticket.logs.length === 0 ? (
            <div className="text-gray-400 italic">No logs yet.</div>
          ) : (
            ticket.logs
              .slice()
              .sort((a, b) => +new Date(a.timestamp) - +new Date(b.timestamp))
              .map((log, i) => (
                <div
                  key={log._id || i}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-3 flex items-start gap-3"
                >
                  <div className="flex flex-col items-center min-w-[70px]">
                    <div className="text-xs font-semibold text-primary mb-1">
                      {log.displayName || log.updatedBy?.name || "—"}
                    </div>
                    <div className="text-[11px] text-gray-400">
                      {log.updatedBy?.role || ""}
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="text-xs text-gray-400 mb-1">
                      {formatDateTime(log.timestamp)}
                    </div>
                    <div className="text-sm text-gray-700">{log.updateNote}</div>
                  </div>
                </div>
              ))
          )}
        </div>

        {/* Add log form */}
        {canAddLog() && (
          <form
            onSubmit={handleAddLog}
            className="bg-white border rounded-xl p-4 flex flex-col gap-3 shadow-card"
          >
            <div className="font-medium mb-2">Add a Log / Update</div>
            {user?.role === "Company" && ticket.requestorName && (
              <div className="mb-2">
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Log As:
                </label>
                <select
                  className="border rounded px-3 py-2 focus:outline-primary"
                  value={logDisplayName}
                  onChange={e => setLogDisplayName(e.target.value)}
                  required
                >
                  <option value={user.name}>{user.name} (Company User)</option>
                  <option value={ticket.requestorName}>{ticket.requestorName} (Person Facing Issue)</option>
                </select>
              </div>
            )}
            <textarea
              className="border rounded p-2 resize-y focus:outline-primary"
              rows={3}
              value={logText}
              onChange={e => setLogText(e.target.value)}
              placeholder="Enter your log or update here…"
              required
            />
            {error && <div className="text-primary text-xs">{error}</div>}
            <div className="flex gap-3">
              <button
                type="submit"
                className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition disabled:opacity-60"
                disabled={logLoading || !logText.trim()}
              >
                {logLoading ? "Saving…" : "Add Log"}
              </button>
              <button
                type="button"
                className="border border-primary text-primary px-6 py-2 rounded font-medium hover:bg-primary/10 transition"
                onClick={() => setLogText("")}
                disabled={logLoading}
              >
                Clear
              </button>
            </div>
          </form>
        )}
        {!canAddLog() && (
          <div className="text-gray-400 text-xs mt-1">
            You can add logs only when allowed by ticket status/assignment.
          </div>
        )}
      </div>
    </div>
  );
}

function formatDateTime(dateStr: string) {
  const d = new Date(dateStr);
  return d.toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}
