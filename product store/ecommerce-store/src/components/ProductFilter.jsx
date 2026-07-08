function ProductFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
  sortOrder,
  setSortOrder,
  minPrice,
  maxPrice,
  setMinPrice,
  setMaxPrice,
}) {
  const minOptions = ["", 500, 1000, 1500, 2000];
  const maxOptions = ["", 1000, 2000, 3000, "5000+"];

  const handleMaxChange = (value) => {
    if (value === "5000+") {
      setMinPrice("5000");
      setMaxPrice("");
    } else {
      setMaxPrice(value);
    }
  };

  const handleClearFilters = () => {
    setSelectedCategory("All");
    setSortOrder("");
    setMinPrice("");
    setMaxPrice("");
  };

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden w-full">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-100">
        <h2 className="text-lg font-bold text-gray-800 tracking-wide">
          FILTERS
        </h2>
      </div>

      <div className="p-6">
        {/* Category */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Category
          </h3>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value="All">All Categories</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Sort By
          </h3>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
          >
            <option value="">Default</option>
            <option value="lowToHigh">Price: Low to High</option>
            <option value="highToLow">Price: High to Low</option>
          </select>
        </div>

        {/* Price Range */}
        <div className="mb-6">
          <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
            Price Range
          </h3>

          <div className="flex items-center gap-2">
            <select
              value={minPrice === "5000" && maxPrice === "" ? "" : minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              {minOptions.map((price) => (
                <option key={price || "min"} value={price}>
                  {price === "" ? "Min" : `₹${price}`}
                </option>
              ))}
            </select>

            <span className="text-gray-400 text-sm">to</span>

            <select
              value={minPrice === "5000" && maxPrice === "" ? "5000+" : maxPrice}
              onChange={(e) => handleMaxChange(e.target.value)}
              className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 focus:ring-2 focus:ring-blue-500 outline-none transition"
            >
              {maxOptions.map((price) => (
                <option key={price || "max"} value={price}>
                  {price === ""
                    ? "Max"
                    : price === "5000+"
                    ? "₹5000+"
                    : `₹${price}`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear button */}
        <button
          onClick={handleClearFilters}
          className="w-full py-2.5 text-sm font-semibold text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );
}

export default ProductFilter;