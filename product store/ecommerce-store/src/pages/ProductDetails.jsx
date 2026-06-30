import { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import { getProductById } from "../api/api";
import { useCart } from "../context/CartContext";
import Button from "../components/Button";
import ErrorMessage from "../components/ErrorMessage";

function ProductDetails() {
  const { id } = useParams();
  const { addToCart, cart, increaseQuantity, decreaseQuantity } = useCart();
  const [product, setProduct] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProductById(id)
      .then((data) => {
        setProduct(data);
      })
      .catch((err) => {
        console.error("Error fetching product:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id]);

  const cartItem = cart?.find((item) => item.id === Number(id));

  if (loading) {
    return <div className="text-center py-20">Loading product...</div>;
  }

  if (!product) {
    return <ErrorMessage message="Product not found" />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div className="flex flex-col">
          <div className="w-full h-[450px] bg-white rounded-lg shadow flex items-center justify-center overflow-hidden">
            <img
              src={product.images?.[currentImage] || product.image}
              alt={product.name}
              className="max-h-full max-w-full object-contain"
            />
          </div>

          <div className="mt-4">
            <div className="flex justify-between">
              <button
                onClick={() =>
                  setCurrentImage(
                    currentImage === 0
                      ? product.images.length - 1
                      : currentImage - 1
                  )
                }
                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full shadow"
              >
                ←
              </button>

              <button
                onClick={() =>
                  setCurrentImage(
                    (currentImage + 1) % product.images.length
                  )
                }
                className="w-10 h-10 flex items-center justify-center bg-gray-100 hover:bg-gray-200 rounded-full shadow"
              >
                →
              </button>
            </div>

            {/* Dot indicators */}
            <div className="flex justify-center gap-2 mt-3">
              {(product.images || []).map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentImage(index)}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-200 ${
                    currentImage === index
                      ? "bg-blue-600 scale-125"
                      : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-4">{product.category}</p>
          <p className="text-yellow-500 text-lg mb-4">⭐ {product.rating}</p>
          <p className="text-3xl font-bold text-blue-600 mb-6">
            ₹{product.price}
          </p>
          <p className="text-gray-700 mb-8">{product.description}</p>

          {cartItem ? (
            <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-2 w-fit">
              <button
                onClick={() => decreaseQuantity(product.id)}
                className="w-8 h-8 bg-green-600 text-white rounded-full"
              >
                −
              </button>
              <span className="font-bold text-green-700">
                {cartItem.quantity}
              </span>
              <button
                onClick={() => increaseQuantity(product.id)}
                className="w-8 h-8 bg-green-600 text-white rounded-full"
              >
                +
              </button>
            </div>
          ) : (
            <Button
              onClick={() => addToCart(product)}
              className="bg-green-600 hover:bg-green-700"
            >
              Add To Cart
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;