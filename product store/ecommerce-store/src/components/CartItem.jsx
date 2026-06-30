import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import Button from "./Button";

function CartItem({ item }) {
  const {
    increaseQuantity,
    decreaseQuantity,
    removeFromCart,
  } = useCart();

const navigate = useNavigate();

  return (
    <div 
    onClick={() => navigate(`/products/${item.id}`)}
    className="bg-white shadow-md rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center cursor-pointer hover:shadow-lg transition">
      <img
        src={item.image}
        alt={item.name}
        className="w-28 h-28 object-cover rounded"
      />

      <div className="flex-1">
        <h3 className="font-bold text-lg">
          {item.name}
        </h3>

        <p className="text-gray-600">
          {item.category}
        </p>

        <p className="font-semibold text-blue-600">
          ₹{item.price}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <Button
          className="px-3"
          onClick={(e) => {
            e.stopPropagation();
            decreaseQuantity(item.id);
          }}
        >
          -
        </Button>

        <span className="font-bold text-lg">
          {item.quantity}
        </span>

        <Button
          className="px-3"
          onClick={(e) => {
            e.stopPropagation();
            increaseQuantity(item.id);
          }}
        >
          +
        </Button>
      </div>

      <div className="text-lg font-bold">
        ₹{item.price * item.quantity}
      </div>

      <Button
        className="bg-red-600 hover:bg-red-700"
        onClick={(e) => {
          e.stopPropagation();
          removeFromCart(item.id)
        }}
      >
        Remove
      </Button>
    </div>
  );
}

export default CartItem;