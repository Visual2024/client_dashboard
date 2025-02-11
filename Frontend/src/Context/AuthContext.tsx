'use client'
import { jwtDecode } from "jwt-decode";
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { AuthContextProps, AuthTokens, tokenData } from "../Types/interfaces";

const AUTH_TOKEN_KEY = "TOKEN_KEY";
const AUTH_INFO_USER = "USER_INFO";
const API_URL = process.env.API_URL || "http://localhost:5000";

export const AuthContext = createContext<AuthContextProps>({
  login: () => {},
  logout: () => {},
  register: () => {},
  fetchJobs: async () => [],
  handleDeleteJob: async () => {},
  isLoggedIn: false,
  authTokens: null,
});

export const AuthContextProvider = ({ children }: { children: React.ReactNode }) => {
  const authTokensInLocalStorage =
    typeof window !== "undefined"
      ? window.localStorage.getItem(AUTH_INFO_USER)
      : null;

  const [authTokens, setAuthTokens] = useState<AuthTokens | null>(
    authTokensInLocalStorage ? JSON.parse(authTokensInLocalStorage) : null
  );

  const [userName, setUserName] = useState<string>(
    authTokensInLocalStorage ? JSON.parse(authTokensInLocalStorage).email : ""
  );

  // 🔹 Función para iniciar sesión
  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (res.status === 401) {
        toast.warning("El email o contraseña son incorrectos");
      }

      if (!res.ok) throw new Error("Failed to login");

      const data = await res.json();

      if (data.token) {
        toast.success("¡Inicio de sesión exitoso!");
        window.location.href = "/dashboard";
        const token = data.token;
        const infoToken: tokenData = jwtDecode(token);
        const dataToken: AuthTokens = {
          token,
          email: infoToken.fullName,
          iat: infoToken.iat,
          exp: infoToken.exp,
          authorities: infoToken.authorities,
        };
        setAuthTokens(dataToken);
        window.localStorage.setItem(AUTH_INFO_USER, JSON.stringify(dataToken));
        window.localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      }
    } catch (err) {
      console.log(err);
    }
  };

  // 🔹 Función para registrar usuario
  const register = async (name: string, lastname: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName: name, lastName: lastname, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(data.message);
        window.location.href = "/login";
      } else {
        toast.error(data.error || "Error en el registro");
      }
    } catch (err) {
      console.log(err);
      toast.error("Error de conexión");
    }
  };

  // 🔹 Función para cerrar sesión
  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_TOKEN_KEY);
    window.localStorage.removeItem(AUTH_INFO_USER);
    setAuthTokens(null);
    setUserName("");
  }, []);

  // 🔹 Función para obtener trabajos (jobs)
  const fetchJobs = useCallback(async () => {
    try {
      const response = await fetch("../json/jobs.json", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: "", values: [] }),
      });

      if (!response.ok) throw new Error("Error fetching jobs");

      return await response.json();
    } catch (error) {
      console.error("Error fetching jobs:", error);
      return [];
    }
  }, []);

  const handleDeleteJob = useCallback(async (jobId: number) => {
    try {
      const response = await fetch("/api/db/newjobspecs", {
        method: "POST",
        body: JSON.stringify({
          query: "DELETE FROM job_specs WHERE id = ?",
          values: [jobId],
        }),
      });

      if (!response.ok) throw new Error("Error fetching jobs");

      return await response.json();
    } catch (error) {
      console.error("Error deleting job:", error);
    }
  }, []);

  // 🔹 Efecto para manejar cambios en el almacenamiento
  useEffect(() => {
    const handleStorageChange = () => {
      const storedTokens = window.localStorage.getItem(AUTH_INFO_USER);
      if (!storedTokens) {
        setAuthTokens(null);
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 🔹 Valores del contexto
  const value = useMemo<AuthContextProps>(
    () => ({
      login,
      logout,
      register,
      handleDeleteJob, 
      fetchJobs,
      authTokens,
      userName,
      isLoggedIn: !!authTokens,
    }),
    [authTokens, login, logout, register, fetchJobs, handleDeleteJob, userName]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para usar el contexto
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuthContext debe ser utilizado dentro de AuthContextProvider");
  }
  return context;
};