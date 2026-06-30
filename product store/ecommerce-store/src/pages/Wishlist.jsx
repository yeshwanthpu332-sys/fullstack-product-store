import { useWishlist } from "../context/WishlistContext";
import ProductList from "../components/ProductList";

function Wishlist() {
  const { wishlist } = useWishlist();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">
        My Wishlist ❤️
      </h1>

      {wishlist.length === 0 ? (
        <div className="bg-white p-10 rounded-lg shadow text-center">
          <h2 className="text-2xl font-semibold">
            Your wishlist is empty
          </h2>
        </div>
      ) : (
        <ProductList products={wishlist} />
      )}
    </div>
  );
}

export default Wishlist;