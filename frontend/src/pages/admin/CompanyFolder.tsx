// src/pages/CompanyFolder.tsx
import React, { PropsWithChildren } from "react";
import { ChevronRight, Folder, FolderOpen } from "lucide-react";

type Company = {
  _id: string;
  companyName: string;
  ticketsCount: number;
  openTickets: number;
  createdAt: string;
  vatOrPan: string;
  phone: string;
  email: string;
};

type Props = {
  company: Company;
  isOpen: boolean;
  onOpen: () => void;
  children?: React.ReactNode;
};

export default function CompanyFolder({
  company,
  isOpen,
  onOpen,
  children,
}: PropsWithChildren<Props>) {
  return (
    <div className="bg-white rounded-xl shadow-card border border-gray-100 transition-all">
      <button
        className="flex w-full items-center px-4 py-4 gap-4 hover:bg-gray-50 rounded-t-xl group transition"
        onDoubleClick={onOpen}
        onClick={onOpen} // Optional: open on single click for touch-friendliness
        title="Double-click to open tickets"
      >
        <div className="relative mr-2">
          {isOpen ? (
            <FolderOpen className="text-primary" size={36} />
          ) : (
            <Folder className="text-primary" size={36} />
          )}
          {company.openTickets > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
              {company.openTickets}
            </span>
          )}
        </div>
        <div className="flex-1 text-left">
          <div className="text-lg font-bold">{company.companyName}</div>
          <div className="text-sm text-gray-500">
            Registered: {new Date(company.createdAt).toLocaleDateString("en-GB")}
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Tickets: <b>{company.ticketsCount}</b> | PAN: <b>{company.vatOrPan}</b>
          </div>
          <div className="text-xs text-gray-400">Phone: {company.phone} | Email: {company.email}</div>
        </div>
        <span className="ml-2 text-primary font-bold text-2xl group-hover:translate-x-1 transition-transform">
          <ChevronRight />
        </span>
      </button>
      {/* Folder body (tickets table) */}
      <div className={`transition-all ${isOpen ? "max-h-[1000px] p-4" : "max-h-0 overflow-hidden p-0"}`}>
        {isOpen && children}
      </div>
    </div>
  );
}
