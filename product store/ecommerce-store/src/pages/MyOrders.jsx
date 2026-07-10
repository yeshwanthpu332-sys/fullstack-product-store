import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getOrders, cancelOrder } from "../api/api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = () => {
    setLoading(true);
    getOrders()
      .then((data) => setOrders(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleCancel = async (orderId) => {
    const confirm = window.confirm("Are you sure you want to cancel this order?");
    if (!confirm) return;

    try {
      await cancelOrder(orderId);
      fetchOrders();
    } catch (err) {
      console.error("Error cancelling order:", err);
    }
  };

  if (loading) {
    return <div className="text-center py-20">Loading orders...</div>;
  }

  if (!orders.length) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-4">No Orders Yet</h1>
        <p className="text-gray-500">You haven't placed any orders yet.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden"
          >
            {/* Order Header */}
            <div className="bg-gray-50 px-6 py-4 flex flex-wrap justify-between items-center gap-4">
              <div className="flex gap-6">
                <div>
                  <p className="text-xs text-gray-400 uppercase">Order ID</p>
                  <p className="font-bold">#{order.id}</p>
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
              </div>

              <div className="flex gap-4 items-center">
                <span
                  className={`px-3 py-1 text-xs font-bold rounded-full ${
                    order.status === "Cancelled"
                      ? "bg-red-100 text-red-700"
                      : "bg-blue-100 text-blue-700"
                  }`}
                >
                  {order.status}
                </span>

                <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full">
                  {order.payment_method}
                </span>
              </div>
            </div>

            {/* Order Items */}
            <div className="p-6">
              <div className="space-y-4">
                {order.items?.map((item) => (
                  <Link
                    to={`/products/${item.product_id}`}
                    key={item.id}
                    className="flex items-center justify-between gap-4 p-3 rounded-lg hover:bg-gray-50 transition cursor-pointer"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-14 h-14 object-contain rounded-lg bg-gray-50"
                      />
                      <div>
                        <p className="font-medium hover:text-blue-600 transition">{item.name}</p>
                        <p className="text-gray-500 text-sm">
                          Qty: {item.quantity} × ₹{item.price}
                        </p>
                      </div>
                    </div>

                    <p className="font-semibold">
                      ₹{item.quantity * item.price}
                    </p>
                  </Link>
                ))}
              </div>

              {/* Shipping Address */}
              <div className="mt-6 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-400 uppercase mb-2">
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

              {/* Cancel Button */}
              {order.status !== "Cancelled" && order.status !== "Delivered" && (
                <div className="mt-6 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleCancel(order.id)}
                    className="px-6 py-2 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition"
                  >
                    Cancel Order
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default MyOrders;