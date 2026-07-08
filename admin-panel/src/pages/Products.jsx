import { useState, useEffect } from "react";
import {
  getProducts,
  getCategories,
  addProduct,
  updateProduct,
  deleteProduct,
  addCategory,
  deleteCategory,
} from "../api/api";
import { useSearchParams } from "react-router-dom";
import { uploadImage } from "../utils/uploadImage";

function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState("table");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [activeImage, setActiveImage] = useState("");
  const [editingProduct, setEditingProduct] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [searchParams] = useSearchParams();
  const isManageMode = searchParams.get("manage") === "true";

  const [formData, setFormData] = useState({
  name: "",
  price: "",
  category_id: "",
  rating: "",
  description: "",
});

  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);
  const [imageUrls, setImageUrls] = useState([]);
  const [imageUploading, setImageUploading] = useState(false);
  const [pasteUrl, setPasteUrl] = useState("");

  const fetchProducts = () => {
    setLoading(true);
    getProducts({ limit: 100 })
      .then((data) => setProducts(data.products || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    getCategories()
      .then((data) => setCategories(data))
      .catch((err) => console.error(err));
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const resetForm = () => {
  setFormData({
    name: "",
    price: "",
    category_id: "",
    rating: "",
    description: "",
  });
  setImageUrls([]);
  setPasteUrl("");
  setEditingProduct(null);
  setFormError("");
  setCurrentView("table");
};

  const handleEdit = (product) => {
  const cat = categories.find((c) => c.name === product.category);
  const images = product.images || [];
  const allImages = images.length > 0 ? images : product.image ? [product.image] : [];
  setFormData({
    name: product.name,
    price: product.price,
    category_id: cat ? cat.id : "",
    rating: product.rating,
    description: product.description || "",
  });
  setImageUrls(allImages);
  setEditingProduct(product);
  setCurrentView("form");
};

  const handleViewDetail = (product) => {
  setSelectedProduct(product);
  setActiveImage(product.image);
  setCurrentView("detail");
};

  const handleSubmit = async (e) => {
  e.preventDefault();
  setFormError("");

  if (imageUrls.length === 0) {
    setFormError("Please add at least one image");
    return;
  }

  setFormLoading(true);

  try {
    const productData = {
      name: formData.name,
      price: parseInt(formData.price),
      category_id: parseInt(formData.category_id),
      rating: parseFloat(formData.rating) || 0,
      image: imageUrls[0],
      images: imageUrls,
      description: formData.description,
    };

    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }

    resetForm();
    fetchProducts();
  } catch (err) {
    setFormError(err.response?.data?.error || "Failed to save product");
  } finally {
    setFormLoading(false);
  }
};

  const handleDelete = async (id, name) => {
    const confirm = window.confirm(
      `Are you sure you want to delete "${name}"?`
    );
    if (!confirm) return;

    try {
      await deleteProduct(id);
      fetchProducts();
      setCurrentView("table");
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // Image handlers
const handleFileUpload = async (files) => {
  if (imageUrls.length + files.length > 8) {
    alert("Maximum 8 images allowed!");
    return;
  }

  setImageUploading(true);

  try {
    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i]);
      setImageUrls((prev) => [...prev, url]);
    }
  } catch (err) {
    console.error("Upload failed:", err);
    alert("Failed to upload image. Try again.");
  } finally {
    setImageUploading(false);
  }
};

const handleDrop = (e) => {
  e.preventDefault();
  const files = Array.from(e.dataTransfer.files).filter((f) =>
    f.type.startsWith("image/")
  );
  if (files.length > 0) handleFileUpload(files);
};

const handleBrowse = (e) => {
  const files = Array.from(e.target.files);
  if (files.length > 0) handleFileUpload(files);
};

const handlePasteUrl = () => {
  if (!pasteUrl.trim()) return;
  if (imageUrls.length >= 8) {
    alert("Maximum 8 images allowed!");
    return;
  }
  setImageUrls((prev) => [...prev, pasteUrl.trim()]);
  setPasteUrl("");
};

const handleRemoveImage = (index) => {
  setImageUrls((prev) => prev.filter((_, i) => i !== index));
};

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

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-20">Loading products...</div>;
  }

