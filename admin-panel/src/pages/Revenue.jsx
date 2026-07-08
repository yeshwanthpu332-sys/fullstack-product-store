import { useState, useEffect } from "react";
import { getRevenue } from "../api/api";

function Revenue() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRevenue()
      .then((res) => setData(res))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="text-center py-20">Loading revenue...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Revenue</h1>

      {/* Revenue Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <div className="bg-green-50 rounded-xl p-6 shadow-md">
          <p className="text-sm font-semibold text-green-600 uppercase">
            Total Revenue
          </p>
          <p className="text-3xl font-bold text-green-700 mt-2">
            ₹{data?.totalRevenue || 0}
          </p>
        </div>

        <div className="bg-blue-50 rounded-xl p-6 shadow-md">
          <p className="text-sm font-semibold text-blue-600 uppercase">
            Successful Orders
          </p>
          <p className="text-3xl font-bold text-blue-700 mt-2">
            {data?.totalOrders || 0}
          </p>
        </div>

        <div className="bg-red-50 rounded-xl p-6 shadow-md">
          <p className="text-sm font-semibold text-red-600 uppercase">
            Cancelled Orders
          </p>
          <p className="text-3xl font-bold text-red-700 mt-2">
            {data?.cancelledOrders || 0}
          </p>
          <p className="text-xs text-red-400 mt-1">
            Not included in revenue
          </p>
        </div>
      </div>

      {/* Orders Revenue Table */}
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-800">
            Order Revenue Breakdown
          </h2>
        </div>

        {data?.orders?.length ? (
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Order
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Date
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Amount
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {data.orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium">
                    #{order.id}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {order.customer_name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-3 py-1 text-xs font-bold rounded-full ${
                        order.status === "Delivered"
                          ? "bg-green-100 text-green-700"
                          : order.status === "Shipped"
                          ? "bg-yellow-100 text-yellow-700"
                          : order.status === "Confirmed"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 font-bold text-green-600">
                    ₹{order.total_amount}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="text-center py-10 text-gray-500">
            No orders yet
          </div>
        )}
      </div>
    </div>
  );
}

export default Revenue;