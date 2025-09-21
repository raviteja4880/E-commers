import React, { useEffect, useState } from "react";
import { getProducts } from "../services/api";
import ProductCard from "../components/products/ProductCard";

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch (err) {
        setError("Failed to load products.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) return <p className="text-center mt-5">Loading products...</p>;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;
  if (products.length === 0) return <p className="text-center mt-5">No products available.</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Products</h2>
      <div className="row">
        {products.map((product) => (
          <div key={product._id} className="col-md-4 mb-4">
            <ProductCard product={product} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
