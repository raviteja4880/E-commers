import React, { useState } from "react";
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

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

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
                <li className="nav-item dropdown">
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
                      className="dropdown-menu dropdown-menu-end show mt-2 shadow-sm border-0"
                      style={{
                        position: "absolute",
                        right: 0,
                        top: "100%",
                        borderRadius: "10px",
                      }}
                    >
                      <li className="dropdown-item text-muted small">
                        <strong>{userInfo.name}</strong>
                        <br />
                        <span>{userInfo.email}</span>
                      </li>
                      <li>
                        <hr className="dropdown-divider" />
                      </li>
                      <li>
                        <button
                          className="dropdown-item text-danger d-flex align-items-center gap-2"
                          onClick={handleLogout}
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
