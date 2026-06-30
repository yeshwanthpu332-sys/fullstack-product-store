import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";
import Button from "../components/Button";

function Cart() {
  const {
    cart,
    totalPrice,
    totalItems,
    clearCart,
  } = useCart();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        Shopping Cart
      </h1>

      {cart.length === 0 ? (
        <div className="bg-white p-10 rounded-lg shadow text-center">
          <h2 className="text-2xl font-semibold mb-4">
            Your cart is empty 🛒
          </h2>
          <p className="text-gray-500 mb-6">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Link to="/products">
            <Button className="bg-blue-600 hover:bg-blue-700 px-8">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {cart.map((item) => (
              <CartItem
                key={item.id}
                item={item}
              />
            ))}
          </div>

  {/* Updated Total Box */}
<div className="mt-8 bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl shadow-lg p-8">
  <h2 className="text-xl font-semibold text-gray-500 mb-4">
    Order Summary
  </h2>

  <div className="border-b border-gray-200 pb-4 mb-4">
    <div className="flex justify-between text-gray-600">
      <span>Total Items</span>
      <span className="font-medium">{totalItems}</span>
    </div>
  </div>

  <div className="flex justify-between items-center mb-6">
    <h2 className="text-2xl font-bold text-gray-800">
      Total Amount
    </h2>
    <span className="text-3xl font-bold text-green-600">
      ₹{totalPrice}
    </span>
  </div>

  <div className="flex justify-between items-center">
    <Link to="/products">
      <button className="px-6 py-2 bg-blue-100 text-blue-700 font-semibold border border-blue-300 rounded-lg hover:bg-blue-200 transition">
        ← Continue Shopping
      </button>
    </Link>

    <Button
      onClick={clearCart}
      className="bg-red-600 hover:bg-red-700 px-6"
    >
      Clear Cart
    </Button>
  </div>
</div>
        </>
      )}
    </div>
  );
}

export default Cart;