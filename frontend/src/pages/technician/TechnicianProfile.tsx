/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import api from "../../utils/axiosConfig";
import { Card } from "../../components/ui/Card";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export default function TechnicianProfile() {
  const { user, logout } = useContext(AuthContext);
  const [editingPhone, setEditingPhone] = useState(false);
  const [phone, setPhone] = useState(user?.phone || "");
  const [phoneLoading, setPhoneLoading] = useState(false);

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPwd, setCurrentPwd] = useState("");
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  const navigate = useNavigate();

  // Handle phone number update
  async function handlePhoneUpdate(e: React.FormEvent) {
    e.preventDefault();
    setPhoneLoading(true);
    try {
      await api.post("/users/change-phone", { phone });
      toast.success("Phone updated!");
      setEditingPhone(false);

      // Update phone in AuthContext if possible, else update UI state only
      if (user) user.phone = phone;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update phone");
    }
    setPhoneLoading(false);
  }

  // Handle password change
  async function handlePasswordChange(e: React.FormEvent) {
    e.preventDefault();

    if (!user) {
      toast.error("User is not loaded. Please reload the page.");
      return;
    }
    if (!currentPwd || !newPwd || !confirmPwd) {
      toast.error("All fields are required.");
      return;
    }
    if (currentPwd.length < 6) {
      toast.error("Current password must be at least 6 characters.");
      return;
    }
    if (newPwd.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return;
    }
    if (newPwd !== confirmPwd) {
      toast.error("Passwords do not match.");
      return;
    }
    if (currentPwd === newPwd) {
      toast.error("New password must be different from the current password.");
      return;
    }

    setPwdLoading(true);
    try {
      await api.post("/users/change-password", {
        email: user.email,
        currentPassword: currentPwd,
        newPassword: newPwd,
        confirmNewPassword: confirmPwd,
      });
      toast.success("Password changed successfully!");
      setCurrentPwd("");
      setNewPwd("");
      setConfirmPwd("");
      setShowPasswordForm(false);
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to change password. Please check your current password."
      );
    }
    setPwdLoading(false);
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  function formatDate(dateStr: string | undefined) {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Technician Profile</h2>
      <Card className="p-6 mb-8 shadow-card">
        <div className="flex items-center gap-4 mb-6">
          <div className="rounded-full bg-primary/10 flex items-center justify-center h-16 w-16 text-2xl font-bold text-primary">
            {user?.name?.charAt(0) ?? "T"}
          </div>
          <div>
            <div className="text-xl font-semibold mb-1">{user?.name}</div>
            <div className="text-sm text-gray-600">
              Role: <span className="font-medium">Technician</span>
            </div>
            <div className="text-sm text-gray-600">
              Joined:{" "}
              <span className="font-medium">
                {formatDate(user?.createdAt)}
              </span>
            </div>
          </div>
        </div>
        <div className="mb-2">
          <span className="text-gray-600 text-sm">Email:</span>{" "}
          <span className="font-medium">{user?.email}</span>
        </div>
        <div className="mb-4">
          <span className="text-gray-600 text-sm">Phone:</span>{" "}
          {editingPhone ? (
            <form className="inline" onSubmit={handlePhoneUpdate}>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border rounded px-2 py-1 w-36 mr-2"
                autoFocus
              />
              <button
                type="submit"
                className="bg-primary text-white px-3 py-1 rounded text-xs mr-2"
                disabled={phoneLoading}
              >
                Save
              </button>
              <button
                type="button"
                className="text-xs text-gray-500"
                onClick={() => {
                  setEditingPhone(false);
                  setPhone(user?.phone || "");
                }}
              >
                Cancel
              </button>
            </form>
          ) : (
            <>
              <span className="font-medium">{phone || "-"}</span>
              <button
                className="ml-4 text-xs text-primary hover:underline"
                onClick={() => setEditingPhone(true)}
              >
                Edit
              </button>
            </>
          )}
        </div>
        <div className="mb-4 flex gap-3">
          <button
            className="px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition"
            onClick={() => setShowPasswordForm((f) => !f)}
          >
            {showPasswordForm ? "Cancel Password Change" : "Change Password"}
          </button>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-black rounded font-semibold hover:bg-gray-300 transition"
          >
            <LogOut size={16} /> Log Out
          </button>
        </div>

        {/* Password change form */}
        {showPasswordForm && (
          <form
            className="bg-gray-50 border p-4 rounded-lg mt-3 space-y-2"
            onSubmit={handlePasswordChange}
          >
            <div>
              <label className="block text-sm mb-1">Current Password:</label>
              <input
                type="password"
                value={currentPwd}
                onChange={(e) => setCurrentPwd(e.target.value)}
                className="border rounded px-2 py-1 w-full"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">New Password:</label>
              <input
                type="password"
                value={newPwd}
                onChange={(e) => setNewPwd(e.target.value)}
                className="border rounded px-2 py-1 w-full"
                minLength={6}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Confirm New Password:</label>
              <input
                type="password"
                value={confirmPwd}
                onChange={(e) => setConfirmPwd(e.target.value)}
                className="border rounded px-2 py-1 w-full"
                minLength={6}
                required
              />
            </div>
            <button
              type="submit"
              className="mt-2 px-5 py-1.5 bg-primary text-white rounded font-medium hover:bg-primary/90 transition"
              disabled={pwdLoading}
            >
              {pwdLoading ? "Updating..." : "Update Password"}
            </button>
          </form>
        )}
      </Card>
    </div>
  );
}
