import React, { createContext, useContext, useEffect, useState } from "react";

const API_URL = "https://slowed-reverb-website.onrender.com/api/";

type User = { id: number; name: string; email: string; role: string } | null;

type AuthContextType = {
  user: User;
  accessToken: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccess: () => Promise<string | null>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(null);
  const [accessToken, setAccessToken] = useState<string | null>(() => localStorage.getItem("accessToken"));
  const [loading, setLoading] = useState(true);

  const loadMe = async (token?: string) => {
    const tok = token ?? accessToken;
    if (!tok) {
      setUser(null);
      return null;
    }
    try {
      const res = await fetch(API_URL + "me/", {
        method: "GET",
        credentials: "include",
        headers: { "Authorization": `Bearer ${tok}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return data;
      }

      if (res.status === 401) {
        const newAccess = await refreshAccess();
        if (newAccess) return await loadMe(newAccess);
      }
      setUser(null);
      return null;
    } catch (e) {
      setUser(null);
      return null;
    }
  };

  
  const refreshAccess = async (): Promise<string | null> => {
    try {
      const r = await fetch(API_URL + "token/refresh/", {
        method: "POST",
        credentials: "include",
      });
      if (!r.ok) return null;
      const data = await r.json();
      const newAccess = data.access;
      if (newAccess) {
        setAccessToken(newAccess);
        localStorage.setItem("accessToken", newAccess);
        return newAccess;
      }
      return null;
    } catch {
      return null;
    }
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      if (accessToken) {
        await loadMe(accessToken);
      } else {
        const newAccess = await refreshAccess();
        if (newAccess) await loadMe(newAccess);
      }
      setLoading(false);
    })();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await fetch(API_URL + "login/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Login failed");
    }
    const data = await res.json();
    setAccessToken(data.token);
    localStorage.setItem("accessToken", data.token);
    await loadMe(data.token);
  };

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(API_URL + "register/", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, role: "user" }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || "Registration failed");
    }
    const data = await res.json();
    setAccessToken(data.token);
    localStorage.setItem("accessToken", data.token);
    await loadMe(data.token);
  };

  const logout = async () => {
    await fetch(API_URL + "logout/", {
      method: "POST",
      credentials: "include",
      headers: accessToken ? { "Authorization": `Bearer ${accessToken}` } : undefined,
    }).catch(() => {});
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("accessToken");
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, loading, login, register, logout, refreshAccess }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
