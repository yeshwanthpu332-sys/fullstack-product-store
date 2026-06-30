function SearchBar({
  searchTerm,
  setSearchTerm,
}) {
  return (
    <input
      type="text"
      placeholder="Search products..."
      value={searchTerm}
      onChange={(e) =>
        setSearchTerm(e.target.value)
      }
      className="w-full md:w-80 border rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-blue-500"
    />
  );
}

export default SearchBar;