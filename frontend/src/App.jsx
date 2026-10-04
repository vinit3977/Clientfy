import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Authentication Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

// Application Pages
import Dashboard from "./pages/Dashboard";
import Clients from "./pages/Clients";
import Projects from "./pages/Projects";
import Tasks from "./pages/Tasks";
import Team from "./pages/Team";
import Invoices from "./pages/Invoices";
import Payments from "./pages/Payments";
import Documents from "./pages/Documents";
import Settings from "./pages/Settings";

// Layout & Protection
import DashboardLayout from "./layouts/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================== AUTHENTICATION ==================== */}

        <Route path="/login" element={<Login />} />

        <Route path="/register" element={<Register />} />

        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />


        {/* ==================== PROTECTED APPLICATION ==================== */}

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >

          {/* / → /dashboard */}
          <Route
            index
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Dashboard */}
          <Route
            path="dashboard"
            element={<Dashboard />}
          />

          {/* Clients */}
          <Route
            path="clients"
            element={<Clients />}
          />

          {/* Projects */}
          <Route
            path="projects"
            element={<Projects />}
          />

          {/* Tasks */}
          <Route
            path="tasks"
            element={<Tasks />}
          />

          {/* Team */}
          <Route
            path="team"
            element={<Team />}
          />

          {/* Invoices */}
          <Route
            path="invoices"
            element={<Invoices />}
          />

          {/* Payments */}
          <Route
            path="payments"
            element={<Payments />}
          />

          {/* Documents */}
          <Route
            path="documents"
            element={<Documents />}
          />

          {/* Settings */}
          <Route
            path="settings"
            element={<Settings />}
          />

        </Route>


        {/* ==================== UNKNOWN ROUTES ==================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;