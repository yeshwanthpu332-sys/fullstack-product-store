import { Routes, Route, Navigate } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import AdminRoute from "./components/AdminRoute";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Users from "./pages/Users";
import Revenue from "./pages/Revenue";
import Categories from "./pages/Categories";

function App() {
  return (
    <Routes>
      {/* Login Page - No Layout */}
      <Route path="/login" element={<Login />} />

      {/* Admin Pages - With Sidebar Layout */}
      <Route path="/dashboard" element={
        <AdminRoute>
          <AdminLayout>
            <Dashboard />
          </AdminLayout>
        </AdminRoute>
      } />

      <Route path="/products" element={
        <AdminRoute>
          <AdminLayout>
            <Products />
          </AdminLayout>
        </AdminRoute>
      } />

      <Route path="/orders" element={
        <AdminRoute>
          <AdminLayout>
            <Orders />
          </AdminLayout>
        </AdminRoute>
      } />

      <Route path="/users" element={
        <AdminRoute>
          <AdminLayout>
            <Users />
          </AdminLayout>
        </AdminRoute>
      } />

      <Route path="/revenue" element={
  <AdminRoute>
    <AdminLayout>
      <Revenue />
    </AdminLayout>
  </AdminRoute>
} />

     <Route path="/categories" element={
  <AdminRoute>
    <AdminLayout>
      <Categories />
    </AdminLayout>
  </AdminRoute>
} />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;