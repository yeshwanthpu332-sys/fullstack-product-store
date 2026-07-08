import { useState, useEffect } from "react";
import {
  getAdminCategories,
  getProducts,
  addCategory,
  deleteCategory,
  deleteProduct,
} from "../api/api";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("table");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [newCategory, setNewCategory] = useState("");

  const fetchCategories = () => {
    setLoading(true);
    getAdminCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchProducts = () => {
    getProducts({ limit: 100 })
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleAddCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await addCategory(newCategory);
      setNewCategory("");
      fetchCategories();
    } catch (err) {
      console.error("Error adding category:", err);
    }
  };

  const handleDeleteCategory = async (id) => {
    const confirm = window.confirm(
      "Are you sure you want to delete this category?"
    );
    if (!confirm) return;
    try {
      await deleteCategory(id);
      fetchCategories();
    } catch (err) {
      console.error("Error deleting category:", err);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    const confirm = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );
    if (!confirm) return;
    try {
      await deleteProduct(id);
      fetchProducts();
      fetchCategories();
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  const handleViewCategory = (category) => {
    setSelectedCategory(category);
    setProductSearchTerm("");
    setCurrentView("products");
  };

  const handleViewProduct = (product) => {
    setSelectedProduct(product);
    setActiveImage(product.image);
    setCurrentView("detail");
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const categoryProducts = selectedCategory
    ? products.filter(
        (product) => product.category === selectedCategory.name
      )
    : [];

  const filteredCategoryProducts = categoryProducts.filter((product) =>
    product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // ============ PRODUCT DETAIL VIEW ============
  if (currentView === "detail" && selectedProduct) {
    const images = selectedProduct.images || [];
    const allImages = images.length > 0 ? images : [selectedProduct.image];

    return (
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => {
              setSelectedProduct(null);
              setCurrentView("table");
            }}
            className="text-blue-600 hover:text-blue-800 font-medium transition"
          >
            Categories
          </button>
          <span className="text-gray-400">›</span>
          <button
            onClick={() => {
              setSelectedProduct(null);
              setCurrentView("products");
            }}
            className="text-blue-600 hover:text-blue-800 font-medium transition"
          >
            {selectedCategory?.name}
          </button>
          <span className="text-gray-400">›</span>
          <span className="text-gray-500 font-medium">Product Details</span>
        </div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">📦 Product Details</h1>
          <p className="text-gray-500 text-sm mt-1">
            View complete product information
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Side - Images */}
          <div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
              <div className="w-full h-72 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                <img
                  src={activeImage}
                  alt={selectedProduct.name}
                  className="max-w-full max-h-full object-contain"
                />
              </div>
            </div>

            {allImages.length > 1 && (
              <div className="flex gap-3 mt-4">
                {allImages.map((img, index) => (
                  <div
                    key={index}
                    onClick={() => setActiveImage(img)}
                    className={`w-20 h-20 bg-white rounded-xl shadow-md flex items-center justify-center overflow-hidden p-2 cursor-pointer transition ${
                      activeImage === img
                        ? "border-2 border-blue-500"
                        : "border border-gray-100 hover:border-blue-300"
                    }`}
                  >
                    <img
                      src={img}
                      alt={`Image ${index + 1}`}
                      className="max-w-full max-h-full object-contain"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Side - Product Info */}
          <div>
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6 mb-4">
              <h2 className="text-2xl font-bold mb-4">
                {selectedProduct.name}
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase mb-1">
                    💰 Price
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    ₹{selectedProduct.price}
                  </p>
                </div>

                <div className="bg-yellow-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase mb-1">
                    ⭐ Rating
                  </p>
                  <p className="text-2xl font-bold text-yellow-600">
                    {selectedProduct.rating} / 5
                  </p>
                </div>

                <div className="bg-blue-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase mb-1">
                    📂 Category
                  </p>
                  <p className="text-lg font-semibold text-blue-600">
                    {selectedProduct.category}
                  </p>
                </div>

                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-400 uppercase mb-1">
                    🆔 Product ID
                  </p>
                  <p className="text-lg font-semibold text-gray-600">
                    #{selectedProduct.id}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
              <h3 className="text-lg font-bold mb-3">📝 Description</h3>
              {selectedProduct.description ? (
                <p className="text-gray-600 leading-relaxed">
                  {selectedProduct.description}
                </p>
              ) : (
                <p className="text-gray-400 italic">
                  No description available
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ============ CATEGORY PRODUCTS VIEW ============
  if (currentView === "products" && selectedCategory) {
    return (
      <div>
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm mb-6">
          <button
            onClick={() => {
              setSelectedCategory(null);
              setProductSearchTerm("");
              setCurrentView("table");
            }}
            className="text-blue-600 hover:text-blue-800 font-medium transition"
          >
            Categories
          </button>
          <span className="text-gray-400">›</span>
          <span className="text-gray-500 font-medium">
            {selectedCategory.name}
          </span>
        </div>

        {/* Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            📂 {selectedCategory.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Showing all products in this category
          </p>

          <div className="mt-4">
            <input
              type="text"
              placeholder="🔍 Search products in this category..."
              value={productSearchTerm}
              onChange={(e) => setProductSearchTerm(e.target.value)}
              className="w-full md:w-1/2 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>
        </div>

        {/* Products Table */}
        {filteredCategoryProducts.length > 0 ? (
          <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                    Rating
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredCategoryProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleViewProduct(product)}
                  >
                    <td className="px-6 py-4 text-sm text-gray-600">
                      #{product.id}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="w-12 h-12 object-contain rounded-lg bg-gray-50"
                        />
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold">
                      ₹{product.price}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      ⭐ {product.rating}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteProduct(product.id, product.name);
                        }}
                        className="px-4 py-1.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
            <p className="text-3xl mb-2">📦</p>
            <p className="text-gray-400">No products found</p>
          </div>
        )}

        <div className="mt-4 text-sm text-gray-500">
          Total Products: {filteredCategoryProducts.length}
        </div>
      </div>
    );
  }

  // ============ ADD CATEGORY VIEW ============
if (currentView === "add") {
  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm mb-6">
        <button
          onClick={() => setCurrentView("table")}
          className="text-blue-600 hover:text-blue-800 font-medium transition"
        >
          Categories
        </button>
        <span className="text-gray-400">›</span>
        <span className="text-gray-500 font-medium">Add Category</span>
      </div>

      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">📂 Add New Category</h1>
        <p className="text-gray-500 text-sm mt-1">
          Create a new product category
        </p>
      </div>

      {/* Category Card */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8">
        {/* Input Section */}
        <div className="flex gap-3 mb-8">
          <input
            type="text"
            placeholder="Enter category name..."
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAddCategory()}
            className="flex-1 md:w-1/2 md:flex-none border border-gray-200 rounded-xl px-5 py-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
          />
          <button
            onClick={handleAddCategory}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            + Add
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200"></div>
          <span className="text-sm font-medium text-gray-400">
            Existing Categories ({categories.length})
          </span>
          <div className="flex-1 h-px bg-gray-200"></div>
        </div>

        {/* Categories List */}
        {categories.length > 0 ? (
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <div
                key={cat.id}
                className="group flex items-center gap-3 bg-purple-50 border border-purple-100 px-5 py-3 rounded-xl shadow-sm hover:shadow-md hover:border-purple-300 transition-all duration-200"
              >
                <span className="text-sm font-semibold text-purple-700">
                  {cat.name}
                </span>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="w-6 h-6 flex items-center justify-center bg-red-100 text-red-500 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 hover:bg-red-500 hover:text-white transition-all duration-200"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-3xl mb-2">📂</p>
            <p className="text-gray-400 text-sm">
              No categories yet. Add your first category above!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

  // ============ DEFAULT TABLE VIEW ============
  return (
    <div>
      {/* Header Section */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
          <div>
            <h1 className="text-3xl font-bold">Categories</h1>
            <p className="text-gray-500 text-sm mt-1">
              Browse and manage all product categories
            </p>
          </div>

          <button
            onClick={() => setCurrentView("add")}
            className="px-6 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition"
          >
            + Add Category
          </button>
        </div>

        <div className="mt-4">
          <input
            type="text"
            placeholder="🔍 Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Categories Table */}
      {filteredCategories.length > 0 ? (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  ID
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Category Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Products
                </th>
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {filteredCategories.map((category) => (
                <tr
                  key={category.id}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewCategory(category)}
                >
                  <td className="px-6 py-4 text-sm text-gray-600">
                    #{category.id}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium">{category.name}</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {category.product_count}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category.id);
                      }}
                      className="px-4 py-1.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition text-sm"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-md border border-gray-100">
          <p className="text-3xl mb-2">📂</p>
          <p className="text-gray-400">No categories found</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-500">
        Total Categories: {filteredCategories.length}
      </div>
    </div>
  );
}

export default Categories;