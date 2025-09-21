import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { createOrder } from "../services/api";
import { useNavigate } from "react-router-dom";

function CheckoutPage() {
  const { state, clearCart } = useCart();
  const { cartItems } = state;
  const navigate = useNavigate();
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.qty * item.price,
    0
  );

  const handlePlaceOrder = async () => {
    if (!address.trim()) return setError("Shipping address is required");
    setLoading(true);
    try {
      await createOrder(address);
      clearCart(); // clear local state + DB
      navigate("/order-success");
    } catch (err) {
      setError(err.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0)
    return <p className="text-center mt-5">Your cart is empty</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Checkout</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="mb-3">
        <label>Shipping Address</label>
        <textarea
          className="form-control"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your shipping address"
        />
      </div>

      <h4>Order Summary</h4>
      <ul className="list-group mb-3">
        {cartItems.map((item) => (
          <li
            className="list-group-item d-flex justify-content-between"
            key={item._id}
          >
            {item.name} x {item.qty} <span>₹{item.qty * item.price}</span>
          </li>
        ))}
        <li className="list-group-item d-flex justify-content-between">
          <strong>Total</strong> <strong>₹{totalPrice}</strong>
        </li>
      </ul>

      <button
        className="btn btn-success w-100"
        onClick={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? "Placing Order..." : "Place Order"}
      </button>
    </div>
  );
}

export default CheckoutPage;
