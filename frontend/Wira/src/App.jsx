import React from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/shared/ProtectedRoute";
import Login from "./components/auth/Login";
import Register from "./components/auth/Register";
import VerifyEmail from "./components/auth/VerifyEmail";
import ForgotPassword from "./components/auth/ForgotPassword";
import Dashboard from "./components/dashboard/Dashboard";
import DashboardRouter from "./components/dashboard/DashboardRouter";
import DashboardMinera from "./components/dashboard/DashboardMinera";
import DashboardProveedor from "./components/dashboard/DashboardProveedor";
import DashboardAdmin from "./components/dashboard/DashboardAdmin";
import CrearLicitacion from "./components/licitaciones/CrearLicitacion";
import EditarLicitacion from "./components/licitaciones/EditarLicitacion";
import LicitacionesMinera from "./components/licitaciones/LicitacionesMinera";
import LicitacionesProveedor from "./components/licitaciones/LicitacionesProveedor";
import PropuestasProveedor from "./components/propuestas/PropuestasProveedor";
import EditarPropuesta from "./components/propuestas/EditarPropuesta";
import HistorialProveedor from "./components/historial/HistorialProveedor";
import CalificacionesPosLicitacion from "./components/calificaciones/CalificacionesPosLicitacion";
import Profile from "./components/profile/Profile";
import ColorPalette from "./components/shared/ColorPalette";
import AdminMineras from "./components/admin/AdminMineras";
import AdminProveedores from "./components/admin/AdminProveedores";
import AdminUsuarios from "./components/admin/AdminUsuarios";
import AprobacionesUsuarios from "./components/admin/AprobacionesUsuarios";
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
            <Route path="/color-palette" element={<ColorPalette />} />

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
              path="/dashboard-admin"
              element={
                <ProtectedRoute>
                  <DashboardAdmin />
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
              path="/calificaciones-poslicitacion"
              element={
                <ProtectedRoute>
                  <CalificacionesPosLicitacion />
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

            <Route
              path="/propuestas-proveedor"
              element={
                <ProtectedRoute>
                  <PropuestasProveedor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/propuestas/editar/:id"
              element={
                <ProtectedRoute>
                  <EditarPropuesta />
                </ProtectedRoute>
              }
            />

            <Route
              path="/historial-proveedor"
              element={
                <ProtectedRoute>
                  <HistorialProveedor />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/mineras"
              element={
                <ProtectedRoute>
                  <AdminMineras />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/proveedores"
              element={
                <ProtectedRoute>
                  <AdminProveedores />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/usuarios"
              element={
                <ProtectedRoute>
                  <AdminUsuarios />
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/aprobaciones"
              element={
                <ProtectedRoute>
                  <AprobacionesUsuarios />
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
