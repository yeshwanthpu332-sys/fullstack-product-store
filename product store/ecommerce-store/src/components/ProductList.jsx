import ProductCard from "./ProductCard";

function ProductList({ products }) {
  if (!products.length) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold">
          No Products Found
        </h2>
      </div>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
        />
      ))}
    </div>
  );
}

export default ProductList;