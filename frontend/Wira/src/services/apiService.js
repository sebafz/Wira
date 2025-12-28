import axios from "axios";

const API_BASE_URL = "http://localhost:5242/api";

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
  getMineras: () => apiClient.get("/mineras"),
  getProveedores: () => apiClient.get("/proveedores"),
  getProveedoresRubros: () => apiClient.get("/proveedores/rubros"),

  // Admin endpoints
  getUsuarios: () => apiClient.get("/auth/users"),
  updateUsuarioStatus: (usuarioId, activo) =>
    apiClient.patch(`/auth/users/${usuarioId}/status`, { activo }),
  updateUsuarioRoles: (usuarioId, roles) =>
    apiClient.put(`/auth/users/${usuarioId}/roles`, { roles }),

  // Test endpoints
  testConnection: () => apiClient.get("/test/connection"),
  getRoles: () => apiClient.get("/test/roles"),
  getEstados: () => apiClient.get("/test/estados"),
};

export default apiService;
