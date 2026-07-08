import { NavLink, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { getProducts } from "../api/api";
import logo from "../assets/shopease-logo.png";

function Navbar() {
  const [search, setSearch] = useState("");
  const [allProducts, setAllProducts] = useState([]);
  const navigate = useNavigate();
  const { totalItems } = useCart();
  const { user, isLoggedIn, logout } = useAuth();

  useEffect(() => {
    getProducts({ limit: 50 })
      .then((data) => setAllProducts(data.products || []))
      .catch((err) => console.error(err));
  }, []);

  const navClass = ({ isActive }) =>
    `px-3 py-1 rounded-md transition ${
      isActive ? "bg-white text-gray-900 font-semibold" : "hover:bg-gray-800"
    }`;

  const filteredProducts = allProducts.filter((product) =>
    product.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <nav className="bg-gray-900 text-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center py-4 gap-4">
          {/* Logo */}
          <NavLink to="/" className="flex items-center">
            <img
              src={logo}
              alt="ShopEase"
              className="h-16 w-auto hover:scale-105 transition-transform"
            />
          </NavLink>

          {/* Search Bar */}
          <div className="w-full md:w-1/2 relative">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-full text-black bg-white border border-gray-300 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {search && (
              <div className="bg-white text-black rounded-md shadow-lg mt-1 absolute w-full z-50">
                {filteredProducts.slice(0, 8).map((product) => (
                  <div
                    key={product.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      navigate(
                        `/products?search=${encodeURIComponent(product.name)}`
                      );
                      setSearch("");
                    }}
                  >
                    {product.name}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Nav Links */}
          <div className="flex gap-6 font-medium items-center">
            <NavLink to="/products" className={navClass}>
              Products
            </NavLink>
            <NavLink to="/wishlist" className={navClass}>
              <span className="text-xl">♡</span>
            </NavLink>

            {/* Cart with Badge */}
            <NavLink to="/cart" className={navClass}>
              <div className="relative">
                <span>Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-4 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </div>
            </NavLink>

            <NavLink to="/orders" className={navClass}>
              Orders
            </NavLink>

            {isLoggedIn ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-300">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-3 py-1 bg-red-600 hover:bg-red-700 rounded-md transition"
                >
                  Logout
                </button>
              </div>
            ) : (
              <NavLink
                to="/login"
                className="px-4 py-1 bg-blue-600 hover:bg-blue-700 rounded-md transition"
              >
                Login
              </NavLink>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;