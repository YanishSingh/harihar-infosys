/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "../../components/Navbar";
import { Sidebar } from "../../components/Sidebar";
import api from "../../utils/axiosConfig";
import { Ticket, Log, Notification } from "../../types"; // Adjust import if needed

export default function AdminLayout() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Polling for tickets (admin view: all tickets)
  useEffect(() => {
    let polling: number | undefined;
    let firstLoad = true;

    const fetchTickets = async () => {
      if (firstLoad) setLoading(true);
      setError(null);

      try {
        const res = await api.get("/tickets", { params: { page: 1, limit: 50 } });
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

  // ---- Notification Logic (like Company, but for all tickets) ----
  // If you want per-admin notifications, add a "lastViewedByAdmin" or similar field per ticket.
  // For now, use ticket.updatedAt and logs to detect changes.
  // Optionally, persist a "last seen" timestamp in localStorage per admin for deduping.
  let lastViewed = new Date(localStorage.getItem("adminLastViewed") || 0);

  const notifications: Notification[] =
    tickets?.flatMap((ticket: Ticket) => {
      const notifs: Notification[] = [];

      // New logs on any ticket
      ticket.logs?.forEach((log: Log) => {
        const logDate = new Date(log.timestamp || (log as any).createdAt);
        if (logDate > lastViewed) {
          notifs.push({
            id: `log-${ticket._id}-${(log as any)._id || ""}`,
            message: `New log added to ticket "${ticket.issueTitle}"`,
            link: `/admin/tickets/${ticket._id}`,
            date: logDate,
          });
        }
      });

      // Status changed (not open)
      if (new Date(ticket.updatedAt) > lastViewed && ticket.status !== "open") {
        notifs.push({
          id: `status-${ticket._id}`,
          message: `Ticket "${ticket.issueTitle}" status changed to "${ticket.status}"`,
          link: `/admin/tickets/${ticket._id}`,
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
          link: `/admin/tickets/${ticket._id}`,
          date: new Date(ticket.updatedAt),
        });
      }

      return notifs;
    }) || [];

  notifications.sort((a, b) => b.date.getTime() - a.date.getTime());

  // --- Mark all as seen when dropdown is opened (optional, implement in Navbar) ---
  // Save lastViewed timestamp in localStorage if desired (see below)

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Navbar role="admin" notifications={notifications} />
      <div className="flex flex-1">
        <Sidebar role="admin" name="Admin" />
        <main className="flex-1 p-10">
          <Outlet context={{ tickets, loading, error, setTickets }} />
        </main>
      </div>
    </div>
  );
}
