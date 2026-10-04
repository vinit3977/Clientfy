import { Outlet } from "react-router-dom";

import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Sidebar from "../components/Sidebar";

import "./DashboardLayout.css";

function DashboardLayout() {
  return (
    <div className="dashboard-layout">

      {/* Sidebar */}
      <Sidebar />

      {/* Main Application Area */}
      <div className="dashboard-main">

        {/* Top Navbar */}
        <Navbar />

        {/* Page Content */}
        <main className="dashboard-content">
          <Outlet />
        </main>

        {/* Footer */}
        <Footer />

      </div>

    </div>
  );
}

export default DashboardLayout;