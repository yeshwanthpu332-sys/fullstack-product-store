import { createContext, useContext, useState } from "react";
import { adminLoginAPI } from "../api/api";

const AdminAuthContext = createContext();

export function AdminAuthProvider({ children }) {
  const [admin, setAdmin] = useState(() => {
    const savedAdmin = localStorage.getItem("admin");
    return savedAdmin ? JSON.parse(savedAdmin) : null;
  });

  const [adminToken, setAdminToken] = useState(() => {
    return localStorage.getItem("adminToken") || null;
  });

  const adminLogin = async (credentials) => {
    const data = await adminLoginAPI(credentials);
    setAdmin(data.user);
    setAdminToken(data.token);
    localStorage.setItem("admin", JSON.stringify(data.user));
    localStorage.setItem("adminToken", data.token);
    return data;
  };

  const adminLogout = () => {
    setAdmin(null);
    setAdminToken(null);
    localStorage.removeItem("admin");
    localStorage.removeItem("adminToken");
  };

  const isAdminLoggedIn = !!admin;

  return (
    <AdminAuthContext.Provider
      value={{
        admin,
        adminToken,
        adminLogin,
        adminLogout,
        isAdminLoggedIn,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}