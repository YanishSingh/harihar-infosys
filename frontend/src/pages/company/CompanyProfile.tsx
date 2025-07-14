/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import api from "../../utils/axiosConfig";
import { Card } from "../../components/ui/Card";
import { toast } from "react-toastify";

interface Branch {
  province: string;
  city: string;
  municipality: string;
  place: string;
  phone: string;
  isHeadOffice: boolean;
}

interface Profile {
  _id: string;
  role: string;
  name: string;
  email: string;
  phone: string;
  companyName?: string;
  companyEmail?: string;
  vatOrPan?: string;
  branches?: Branch[];
  isApproved?: boolean;
}

export default function CompanyProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdForm, setPwdForm] = useState({
    email: "",
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [pwdLoading, setPwdLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    api
      .get("/users/profile")
      .then((res: any) => setProfile(res.data || res))
      .catch(() => setProfile(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (profile?.email) setPwdForm(f => ({ ...f, email: profile.email }));
  }, [profile]);

  const handlePwdInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPwdForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  // Validation helper
  function validatePwdForm() {
    if (
      !pwdForm.email ||
      !pwdForm.currentPassword ||
      !pwdForm.newPassword ||
      !pwdForm.confirmNewPassword
    ) {
      toast.error("Please fill in all fields.");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(pwdForm.email)) {
      toast.error("Enter a valid email address.");
      return false;
    }
    if (pwdForm.newPassword.length < 6) {
      toast.error("New password must be at least 6 characters.");
      return false;
    }
    if (pwdForm.newPassword !== pwdForm.confirmNewPassword) {
      toast.error("New passwords do not match.");
      return false;
    }
    if (pwdForm.newPassword === pwdForm.currentPassword) {
      toast.error("New password cannot be same as current password.");
      return false;
    }
    return true;
  }

  async function handlePwdChange(e: React.FormEvent) {
    e.preventDefault();
    if (!validatePwdForm()) return;

    setPwdLoading(true);
    try {
      await api.post("/users/change-password", pwdForm);
      toast.success("Password updated successfully!");
      setShowChangePwd(false);
      setPwdForm(f => ({
        ...f,
        currentPassword: "",
        newPassword: "",
        confirmNewPassword: "",
      }));
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to change password. Please try again.";
      toast.error(msg);
    } finally {
      setPwdLoading(false);
    }
  }

  if (loading) {
    return <div className="text-center p-10 text-gray-400">Loading profile…</div>;
  }
  if (!profile) {
    return <div className="text-center p-10 text-red-600">Profile not found.</div>;
  }

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      {/* Head Section */}
      <Card className="flex flex-col items-center mb-8">
        <h1 className="text-4xl font-extrabold text-center mb-2">
          {profile.companyName}
        </h1>
        <div className="text-lg font-medium text-center mb-1">
          {profile.companyEmail || profile.email}
        </div>
        <div className="text-center text-gray-700 mb-1">
          Phone: {profile.phone}
        </div>
        <div className="text-center text-gray-700">
          PAN Number: {profile.vatOrPan}
        </div>
      </Card>

      {/* Change Password Section */}
      <Card className="mb-6">
        {!showChangePwd ? (
          <button
            onClick={() => setShowChangePwd(true)}
            className="bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700"
          >
            Change Password
          </button>
        ) : (
          <form
            className="space-y-4"
            onSubmit={handlePwdChange}
            autoComplete="off"
          >
            <div className="font-semibold text-lg mb-1">Change Password</div>
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={pwdForm.email}
              readOnly
              className="w-full border rounded p-3 bg-gray-100"
            />
            <input
              type="password"
              name="currentPassword"
              placeholder="Current Password"
              value={pwdForm.currentPassword}
              onChange={handlePwdInput}
              required
              className="w-full border rounded p-3"
              minLength={6}
            />
            <input
              type="password"
              name="newPassword"
              placeholder="New Password"
              value={pwdForm.newPassword}
              onChange={handlePwdInput}
              required
              className="w-full border rounded p-3"
              minLength={6}
            />
            <input
              type="password"
              name="confirmNewPassword"
              placeholder="Confirm New Password"
              value={pwdForm.confirmNewPassword}
              onChange={handlePwdInput}
              required
              className="w-full border rounded p-3"
              minLength={6}
            />
            <div className="flex gap-3">
              <button
                type="submit"
                className={`bg-red-600 text-white px-6 py-2 rounded font-bold hover:bg-red-700 ${
                  pwdLoading ? "opacity-60 cursor-not-allowed" : ""
                }`}
                disabled={pwdLoading}
              >
                {pwdLoading ? "Updating..." : "Update Password"}
              </button>
              <button
                type="button"
                onClick={() => setShowChangePwd(false)}
                className="border border-red-600 text-red-600 px-6 py-2 rounded font-bold hover:bg-red-100"
                disabled={pwdLoading}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </Card>

      {/* Account Owner Info */}
      <Card className="mb-6">
        <div className="font-bold text-lg mb-2">Account Owner Info</div>
        <div className="flex gap-6 flex-wrap">
          <div className="flex-1 min-w-[160px]">
            <div className="text-xs text-gray-500">User Name</div>
            <div className="font-semibold">{profile.name}</div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <div className="text-xs text-gray-500">User Email</div>
            <div className="font-semibold">{profile.email}</div>
          </div>
          <div className="flex-1 min-w-[160px]">
            <div className="text-xs text-gray-500">User Phone Number</div>
            <div className="font-semibold">{profile.phone}</div>
          </div>
        </div>
      </Card>

      {/* Branch Details */}
      <Card>
        <div className="font-bold text-lg mb-4">Branch Details</div>
        {profile.branches?.length ? (
          profile.branches.map((b, i) => (
            <div key={i} className="mb-5 border-b pb-4 last:border-b-0 last:pb-0">
              <div className="flex items-center gap-3 mb-2">
                <span className="font-bold">#{i + 1}</span>
                {b.isHeadOffice && (
                  <span className="bg-red-100 text-red-600 text-xs px-3 py-1 rounded-full font-semibold">
                    Head Office
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-700">
                <div>Province: {b.province}</div>
                <div>City: {b.city}</div>
                <div>Municipality: {b.municipality}</div>
                <div>Place: {b.place}</div>
                <div>Phone: {b.phone}</div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-400">No branches found.</div>
        )}
      </Card>
    </div>
  );
}
