import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/authApi";
import {
  saveTokens, clearTokens,
  isAuthenticated
} from "../utils/tokenUtils";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const restore = async () => {
      if (isAuthenticated()) {
        try {
          const { data } = await authApi.getMe();
          setUser(data);
        } catch {
          clearTokens();
          setUser(null);
        }
      }
      setLoading(false);
    };
    restore();
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    saveTokens(data.access_token, data.refresh_token);
    const me = await authApi.getMe();
    setUser(me.data);
    return me.data;
  }, []);

  const register = useCallback(async (formData) => {
    const { data } = await authApi.register(formData);
    saveTokens(data.access_token, data.refresh_token);
    const me = await authApi.getMe();
    setUser(me.data);
    return me.data;
  }, []);

  const logout = useCallback(() => {
    authApi.logout().catch(() => {});
    clearTokens();
    setUser(null);
  }, []);

  const isAdmin      = user?.role === "admin";
  const isInstructor = user?.role === "instructor" || isAdmin;
  const isStudent    = user?.role === "student";

  return (
    <AuthContext.Provider value={{
      user, loading,
      login, register, logout,
      isAdmin, isInstructor, isStudent,
      isLoggedIn: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
