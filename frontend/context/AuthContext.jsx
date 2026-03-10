"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import * as dashboardApi from "../lib/dashboardApi";

const AuthContext = createContext();

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("shopbot_token");
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [owner, setOwner] = useState(null);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load token on mount
  useEffect(() => {
    const saved = getToken();
    if (saved) {
      setToken(saved);
      // Verify token validity
      dashboardApi.getMe(saved).then((data) => {
        setOwner(data.owner);
        setStore(data.store);
        setLoading(false);
      }).catch(() => {
        // Token expired or invalid
        localStorage.removeItem("shopbot_token");
        setToken(null);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const data = await dashboardApi.login(email, password);
    localStorage.setItem("shopbot_token", data.token);
    setToken(data.token);
    setOwner(data.owner);
    setStore(data.store);
    return data;
  };

  const register = async (name, email, password) => {
    const data = await dashboardApi.register(name, email, password);
    localStorage.setItem("shopbot_token", data.token);
    setToken(data.token);
    setOwner(data.owner);
    setStore(null);
    return data;
  };

  const logout = () => {
    localStorage.removeItem("shopbot_token");
    setToken(null);
    setOwner(null);
    setStore(null);
  };

  const refreshStore = useCallback(async () => {
    if (!token) return;
    try {
      const data = await dashboardApi.getMe(token);
      setOwner(data.owner);
      setStore(data.store);
    } catch {
      // silent
    }
  }, [token]);

  return (
    <AuthContext.Provider
      value={{
        token,
        owner,
        store,
        loading,
        isAuthenticated: !!token && !!owner,
        hasStore: !!store,
        login,
        register,
        logout,
        refreshStore,
        setStore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
