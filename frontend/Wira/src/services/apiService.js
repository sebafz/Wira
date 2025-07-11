import axios from "axios";

const API_BASE_URL = "https://localhost:5001/api";

// Configurar axios con la base URL
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000, // 10 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor para manejar errores globalmente
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Servicios de la API
export const apiService = {
  // Test endpoints
  testConnection: () => apiClient.get("/test/connection"),
  getRoles: () => apiClient.get("/test/roles"),
  getEstados: () => apiClient.get("/test/estados"),
};

export default apiService;
