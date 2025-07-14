// src/pages/AdminTickets.tsx
import React, { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import { Folder } from "lucide-react";

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

export default function AdminTickets() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get("/users/companies?includeTicketCount=true")
      .then((res) => setCompanies(res.data.data || []))
      .catch((err) => setError(err?.response?.data?.message || err?.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = companies.filter((c) =>
    c.companyName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-4 md:p-10 bg-gray-50 min-h-screen">
      <h2 className="text-2xl font-bold mb-6">Ticket Management</h2>
      <input
        type="text"
        className="mb-6 border rounded-lg px-4 py-2 w-full md:w-80"
        placeholder="Search companies…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      {loading ? (
        <div className="text-gray-500">Loading…</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filtered.map((company) => (
            <button
              key={company._id}
              className="group bg-white rounded-2xl shadow hover:shadow-lg p-6 flex flex-col items-start gap-2 border border-gray-100 hover:border-primary focus:outline-none transition"
              onClick={() => navigate(`/admin/tickets/company/${company._id}`)}
              tabIndex={0}
              title="Open Tickets"
            >
              <span className="mb-3 flex items-center">
                <Folder size={32} className="text-primary mr-2 group-hover:scale-110 transition-transform" />
                <span className="text-xl font-bold text-left">{company.companyName}</span>
              </span>
              <span className="text-sm text-gray-500">
                Registered: {new Date(company.createdAt).toLocaleDateString("en-GB")}
              </span>
              <span className="text-sm text-gray-500">
                Tickets: <b className="text-primary">{company.ticketsCount}</b>
                {company.openTickets > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full bg-red-100 text-red-700 text-xs font-bold">
                    {company.openTickets} open
                  </span>
                )}
              </span>
              <span className="text-sm text-gray-500">
                PAN: <b>{company.vatOrPan || "-"}</b>
              </span>
              <span className="text-xs text-gray-400 truncate w-full">
                {company.phone} | {company.email}
              </span>
            </button>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-gray-400 italic">
              No companies found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
