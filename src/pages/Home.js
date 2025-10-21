import React, { useEffect, useState } from "react";
import { productAPI } from "../services/api";
import ProductCard from "../components/products/ProductCard";

function Home() {
  const [groupedProducts, setGroupedProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchProducts = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await productAPI.getAll();

      // Group products by category
      const grouped = data.reduce((acc, product) => {
        if (!acc[product.category]) acc[product.category] = [];
        acc[product.category].push(product);
        return acc;
      }, {});

      // Sort products by name inside each category
      Object.keys(grouped).forEach((cat) => {
        grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
      });

      setGroupedProducts(grouped);
    } catch (err) {
      setError("Failed to load products.");
      console.error("❌ Products fetch error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading products...</p>;
  if (error)
    return (
      <div className="text-center mt-5 text-danger">
        <p>{error}</p>
        <button
          className="btn btn-primary"
          onClick={fetchProducts}
        >
          Retry
        </button>
      </div>
    );
  if (Object.keys(groupedProducts).length === 0)
    return <p className="text-center mt-5">No products available.</p>;

  return (
<div className="container mt-4">
  {Object.keys(groupedProducts).map((category) => (
    <div key={category} className="mb-5">
      <h3 className="mb-4 text-capitalize">{category}</h3>
      <div className="row">
        {groupedProducts[category].map((product) => (
          <div key={product._id} className="col-md-3 mb-4">
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
