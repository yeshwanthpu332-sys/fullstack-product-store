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
    getProducts()
      .then((res) => {
        setProducts(res);
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
      <section className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white rounded-2xl p-10 md:p-16 text-center shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 rounded-2xl"></div>

        <div className="relative z-10">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-4 tracking-tight">
            Welcome to <span className="text-yellow-300">ShopEase</span>
          </h1>

          <p className="text-lg md:text-xl mb-8 text-blue-100 max-w-2xl mx-auto">
            Discover amazing products at great prices. Shop the latest trends with fast delivery.
          </p>

          <Link to="/products">
            <button className="px-10 py-4 bg-white text-blue-700 font-bold text-lg rounded-full shadow-lg hover:bg-yellow-300 hover:text-gray-900 hover:scale-105 transition-all duration-300">
             Shop Now
            </button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="mt-12">
        <h2 className="text-3xl font-bold mb-6">Categories</h2>
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
      <section className="mt-12">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-bold">Featured Products</h2>
        </div>
        <ProductList products={featuredProducts} />
      </section>
    </div>
  );
}

export default Home;