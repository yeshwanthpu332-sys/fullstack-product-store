import { createContext, useContext, useEffect, useState } from "react";
import {
  getWishlist,
  toggleWishlistAPI,
  removeWishlistItem,
} from "../api/api";
import { useAuth } from "./AuthContext";

const WishlistContext = createContext();

export function WishlistProvider({ children }) {
  const { isLoggedIn } = useAuth();
  const [wishlist, setWishlist] = useState([]);

  const fetchWishlist = async () => {
    try {
      const data = await getWishlist();
      setWishlist(data);
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchWishlist();
    } else {
      setWishlist([]);
    }
  }, [isLoggedIn]);

  const toggleWishlist = async (product) => {
    if (!isLoggedIn) {
      alert("Please login to add items to wishlist");
      return;
    }

    try {
      await toggleWishlistAPI(product.id);
      fetchWishlist();
    } catch (err) {
      console.error("Error toggling wishlist:", err);
    }
  };

  const removeFromWishlist = async (id) => {
    try {
      await removeWishlistItem(id);
      fetchWishlist();
    } catch (err) {
      console.error("Error removing from wishlist:", err);
    }
  };

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        fetchWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}