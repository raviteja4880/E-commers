import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/products/ProductCard";
import { toast } from "react-toastify";
import Loader from "./Loader";

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch product and related ones
  useEffect(() => {
    const fetchProductAndOthers = async () => {
      try {
        const { data: mainProduct } = await productAPI.getById(id);
        setProduct(mainProduct);

        const { data: allProducts } = await productAPI.getAll();
        const remaining = allProducts.filter((p) => p._id !== id);
        setOtherProducts(remaining);
      } catch (err) {
        setError("Failed to load product.");
        console.error("Product fetch error:", err.response?.data || err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndOthers();
  }, [id]);

  if (loading) return <Loader />;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;
  if (!product) return <p className="text-center mt-5">Product not found.</p>;

  // Handle quantity change
  const handleQtyChange = (val) => {
    if (val < 1) return;
    setQty(val);
  };

  // Add to cart with login check only when button pressed
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    if (!userInfo?.token) {
      toast.warning("You need to log in to access the cart");
      navigate("/login");
      return;
    }

    try {
      await addToCart(product._id, 1);
      toast.success(`${product.name} added to cart`);
    } catch {
      toast.error("Failed to add to cart");
    }
  };

  return (
    <div className="container mt-4">
      {/* Main product */}
      <div className="row mb-5">
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

          <button className="btn btn-primary mt-2" onClick={handleAddToCart}>
            Add to Cart
          </button>
        </div>
      </div>

      {/* Other recommended products */}
      {otherProducts.length > 0 && (
        <>
          <h3>Other Products You May Like</h3>
          <div className="row">
            {otherProducts.map((p) => (
              <div key={p._id} className="col-md-3 mb-4">
                <ProductCard product={p} />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default ProductDetails;
