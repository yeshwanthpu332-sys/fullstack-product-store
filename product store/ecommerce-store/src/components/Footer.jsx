import { Link } from "react-router-dom";
import { NavLink } from "react-router-dom";

function Footer() {
  return (
    <footer className="bg-gray-900 text-white mt-10">
      <div className="max-w-7xl mx-auto px-4 py-6 text-center">

        <h3 className="text-lg font-semibold">
          ShopEase
        </h3>

        <p className="text-gray-300 mt-2">
          Your one-stop destination for quality products.
        </p>

        {/* ABOUT LINK */}
        <div className="mt-4">
          <NavLink
  to="/about"
  className={({ isActive }) =>
    `text-sm text-gray-300 hover:text-white transition ${
      isActive ? "underline text-white" : ""
    }`
  }
>
  About ShopEase
</NavLink>
        </div>

        <p className="text-sm text-gray-400 mt-4">
          © {new Date().getFullYear()} ShopEase. All Rights Reserved.
        </p>

      </div>
    </footer>
  );
}

export default Footer;