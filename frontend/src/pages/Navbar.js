import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const { state } = useCart();
  const { cartItems } = state;
  const cartCount = cartItems.reduce((acc, item) => acc + item.qty, 0);

  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/");
  };

  return (
    <nav style={styles.nav}>
      <h2 style={styles.logo}>🛒 MyStore</h2>
      <div style={styles.rightSection}>
        <Link to="/" style={styles.link}>Home</Link>
        <Link to="/cart" style={styles.link}>Cart ({cartCount})</Link>
        {!userInfo && <Link to="/login" style={styles.link}>Login</Link>}

        {userInfo && (
          <div style={styles.profileWrapper}>
            <div
              style={styles.profile}
              onClick={() => setDropdownOpen(!dropdownOpen)}
            >
              👤 {userInfo.name || userInfo.email} ▼
            </div>

            {dropdownOpen && (
              <div style={styles.dropdown}>
                <p><strong>Name:</strong> {userInfo.name}</p>
                <p><strong>Email:</strong> {userInfo.email}</p>
                <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 20px", backgroundColor: "#007bff", color: "#fff" },
  logo: { margin: 0 },
  link: { marginLeft: "20px", color: "#fff", textDecoration: "none", fontWeight: "bold" },
  rightSection: { display: "flex", alignItems: "center" },
  profileWrapper: { position: "relative", marginLeft: "20px", cursor: "pointer" },
  profile: { fontWeight: "bold" },
  dropdown: { position: "absolute", top: "40px", right: 0, backgroundColor: "#fff", color: "#000", padding: "10px", borderRadius: "8px", minWidth: "200px", zIndex: 100 },
  logoutBtn: { marginTop: "10px", width: "100%", padding: "8px", backgroundColor: "#dc3545", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
};

export default Navbar;
