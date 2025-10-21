import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

function Navbar() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  const navigate = useNavigate();
  const { state } = useCart();
  const cartCount = state.cartItems?.reduce((acc, item) => acc + item.qty, 0) || 0;

  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    navigate("/login");
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary sticky-top">
      <div className="container">
        <Link className="navbar-brand" to="/">
          🛒 MyStore
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            <li className="nav-item">
              <Link className="nav-link" to="/">Home</Link>
            </li>

            {userInfo ? (
              <>
                <li className="nav-item">
                  <Link className="nav-link" to="/cart">
                    Cart <span className="badge bg-warning text-dark">{cartCount}</span>
                  </Link>
                </li>
                <li className="nav-item">
                  <Link className="nav-link" to="/my-orders">My Orders</Link>
                </li>

                <li className="nav-item dropdown">
                  <span
                    className="nav-link dropdown-toggle"
                    role="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    style={{ cursor: "pointer" }}
                  >
                    👤 {userInfo.name || userInfo.email}
                  </span>
                  <ul className="dropdown-menu dropdown-menu-end">
                    <li><span className="dropdown-item"><strong>Name:</strong> {userInfo.name}</span></li>
                    <li><span className="dropdown-item"><strong>Email:</strong> {userInfo.email}</span></li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger" onClick={handleLogout}>
                        Logout
                      </button>
                    </li>
                  </ul>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link className="nav-link" to="/login">Login</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
  