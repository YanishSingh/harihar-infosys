/* eslint-disable @typescript-eslint/no-explicit-any */
import { ReactNode } from "react";

// src/types.ts
export type Log = {
  timestamp: string;
  _id: string;
  createdAt: string;
  message: string;
};

export type Ticket = {
  ticketId: ReactNode;
  _id: string;
  issueTitle: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  company?: {
    companyName?: string;
    name?: string;
    [key: string]: any; // allow for flexibility, optional
  };
  lastViewedByCompany?: string;
  assignedTechnician?: { name: string };
  logs?: Log[];
};

export type Notification = {
  id: string;
  message: string;
  link: string;
  date: Date;
};

