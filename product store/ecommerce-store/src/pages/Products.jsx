import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts, getCategories } from "../api/api";
import ProductList from "../components/ProductList";
import ProductFilter from "../components/ProductFilter";

function Products() {
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get("category");
  const searchTerm = searchParams.get("search") || "";

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl || "All");
  const [sortOrder, setSortOrder] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getProducts()
      .then((data) => {
        setProducts(data);
        setError(null);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  
  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data);
      })
      .catch((err) => {
        console.error("Error fetching categories:", err);
      });
  }, []);

  let filteredProducts = [...products];

  if (searchTerm) {
    filteredProducts = filteredProducts.filter((product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }

  if (selectedCategory !== "All") {
    filteredProducts = filteredProducts.filter(
      (product) => product.category === selectedCategory
    );
  }

  if (sortOrder === "lowToHigh") {
    filteredProducts.sort((a, b) => a.price - b.price);
  }
  if (sortOrder === "highToLow") {
    filteredProducts.sort((a, b) => b.price - a.price);
  }

  if (loading) return <div className="text-center py-10">Loading products...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Products</h1>

      <div className="flex flex-col md:flex-row justify-between gap-4 mb-8">
        <ProductFilter
          categories={categories}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
        />
      </div>

      <ProductList products={filteredProducts} />
    </div>
  );
}

export default Products;