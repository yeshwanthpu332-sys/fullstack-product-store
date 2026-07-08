import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { getProducts, getCategories } from "../api/api";
import ProductList from "../components/ProductList";
import ProductFilter from "../components/ProductFilter";
import Pagination from "../components/Pagination";

function Products() {
  const [searchParams, setSearchParams] = useSearchParams();

  const categoryFromUrl = searchParams.get("category") || "All";
  const searchTerm = searchParams.get("search") || "";
  const pageFromUrl = parseInt(searchParams.get("page")) || 1;

  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [sortOrder, setSortOrder] = useState("");
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [debouncedMinPrice, setDebouncedMinPrice] = useState("");
  const [debouncedMaxPrice, setDebouncedMaxPrice] = useState("");

  const itemsPerPage = 4;

  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Keep selectedCategory synced with URL
  useEffect(() => {
    setSelectedCategory(categoryFromUrl);
  }, [categoryFromUrl]);

  // Debounce price filter
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedMinPrice(minPrice);
      setDebouncedMaxPrice(maxPrice);

      const params = new URLSearchParams(searchParams);
      params.set("page", 1);
      setSearchParams(params);
    }, 500);

    return () => clearTimeout(timer);
  }, [minPrice, maxPrice]);

  // Fetch products
  useEffect(() => {
    setLoading(true);
    setError(null);

    const opts = {
      page: pageFromUrl,
      limit: itemsPerPage,
      sort: sortOrder || undefined,
      category: selectedCategory !== "All" ? selectedCategory : undefined,
      search: searchTerm || undefined,
      minPrice: debouncedMinPrice || undefined,
      maxPrice: debouncedMaxPrice || undefined,
    };

    getProducts(opts)
      .then((data) => {
        setProducts(data.products || []);
        setTotalPages(data.totalPages || 1);
        setTotalItems(data.totalItems || 0);
      })
      .catch((err) => {
        console.error("Error fetching products:", err);
        setError("Failed to load products");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [
    selectedCategory,
    sortOrder,
    searchTerm,
    pageFromUrl,
    debouncedMinPrice,
    debouncedMaxPrice,
  ]);

  // Fetch categories
  useEffect(() => {
    getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error("Error fetching categories:", err));
  }, []);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);

    const params = new URLSearchParams(searchParams);
    params.set("page", 1);

    if (category !== "All") {
      params.set("category", category);
    } else {
      params.delete("category");
    }

    setSearchParams(params);
  };

  const handleSortChange = (sort) => {
    setSortOrder(sort);

    const params = new URLSearchParams(searchParams);
    params.set("page", 1);
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page);
    setSearchParams(params);
  };

  if (error && !products.length) {
    return <div className="text-center py-10 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8">Products</h1>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filter */}
        <div className="w-full md:w-72 flex-shrink-0">
          <ProductFilter
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={handleCategoryChange}
            sortOrder={sortOrder}
            setSortOrder={handleSortChange}
            minPrice={minPrice}
            maxPrice={maxPrice}
            setMinPrice={setMinPrice}
            setMaxPrice={setMaxPrice}
          />
        </div>

        {/* Products Section */}
        <div className="flex-1">
          {loading ? (
            <div className="text-center py-10">Loading products...</div>
          ) : error ? (
            <div className="text-center py-10 text-red-500">{error}</div>
          ) : (
            <ProductList products={products} />
          )}

          <div className="mt-8">
            <Pagination
              currentPage={pageFromUrl}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Products;