import { NavLink, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../context/AdminAuthContext";

function AdminSidebar() {
  const { admin, adminLogout } = useAdminAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    adminLogout();
    navigate("/login");
  };

  const handleViewWebsite = () => {
    window.open(
      "http://localhost:5173?guestPreview=true",
      "_blank",
      "noopener,noreferrer"
    );
  };

  const navClass = ({ isActive }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 font-medium relative ${
      isActive
        ? "bg-purple-500/10 text-purple-400 border-l-4 border-purple-500"
        : "text-gray-400 hover:bg-gray-800 hover:text-white border-l-4 border-transparent"
    }`;

  return (
    <div className="w-64 h-screen bg-gray-900 flex flex-col fixed top-0 left-0">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-gray-700 shrink-0">
        <h1 className="text-white font-bold text-xl">🛍️ ShopEase</h1>
        <p className="text-purple-400 text-sm mt-1">Admin Panel</p>
      </div>

      {/* Admin Info */}
      <div className="px-6 py-4 border-b border-gray-700 shrink-0">
        <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
          Logged in as
        </p>
        <p className="text-white font-medium text-sm">{admin?.name}</p>
        <p className="text-gray-400 text-xs break-all">{admin?.email}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-2">
        <p className="text-gray-500 text-xs uppercase tracking-wider px-4 mb-3">
          Menu
        </p>

        <NavLink to="/dashboard" className={navClass}>
          <span>📊</span>
          <span>Dashboard</span>
        </NavLink>

        <NavLink to="/products?manage=true" className={navClass}>
          <span>Products</span>
        </NavLink>

        <NavLink to="/categories" className={navClass}>
          <span>Categories</span>
        </NavLink>

        <NavLink to="/orders?manage=true" className={navClass}>
          <span>Orders</span>
        </NavLink>

        <NavLink to="/users" className={navClass}>
          <span>Users</span>
        </NavLink>
      </nav>

      {/* Bottom section */}
      <div className="px-4 py-4 border-t border-gray-700 space-y-2 shrink-0 bg-gray-900">
        <button
          onClick={handleViewWebsite}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all duration-200 font-medium"
        >
          <span>🌐</span>
          <span>View Website</span>
        </button>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-900/50 hover:text-red-300 transition-all duration-200 font-medium"
        >
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;