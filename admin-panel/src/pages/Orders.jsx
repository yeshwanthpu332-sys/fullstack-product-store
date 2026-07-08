import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getAdminOrders, updateOrderStatus } from "../api/api";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchParams] = useSearchParams();
  const isManageMode = searchParams.get("manage") === "true";

  const fetchOrders = () => {
    setLoading(true);
    getAdminOrders()
      .then((data) => setOrders(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      fetchOrders();
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  const statusColors = {
    Placed: "bg-blue-100 text-blue-700",
    Confirmed: "bg-purple-100 text-purple-700",
    Shipped: "bg-yellow-100 text-yellow-700",
    Delivered: "bg-green-100 text-green-700",
    Cancelled: "bg-red-100 text-red-700",
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.user_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toString().includes(searchTerm) ||
      order.status?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-20">Loading orders...</div>;
  }

  if (!orders.length) {
    return (
      <div className="text-center py-16">
        <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
        <p className="text-gray-500">No orders have been placed yet.</p>
      </div>
    );
  }

  return (
    <div>
      {/* ============ HEADER SECTION ============ */}
      <div className="mb-8">
        <div>
          <h1 className="text-3xl font-bold">Orders</h1>
          <p className="text-gray-500 text-sm mt-1">
            Track and manage all customer orders.
          </p>
        </div>

        <div className="mt-4">
          <input
            type="text"
            placeholder="🔍 Search by name, email, ID or status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* ============ ORDERS LIST ============ */}
      <div className="space-y-6">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
          >
            <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Order ID</p>
                  <p className="font-bold">#{order.id}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase">Customer</p>
                  <p className="font-medium text-sm">{order.user_name}</p>
                  <p className="text-xs text-gray-400">{order.user_email}</p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase">Date</p>
                  <p className="font-medium text-sm">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase">Total</p>
                  <p className="font-bold text-green-600">
                    ₹{order.total_amount}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase">Payment</p>
                  <p className="font-medium text-sm">
                    {order.payment_method}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
  {order.status === "Cancelled" || order.status === "Delivered" ? (
    <span
      className={`px-4 py-1.5 text-sm font-bold rounded-full ${
        order.status === "Cancelled"
          ? "bg-red-100 text-red-700"
          : "bg-green-100 text-green-700"
      }`}
    >
      {order.status === "Cancelled"
        ? "❌ Cancelled"
        : "✅ Delivered"}
    </span>
  ) : (
   <div className="relative">
  <select
    value={order.status}
    onChange={(e) =>
      handleStatusChange(order.id, e.target.value)
    }
    className={`pr-8 pl-4 py-1.5 text-sm font-bold rounded-full appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-300 ${
      statusColors[order.status] || "bg-gray-100 text-gray-700"
    }`}
  >
    <option className="bg-white text-gray-700" value="Placed">Placed</option>
    <option className="bg-white text-gray-700" value="Confirmed">Confirmed</option>
    <option className="bg-white text-gray-700" value="Shipped">Shipped</option>
    <option className="bg-white text-gray-700" value="Delivered">Delivered</option>
    <option className="bg-white text-gray-700" value="Cancelled">Cancelled</option>
  </select>
  <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs">
    ▼
  </span>
</div>
  )}
</div>
            </div>

            <div className="p-6">
              <div className="space-y-3">
                {order.items?.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded-lg bg-gray-50"
                      />
                      <div>
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-gray-500 text-xs">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold text-sm">
                      ₹{item.quantity * item.price}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase mb-1">
                  Shipping Address
                </p>
                <p className="text-sm text-gray-600">
                  {order.full_name}, {order.address}, {order.city} -{" "}
                  {order.pincode}
                </p>
                <p className="text-sm text-gray-600">
                  Phone: {order.phone}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Total Orders: {filteredOrders.length}
      </div>
    </div>
  );
}

export default Orders;