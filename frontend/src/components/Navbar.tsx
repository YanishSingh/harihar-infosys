/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/rules-of-hooks */
import React, { useContext, useRef, useState, useEffect } from "react";
import Logo from "../assets/logo.svg";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import { LogOut, Bell } from "lucide-react";
import { Notification } from "../types";

type Role = "company" | "admin" | "technician";
type NavbarProps =
  | { public?: true }
  | { role: Role; notifications?: Notification[]; public?: false };

export function Navbar(props: NavbarProps) {
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  // PUBLIC LANDING PAGE NAVBAR (no auth required)
  if (props.public) {
    return (
      <nav className="w-full bg-white shadow-sm px-8 py-3 flex items-center justify-between z-50">
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => navigate("/")}
          title="Harihar Infosys Home"
        >
          <img src={Logo} alt="Harihar Infosys" className="h-8 w-8" />
          <span className="text-xl font-bold text-black">HARIHAR</span>
          <span className="text-xl font-bold" style={{ color: "#D6212A" }}>
            INFOSYS
          </span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="px-6 py-2 rounded bg-[#D6212A] text-white font-semibold hover:bg-[#c81620] transition shadow"
            onClick={() => navigate("/register")}
          >
            Register as a New Company
          </button>
          <button
            className="px-6 py-2 rounded border border-[#D6212A] text-[#D6212A] font-semibold hover:bg-[#fff3f3] transition"
            onClick={() => navigate("/login")}
          >
            Log in
          </button>
        </div>
      </nav>
    );
  }

  // ROLE-BASED NAVBAR (dashboard, notifications, logout, etc.)
  // Only show when user is logged in
  const { role, notifications = [] } = props as any;
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const bellRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const storageKey =
    role === "admin"
      ? "notifications_last_viewed_admin"
      : role === "technician"
      ? "notifications_last_viewed_technician"
      : "notifications_last_viewed_company";

  const lastViewed = parseInt(localStorage.getItem(storageKey) || "0", 10);
  const unreadNotifications = notifications.filter((n: { date: string | number | Date; }) =>
    n.date instanceof Date
      ? n.date.getTime() > lastViewed
      : new Date(n.date).getTime() > lastViewed
  );

  const [hasUnread, setHasUnread] = useState(unreadNotifications.length > 0);

  useEffect(() => {
    setHasUnread(unreadNotifications.length > 0);
    // eslint-disable-next-line
  }, [notifications]);

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

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

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
        <span className="text-xl font-bold" style={{ color: "#D6212A" }}>
          INFOSYS
        </span>
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
              notifications.map((notif: Notification) => (
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
          className="flex items-center gap-2 px-4 py-2 bg-[#D6212A] text-white rounded font-semibold hover:bg-[#c81620] transition"
        >
          <LogOut size={18} />
          Log Out
        </button>
      </div>
    </nav>
  );
}

export default Navbar;
