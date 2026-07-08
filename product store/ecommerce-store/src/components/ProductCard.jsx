import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";

function ProductCard({ product }) {
  const navigate = useNavigate();
  const { cart, addToCart, increaseQuantity, decreaseQuantity } = useCart();
  const { wishlist, toggleWishlist } = useWishlist();

  const cartItem = cart.find((item) => item.id === product.id);
  const isWishlisted = wishlist.find((item) => item.id === product.id);

  return (
    <div
      onClick={() => navigate(`/products/${product.id}`)}
      className="group bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer h-full flex flex-col border border-gray-100"
    >
      {/* Image Section */}
      <div className="relative">
        <div className="w-full h-56 flex items-center justify-center bg-white overflow-hidden p-4">
          <img
            src={product.image}
            alt={product.name}
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
          />
        </div>

        {/* Wishlist Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleWishlist(product);
          }}
          className={`absolute top-3 right-3 w-10 h-10 flex items-center justify-center rounded-full shadow-md transition hover:scale-110 ${
            isWishlisted ? "bg-red-100" : "bg-white"
          }`}
        >
          {isWishlisted ? "❤️" : "🤍"}
        </button>

        {/* Rating Badge */}
        <div className="absolute top-3 left-3 bg-white/90 px-2 py-1 rounded-lg shadow-sm flex items-center gap-1">
          <span className="text-yellow-500 text-xs">⭐</span>
          <span className="text-xs font-bold text-gray-700">
            {product.rating}
          </span>
        </div>
      </div>

      {/* Info Section */}
      <div className="p-4 flex flex-col flex-1">
        <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit mb-2">
          {product.category}
        </span>

        <h3 className="text-lg font-bold mb-2 min-h-[56px]">
          {product.name}
        </h3>

        <p className="text-xl font-bold text-blue-600 mb-4">
          ₹{product.price}
        </p>

        {/* Cart Button */}
        <div
          className="mt-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {cartItem ? (
            <div className="w-full flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-2">
              <button
                onClick={() => decreaseQuantity(product.id)}
                className="w-9 h-9 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-lg transition"
              >
                −
              </button>

              <span className="text-lg font-bold text-green-700">
                {cartItem.quantity}
              </span>

              <button
                onClick={() => increaseQuantity(product.id)}
                className="w-9 h-9 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full font-bold text-lg transition"
              >
                +
              </button>
            </div>
          ) : (
            <button
              onClick={() => addToCart(product)}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg transition"
            >
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductCard;