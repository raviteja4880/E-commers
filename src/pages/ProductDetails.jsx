import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import ProductCard from "../components/products/ProductCard";
import { toast } from "react-toastify";
import Loader from "./Loader";
import { motion, AnimatePresence } from "framer-motion";

// ✅ Rupee formatter
const Rupee = ({ value, size = "1.1rem", bold = false, color = "#28a745" }) => (
  <span
    style={{
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: size,
      fontWeight: bold ? 600 : 500,
      color,
      display: "inline-flex",
      alignItems: "baseline",
      gap: "2px",
    }}
  >
    <span
      style={{
        fontFamily: "sans-serif",
        fontWeight: 600,
        transform: "translateY(-0.5px)",
      }}
    >
      ₹
    </span>
    <span>{value?.toLocaleString("en-IN")}</span>
  </span>
);

function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [otherProducts, setOtherProducts] = useState([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ Fetch product and recommendations
  useEffect(() => {
    const fetchProductAndOthers = async () => {
      try {
        const { data: mainProduct } = await productAPI.getById(id);
        setProduct(mainProduct);

        const { data: allProducts } = await productAPI.getAll();
        const remaining = allProducts.filter((p) => p._id !== id);
        setOtherProducts(remaining);

        // 🆕 Scroll to top when product changes
        window.scrollTo({ top: 0, behavior: "smooth" });
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
  if (error)
    return (
      <p className="text-center mt-5 text-danger fw-semibold">{error}</p>
    );
  if (!product)
    return <p className="text-center mt-5 text-muted">Product not found.</p>;

  // ✅ Quantity logic
  const handleQtyChange = (val) => {
    if (val < 1) return;
    setQty(val);
  };

  // ✅ Add to cart animation
  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (!userInfo?.token) {
      toast.warning("You need to log in to access the cart");
      navigate("/login");
      return;
    }

    const productImage = document.getElementById("product-main-image");
    const cartIcon = document.getElementById("cart-icon");

    if (!cartIcon || !productImage) {
      await addToCart(product._id, qty);
      toast.success(`${product.name} added to cart`);
      return;
    }

    // Animate image flying to cart
    const clone = productImage.cloneNode(true);
    const imgRect = productImage.getBoundingClientRect();
    const cartRect = cartIcon.getBoundingClientRect();

    clone.style.position = "fixed";
    clone.style.left = imgRect.left + "px";
    clone.style.top = imgRect.top + "px";
    clone.style.width = imgRect.width + "px";
    clone.style.height = imgRect.height + "px";
    clone.style.borderRadius = "10px";
    clone.style.transition =
      "all 0.9s cubic-bezier(0.4, 0.7, 0.2, 1.1), opacity 0.9s";
    clone.style.zIndex = 9999;
    clone.style.pointerEvents = "none";
    clone.style.opacity = 1;
    document.body.appendChild(clone);

    requestAnimationFrame(() => {
      clone.style.transform = `translate3d(
        ${cartRect.left - imgRect.left}px,
        ${cartRect.top - imgRect.top}px,
        0
      ) scale(0.2) rotate(25deg)`;
      clone.style.opacity = 0.1;
    });

    setTimeout(() => {
      clone.remove();

      cartIcon.classList.add("cart-bounce");
      setTimeout(() => cartIcon.classList.remove("cart-bounce"), 600);

      addToCart(product._id, qty)
        .then(() => {
          sessionStorage.setItem("cartAnimation", product.name);
          navigate("/cart");
        })
        .catch(() => toast.error("Failed to add to cart"));
    }, 850);
  };

  // 🆕 Handle recommended product click
  const handleRecommendedClick = (pid) => {
    // smooth scroll + motion exit
    window.scrollTo({ top: 0, behavior: "smooth" });
    setTimeout(() => navigate(`/product/${pid}`), 300);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={id}
        className="container mt-4 mb-5"
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: -80, opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        {/* Main Product Section */}
        <div className="row align-items-start mb-5">
          <motion.div
            className="col-md-6 mb-3 mb-md-0 text-center"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            <img
              id="product-main-image"
              src={product.image}
              alt={product.name}
              className="img-fluid rounded shadow-sm"
              style={{
                maxHeight: "480px",
                objectFit: "contain",
                border: "1px solid #eee",
              }}
            />
          </motion.div>

          <motion.div
            className="col-md-6"
            initial={{ opacity: 0, x: 80 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h2 className="fw-bold mb-2">{product.name}</h2>
            <p className="text-muted mb-3">{product.brand}</p>

            <h4 className="text-success mb-3">
              <Rupee value={product.price} bold size="1.4rem" />
            </h4>

            <p className="mb-4">{product.description}</p>

            <div className="d-flex align-items-center mb-4">
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

            <motion.button
              className="btn btn-primary fw-semibold px-4 py-2"
              onClick={handleAddToCart}
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.03 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              Add to Cart
            </motion.button>
          </motion.div>
        </div>

        {/* Recommended Products */}
        {otherProducts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
          >
            <h3 className="fw-bold mb-4 text-primary">
              Other Products You May Like
            </h3>
            <div className="row">
              {otherProducts.map((p) => (
                <div
                  key={p._id}
                  className="col-6 col-md-3 mb-4"
                  style={{ cursor: "pointer" }}
                  onClick={() => handleRecommendedClick(p._id)}
                >
                  <ProductCard product={p} />
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Bounce Animation */}
        <style>{`
          .cart-bounce {
            animation: cartBounce 0.5s ease;
          }
          @keyframes cartBounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.3); }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  );
}

export default ProductDetails;
