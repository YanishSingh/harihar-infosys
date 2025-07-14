/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Sidebar } from "../../components/Sidebar";
import api from "../../utils/axiosConfig";
import { Ticket, Log, Notification } from "../../types"; // Adjust import if needed

export default function TechnicianLayout() {
  
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Polling for technician's assigned tickets
  useEffect(() => {
    let polling: number | undefined;
    let firstLoad = true;

    const fetchTickets = async () => {
      if (firstLoad) setLoading(true);
      setError(null);
      try {
        // You may want to filter by technician via API, or backend should already restrict to this technician
        const res = await api.get("/technician/tickets", { params: { page: 1, limit: 50 } });
        setTickets(Array.isArray(res.data?.data) ? res.data.data : []);
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Error fetching tickets"
        );
        setTickets([]);
      } finally {
        if (firstLoad) setLoading(false);
        firstLoad = false;
      }
    };

    fetchTickets();
    polling = window.setInterval(fetchTickets, 5000);

    return () => {
      if (polling) clearInterval(polling);
    };
  }, []);

  // Notifications (modeled after AdminLayout)
  let lastViewed = new Date(localStorage.getItem("technicianLastViewed") || 0);

  const notifications: Notification[] = tickets?.flatMap((ticket: Ticket) => {
  const notifs: Notification[] = [];

  // Ticket assigned
  if (ticket.status === "Assigned" && new Date(ticket.updatedAt) > lastViewed) {
    notifs.push({
      id: `assigned-${ticket._id}-${new Date(ticket.updatedAt).getTime()}`, // now unique per event
      message: `You have been assigned ticket "${ticket.issueTitle}"`,
      link: `/technician/tickets/${ticket._id}`,
      date: new Date(ticket.updatedAt),
    });
  }

  // New logs
  ticket.logs?.forEach((log: Log) => {
    const logDate = new Date(log.timestamp || (log as any).createdAt);
    notifs.push({
      id: `log-${ticket._id}-${(log as any)._id || logDate.getTime()}`,
      message: `New log added to ticket "${ticket.issueTitle}"`,
      link: `/technician/tickets/${ticket._id}`,
      date: logDate,
    });
  });

  // Status changed
  if (new Date(ticket.updatedAt) > lastViewed && ticket.status !== "open") {
    notifs.push({
      id: `status-${ticket._id}-${ticket.status}-${new Date (ticket.updatedAt).getTime()}`,
      message: `Ticket "${ticket.issueTitle}" status changed to "${ticket.status}"`,
      link: `/technician/tickets/${ticket._id}`,
      date: new Date(ticket.updatedAt),
    });
  }

  return notifs;
}) || [];

  notifications.sort((a, b) => b.date.getTime() - a.date.getTime());

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="technician" notifications={notifications} />
      <div className="flex flex-1">
        <Sidebar role="technician" />
        <main className="flex-1 p-10">
          <Outlet context={{ tickets, loading, error, setTickets }} />
        </main>
      </div>
    </div>
  );
}
