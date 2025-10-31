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

  const userInfo = localStorage.getItem("userInfo");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");

    if (!userInfo) setShowBanner(true);
    else setShowBanner(false);

    try {
      const { data } = await productAPI.getAll();

      const grouped = data.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
      }, {});

      Object.keys(grouped).forEach((cat) => {
        grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
      });

      setGroupedProducts(grouped);
    } catch (err) {
      console.error("Products fetch error:", err.response?.data || err.message);
      setError("Failed to load products.");
    } finally {
      setLoading(false);
      if (!userInfo) {
        setTimeout(() => setShowBanner(false), 2000);
      }
    }
  };

  useEffect(() => {
    fetchProducts();
    if (userInfo) document.body.style.overflowX = "hidden";
    return () => (document.body.style.overflowX = "auto");
  }, []);

  return (
    <div className="container mt-4 position-relative">
      {/* Floating Scrolling Banner — visible during loading or wake-up */}
      {!userInfo && showBanner && (
        <div className="scrolling-banner-container">
          <div className="scrolling-banner text-center fw-semibold">
            <div className="scrolling-text">
              <span>
                Backend is waking up... Please wait a few seconds while we load
                the products. Thank you for your patience. &nbsp;&nbsp;&nbsp;
              </span>
              <span>
                Backend is waking up... Please wait a few seconds while we load
                the products. Thank you for your patience. &nbsp;&nbsp;&nbsp;
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Loader always below the floating banner */}
      {loading && (
        <div className="d-flex justify-content-center align-items-center mt-5">
          <Loader />
        </div>
      )}

      {/* Error state */}
      {!loading && error && (
        <div className="text-center mt-5 text-danger">
          <p>{error}</p>
          <button className="btn btn-primary" onClick={fetchProducts}>
            Retry
          </button>
        </div>
      )}

      {/* No products */}
      {!error && !loading && Object.keys(groupedProducts).length === 0 && (
        <p className="text-center mt-5">No products available.</p>
      )}

      {/* Products grouped by category */}
      {!error &&
        !loading &&
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
