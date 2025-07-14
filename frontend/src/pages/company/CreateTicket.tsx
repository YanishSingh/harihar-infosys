/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

type Branch = {
  _id: string;
  province: string;
  city: string;
  municipality: string;
  place: string;
  phone: string;
  isHeadOffice: boolean;
};

export default function CreateTicket() {
  const { user } = useContext(AuthContext);
  const branches: Branch[] = user?.branches || [];
  const navigate = useNavigate();

  const [form, setForm] = useState({
    issueTitle: "",
    issueDescription: "",
    issueType: "Remote",
    branchId: "",
    anyDeskId: "",
    requestorName: "", // NEW FIELD
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!form.issueTitle.trim()) newErrors.issueTitle = "Title is required.";
    if (!form.issueDescription.trim()) newErrors.issueDescription = "Description is required.";
    if (!form.requestorName.trim()) newErrors.requestorName = "Name of person facing the issue is required."; // NEW
    if (form.issueType === "Physical" && !form.branchId) newErrors.branchId = "Select a branch.";
    if (form.issueType === "Remote" && !form.anyDeskId.trim()) newErrors.anyDeskId = "AnyDesk ID required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await api.post("/tickets", {
        issueTitle: form.issueTitle,
        issueDescription: form.issueDescription,
        issueType: form.issueType,
        branchId: form.issueType === "Physical" ? form.branchId : undefined,
        anyDeskId: form.issueType === "Remote" ? form.anyDeskId : undefined,
        requestorName: form.requestorName, // NEW
      });
      toast.success("Ticket created!");
      navigate("/company/my-tickets");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
        "Failed to create ticket. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 min-h-screen bg-gray-50 p-10">
      {/* Page Title */}
      <h2 className="text-2xl font-bold mb-6">Create New Tickets</h2>
      {/* Form */}
      <form
        className="max-w-2xl w-full flex flex-col gap-6 pl-2"
        onSubmit={handleSubmit}
        noValidate
      >
        {/* Issue Title */}
        <div>
          <label className="block font-medium mb-1" htmlFor="issueTitle">
            Issue Title <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            id="issueTitle"
            className={`w-full p-3 border rounded focus:outline-none ${
              errors.issueTitle ? "border-primary" : "border-gray-light"
            }`}
            value={form.issueTitle}
            onChange={e => setForm(f => ({ ...f, issueTitle: e.target.value }))}
            maxLength={120}
            required
          />
          {errors.issueTitle && (
            <div className="text-xs text-primary mt-1">{errors.issueTitle}</div>
          )}
        </div>

        {/* Person Facing the Issue */}
        <div>
          <label className="block font-medium mb-1" htmlFor="requestorName">
            Person facing the issue <span className="text-primary">*</span>
          </label>
          <input
            type="text"
            id="requestorName"
            className={`w-full p-3 border rounded focus:outline-none ${
              errors.requestorName ? "border-primary" : "border-gray-light"
            }`}
            value={form.requestorName}
            onChange={e => setForm(f => ({ ...f, requestorName: e.target.value }))}
            maxLength={100}
            required
          />
          {errors.requestorName && (
            <div className="text-xs text-primary mt-1">{errors.requestorName}</div>
          )}
        </div>

        {/* Issue Description */}
        <div>
          <label className="block font-medium mb-1" htmlFor="issueDescription">
            Description <span className="text-primary">*</span>
          </label>
          <textarea
            id="issueDescription"
            rows={4}
            className={`w-full p-3 border rounded focus:outline-none resize-y ${
              errors.issueDescription ? "border-primary" : "border-gray-light"
            }`}
            value={form.issueDescription}
            onChange={e => setForm(f => ({ ...f, issueDescription: e.target.value }))}
            required
            maxLength={500}
          />
          {errors.issueDescription && (
            <div className="text-xs text-primary mt-1">{errors.issueDescription}</div>
          )}
        </div>

        {/* Issue Type (Remote/Physical) */}
        <div>
          <label className="block font-medium mb-2">
            Issue Type <span className="text-primary">*</span>
          </label>
          <div className="flex gap-8">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="issueType"
                value="Remote"
                checked={form.issueType === "Remote"}
                onChange={() => setForm(f => ({ ...f, issueType: "Remote", branchId: "", anyDeskId: "" }))}
              />
              Remote
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="issueType"
                value="Physical"
                checked={form.issueType === "Physical"}
                onChange={() => setForm(f => ({ ...f, issueType: "Physical", branchId: "", anyDeskId: "" }))}
              />
              Physical
            </label>
          </div>
        </div>

        {/* Conditional: Branch selection */}
        {form.issueType === "Physical" && (
          <div>
            <label className="block font-medium mb-1" htmlFor="branchId">
              Branch <span className="text-primary">*</span>
            </label>
            <select
              id="branchId"
              className={`w-full p-3 border rounded focus:outline-none ${
                errors.branchId ? "border-primary" : "border-gray-light"
              }`}
              value={form.branchId}
              onChange={e => setForm(f => ({ ...f, branchId: e.target.value }))}
              required
            >
              <option value="">Select Branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.isHeadOffice ? "[Head Office] " : ""}
                  {`${b.province}, ${b.city}, ${b.municipality}, ${b.place} (${b.phone})`}
                </option>
              ))}
            </select>
            {errors.branchId && (
              <div className="text-xs text-primary mt-1">{errors.branchId}</div>
            )}
          </div>
        )}

        {/* Conditional: AnyDesk ID */}
        {form.issueType === "Remote" && (
          <div>
            <label className="block font-medium mb-1" htmlFor="anyDeskId">
              AnyDesk ID <span className="text-primary">*</span>
            </label>
            <input
              type="text"
              id="anyDeskId"
              className={`w-full p-3 border rounded focus:outline-none ${
                errors.anyDeskId ? "border-primary" : "border-gray-light"
              }`}
              value={form.anyDeskId}
              onChange={e => setForm(f => ({ ...f, anyDeskId: e.target.value }))}
              required
            />
            {errors.anyDeskId && (
              <div className="text-xs text-primary mt-1">{errors.anyDeskId}</div>
            )}
          </div>
        )}

        {/* Buttons */}
        <div className="flex gap-4 pt-2">
          <button
            type="submit"
            className="bg-primary text-white px-6 py-2 rounded font-medium hover:bg-primary/90 transition disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Creating..." : "Create Ticket"}
          </button>
          <button
            type="button"
            className="border border-primary text-primary px-6 py-2 rounded font-medium hover:bg-primary/10 transition"
            onClick={() => navigate("/company")}
            disabled={loading}
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
