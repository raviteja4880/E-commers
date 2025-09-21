import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getProductById } from "../services/api";
import { useCart } from "../context/CartContext";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const data = await getProductById(id);
        setProduct(data);
      } catch (err) {
        setError("Failed to load product.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <p className="text-center mt-5">Loading product...</p>;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;
  if (!product) return <p className="text-center mt-5">Product not found.</p>;

  const handleQtyChange = (val) => {
    if (val < 1) return;
    setQty(val);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-md-6">
          <img
            src={product.image}
            alt={product.name}
            className="img-fluid rounded"
          />
        </div>
        <div className="col-md-6">
          <h2>{product.name}</h2>
          <p className="text-muted">{product.brand}</p>
          <h4 className="text-success">₹{product.price}</h4>
          <p>{product.description}</p>

          <div className="d-flex align-items-center mb-3">
            <button
              className="btn btn-outline-secondary me-2"
              onClick={() => handleQtyChange(qty - 1)}
              disabled={qty <= 1}
            >
              -
            </button>
            <input
              type="number"
              value={qty}
              min="1"
              className="form-control text-center"
              style={{ width: "70px" }}
              onChange={(e) => handleQtyChange(Number(e.target.value))}
            />
            <button
              className="btn btn-outline-secondary ms-2"
              onClick={() => handleQtyChange(qty + 1)}
            >
              +
            </button>
          </div>

          <button
            className="btn btn-primary mt-2"
            onClick={() => {
              addToCart(product._id, qty);
              navigate("/cart");
            }}
          >
            Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductDetails;
