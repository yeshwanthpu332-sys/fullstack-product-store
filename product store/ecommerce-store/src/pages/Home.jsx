import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getProducts, getCategories } from "../api/api";
import ProductList from "../components/ProductList";

function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts({ page: 1, limit: 8 })
      .then((res) => {
        setProducts(res.products || []);
        setError(null);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load products. Please try again later.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  }, []);

  const featuredProducts = products.slice(0, 4);

  const categoryIcons = {
    Electronics: "🎧",
    Fashion: "👕",
    Home: "🏠",
    Fitness: "💪",
    Accessories: "🎒",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-10 md:p-16 text-center shadow-xl overflow-hidden">
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-72 h-72 bg-white/10 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full translate-x-1/3 translate-y-1/3"></div>
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-white/5 rounded-full"></div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Welcome to <span className="text-yellow-300">ShopEase</span>
          </h1>

          <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Discover amazing products at great prices. Shop the latest trends
            with fast delivery.
          </p>

          <Link to="/products">
            <button className="px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-full shadow-lg hover:bg-yellow-300 hover:text-gray-900 hover:scale-105 transition-all duration-300">
              Shop Now →
            </button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold">Shop by Category</h2>
          <p className="text-gray-500 text-sm mt-2">
            Browse products by your favorite categories
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {categories.map((category) => (
            <Link
              key={category.id}
              to={`/products?category=${category.name}`}
              className="bg-white shadow rounded-xl p-6 text-center font-semibold hover:shadow-xl hover:scale-105 transition"
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-4xl">
                  {categoryIcons[category.name] || "📦"}
                </span>
                <span>{category.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="mt-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold">Featured Products</h2>
            <p className="text-gray-500 text-sm mt-1">
              Handpicked products just for you
            </p>
          </div>
          <Link
            to="/products"
            className="text-blue-600 hover:text-blue-800 font-medium transition"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10 text-red-500">{error}</div>
        ) : (
          <ProductList products={featuredProducts} />
        )}
      </section>

      {/* Bottom Banner */}
      <section className="mt-16 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-2xl p-10 md:p-14 text-center shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full translate-x-1/3 -translate-y-1/3"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 rounded-full -translate-x-1/3 translate-y-1/3"></div>

        <div className="relative z-10">
          <h2 className="text-2xl md:text-4xl font-bold mb-3">
            Get the Best Deals Today! 🔥
          </h2>
          <p className="text-gray-300 mb-6 max-w-xl mx-auto">
            Free delivery on orders above ₹499. Shop now and save big!
          </p>
          <Link to="/products">
            <button className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full hover:scale-105 transition-all duration-300">
              Explore Products →
            </button>
          </Link>
        </div>
      </section>

      <div className="mt-8"></div>
    </div>
  );
}

export default Home;