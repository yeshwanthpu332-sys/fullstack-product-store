function ProductFilter({
  categories,
  selectedCategory,
  setSelectedCategory,
  sortOrder,
  setSortOrder,
}) {
  return (
    <div className="flex flex-col md:flex-row gap-4">
      <select
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="border rounded-lg px-4 py-2"
      >
        <option value="All">All Categories</option>

        {/* ✅ Now coming from DB */}
        {categories.map((category) => (
          <option
            key={category.id}
            value={category.name}
          >
            {category.name}
          </option>
        ))}
      </select>

      <select
        value={sortOrder}
        onChange={(e) => setSortOrder(e.target.value)}
        className="border rounded-lg px-4 py-2"
      >
        <option value="">Sort By Price</option>
        <option value="lowToHigh">Low To High</option>
        <option value="highToLow">High To Low</option>
      </select>
    </div>
  );
}

export default ProductFilter;