// src/pages/Companies.tsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../utils/axiosConfig";
import { Card } from "../../components/ui/Card";

interface Company {
  _id: string;
  companyName: string;
  createdAt: string;
  vatOrPan: string;
  phone: string;
  email: string;
  ticketsCount: number;
  isApproved?: boolean;
}

export default function Companies() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    api
      .get("/users/companies?includeTicketCount=true") // Use your correct API endpoint
      .then((res) => {
        setCompanies(res.data.data || res.data || []);
        setError(null);
      })
      .catch((err) => {
        setError(
          err?.response?.data?.message ||
          err?.message ||
          "Failed to fetch companies"
        );
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <h2 className="text-2xl font-bold mb-6">Registered Companies</h2>
      {loading ? (
        <div className="text-gray-500">Loading...</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : companies.length === 0 ? (
        <div className="text-gray-500">No companies found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <Card
              key={company._id}
              className="p-6 cursor-pointer transition hover:bg-gray-100"
              onClick={() => navigate(`/admin/companies/${company._id}`)}
            >
              <div className="mb-2 flex items-center gap-2">
                <span className="text-lg font-bold">{company.companyName}</span>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-semibold ${
                    company.isApproved
                      ? "bg-green-100 text-green-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {company.isApproved ? "Approved" : "Not Approved"}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-1">
                Registered:{" "}
                <span className="font-medium">
                  {new Date(company.createdAt).toLocaleDateString("en-GB", {
                    year: "numeric",
                    month: "short",
                    day: "2-digit",
                  })}
                </span>
              </div>
              <div className="text-sm mb-1">
                Tickets Created:{" "}
                <span className="font-semibold text-primary">{company.ticketsCount ?? 0}</span>
              </div>
              <div className="text-sm mb-1">
                PAN Number: <span className="font-medium">{company.vatOrPan || "-"}</span>
              </div>
              <div className="text-sm mb-1">
                Phone: <span className="font-medium">{company.phone}</span>
              </div>
              <div className="text-sm">
                Email: <span className="font-medium">{company.email}</span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
