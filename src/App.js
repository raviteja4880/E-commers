import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import Navbar from "./pages/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccess from "./pages/OrderSuccess";
import { CartProvider } from "./context/CartContext";
import ProductDetails from "./pages/ProductDetails";
import PaymentPage from "./pages/PaymentPage";
import MyOrdersPage from "./pages/MyOrdersPage";


// Wrapper to conditionally show Navbar
function Layout({ children }) {
  const location = useLocation();

  // hide Navbar on login & register
  const hideNavbar =
    location.pathname === "/login" || location.pathname === "/register";

  return (
    <>
      {!hideNavbar && <Navbar />}
      {children}
    </>
  );
}

function App() {
  const userInfo = localStorage.getItem("userInfo"); // ✅ define here

  return (
    <CartProvider>
      <Router>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/order-success/:orderId" element={<OrderSuccess />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/my-orders" element={<MyOrdersPage  />} />
            <Route path="/product/:id" element={<ProductDetails />} />
            <Route path="/payment/:orderId" element={<PaymentPage />} />
            <Route
              path="/checkout" element={userInfo ? <CheckoutPage /> : <Navigate to="/login" />}/>
          </Routes>
        </Layout>
      </Router>
    </CartProvider>
  );
}

export default App;
