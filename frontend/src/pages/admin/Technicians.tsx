/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/Technicians.tsx

import React, { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";
import { Card } from "../../components/ui/Card";
import { useNavigate } from "react-router-dom";

interface Technician {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  pendingCount?: number;
}

export default function Technicians() {
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  const navigate = useNavigate();

  // Fetch all technicians
  const fetchTechnicians = () => {
    setLoading(true);
    api
      .get("/users/technicians")
      .then((res) => setTechnicians(res.data))
      .catch((err) =>
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Error loading technicians"
        )
      )
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTechnicians();
    // eslint-disable-next-line
  }, []);

  // Search logic
  const filteredTechs = technicians.filter((tech) => {
    const s = search.toLowerCase();
    return (
      tech.name.toLowerCase().includes(s) ||
      tech.email.toLowerCase().includes(s) ||
      (tech.phone && tech.phone.includes(s))
    );
  });

  // Create Technician handler
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setFormError(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (
      !form.name.trim() ||
      !form.email.trim() ||
      !form.password ||
      !form.confirmPassword
    ) {
      setFormError("All fields except phone are required.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setFormError("Passwords do not match.");
      return;
    }
    setFormLoading(true);
    try {
      // Use your backend's admin user-create endpoint:
      await api.post("/users", {
        ...form,
        role: "Technician",
      });
      setShowForm(false);
      setForm({
        name: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });
      fetchTechnicians();
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message || "Failed to create technician"
      );
    }
    setFormLoading(false);
  };

  return (
    <div className="p-10 min-h-screen bg-gray-50">
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h2 className="text-2xl font-bold">Registered Technicians</h2>
        <button
          className="bg-primary text-white px-5 py-2 rounded font-medium shadow hover:bg-primary/90 transition"
          onClick={() => setShowForm((show) => !show)}
        >
          {showForm ? "Cancel" : "Create Technician"}
        </button>
      </div>

      {/* Technician Create Form */}
      {showForm && (
        <form
          onSubmit={handleFormSubmit}
          className="bg-white border rounded-xl shadow-card p-6 mb-8 max-w-lg space-y-3"
        >
          <div className="text-lg font-bold mb-2">Create New Technician</div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Name<span className="text-primary">*</span>
            </label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleFormChange}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Email<span className="text-primary">*</span>
            </label>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleFormChange}
              className="border rounded px-3 py-2 w-full"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Phone
            </label>
            <input
              name="phone"
              type="text"
              value={form.phone}
              onChange={handleFormChange}
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Password<span className="text-primary">*</span>
            </label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleFormChange}
              className="border rounded px-3 py-2 w-full"
              required
              minLength={6}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password<span className="text-primary">*</span>
            </label>
            <input
              name="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={handleFormChange}
              className="border rounded px-3 py-2 w-full"
              required
              minLength={6}
            />
          </div>
          {formError && (
            <div className="text-red-600 text-sm">{formError}</div>
          )}
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition mt-2"
            disabled={formLoading}
          >
            {formLoading ? "Creating..." : "Create Technician"}
          </button>
        </form>
      )}

      {/* Search Box */}
      <div className="max-w-md mb-8">
        <input
          type="text"
          placeholder="Search by name, email, or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-4 py-2 w-full shadow"
        />
      </div>

      {/* Technician Cards */}
      {loading ? (
        <div>Loading…</div>
      ) : error ? (
        <div className="text-red-500">{error}</div>
      ) : filteredTechs.length === 0 ? (
        <div className="text-gray-500">No technicians found.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredTechs.map((tech) => (
            <Card
              key={tech._id}
              className="p-6 shadow-card cursor-pointer hover:bg-primary/5 transition"
              onClick={() => navigate(`/admin/technicians/${tech._id}`)}
            >
              <div className="mb-3">
                <span className="block text-lg font-bold mb-1">{tech.name}</span>
                <span className="inline-block bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                  Technician
                </span>
              </div>
              <div className="mb-1">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="ml-2 text-sm">{tech.email}</span>
              </div>
              {tech.phone && (
                <div className="mb-1">
                  <span className="text-sm text-gray-600">Phone:</span>
                  <span className="ml-2 text-sm">{tech.phone}</span>
                </div>
              )}
              <div className="mb-1">
                <span className="text-sm text-gray-600">Pending Tickets:</span>
                <span className="ml-2 text-sm font-semibold text-primary">
                  {tech.pendingCount ?? 0}
                </span>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
