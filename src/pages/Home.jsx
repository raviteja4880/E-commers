import React, { useEffect, useState } from "react";
import { productAPI } from "../services/api";
import ProductCard from "../components/products/ProductCard";
import Loader from "../pages/Loader";
import "../scrollMessage.css";

function Home() {
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showBanner, setShowBanner] = useState(true);

  // Fetch products and group them by category
  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    setShowBanner(true); // show banner while loading

    try {
      const { data } = await productAPI.getAll();

      // Group products by category
      const grouped = data.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
      }, {});

      // Sort alphabetically within each category
      Object.keys(grouped).forEach((cat) => {
        grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
      });

      setGroupedProducts(grouped);
    } catch (err) {
      console.error("Products fetch error:", err.response?.data || err.message);
      setError("Failed to load products.");
    } finally {
      setLoading(false);

      // Hide banner a short time after loading completes
      setTimeout(() => setShowBanner(false), 1000);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Global loader
  if (loading) return <Loader />;

  return (
    <div className="container mt-4">
      {/* Scrolling message shown while backend wakes up */}
      {showBanner && (
        <div
          className="scrolling-banner text-center fw-semibold mb-3"
          style={{
            background: "linear-gradient(to right, #fff, #f8f9fa)",
            color: "#555",
            border: "1px solid #ddd",
          }}
        >
          <div className="scrolling-text">
            Backend is waking up... Please wait a few seconds while we load the products.
            Thank you for your patience.
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="text-center mt-5 text-danger">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchProducts}>
            Retry
          </button>
        </div>
      )}

      {/* No products */}
      {!error && Object.keys(groupedProducts).length === 0 && (
        <p className="text-center mt-5">No products available.</p>
      )}

      {/* Products grouped by category */}
      {!error &&
        Object.keys(groupedProducts).map((category) => (
          <div key={category} className="mb-5">
            <h3 className="mb-4 text-capitalize fw-semibold">{category}</h3>
            <div className="row">
              {groupedProducts[category].map((product) => (
                <div key={product._id} className="col-6 col-md-3 mb-4">
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        ))}
    </div>
  );
}

export default Home;
