import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { Card } from "../../components/ui/Card";
import { ChevronLeft } from "lucide-react";

interface Technician {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface Ticket {
  _id: string;
  ticketId: string;
  issueTitle: string;
  status: string;
  updatedAt: string;
}

export default function TechnicianDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tech, setTech] = useState<Technician | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      api.get(`/users/technicians/${id}`), // <-- Backend: implement if missing
      api.get(`/tickets?technicianId=${id}&limit=20`), // get tickets assigned to this technician
    ])
      .then(([techRes, ticketRes]) => {
        setTech(techRes.data);
        setTickets(ticketRes.data.data || []);
      })
      .catch(() => {
        setTech(null);
        setTickets([]);
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="p-10">Loading…</div>;
  if (!tech)
    return (
      <div className="p-10 text-red-600">Technician not found or deleted.</div>
    );

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <button
        className="mb-6 flex items-center gap-2 text-primary hover:underline text-sm font-medium"
        onClick={() => navigate(-1)}
      >
        <ChevronLeft size={18} /> Back to Technicians
      </button>
      <Card className="max-w-xl p-8 mb-8">
        <h2 className="text-2xl font-bold mb-3">{tech.name}</h2>
        <div className="mb-2">
          <span className="text-gray-600 font-medium">Role: </span>
          <span>{tech.role}</span>
        </div>
        <div className="mb-2">
          <span className="text-gray-600 font-medium">Email: </span>
          <span>{tech.email}</span>
        </div>
        {tech.phone && (
          <div className="mb-2">
            <span className="text-gray-600 font-medium">Phone: </span>
            <span>{tech.phone}</span>
          </div>
        )}
      </Card>
      <Card className="max-w-2xl p-6">
        <h3 className="text-lg font-semibold mb-2">Assigned Tickets</h3>
        {tickets.length === 0 ? (
          <div className="text-gray-500">No tickets assigned.</div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-2">Ticket #</th>
                <th className="py-2 px-2">Issue</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Last Updated</th>
              </tr>
            </thead>
            <tbody>
              {tickets.map((t) => (
                <tr
                  key={t._id}
                  className="hover:bg-gray-100 cursor-pointer"
                  onClick={() => navigate(`/admin/tickets/${t._id}`)}
                >
                  <td className="py-1 px-2 font-semibold">{t.ticketId}</td>
                  <td className="py-1 px-2">{t.issueTitle}</td>
                  <td className="py-1 px-2">{t.status}</td>
                  <td className="py-1 px-2">
                    {new Date(t.updatedAt).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}
