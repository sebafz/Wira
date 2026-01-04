import axios from "axios";

const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5242/api"
).replace(/\/$/, "");

// Configurar axios con la base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para agregar token de autenticación
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);

    // Si es error 401 y NO es en el endpoint de login, remover token
    if (
      error.response?.status === 401 &&
      !error.config?.url?.includes("/auth/login")
    ) {
      localStorage.removeItem("authToken");
      localStorage.removeItem("userInfo");
      // No hacer redirect aquí, lo manejará cada componente según sea necesario
    }

    return Promise.reject(error);
  }
);

// Servicios de la API
export const apiService = {
  // Auth endpoints
  login: (credentials) => apiClient.post("/auth/login", credentials),
  register: (userData) => apiClient.post("/auth/register", userData),
  getCurrentUser: () => apiClient.get("/auth/me"),
  verifyEmail: (email, code) =>
    apiClient.post("/auth/verify-email", { email, code }),
  resendVerificationEmail: (email) =>
    apiClient.post("/auth/resend-verification", { email }),
  forgotPassword: (email) => apiClient.post("/auth/forgot-password", { email }),
  resetPassword: (data) => apiClient.post("/auth/reset-password", data),
  updateProfile: (userData) => apiClient.put("/auth/profile", userData),

  // Data endpoints
  getMineras: (params = {}) => apiClient.get("/mineras", { params }),
  getMineraById: (mineraId) => apiClient.get(`/mineras/${mineraId}`),
  createMinera: (minera) => apiClient.post("/mineras", minera),
  updateMinera: (mineraId, minera) =>
    apiClient.put(`/mineras/${mineraId}`, minera),
  updateMineraStatus: (mineraId, activo) =>
    apiClient.patch(`/mineras/${mineraId}/status`, { activo }),
  getProyectosMinerosByMinera: (mineraId) =>
    apiClient.get(`/proyectosmineros/minera/${mineraId}`),
  createProyectoMinero: (payload) =>
    apiClient.post("/proyectosmineros", payload),
  updateProyectoMinero: (proyectoId, payload) =>
    apiClient.put(`/proyectosmineros/${proyectoId}`, payload),
  deleteProyectoMinero: (proyectoId) =>
    apiClient.delete(`/proyectosmineros/${proyectoId}`),
  getProveedores: () => apiClient.get("/proveedores"),
  getProveedorById: (proveedorId) =>
    apiClient.get(`/proveedores/${proveedorId}`),
  updateProveedor: (proveedorId, proveedor) =>
    apiClient.put(`/proveedores/${proveedorId}`, proveedor),
  getProveedoresRubros: () => apiClient.get("/proveedores/rubros"),
  getMonedas: () => apiClient.get("/monedas"),

  // Admin endpoints
  getUsuarios: () => apiClient.get("/auth/users"),
  createUsuario: (usuario) => apiClient.post("/auth/users", usuario),
  updateUsuarioStatus: (usuarioId, activo) =>
    apiClient.patch(`/auth/users/${usuarioId}/status`, { activo }),
  updateUsuarioRoles: (usuarioId, roles) =>
    apiClient.put(`/auth/users/${usuarioId}/roles`, { roles }),
  updateUsuario: (usuarioId, usuario) =>
    apiClient.put(`/auth/users/${usuarioId}`, usuario),

  // Approval endpoints
  getPendingApprovals: (params = {}) =>
    apiClient.get("/auth/approvals/pending", { params }),
  getPendingApprovalsCount: (params = {}) =>
    apiClient.get("/auth/approvals/pending/count", { params }),
  approveUser: (usuarioId, roles = []) =>
    apiClient.post(`/auth/approvals/${usuarioId}/approve`, { roles }),
  rejectUser: (usuarioId, motivo) =>
    apiClient.post(`/auth/approvals/${usuarioId}/reject`, { motivo }),

  // Test endpoints
  testConnection: () => apiClient.get("/test/connection"),
  getRoles: () => apiClient.get("/test/roles"),
  getEstados: () => apiClient.get("/test/estados"),
};

export default apiService;
