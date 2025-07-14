// src/pages/CompanyTicketsPage.tsx
import React, { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, User, Eye } from "lucide-react";

type Ticket = {
  _id: string;
  ticketId: string;
  issueTitle: string;
  status: string;
  issueType: string;
  requestorName: string;
  assignedTo?: { _id: string; name: string };
  createdAt: string;
};

type Company = {
  _id: string;
  companyName: string;
  createdAt: string;
  vatOrPan: string;
  phone: string;
  email: string;
  ticketsCount: number;
  openTickets: number;
};

export default function CompanyTicketsPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [company, setCompany] = useState<Company | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.get(`/users/companies/${companyId}`),
      api.get(`/tickets?companyId=${companyId}`)
    ])
      .then(([compRes, ticketsRes]) => {
        setCompany(compRes.data.data);
        setTickets(ticketsRes.data.data || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  const shown = tickets.filter(
    (t) =>
      t.issueTitle.toLowerCase().includes(filter.toLowerCase()) ||
      t.ticketId.toLowerCase().includes(filter.toLowerCase()) ||
      (t.requestorName && t.requestorName.toLowerCase().includes(filter.toLowerCase()))
  );

  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen">
      <button
        className="mb-6 flex items-center gap-2 text-primary hover:underline text-sm font-medium"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={18} /> Back to Companies
      </button>
      {company && (
        <div className="mb-8 sticky top-4 z-10 bg-gray-50 rounded-xl shadow-card p-6 flex flex-col md:flex-row md:items-center md:gap-10 gap-2">
          <div>
            <div className="text-xl font-bold">{company.companyName}</div>
            <div className="text-xs text-gray-400">
              Registered: {new Date(company.createdAt).toLocaleDateString("en-GB")}
              &nbsp;| PAN: <b>{company.vatOrPan || "-"}</b>
            </div>
            <div className="text-xs text-gray-400">
              {company.phone} | {company.email}
            </div>
          </div>
          <div className="flex flex-col md:items-end ml-auto">
            <span className="text-sm font-semibold text-primary">
              Total Tickets: {company.ticketsCount}
            </span>
            <span className="text-xs text-red-700">
              Open: {company.openTickets}
            </span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto w-full">
        <input
          type="text"
          className="border rounded-lg px-4 py-2 w-full mb-4"
          placeholder="Search tickets…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        <div className="overflow-x-auto">
          <table className="min-w-full rounded-xl">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-3 py-2">Ticket ID</th>
                <th className="px-3 py-2">Title</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Type</th>
                <th className="px-3 py-2">Requestor</th>
                <th className="px-3 py-2">Technician</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    Loading…
                  </td>
                </tr>
              ) : shown.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-gray-400">
                    No tickets found.
                  </td>
                </tr>
              ) : (
                shown.map((ticket) => (
                  <tr key={ticket._id} className="hover:bg-gray-50 transition">
                    <td className="px-3 py-2 font-mono">{ticket.ticketId}</td>
                    <td className="px-3 py-2">{ticket.issueTitle}</td>
                    <td className="px-3 py-2">{ticket.status}</td>
                    <td className="px-3 py-2">{ticket.issueType}</td>
                    <td className="px-3 py-2">{ticket.requestorName}</td>
                    <td className="px-3 py-2">
                      {ticket.assignedTo?.name ? (
                        <span className="flex items-center gap-1">
                          <User size={14} /> {ticket.assignedTo.name}
                        </span>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(ticket.createdAt).toLocaleString("en-GB", {
                        day: "2-digit",
                        month: "short",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        className="bg-primary text-white px-3 py-1 rounded hover:bg-primary/90"
                        onClick={() => navigate(`/admin/tickets/${ticket._id}`)}
                        title="View ticket details"
                      >
                        <Eye size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
