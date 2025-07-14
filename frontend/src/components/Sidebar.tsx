import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Home,
  PlusCircle,
  Ticket,
  User,
  Building2,
  Users,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

const sidebarLinks = {
  company: [
    { to: "/company", label: "Dashboard", Icon: Home },
    { to: "/company/create-ticket", label: "Create Ticket", Icon: PlusCircle },
    { to: "/company/my-tickets", label: "My Tickets", Icon: Ticket },
    { to: "/company/profile", label: "Company Profile", Icon: User },
  ],
  admin: [
    { to: "/admin/dashboard", label: "Dashboard", Icon: Home },
    { to: "/admin/companies", label: "Company Management", Icon: Building2 },
    { to: "/admin/technicians", label: "Technician Management", Icon: Users },
    { to: "/admin/tickets", label: "Tickets", Icon: Ticket },
    { to: "/admin/profile", label: "Admin Profile", Icon: User },
  ],
  technician: [
    { to: "/technician/dashboard", label: "Dashboard", Icon: Home },
    { to: "/technician/tickets", label: "Tickets Board", Icon: Ticket },
    { to: "/technician/profile", label: "My Profile", Icon: User },
  ],
} as const;

type Role = "company" | "admin" | "technician";

type SidebarProps = {
  role: Role;
  name?: string; // companyName, adminName, or technicianName
};

export function Sidebar({ role, name }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const links = sidebarLinks[role];
  const mainLinks = links.slice(0, 3);
  const restLinks = links.slice(3);

  // Dynamic greeting
  const getGreeting = () => {
    if (role === "company") {
      return (
        <>
          Hello,<br />
          <span className="text-primary">{name}</span>
        </>
      );
    } else if (role === "technician") {
      return (
        <>
          Hello Technician!<br />
          <span className="text-primary">{name}</span>
        </>
      );
    } else {
      // admin
      return <span className="text-primary">Welcome Admin</span>;
    }
  };

  return (
    <aside
      className={`
        bg-white border-r min-h-screen flex flex-col pt-0
        transition-all duration-300
        ${collapsed ? "w-16" : "w-64"}
        relative
      `}
      style={{ boxShadow: "1px 0 0 #ececec" }}
    >
      {/* Top Section */}
      <div className={`${collapsed ? "h-20" : "h-[92px]"} flex flex-col justify-center relative`}>
        <button
          className={`
            absolute right-2 top-4 z-10
            border border-primary rounded-full bg-white
            shadow transition-all duration-300
            flex items-center justify-center
            ${collapsed ? "p-1" : "p-2"}
            hover:bg-primary/10
          `}
          style={{
            width: collapsed ? "34px" : "40px",
            height: collapsed ? "34px" : "40px",
          }}
          onClick={() => setCollapsed((v) => !v)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <ChevronRight size={20} color="#E23C29" /> : <ChevronLeft size={24} color="#E23C29" />}
        </button>
        {!collapsed && (
          <div className="px-6 pt-2 pb-2 flex items-center min-h-[56px]">
            <div
              className={`
                font-semibold text-lg
                leading-snug
                w-full
                break-words
              `}
              title={name}
              style={{ wordBreak: "break-word" }}
            >
              {getGreeting()}
            </div>
          </div>
        )}
      </div>

      {/* Divider */}
      <hr className="border-t border-gray-200 mb-2" />

      {/* Navigation Links */}
      <nav className={`flex flex-col gap-1 px-2`}>
        {mainLinks.map(({ to, label, Icon }) => (
          <NavLink
            to={to}
            key={to}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2 rounded-lg text-base font-medium transition
              ${collapsed ? "justify-center px-0" : "px-4"}
              ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-black hover:bg-gray-100"
              }`
            }
            end
            title={collapsed ? label : undefined}
          >
            <Icon size={22} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
        {restLinks.length > 0 && <hr className="my-3 border-t border-gray-200" />}
        {restLinks.map(({ to, label, Icon }) => (
          <NavLink
            to={to}
            key={to}
            className={({ isActive }) =>
              `flex items-center gap-3 py-2 rounded-lg text-base font-medium transition
              ${collapsed ? "justify-center px-0" : "px-4"}
              ${
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-black hover:bg-gray-100"
              }`
            }
            title={collapsed ? label : undefined}
          >
            <Icon size={22} />
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
