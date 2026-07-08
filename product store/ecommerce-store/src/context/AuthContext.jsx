import { createContext, useContext, useState } from "react";
import { loginUser, registerUser } from "../api/api";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const isGuestPreview = new URLSearchParams(window.location.search).get("guestPreview") === "true";

  const [user, setUser] = useState(() => {
    if (isGuestPreview) return null;
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState(() => {
    if (isGuestPreview) return null;
    return localStorage.getItem("token") || null;
  });

  const register = async (userData) => {
    const data = await registerUser(userData);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    return data;
  };

  const login = async (userData) => {
    const data = await loginUser(userData);
    setUser(data.user);
    setToken(data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    localStorage.setItem("token", data.token);
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const isLoggedIn = !!user && !isGuestPreview;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        register,
        login,
        logout,
        isLoggedIn,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}