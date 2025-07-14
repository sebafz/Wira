import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Login from "./components/Login";
import Register from "./components/Register";
import VerifyEmail from "./components/VerifyEmail";
import ForgotPassword from "./components/ForgotPassword";
import Dashboard from "./components/Dashboard";
import DashboardRouter from "./components/DashboardRouter";
import DashboardMinera from "./components/DashboardMinera";
import DashboardProveedor from "./components/DashboardProveedor";
import CrearLicitacion from "./components/CrearLicitacion";
import EditarLicitacion from "./components/EditarLicitacion";
import LicitacionesMinera from "./components/LicitacionesMinera";
import LicitacionesProveedor from "./components/LicitacionesProveedor";
import Profile from "./components/Profile";
import "./App.css";

function App() {
  console.log("App component rendering..."); // Debug log

  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/verify-email" element={<VerifyEmail />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <DashboardRouter />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard-general"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard-minera"
              element={
                <ProtectedRoute>
                  <DashboardMinera />
                </ProtectedRoute>
              }
            />

            <Route
              path="/dashboard-proveedor"
              element={
                <ProtectedRoute>
                  <DashboardProveedor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/crear-licitacion"
              element={
                <ProtectedRoute>
                  <CrearLicitacion />
                </ProtectedRoute>
              }
            />

            <Route
              path="/editar-licitacion/:id"
              element={
                <ProtectedRoute>
                  <EditarLicitacion />
                </ProtectedRoute>
              }
            />

            <Route
              path="/mis-licitaciones"
              element={
                <ProtectedRoute>
                  <LicitacionesMinera />
                </ProtectedRoute>
              }
            />

            <Route
              path="/licitaciones-activas"
              element={
                <ProtectedRoute>
                  <LicitacionesProveedor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Redirección por defecto */}
            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            {/* Ruta catch-all */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
