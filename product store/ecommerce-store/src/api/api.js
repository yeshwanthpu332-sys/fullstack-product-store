import axios from "axios";

const API = axios.create({
 baseURL: import.meta.env.VITE_API_URL,
  timeout: 8000,
});

// Sends token with every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products
export const getProducts = (opts = {}) =>
  API.get("/products", { params: opts })
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.response?.data || err.message);
      throw err;
    });

export const getProductById = (id) =>
  API.get(`/products/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

// Categories
export const getCategories = () =>
  API.get("/categories")
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

// Auth
export const registerUser = (userData) =>
  API.post("/auth/register", userData)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.response?.data?.error || err.message);
      throw err;
    });

export const loginUser = (userData) =>
  API.post("/auth/login", userData)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.response?.data?.error || err.message);
      throw err;
    });

// Cart
export const getCart = () =>
  API.get("/cart")
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const addToCartAPI = (product_id) =>
  API.post("/cart", { product_id })
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const increaseCartItem = (product_id) =>
  API.put(`/cart/increase/${product_id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const decreaseCartItem = (product_id) =>
  API.put(`/cart/decrease/${product_id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const removeCartItem = (product_id) =>
  API.delete(`/cart/${product_id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const clearCartAPI = () =>
  API.delete("/cart")
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

// Wishlist
export const getWishlist = () =>
  API.get("/wishlist")
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const toggleWishlistAPI = (product_id) =>
  API.post("/wishlist", { product_id })
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const removeWishlistItem = (product_id) =>
  API.delete(`/wishlist/${product_id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

// Orders
export const placeOrder = (orderData) =>
  API.post("/orders", orderData)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const getOrders = () =>
  API.get("/orders")
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const getOrderById = (id) =>
  API.get(`/orders/${id}`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });

export const cancelOrder = (id) =>
  API.put(`/orders/${id}/cancel`)
    .then((res) => res.data)
    .catch((err) => {
      console.error("API Error:", err.message);
      throw err;
    });