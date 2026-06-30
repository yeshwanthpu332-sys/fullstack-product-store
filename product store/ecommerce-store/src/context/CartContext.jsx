import { createContext, useContext, useEffect, useState } from "react";
import {
  getCart,
  addToCartAPI,
  increaseCartItem,
  decreaseCartItem,
  removeCartItem,
  clearCartAPI,
} from "../api/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { isLoggedIn } = useAuth();
  const [cart, setCart] = useState([]);

  const fetchCart = async () => {
    try {
      const data = await getCart();
      setCart(data);
    } catch (err) {
      console.error("Error fetching cart:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchCart();
    } else {
      setCart([]);
    }
  }, [isLoggedIn]);

  const addToCart = async (product) => {
    if (!isLoggedIn) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      await addToCartAPI(product.id);
      fetchCart();
    } catch (err) {
      console.error("Error adding to cart:", err);
    }
  };

  const increaseQuantity = async (id) => {
    try {
      await increaseCartItem(id);
      fetchCart();
    } catch (err) {
      console.error("Error increasing quantity:", err);
    }
  };

  const decreaseQuantity = async (id) => {
    try {
      await decreaseCartItem(id);
      fetchCart();
    } catch (err) {
      console.error("Error decreasing quantity:", err);
    }
  };

  const removeFromCart = async (id) => {
    try {
      await removeCartItem(id);
      fetchCart();
    } catch (err) {
      console.error("Error removing item:", err);
    }
  };

  const clearCart = async () => {
    try {
      await clearCartAPI();
      setCart([]);
    } catch (err) {
      console.error("Error clearing cart:", err);
    }
  };

  const totalPrice = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  const totalItems = cart.reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        totalPrice,
        totalItems,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);