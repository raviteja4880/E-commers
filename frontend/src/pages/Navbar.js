import React from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext"; // ✅ import cart context

function Navbar() {
  const { state } = useCart(); // get cart items
  const cartCount = state.cartItems.reduce((acc, item) => acc + item.qty, 0);

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>🛒 MyStore</h2>
      <div>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/cart" style={styles.link}>
          Cart ({cartCount}) {/* ✅ cart badge */}
        </Link>
        <Link to="/login" style={styles.link}>Login</Link>
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 20px",
    backgroundColor: "#007bff",
    color: "#fff",
  },
  logo: {
    margin: 0,
  },
  link: {
    marginLeft: "20px",
    color: "#fff",
    textDecoration: "none",
    fontWeight: "bold",
  },
};

export default Navbar;
