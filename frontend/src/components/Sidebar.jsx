import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  UsersRound,
  FileText,
  CreditCard,
  Files,
  Settings,
  LogOut,
} from "lucide-react";

import "./Sidebar.css";

const menuItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Clients",
    path: "/clients",
    icon: Users,
  },
  {
    name: "Projects",
    path: "/projects",
    icon: FolderKanban,
  },
  {
    name: "Tasks",
    path: "/tasks",
    icon: CheckSquare,
  },
  {
    name: "Team",
    path: "/team",
    icon: UsersRound,
  },
  {
    name: "Invoices",
    path: "/invoices",
    icon: FileText,
  },
  {
    name: "Payments",
    path: "/payments",
    icon: CreditCard,
  },
  {
    name: "Documents",
    path: "/documents",
    icon: Files,
  },
];

function Sidebar() {
  return (
    <aside className="sidebar">

      {/* Logo */}
      <div className="sidebar-logo">
        <span>Clientify</span>
      </div>

      {/* Main Navigation */}
      <nav className="sidebar-nav">

        <div className="sidebar-section-title">
          MAIN MENU
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `nav-item ${isActive ? "active" : ""}`
              }
            >
              <Icon
                className="nav-icon"
                size={19}
                strokeWidth={1.8}
              />

              <span>{item.name}</span>
            </NavLink>
          );
        })}

      </nav>

      {/* Bottom Navigation */}
      <div className="sidebar-bottom">

        {/* Settings */}
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `nav-item ${isActive ? "active" : ""}`
          }
        >
          <Settings
            className="nav-icon"
            size={19}
            strokeWidth={1.8}
          />

          <span>Settings</span>
        </NavLink>

        {/* Logout - UI only */}
        <button
          type="button"
          className="nav-item logout-btn"
        >
          <LogOut
            className="nav-icon"
            size={19}
            strokeWidth={1.8}
          />

          <span>Logout</span>
        </button>

      </div>

    </aside>
  );
}

export default Sidebar;