import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../../context/CartContext";

function ProductCard({ product }) {
  const { dispatch } = useCart(); // ✅ get dispatch

  const addToCart = () => {
    dispatch({ type: "ADD_TO_CART", payload: product });
  };

  return (
    <div style={styles.card}>
      <Link
        to={`/product/${product._id}`}
        style={{ textDecoration: "none", color: "inherit" }}
      >
        <img src={product.image} alt={product.name} style={styles.image} />
        <h3>{product.name}</h3>
        <p style={styles.brand}>{product.brand}</p>
        <p style={styles.price}>₹{product.price}</p>
      </Link>

      {/* ✅ Button dispatches action */}
      <button style={styles.button} onClick={addToCart}>
        Add to Cart
      </button>
    </div>
  );
}

const styles = {
  card: {
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    textAlign: "center",
    backgroundColor: "#fff",
    boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  brand: {
    color: "gray",
    fontSize: "14px",
  },
  price: {
    color: "green",
    fontWeight: "bold",
    fontSize: "18px",
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
