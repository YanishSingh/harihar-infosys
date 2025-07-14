/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import api from "../../utils/axiosConfig";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { Card } from "../../components/ui/Card";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { Ticket } from "../../types"; // Adjust path as needed

type TicketStatus = "Assigned" | "In Progress" | "Completed";

const STATUS_COLUMNS: { key: TicketStatus; label: string }[] = [
  { key: "Assigned", label: "Assigned" },
  { key: "In Progress", label: "In Progress" },
  { key: "Completed", label: "Completed" },
];

// Only allow sequential transitions (Assigned <-> In Progress <-> Completed)
function canTransition(from: TicketStatus, to: TicketStatus) {
  if (from === to) return false;
  if (
    (from === "Assigned" && to === "Completed") ||
    (from === "Completed" && to === "Assigned")
  ) {
    return false;
  }
  return true;
}

export default function TechnicianTicketsBoard() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const navigate = useNavigate();

  // Polling for updates
  useEffect(() => {
    let polling: number;
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const res = await api.get("/technician/tickets", {
          params: { page: 1, limit: 50 },
        });
        setTickets(Array.isArray(res.data?.data) ? res.data.data : []);
        setError(null);
      } catch (err: any) {
        setError("Failed to fetch tickets.");
        setTickets([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
    polling = setInterval(fetchTickets, 5000);
    return () => clearInterval(polling);
  }, []);

  // Split tickets into columns by status
  const ticketsByStatus: Record<TicketStatus, Ticket[]> = {
    Assigned: [],
    "In Progress": [],
    Completed: [],
  };
  tickets.forEach((t) => {
    if (ticketsByStatus[t.status as TicketStatus]) {
      ticketsByStatus[t.status as TicketStatus].push(t);
    }
  });

  // Drag-and-drop handler
  const onDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;
    if (source.droppableId === destination.droppableId) return;

    const ticketId = draggableId;
    const from = source.droppableId as TicketStatus;
    const to = destination.droppableId as TicketStatus;

    if (!canTransition(from, to)) return;

    try {
      setUpdating(ticketId);
      await api.put(`/tickets/${ticketId}/status`, {
        status: to,
        updateNote: `Status changed to "${to}" by technician.`,
      });
      // Optimistic UI update
      setTickets((prev) =>
        prev.map((t) =>
          t._id === ticketId ? { ...t, status: to } : t
        )
      );
    } catch (err: any) {
      alert("Failed to update ticket status.");
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <Loader2 className="animate-spin mb-4" size={36} />
        <span className="text-gray-500">Loading tickets board...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <span className="text-red-500 text-lg">{error}</span>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-8">Tickets Board</h1>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STATUS_COLUMNS.map((col) => (
            <Droppable key={col.key} droppableId={col.key}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="min-h-[350px] bg-white rounded-2xl p-4 border border-gray-200 shadow-card"
                >
                  <div className="font-semibold text-lg mb-4">{col.label}</div>
                  {ticketsByStatus[col.key]?.length === 0 && (
                    <div className="text-gray-400 text-sm">No tickets</div>
                  )}
                  {ticketsByStatus[col.key]?.map((ticket, idx) => (
                    <Draggable
                      key={ticket._id}
                      draggableId={ticket._id}
                      index={idx}
                      isDragDisabled={updating === ticket._id}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`mb-4 cursor-pointer transition border-2 border-transparent hover:border-primary/60 ${
                            snapshot.isDragging ? "opacity-80" : ""
                          }`}
                          style={{
                            ...provided.draggableProps.style,
                          }}
                          onClick={() =>
                            navigate(`/technician/tickets/${ticket._id}`)
                          }
                        >
                          <Card className="p-4">
                            <div className="flex flex-col gap-2">
                              <div className="font-bold text-black text-base">
                                {ticket.issueTitle}
                              </div>
                              <div className="text-sm text-gray-500">
                                {ticket.company?.companyName ||
                                  ticket.company?.name ||
                                  ""}
                              </div>
                              <div className="text-xs text-gray-400">
                                {ticket.createdAt
                                  ? new Date(ticket.createdAt).toLocaleString()
                                  : ""}
                              </div>
                              <div className="flex justify-end items-center mt-2">
                                {updating === ticket._id && (
                                  <Loader2 className="animate-spin" size={18} />
                                )}
                              </div>
                            </div>
                          </Card>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}
