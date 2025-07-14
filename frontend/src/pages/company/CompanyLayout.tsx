/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, useContext } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Sidebar } from "../../components/Sidebar";
import { AuthContext } from "../../contexts/AuthContext";
import { Ticket, Log, Notification } from "../../types";
import api from "../../utils/axiosConfig";

export default function CompanyLayout() {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Polling for tickets (only here)
useEffect(() => {
  let polling: number | undefined;
  let firstLoad = true;

  const fetchTickets = async () => {
    if (firstLoad) setLoading(true); // Only set loading for first load
    setError(null);

    try {
      const res = await api.get("/tickets/company", { params: { page: 1, limit: 50 } });
      setTickets(res.data.data as Ticket[]);
    } catch (err: any) {
      setError(err.message || "Unknown error");
    } finally {
      if (firstLoad) setLoading(false); // Only clear loading after first load
      firstLoad = false;
    }
  };

  fetchTickets();
  polling = window.setInterval(fetchTickets, 5000);

  return () => {
    if (polling) clearInterval(polling);
  };
}, []);

  // Notification logic
  const notifications: Notification[] =
    tickets?.flatMap((ticket: Ticket) => {
      const lastViewed = new Date(ticket.lastViewedByCompany || 0);
      const notifs: Notification[] = [];

      // New logs
      ticket.logs?.forEach((log: Log) => {
        const logDate = new Date(log.timestamp || log.createdAt);
        if (logDate > lastViewed) {
          notifs.push({
            id: `log-${ticket._id}-${(log as any)._id || ""}`,
            message: `New log added to ticket "${ticket.issueTitle}"`,
            link: `/company/tickets/${ticket._id}`,
            date: logDate,
          });
        }
      });

      // Status changed
      if (new Date(ticket.updatedAt) > lastViewed && ticket.status !== "open") {
        notifs.push({
          id: `status-${ticket._id}`,
          message: `Ticket "${ticket.issueTitle}" status changed to "${ticket.status}"`,
          link: `/company/tickets/${ticket._id}`,
          date: new Date(ticket.updatedAt),
        });
      }

      // Technician assigned
      if (
        (ticket as any).assignedTechnician &&
        new Date(ticket.updatedAt) > lastViewed
      ) {
        notifs.push({
          id: `tech-${ticket._id}`,
          message: `Technician "${(ticket as any).assignedTechnician.name}" assigned to "${ticket.issueTitle}"`,
          link: `/company/tickets/${ticket._id}`,
          date: new Date(ticket.updatedAt),
        });
      }

      return notifs;
    }) || [];

  notifications.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="company" notifications={notifications} />
      <div className="flex flex-1">
        <Sidebar role="company" name={user?.companyName || user?.name || "Company"} />
        <main className="flex-1 p-10">
          <Outlet context={{ tickets, loading, error, setTickets }} />
        </main>
      </div>
    </div>
  );
}
