import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  useState,
} from "react";
import { apiService } from "../services/apiService";
import DialogModal from "../components/shared/DialogModal";

/* eslint-disable react-refresh/only-export-components */

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
  const logoutTimerRef = useRef(null);
  const lastActivityRef = useRef(Date.now());
  const warnedRef = useRef(false);
  const renewThrottleRef = useRef({ last: 0 });
  const [warningOpen, setWarningOpen] = useState(false);

  const decodeJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join(""),
      );
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  };

  const scheduleLogoutFromToken = (token) => {
    const payload = decodeJwt(token);
    if (!payload || !payload.exp) return;
    const msRemaining = payload.exp * 1000 - Date.now();
    if (msRemaining <= 0) {
      // Token ya expirado
      logout();
      return;
    }
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
    }
    logoutTimerRef.current = setTimeout(() => {
      logout();
    }, msRemaining);
  };

  const renewToken = async () => {
    try {
      const response = await apiService.renewToken();
      if (response.data?.success && response.data?.token) {
        const newToken = response.data.token;
        localStorage.setItem("authToken", newToken);
        // re-schedule logout using new token
        scheduleLogoutFromToken(newToken);
        warnedRef.current = false; // reset warning state
      }
    } catch (e) {
      console.warn("Token renew failed", e);
      logout();
    }
  };

  const handleUserActivity = () => {
    lastActivityRef.current = Date.now();
    if (warningOpen) setWarningOpen(false);
    // Throttle renew calls (e.g., 60s)
    const now = Date.now();
    if (now - renewThrottleRef.current.last > 60_000) {
      renewThrottleRef.current.last = now;
      // Renew proactively to keep session alive while active
      renewToken();
    }
  };

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
        scheduleLogoutFromToken(token);
      } catch (error) {
        console.error("Auth initialization error:", error);
        localStorage.removeItem("authToken");
        localStorage.removeItem("userInfo");
      }
    }

    // Marcar que la inicialización está completa
    dispatch({ type: "INIT_COMPLETE" });

    // Listeners de actividad del usuario
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((ev) =>
      window.addEventListener(ev, handleUserActivity, { passive: true }),
    );

    // Chequeo de inactividad y aviso a los 13 minutos
    const checkInterval = setInterval(() => {
      const inactivityMs = Date.now() - lastActivityRef.current;
      const warnMs = 13 * 60 * 1000;
      const maxMs = 15 * 60 * 1000;

      if (
        inactivityMs >= warnMs &&
        inactivityMs < maxMs &&
        !warnedRef.current
      ) {
        warnedRef.current = true;
        setWarningOpen(true);
      }
    }, 15_000); // cada 15s

    return () => {
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current);
      }
      clearInterval(checkInterval);
      events.forEach((ev) =>
        window.removeEventListener(ev, handleUserActivity),
      );
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

        // Programar logout automático según expiración del JWT
        scheduleLogoutFromToken(token);

        return { success: true, user };
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
    if (logoutTimerRef.current) {
      clearTimeout(logoutTimerRef.current);
      logoutTimerRef.current = null;
    }
    // Ensure any session warning modal is closed
    warnedRef.current = false;
    setWarningOpen(false);
    dispatch({ type: "LOGOUT" });
  };

  // If auth state flips to unauthenticated (e.g., token expired), close warning
  useEffect(() => {
    if (!state.isAuthenticated) {
      warnedRef.current = false;
      setWarningOpen(false);
    }
  }, [state.isAuthenticated]);

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
      // Error silencioso para refresh de usuario
      console.error("Refresh user error:", error);
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

  return (
    <AuthContext.Provider value={value}>
      {children}
      <DialogModal
        isOpen={warningOpen}
        title={"Sesión próxima a expirar"}
        description={"Su sesión vence en 2 minutos. ¿Desea extenderla?"}
        variant="yellow"
        confirmText="Extender sesión"
        cancelText="Cerrar"
        closeOnBackdrop={false}
        onConfirm={() => {
          setWarningOpen(false);
          lastActivityRef.current = Date.now();
          renewToken();
        }}
        onCancel={() => {
          setWarningOpen(false);
        }}
      />
    </AuthContext.Provider>
  );
};

// Hook para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe ser usado dentro de AuthProvider");
  }
  return context;
};

// Export the AuthProvider as default (component) to satisfy fast refresh
export default AuthProvider;

// Export AuthContext for compatibility
export { AuthContext };
