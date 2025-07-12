import React, { createContext, useContext, useReducer, useEffect } from "react";
import { apiService } from "../services/apiService";

// Estados de autenticación
const authReducer = (state, action) => {
  switch (action.type) {
    case "LOGIN_START":
      return { ...state, loading: true, error: null };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        loading: false,
        error: null,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
      };
    case "LOGIN_ERROR":
      return {
        ...state,
        loading: false,
        error: action.payload,
        user: null,
        token: null,
        isAuthenticated: false,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "INIT_COMPLETE":
      return {
        ...state,
        loading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      };
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
      };
    default:
      return state;
  }
};

// Estado inicial
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true, // Empezar con loading true para verificar token
  error: null,
};

// Crear contexto
const AuthContext = createContext();

// Provider de autenticación
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  console.log("AuthProvider state:", state); // Debug log

  // Verificar si hay un token guardado al cargar la aplicación
  useEffect(() => {
    const token = localStorage.getItem("authToken");
    const userInfo = localStorage.getItem("userInfo");

    if (token && userInfo) {
      try {
        const user = JSON.parse(userInfo);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user, token },
        });
      } catch (error) {
        console.error("Error parsing stored user info:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userInfo");
      }
    }

    // Marcar que la inicialización está completa
    dispatch({ type: "INIT_COMPLETE" });
  }, []);

  // Función de login
  const login = async (email, password) => {
    dispatch({ type: "LOGIN_START" });

    try {
      const response = await apiService.login({ email, password });

      if (response.data.success) {
        const { token, user } = response.data;

        // Guardar en localStorage
        localStorage.setItem("authToken", token);
        localStorage.setItem("userInfo", JSON.stringify(user));

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user, token },
        });

        return { success: true };
      } else {
        dispatch({
          type: "LOGIN_ERROR",
          payload: response.data.message || "Error en el login",
        });
        return { success: false, message: response.data.message };
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.errors ||
        "Error de conexión";

      dispatch({
        type: "LOGIN_ERROR",
        payload: errorMessage,
      });

      return { success: false, message: errorMessage };
    }
  };

  // Función de logout
  const logout = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("userInfo");
    dispatch({ type: "LOGOUT" });
  };

  // Obtener información actualizada del usuario
  const refreshUser = async () => {
    try {
      const response = await apiService.getCurrentUser();
      if (response.data.success) {
        const user = response.data.user;
        localStorage.setItem("userInfo", JSON.stringify(user));
        dispatch({ type: "SET_USER", payload: user });
      }
    } catch (error) {
      console.error("Error refreshing user info:", error);
    }
  };

  // Limpiar errores
  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  // Actualizar información del usuario
  const updateUser = (updatedUserData) => {
    const updatedUser = { ...state.user, ...updatedUserData };
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));
    dispatch({ type: "SET_USER", payload: updatedUser });
    return Promise.resolve(updatedUser);
  };

  const value = {
    ...state,
    login,
    logout,
    refreshUser,
    clearError,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};

export default AuthContext;
