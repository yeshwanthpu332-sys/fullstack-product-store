import { Link, useParams } from "react-router-dom";

function OrderSuccess() {
  const { id } = useParams();

  return (
    <div className="max-w-lg mx-auto px-4 py-20 text-center">
      <div className="bg-white rounded-xl shadow-lg p-10">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">✅</span>
        </div>

        <h1 className="text-3xl font-bold mb-4">Order Placed!</h1>

        <p className="text-gray-500 mb-2">
          Your order has been placed successfully.
        </p>

        <p className="text-lg font-semibold text-blue-600 mb-2">
          Order ID: #{id}
        </p>

        <p className="text-sm text-gray-400 mb-8">
          Payment: Cash on Delivery (COD)
        </p>

        <div className="flex gap-4 justify-center">
          <Link
            to="/orders"
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
          >
            View Orders
          </Link>

          <Link
            to="/products"
            className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition"
          >
            Shop More
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;