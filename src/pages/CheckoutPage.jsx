import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { orderAPI } from "../services/api";
import { useNavigate } from "react-router-dom";

function CheckoutPage() {
  const { state, clearCart } = useCart();
  const { cartItems } = state;
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.qty * (item.product?.price || 0),
    0
  );

  const handlePlaceOrder = async () => {
    if (!address.trim()) return setError("Shipping address is required");
    setLoading(true);
    setError("");

    try {
      const payload = {
        items: cartItems.map((item) => ({
          product: item.product?._id,
          name: item.product?.name,
          qty: item.qty,
          price: item.product?.price,
          image: item.product?.image,
        })),
        shippingAddress: address,
        paymentMethod,
      };

      const { data } = await orderAPI.create(payload);

      if (paymentMethod === "qr" || paymentMethod === "card") {
        // Navigate to payment page, cart remains until payment confirmed
        navigate(`/payment/${data._id}`);
      } else if (paymentMethod === "COD") {
        // For COD, order is considered paid on confirmation
        navigate(`/order-success/${data._id}`);
        clearCart();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return <p className="text-center mt-5">Your cart is empty</p>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Checkout</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Shipping Address */}
      <div className="mb-3">
        <label htmlFor="address">Shipping Address</label>
        <textarea
          id="address"
          className="form-control"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your shipping address"
        />
      </div>

      {/* Payment Method */}
      <div className="mb-3">
        <label htmlFor="paymentMethod">Payment Method</label>
        <select
          id="paymentMethod"
          className="form-select"
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <option value="COD">Cash on Delivery</option>
          <option value="qr">Pay via QR Code</option>
          <option value="card">Debit Card</option>
        </select>
      </div>

      {/* Order Summary */}
      <h4>Order Summary</h4>
      <ul className="list-group mb-3">
        {cartItems.map((item) => (
          <li
            className="list-group-item d-flex justify-content-between"
            key={item._id}
          >
            {item.product?.name} x {item.qty}
            <span>₹{item.qty * item.product?.price}</span>
          </li>
        ))}
        <li className="list-group-item d-flex justify-content-between">
          <strong>Total</strong>
          <strong>₹{totalPrice}</strong>
        </li>
      </ul>

      <button
        className="btn btn-success w-100"
        onClick={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? "Placing Order..." : "Proceed to Payment"}
      </button>
    </div>
  );
}

export default CheckoutPage;
