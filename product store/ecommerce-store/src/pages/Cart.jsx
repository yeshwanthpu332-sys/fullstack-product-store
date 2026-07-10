import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import CartItem from "../components/CartItem";

function Cart() {
  const { cart, totalPrice, totalItems, clearCart } = useCart();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {cart.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-6xl mb-4">🛒</p>
          <h1 className="text-3xl font-bold mb-2">Your cart is empty</h1>
          <p className="text-gray-500 mb-8">
            Looks like you haven't added anything to your cart yet
          </p>
          <Link to="/products">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition">
              Start Shopping →
            </button>
          </Link>
        </div>
      ) : (
        <div>
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <h1 className="text-3xl font-bold">Shopping Cart</h1>
              <p className="text-gray-500 text-sm mt-1">
                You have {totalItems} {totalItems === 1 ? "item" : "items"} in
                your cart
              </p>
            </div>
            <button
              onClick={clearCart}
              className="px-5 py-2.5 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-xl border border-red-200 transition"
            >
               Clear Cart
            </button>
          </div>

          {/* Cart Items + Summary */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Cart Items */}
            <div className="flex-1 space-y-4">
              {cart.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>

            {/* Order Summary */}
            <div className="w-full lg:w-80">
              <div className="bg-white rounded-xl border border-gray-100 shadow-md p-6 lg:sticky lg:top-24">
                <h2 className="text-lg font-bold mb-4">Order Summary</h2>
                <div className="h-px bg-gray-100 mb-4"></div>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>
                      Subtotal ({totalItems}{" "}
                      {totalItems === 1 ? "item" : "items"})
                    </span>
                    <span className="font-medium">₹{totalPrice}</span>
                  </div>

                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Delivery</span>
                    <span className="font-medium text-green-600">Free</span>
                  </div>
                </div>

                <div className="h-px bg-gray-200 mb-4"></div>

                <div className="flex justify-between items-center mb-6">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-2xl font-bold text-green-600">
                    ₹{totalPrice}
                  </span>
                </div>

                <Link to="/checkout">
                  <button className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition mb-3">
                    Proceed to Checkout →
                  </button>
                </Link>

                <Link to="/products">
                  <button className="w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 font-semibold rounded-xl border border-gray-200 transition">
                    ← Continue Shopping
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Cart;