// ============ PRODUCT DETAIL VIEW ============
if (currentView === "detail" && selectedProduct) {
  const images = selectedProduct.images || [];
  const allImages = images.length > 0 ? images : [selectedProduct.image];

  return (
    <div>
      {/* Top Bar - Back + Action Buttons */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2 text-sm mb-6">
  <button
    onClick={() => {
      setSelectedProduct(null);
      setCurrentView("table");
    }}
    className="text-blue-600 hover:text-blue-800 font-medium transition"
  >
    Products
  </button>
  <span className="text-gray-400">›</span>
  <span className="text-gray-500 font-medium">Product Details</span>
</div>

        {isManageMode && (
          <div className="flex gap-3">
            <button
              onClick={() => handleEdit(selectedProduct)}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
            >
              ✏️ Edit Product
            </button>
            <button
              onClick={() =>
                handleDelete(selectedProduct.id, selectedProduct.name)
              }
              className="px-6 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-semibold rounded-lg transition"
            >
              🗑 Delete Product
            </button>
          </div>
        )}
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
          {/* Main Image */}
          <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
            <div className="w-full h-72 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
             <img
  src={activeImage}
  alt={selectedProduct.name}
  className="max-w-full max-h-full object-contain"
/>
            </div>
          </div>

          {/* Thumbnail Images */}
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
          {/* Product Name */}
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

          {/* Description */}
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

  // ============ ADD / EDIT PRODUCT VIEW ============
  if (currentView === "form") {
    return (
      <div>
        {/* Back Button */}
        <div className="flex items-center gap-2 text-sm mb-6">
  <button
    onClick={resetForm}
    className="text-blue-600 hover:text-blue-800 font-medium transition"
  >
    Products
  </button>
  <span className="text-gray-400">›</span>
  {editingProduct ? (
    <>
      <button
        onClick={() => {
          setCurrentView("detail");
        }}
        className="text-blue-600 hover:text-blue-800 font-medium transition"
      >
        Product Details
      </button>
      <span className="text-gray-400">›</span>
      <span className="text-gray-500 font-medium">Edit Product</span>
    </>
  ) : (
    <span className="text-gray-500 font-medium">Add New Product</span>
  )}
</div>

        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            {editingProduct ? "✏️ Edit Product" : "📦 Add New Product"}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {editingProduct
              ? "Update the details of your product"
              : "Fill in the details to add a new product"}
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          {formError && (
            <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm">
              {formError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Product Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter product name"
                  required
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Price (₹)
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="Enter price"
                  required
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Category
                </label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleChange}
                  required
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Rating
                </label>
                <input
                  type="number"
                  name="rating"
                  value={formData.rating}
                  onChange={handleChange}
                  placeholder="e.g. 4.5"
                  step="0.1"
                  min="0"
                  max="5"
                  className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

{/* -------- Image Upload Section -------- */}
<div>
  <label className="block text-sm font-medium mb-1">
    Product Images
  </label>
  <p className="text-xs text-gray-400 mb-3">
    Upload upto 8 images. First image will be the main image.
  </p>

  {/* Drag & Drop / Browse */}
  {imageUrls.length < 8 && (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => document.getElementById("fileInput").click()}
      className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition mb-4"
    >
      {imageUploading ? (
        <div>
          <p className="text-blue-600 font-medium">⏳ Uploading...</p>
          <p className="text-xs text-gray-400 mt-1">
            Please wait while images are being uploaded
          </p>
        </div>
      ) : (
        <div>
          <p className="text-3xl mb-2">📎</p>
          <p className="text-gray-600 font-medium">
            Drag & drop images here
          </p>
          <p className="text-sm text-gray-400 mt-1">
            or click to browse from your computer
          </p>
          <p className="text-xs text-gray-300 mt-2">
            Supports: JPG, PNG, WEBP
          </p>
        </div>
      )}

      <input
        id="fileInput"
        type="file"
        accept="image/*"
        multiple
        onChange={handleBrowse}
        className="hidden"
      />
    </div>
  )}

  {/* OR Divider */}
  {imageUrls.length < 8 && (
    <div className="flex items-center gap-3 mb-4">
      <div className="flex-1 h-px bg-gray-200"></div>
      <span className="text-sm text-gray-400">or paste image URL</span>
      <div className="flex-1 h-px bg-gray-200"></div>
    </div>
  )}

  {/* Paste URL */}
  {imageUrls.length < 8 && (
    <div className="flex gap-2 mb-4">
      <input
        type="text"
        placeholder="🔗 Paste image URL here..."
        value={pasteUrl}
        onChange={(e) => setPasteUrl(e.target.value)}
        onKeyDown={(e) =>
          e.key === "Enter" && (e.preventDefault(), handlePasteUrl())
        }
        className="flex-1 border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
      <button
        type="button"
        onClick={handlePasteUrl}
        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
      >
        Add
      </button>
    </div>
  )}

  {/* Image Previews */}
  {imageUrls.length > 0 && (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium text-gray-500">
          Uploaded Images ({imageUrls.length}/8)
        </h3>
        <span className="text-xs text-gray-400">
          First image = Main image
        </span>
      </div>
      <div className="flex flex-wrap gap-3">
        {imageUrls.map((url, index) => (
          <div
            key={index}
            className={`relative w-24 h-24 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden p-1 ${
              index === 0
                ? "border-2 border-blue-500"
                : "border border-gray-200"
            }`}
          >
            <img
              src={url}
              alt={`Image ${index + 1}`}
              className="max-w-full max-h-full object-contain"
              onError={(e) => {
                e.target.style.display = "none";
                e.target.parentElement.innerHTML =
                  '<span class="text-xs text-red-400">Invalid</span>';
              }}
            />
            <button
              type="button"
              onClick={() => handleRemoveImage(index)}
              className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs flex items-center justify-center hover:bg-red-600"
            >
              ✕
            </button>
            {index === 0 && (
              <span className="absolute bottom-0 left-0 right-0 bg-blue-500 text-white text-[10px] text-center py-0.5">
                Main
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )}

  {/* Max limit reached */}
  {imageUrls.length >= 8 && (
    <p className="text-sm text-yellow-600 mt-3">
      ⚠️ Maximum 8 images reached. Remove an image to add more.
    </p>
  )}
</div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Enter product description"
                rows="3"
                className="w-full border rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                disabled={formLoading}
                className="px-8 py-2.5 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                {formLoading
                  ? "Saving..."
                  : editingProduct
                  ? "Update Product"
                  : "Add Product"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="px-8 py-2.5 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
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
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-gray-500 text-sm mt-1">
              Browse and manage all products in your store
            </p>
          </div>

          {isManageMode && (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView("form")}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition"
              >
                + Add Product
              </button>

            </div>
          )}
        </div>

        <div className="mt-4">
          <input
            type="text"
            placeholder="🔍 Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/2 border rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Products Table */}
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
                Category
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Price
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                Rating
              </th>
              {isManageMode && (
                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">
                  Actions
                </th>
              )}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr
                key={product.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleViewDetail(product)}
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
                <td className="px-6 py-4 text-sm text-gray-600">
                  {product.category}
                </td>
                <td className="px-6 py-4 font-semibold">₹{product.price}</td>
                <td className="px-6 py-4 text-sm">⭐ {product.rating}</td>
                {isManageMode && (
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit(product);
                        }}
                        className="px-4 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition text-sm"
                      >
                        Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(product.id, product.name);
                        }}
                        className="px-4 py-1.5 bg-red-50 text-red-600 font-semibold rounded-lg hover:bg-red-100 transition text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 text-sm text-gray-500">
        Total Products: {filteredProducts.length}
      </div>
    </div>
  );
}

export default Products;