function About() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold mb-6">
        About ShopEase
      </h1>

      <p className="text-gray-700 leading-8 text-lg">
        ShopEase is a modern e-commerce
        platform built with React, Vite,
        Tailwind CSS, React Router, Context
        API, and LocalStorage.
      </p>

      <p className="text-gray-700 leading-8 text-lg mt-6">
        This project demonstrates product
        listing, product details, search,
        filtering, sorting, cart management,
        reusable React components, and
        responsive design.
      </p>

      <p className="text-gray-700 leading-8 text-lg mt-6">
        Features include:
      </p>

      <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
        <li>Browse products</li>
        <li>Product details page</li>
        <li>Search products</li>
        <li>Category filtering</li>
        <li>Price sorting</li>
        <li>Add to cart</li>
        <li>Quantity management</li>
        <li>Persistent cart using localStorage</li>
        <li>Responsive UI</li>
      </ul>
    </div>
  );
}

export default About;