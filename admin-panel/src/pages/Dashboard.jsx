import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getDashboard } from "../api/api";

function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    getDashboard()
      .then((data) => setStats(data))
      .catch((err) => console.error(err))
      .finally(() => {
        setLoading(false);
        setTimeout(() => setAnimate(true), 100);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  const cards = [
    {
      title: "Total Products",
      value: stats?.totalProducts || 0,
      icon: "📦",
      gradient: "from-blue-500 to-blue-600",
      shadow: "shadow-blue-200",
    },
    {
      title: "Total Orders",
      value: stats?.totalOrders || 0,
      icon: "📋",
      gradient: "from-green-500 to-green-600",
      shadow: "shadow-green-200",
    },
    {
      title: "Total Users",
      value: stats?.totalUsers || 0,
      icon: "👥",
      gradient: "from-purple-500 to-purple-600",
      shadow: "shadow-purple-200",
    },
  ];

  const statusColors = {
    Placed: "bg-blue-100 text-blue-700",
    Confirmed: "bg-purple-100 text-purple-700",
    Shipped: "bg-yellow-100 text-yellow-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  return (
    <div>
      {/* Header */}
      <div
        className={`mb-8 transition-all duration-700 ${
          animate
            ? "opacity-100 translate-y-0"
            : "opacity-0 -translate-y-4"
        }`}
      >
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-gray-500 text-sm mt-1">
          Welcome back, Admin! Here's an overview of your store
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {cards.map((card, index) => (
          <div
            key={card.title}
            className={`bg-gradient-to-br ${card.gradient} text-white rounded-xl p-6 shadow-lg ${card.shadow} transition-all duration-700 ${
              animate
                ? "opacity-100 translate-y-0"
                : "opacity-0 translate-y-8"
            }`}
            style={{ transitionDelay: `${index * 150}ms` }}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
                  {card.title}
                </p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <div className="text-4xl opacity-80">{card.icon}</div>
            </div>
          </div>
        ))}

        {/* Revenue Card - Clickable */}
        <Link
          to="/revenue"
          className={`bg-gradient-to-br from-yellow-500 to-orange-500 text-white rounded-xl p-6 shadow-lg shadow-yellow-200 hover:shadow-xl hover:scale-105 transition-all duration-700 ${
            animate
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "450ms" }}
        >
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wider opacity-80">
                Total Revenue
              </p>
              <p className="text-3xl font-bold mt-2">
                ₹{stats?.totalRevenue || 0}
              </p>
            </div>
            <div className="text-4xl opacity-80">💰</div>
          </div>
          <p className="text-xs mt-3 opacity-70">Click to view details →</p>
        </Link>
      </div>

      {/* Recent Orders + Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div
          className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-700 ${
            animate
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "600ms" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">📋 Recent Orders</h2>
            <Link
              to="/orders?manage=true"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
            >
              View All →
            </Link>
          </div>

          {stats?.recentOrders?.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.map((order, index) => (
                <div
                  key={order.id}
                  className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-500 ${
                    animate
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4"
                  }`}
                  style={{ transitionDelay: `${700 + index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-sm">
                      #{order.id}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{order.user_name}</p>
                      <p className="text-xs text-gray-400">
                        {new Date(order.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-sm text-green-600">
                      ₹{order.total_amount}
                    </span>
                    <span
                      className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        statusColors[order.status] ||
                        "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">📋</p>
              <p className="text-gray-400 text-sm">No orders yet</p>
            </div>
          )}
        </div>

        {/* Top Products */}
        <div
          className={`bg-white rounded-xl shadow-md border border-gray-100 p-6 transition-all duration-700 ${
            animate
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-8"
          }`}
          style={{ transitionDelay: "750ms" }}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">🏆 Top Products</h2>
            <Link
              to="/products?manage=true"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition"
            >
              View All →
            </Link>
          </div>

          {stats?.topProducts?.length > 0 ? (
            <div className="space-y-3">
              {stats.topProducts.map((product, index) => (
                <div
                  key={product.id}
                  className={`flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-all duration-500 ${
                    animate
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 translate-x-4"
                  }`}
                  style={{ transitionDelay: `${850 + index * 100}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${
                        index === 0
                          ? "bg-gradient-to-br from-yellow-400 to-yellow-600"
                          : index === 1
                          ? "bg-gradient-to-br from-gray-400 to-gray-500"
                          : "bg-gradient-to-br from-orange-400 to-orange-600"
                      }`}
                    >
                      #{index + 1}
                    </span>
                    <img
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 object-contain rounded-lg bg-white border border-gray-100"
                    />
                    <div>
                      <p className="font-medium text-sm">{product.name}</p>
                      <p className="text-xs text-gray-400">
                        ₹{product.price}
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-sm text-green-600">
                      {product.total_sold}
                    </p>
                    <p className="text-xs text-gray-400">sold</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-3xl mb-2">🏆</p>
              <p className="text-gray-400 text-sm">No products yet</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;