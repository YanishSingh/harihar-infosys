// src/api/tickets.ts
import api from '../utils/axiosConfig';

export interface Ticket {
  _id: string;
  ticketId: string;
  issueTitle: string;
  issueDescription: string;
  issueType: string;
  status: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  assignedTo?: any;
  createdAt: string;
  updatedAt: string;
  logs: {
    updatedBy: string;
    updateNote: string;
    timestamp: string;
  }[];
}

export interface GetTicketsResponse {
  total: number;
  page: number;
  pages: number;
  data: Ticket[];
}

// Get all tickets for logged in company user
export async function getCompanyTickets(params: { page?: number; limit?: number; status?: string } = {}) {
  const res = await api.get<GetTicketsResponse>('/tickets/company', { params });
  return res.data;
}
