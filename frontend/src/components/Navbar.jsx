import { Bell, ChevronDown } from "lucide-react";
import { useLocation } from "react-router-dom";

import "./Navbar.css";

function Navbar() {
  const location = useLocation();

  const pageNames = {
    "/dashboard": "Dashboard",
    "/clients": "Clients",
    "/projects": "Projects",
    "/tasks": "Tasks",
    "/team": "Team",
    "/invoices": "Invoices",
    "/payments": "Payments",
    "/documents": "Documents",
    "/settings": "Settings",
  };

  const currentPage = pageNames[location.pathname] || "Dashboard";

  return (
    <header className="navbar">

      {/* Left Side */}
      <div className="navbar-left">
        <div className="navbar-breadcrumb">
          <span className="navbar-brand">Clientify</span>

          <span className="breadcrumb-separator">—</span>

          <span className="navbar-page">
            {currentPage}
          </span>
        </div>
      </div>

      {/* Right Side */}
      <div className="navbar-right">

        {/* Notification */}
        <button className="notification-btn">
          <Bell size={20} strokeWidth={1.8} />

          <span className="notification-dot"></span>
        </button>

        {/* Profile */}
        <div className="profile">

          <div className="profile-avatar">
            PV
          </div>

          <div className="profile-info">
            <span className="profile-name">
              Priya
            </span>

            <span className="profile-role">
              Manager
            </span>
          </div>

          <ChevronDown
            className="profile-arrow"
            size={17}
            strokeWidth={1.8}
          />

        </div>

      </div>

    </header>
  );
}

export default Navbar;