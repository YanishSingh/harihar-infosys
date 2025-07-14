import React, { useState, useRef, useEffect, useContext } from "react";
import Logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { LogOut, Bell } from "lucide-react";
import { Notification } from "../types";

type Role = "company" | "admin" | "technician";
type NavbarProps = {
  role: Role;
  notifications?: Notification[];
};

export function Navbar({ role, notifications = [] }: NavbarProps) {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Unique storage key per role
  const storageKey =
    role === "admin"
      ? "notifications_last_viewed_admin"
      : role === "technician"
      ? "notifications_last_viewed_technician"
      : "notifications_last_viewed_company";

  // Only count unread notifications newer than last viewed
  const lastViewed = parseInt(localStorage.getItem(storageKey) || "0", 10);
  const unreadNotifications = notifications.filter((n) =>
    n.date instanceof Date
      ? n.date.getTime() > lastViewed
      : new Date(n.date).getTime() > lastViewed
  );

  const [hasUnread, setHasUnread] = useState(unreadNotifications.length > 0);

  useEffect(() => {
    setHasUnread(unreadNotifications.length > 0);
    // eslint-disable-next-line
  }, [notifications]);

  // Mark all as read on bell click
  const handleBellClick = () => {
    setDropdownOpen((open) => {
      const willOpen = !open;
      if (willOpen) {
        localStorage.setItem(storageKey, Date.now().toString());
        setHasUnread(false);
      }
      return willOpen;
    });
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (
        !bellRef.current?.contains(e.target as Node) &&
        !dropdownRef.current?.contains(e.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [dropdownOpen]);

  // Logout handler
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Logo click navigation
  const goToDashboard = () => {
    if (role === "admin") navigate("/admin");
    else if (role === "technician") navigate("/technician/dashboard");
    else navigate("/company");
  };

  return (
    <nav className="w-full bg-white shadow-sm px-8 py-3 flex items-center justify-between z-50 relative">
      {/* Logo */}
      <div
        className="flex items-center gap-3 cursor-pointer"
        onClick={goToDashboard}
        title="Go to Dashboard"
      >
        <img src={Logo} alt="Harihar Infosys" className="h-8 w-8" />
        <span className="text-xl font-bold text-black">HARIHAR</span>
        <span className="text-xl font-bold text-primary">INFOSYS</span>
      </div>
      <div className="flex items-center gap-4">
        {/* Notification Bell */}
        <button
          className="relative p-2 rounded-full hover:bg-gray-100 transition"
          aria-label="Notifications"
          ref={bellRef}
          onClick={handleBellClick}
        >
          <Bell size={22} />
          {hasUnread && unreadNotifications.length > 0 && (
            <span className="absolute top-1 right-1 bg-red-500 text-white text-xs rounded-full px-1">
              {unreadNotifications.length}
            </span>
          )}
        </button>
        {/* Dropdown */}
        {dropdownOpen && (
          <div
            ref={dropdownRef}
            className="absolute right-16 top-16 w-80 bg-white rounded shadow-lg border z-50 max-h-96 overflow-auto"
          >
            <div className="p-4 font-semibold border-b">Notifications</div>
            {notifications.length === 0 ? (
              <div className="p-4 text-gray-500">No new notifications.</div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  className="px-4 py-3 hover:bg-gray-50 cursor-pointer border-b last:border-0"
                  onClick={() => {
                    navigate(notif.link);
                    setDropdownOpen(false);
                  }}
                >
                  <div className="text-sm font-medium">{notif.message}</div>
                  <div className="text-xs text-gray-400 mt-1">
                    {notif.date instanceof Date
                      ? notif.date.toLocaleString()
                      : new Date(notif.date).toLocaleString()}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {/* Logout */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded font-semibold hover:bg-primary/90 transition"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </nav>
  );
}
