import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { toast } from "react-toastify";

function ProductCard({ product }) {
  const { addToCart } = useCart();
  const navigate = useNavigate();

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
    <div style={styles.card}>
      <Link
        to={`/product/${product._id}`}
        style={{ textDecoration: "none", color: "inherit", flex: 1 }}
      >
        <div style={styles.imageWrapper}>
          <img src={product.image} alt={product.name} style={styles.image} />
        </div>
        <h3 style={styles.title}>{product.name}</h3>
        <p style={styles.brand}>{product.brand}</p>
        <p style={styles.price}>₹{product.price}</p>
      </Link>

      <button style={styles.button} onClick={handleAddToCart}>
        Add to Cart
      </button>
    </div>
  );
}

const styles = {
  card: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    height: "420px",
    textAlign: "center",
    transition: "transform 0.2s ease",
  },
  imageWrapper: {
    height: "200px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "10px",
  },
  image: {
    maxWidth: "100%",
    maxHeight: "100%",
    objectFit: "cover",
    borderRadius: "8px",
  },
  title: {
    fontSize: "16px",
    fontWeight: 600,
    margin: "5px 0",
    height: "40px",
    overflow: "hidden",
  },
  brand: {
    color: "gray",
    fontSize: "14px",
    margin: "3px 0",
  },
  price: {
    color: "green",
    fontWeight: "bold",
    fontSize: "18px",
    margin: "5px 0",
  },
  button: {
    marginTop: "10px",
    padding: "8px 12px",
    border: "none",
    backgroundColor: "#007bff",
    color: "#fff",
    borderRadius: "5px",
    cursor: "pointer",
  },
};

export default ProductCard;
