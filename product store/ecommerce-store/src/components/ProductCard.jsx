import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import Button from "./Button";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart();

  // Check if item is already in cart
  const cartItem = cart.find((item) => item.id === product.id);

  const { wishlist, toggleWishlist } = useWishlist();

  const isWishlisted = wishlist.find(
    (item) => item.id === product.id
  );

  return (
  <div
    onClick={() => navigate(`/products/${product.id}`)}
    className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-transform duration-300 hover:scale-105 cursor-pointer"
  >
    <div className="relative">
  <div className="w-full h-56 flex items-center justify-center bg-white overflow-hidden">
    <img
      src={product.image}
      alt={product.name}
      className="max-h-full max-w-full object-contain transition-transform duration-300 hover:scale-105"
    />
  </div>

      <button
  onClick={(e) => {
    e.stopPropagation();
    toggleWishlist(product);
  }}
  className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full shadow-md transition hover:scale-110 ${
    isWishlisted
      ? "bg-red-100"
      : "bg-white"
  }`}
>
  {isWishlisted ? "❤️" : "🤍"}
</button>
    </div>

    <div className="p-4">
        <h3 className="text-lg font-bold mb-2">
          {product.name}
        </h3>

        <p className="text-gray-600 text-sm mb-2">
          {product.category}
        </p>

        <p className="text-xl font-bold text-blue-600 mb-4">
          ₹{product.price}
        </p>

        <div className="flex gap-2">
          {/* View Details Button */}
          <Link
            to={`/products/${product.id}`}
            className="flex-1"
          >
            <Button className="w-full">
              View Details
            </Button>
          </Link>

          {/* Add to Cart OR Quantity Controls */}
          {cartItem ? (
            <div className="flex-1 flex items-center justify-center gap-3 bg-green-50 border border-green-200 rounded-lg px-2">
              <button
                onClick={(e) => { 
                  e.stopPropagation();
                  decreaseQuantity(product.id);}}
                className="w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-lg transition"
              >
                −
              </button>

              <span className="text-lg font-bold text-green-700 min-w-[20px] text-center">
                {cartItem.quantity}
              </span>

              <button
                onClick={(e) => { 
                  e.stopPropagation();
                  increaseQuantity(product.id);}}
                className="w-8 h-8 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-lg transition"
              >
                +
              </button>
            </div>
          ) : (
            <Button
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={(e) => {
              e.stopPropagation();
              addToCart(product);}}
            >
              Add to Cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;