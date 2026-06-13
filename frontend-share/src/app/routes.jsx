import { Routes, Route } from "react-router-dom";

// Public Facing Platform Components
import PublicNavbar from "../components/layout/PublicNavbar"; // Your friend's marketing navigation
import Landing from "../pages/public/Landing";
import Login from "../pages/public/Login";
import Signup from "../pages/public/Signup";

// Dashboard Architecture Components
import Dashboard from "../pages/app/Dashboard";
import AppLayout from "../components/layout/AppLayout"; // This houses your real internal dashboard navbar
import ProtectedRoute from "./ProtectedRoute";

export default function AppRoutes() {
  return (
    <Routes>
      {/* ── PUBLIC VIEW ROUTING MATRIX (Uses PublicNavbar Only) ── */}
      <Route
        path="/"
        element={
          <>
            <PublicNavbar />
            <Landing />
          </>
        }
      />
      <Route
        path="/login"
        element={
          <>
            <PublicNavbar />
            <Login />
          </>
        }
      />
      <Route
        path="/signup"
        element={
          <>
            <PublicNavbar />
            <Signup />
          </>
        }
      />

      {/* ── SECURE PRIVATE WORKSPACE ROUTES (Uses your real Dashboard components) ── */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <AppLayout>
              <Dashboard />
            </AppLayout>
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}