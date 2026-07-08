import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function CartItem({ item }) {
  const { increaseQuantity, decreaseQuantity, removeFromCart } = useCart();
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(`/products/${item.id}`)}
      className="bg-white rounded-xl border border-gray-100 p-4 flex flex-col md:flex-row gap-4 items-center cursor-pointer hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300"
    >
      {/* Image */}
      <div className="w-28 h-28 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden p-2">
        <img
          src={item.image}
          alt={item.name}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Info */}
      <div className="flex-1">
        <h3 className="font-bold text-lg mb-1">{item.name}</h3>
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full">
          {item.category}
        </span>
        <p className="font-bold text-blue-600 text-lg mt-2">₹{item.price}</p>
      </div>

      {/* Quantity Controls */}
      <div
        className="flex items-center gap-2"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => decreaseQuantity(item.id)}
          className="w-9 h-9 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-lg transition"
        >
          −
        </button>
        <span className="w-10 text-center font-bold text-lg">
          {item.quantity}
        </span>
        <button
          onClick={() => increaseQuantity(item.id)}
          className="w-9 h-9 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-lg transition"
        >
          +
        </button>
      </div>

      {/* Total Price */}
      <div className="text-right min-w-[80px]">
        <p className="text-xl font-bold text-gray-900">
          ₹{item.price * item.quantity}
        </p>
        {item.quantity > 1 && (
          <p className="text-xs text-gray-400">
            ₹{item.price} × {item.quantity}
          </p>
        )}
      </div>

      {/* Remove Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          removeFromCart(item.id);
        }}
        className="text-sm text-red-500 hover:text-red-700 font-medium transition"
      >
        Remove
      </button>
    </div>
  );
}

export default CartItem;