import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000",
  timeout: 8000,
});

API.interceptors.request.use((config) => {
  const adminToken = localStorage.getItem("adminToken");
  if (adminToken) {
    config.headers.Authorization = `Bearer ${adminToken}`;
  }
  return config;
});

// Admin Auth
export const adminLoginAPI = (credentials) =>
  API.post("/admin/login", credentials)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.response?.data?.error || err.message);
      throw err;
    });

// Dashboard
export const getDashboard = () =>
  API.get("/admin/dashboard")
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

// Products
export const getProducts = (opts = {}) =>
  API.get("/products", { params: opts })
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const getCategories = () =>
  API.get("/categories")
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const addProduct = (productData) =>
  API.post("/admin/products", productData)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const updateProduct = (id, productData) =>
  API.put(`/admin/products/${id}`, productData)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const deleteProduct = (id) =>
  API.delete(`/admin/products/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

// Orders
export const getAdminOrders = () =>
  API.get("/admin/orders")
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const updateOrderStatus = (id, status) =>
  API.put(`/admin/orders/${id}/status`, { status })
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

// Categories
export const getAdminCategories = () =>
  API.get("/admin/categories")
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const addCategory = (name) =>
  API.post("/admin/categories", { name })
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const deleteCategory = (id) =>
  API.delete(`/admin/categories/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

// Users
export const getUsers = () =>
  API.get("/admin/users")
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const updateUserRole = (id, role) =>
  API.put(`/admin/users/${id}/role`, { role })
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

    export const getRevenue = () =>
  API.get("/admin/revenue")
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });