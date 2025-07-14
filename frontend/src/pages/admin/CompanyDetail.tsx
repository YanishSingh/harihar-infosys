/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/CompanyDetail.tsx

import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { Card } from "../../components/ui/Card";

interface Company {
  _id: string;
  companyName: string;
  email: string;
  phone?: string;
  vatOrPan?: string;
  createdAt?: string;
  ticketCount?: number;
  isApproved?: boolean;
  isActive?: boolean;
  // Add other fields as needed
}

export default function CompanyDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [company, setCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch company detail
  useEffect(() => {
    setLoading(true);
    api
      .get(`/users/companies/${id}`)
      .then((res) => setCompany(res.data))
      .catch((err) =>
        setError(
          err?.response?.data?.message || err?.message || "Error loading company"
        )
      )
      .finally(() => setLoading(false));
  }, [id]);

  // Approve company
  const handleApprove = async () => {
    if (!company) return;
    setActionLoading(true);
    try {
      await api.patch(`/users/companies/${company._id}/approve`);
      setCompany({ ...company, isApproved: true });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error approving company");
    }
    setActionLoading(false);
  };

  // Disable company
  const handleDisable = async () => {
    if (!company) return;
    setActionLoading(true);
    try {
      await api.patch(`/users/companies/${company._id}/disable`);
      setCompany({ ...company, isActive: false });
    } catch (err: any) {
      setError(err?.response?.data?.message || "Error disabling company");
    }
    setActionLoading(false);
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <button
        className="mb-6 text-primary underline"
        onClick={() => navigate(-1)}
      >
        &larr; Back to Companies
      </button>
      <h2 className="text-2xl font-bold mb-6">Company Details</h2>
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : company ? (
        <Card className="p-8 max-w-xl">
          <div className="mb-3 text-xl font-bold">{company.companyName}</div>
          <div className="mb-1 text-gray-700">
            <b>Email:</b> {company.email}
          </div>
          <div className="mb-1 text-gray-700">
            <b>Phone:</b> {company.phone ?? "-"}
          </div>
          <div className="mb-1 text-gray-700">
            <b>PAN/VAT Number:</b> {company.vatOrPan ?? "-"}
          </div>
          <div className="mb-1 text-gray-700">
            <b>Date Registered:</b>{" "}
            {company.createdAt
              ? new Date(company.createdAt).toLocaleString()
              : "-"}
          </div>
          <div className="mb-1 text-gray-700">
            <b>No. of Tickets:</b> {company.ticketCount ?? 0}
          </div>
          <div className="mb-3 mt-3">
            <span
              className={`px-2 py-0.5 rounded text-xs font-semibold ${
                company.isApproved
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {company.isApproved ? "Approved" : "Not Approved"}
            </span>
            {company.isActive === false && (
              <span className="ml-3 px-2 py-0.5 rounded text-xs bg-red-100 text-red-700 font-semibold">
                Disabled
              </span>
            )}
          </div>
          <div className="flex gap-4 mt-6">
            {!company.isApproved && (
              <button
                onClick={handleApprove}
                disabled={actionLoading}
                className="bg-primary text-white px-5 py-2 rounded font-semibold hover:bg-primary/90 transition"
              >
                {actionLoading ? "Approving…" : "Approve Registration"}
              </button>
            )}
            {company.isApproved && company.isActive !== false && (
              <button
                onClick={handleDisable}
                disabled={actionLoading}
                className="bg-red-500 text-white px-5 py-2 rounded font-semibold hover:bg-red-600 transition"
              >
                {actionLoading ? "Disabling…" : "Disable Company"}
              </button>
            )}
          </div>
        </Card>
      ) : (
        <div className="text-gray-500">Company not found.</div>
      )}
    </div>
  );
}
