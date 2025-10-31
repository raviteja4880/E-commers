import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import {
  FaShoppingCart,
  FaUserCircle,
  FaBoxOpen,
  FaSignOutAlt,
  FaHome,
} from "react-icons/fa";

function Navbar() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();
  const { state } = useCart();
  const cartCount =
    state.cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null); // 🔹 ref for dropdown container

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  // 🔹 Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className="navbar navbar-expand-lg sticky-top shadow-sm"
      style={{
        backgroundColor: "#ffffff",
        borderBottom: "1px solid #e5e5e5",
      }}
    >
      <div className="container">
        {/* Brand */}
        <Link
          className="navbar-brand fw-semibold"
          to="/"
          style={{ color: "#222", fontSize: "1.4rem", textDecoration: "none" }}
        >
          MyStore
        </Link>

        {/* Toggler */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* Nav Links */}
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-lg-3">
            <li className="nav-item">
              <Link className="nav-link d-flex align-items-center gap-2" to="/">
                <FaHome size={18} />
                <span className="fw-medium">Home</span>
              </Link>
            </li>

            {userInfo ? (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center gap-2"
                    to="/cart"
                  >
                    <FaShoppingCart size={18} />
                    <span className="fw-medium">Cart</span>
                    {cartCount > 0 && (
                      <span className="badge bg-primary ms-1">{cartCount}</span>
                    )}
                  </Link>
                </li>

                <li className="nav-item">
                  <Link
                    className="nav-link d-flex align-items-center gap-2"
                    to="/my-orders"
                  >
                    <FaBoxOpen size={18} />
                    <span className="fw-medium">My Orders</span>
                  </Link>
                </li>

                {/* User Dropdown */}
                <li className="nav-item dropdown" ref={dropdownRef}>
                  <div
                    className="nav-link d-flex align-items-center gap-2"
                    style={{ cursor: "pointer" }}
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                  >
                    <FaUserCircle size={20} />
                    <span className="fw-medium">
                      {userInfo.name || "Account"}
                    </span>
                  </div>

                  {dropdownOpen && (
                    <ul
                      className="dropdown-menu dropdown-menu-end show mt-2 border-0 shadow"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        borderRadius: "12px",
                        minWidth: "230px",
                        padding: "0.6rem 0.5rem",
                        background: "white",
                      }}
                    >
                      {/* User Info */}
                      <li
                        className="dropdown-item"
                        style={{
                          padding: "1rem 2rem",
                          borderRadius: "8px",
                          background: "#f8f9fa",
                          marginBottom: "0.4rem",
                          lineHeight: "1.5",
                        }}
                      >
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: "0.95rem",
                            color: "#333",
                          }}
                        >
                          {userInfo.name}
                        </div>
                        <div style={{ fontSize: "0.85rem", color: "#777" }}>
                          {userInfo.email}
                        </div>
                      </li>

                      <li>
                        <hr className="dropdown-divider my-2" />
                      </li>

                      {/* Logout */}
                      <li>
                        <button
                          className="dropdown-item d-flex align-items-center gap-2 text-danger fw-semibold"
                          style={{
                            padding: "0.7rem 1rem",
                            borderRadius: "8px",
                            transition: "all 0.2s ease-in-out",
                          }}
                          onClick={handleLogout}
                          onMouseOver={(e) =>
                            (e.currentTarget.style.background = "#fff5f5")
                          }
                          onMouseOut={(e) =>
                            (e.currentTarget.style.background = "transparent")
                          }
                        >
                          <FaSignOutAlt size={16} />
                          Logout
                        </button>
                      </li>
                    </ul>
                  )}
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link
                  className="nav-link d-flex align-items-center gap-2"
                  to="/login"
                >
                  <FaUserCircle size={18} />
                  <span className="fw-medium">Login</span>
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
