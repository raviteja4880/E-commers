import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { orderAPI } from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { IndianRupee, MapPin, Smartphone, CreditCard, Home } from "lucide-react";

function CheckoutPage() {
  const { state, clearCart } = useCart();
  const { cartItems } = state;
  const navigate = useNavigate();

  const [address, setAddress] = useState("");
  const [mobile, setMobile] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [loading, setLoading] = useState(false);

  const totalPrice = cartItems.reduce(
    (acc, item) => acc + item.qty * (item.product?.price || 0),
    0
  );

  // Detect location and autofill address
  const handleUseLocation = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported in this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();
          if (data?.display_name) {
            setAddress(data.display_name);
            toast.success("Location detected successfully!");
          } else {
            toast.warning("Unable to fetch address. Try again manually.");
          }
        } catch {
          toast.error("Failed to get address. Try again.");
        }
      },
      () => {
        toast.error("Location access denied.");
      }
    );
  };

  // Place Order
  const handlePlaceOrder = async () => {
    if (!address.trim()) return toast.error("Shipping address is required!");
    if (!mobile.trim()) return toast.error("Mobile number is required!");
    if (!/^[6-9]\d{9}$/.test(mobile))
      return toast.error("Enter a valid 10-digit mobile number.");

    setLoading(true);

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
        mobile,
      };

      const { data } = await orderAPI.create(payload);

      // Pass selected payment method via query params
      if (paymentMethod === "qr" || paymentMethod === "card") {
        navigate(`/payment/${data._id}?method=${paymentMethod}`);
      } else {
        navigate(`/order-success/${data._id}`);
        clearCart();
      }

      toast.success("Order placed successfully!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Order failed");
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return <p className="text-center mt-5">Your cart is empty</p>;
  }

  return (
    <div className="container mt-4">
      <h2 className="mb-4 fw-bold text-primary d-flex align-items-center gap-2">
        <CreditCard size={24} />
        Checkout
      </h2>

      {/* Address Section */}
      <div className="mb-3">
        <label htmlFor="address" className="form-label fw-semibold d-flex align-items-center gap-1">
          <Home size={18} /> Shipping Address <span className="text-danger">*</span>
        </label>
        <textarea
          id="address"
          className="form-control"
          rows="3"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="Enter your full address"
        ></textarea>
        <button
          onClick={handleUseLocation}
          className="btn btn-outline-secondary mt-2 d-flex align-items-center gap-2"
        >
          <MapPin size={16} />
          Use My Current Location
        </button>
      </div>

      {/* Mobile Number */}
      <div className="mb-3">
        <label htmlFor="mobile" className="form-label fw-semibold d-flex align-items-center gap-1">
          <Smartphone size={18} /> Mobile Number <span className="text-danger">*</span>
        </label>
        <input
          id="mobile"
          type="text"
          className="form-control"
          maxLength="10"
          placeholder="Enter your 10-digit mobile number"
          value={mobile}
          onChange={(e) => setMobile(e.target.value)}
        />
      </div>

      {/* Payment Method */}
      <div className="mb-3">
        <label htmlFor="paymentMethod" className="form-label fw-semibold d-flex align-items-center gap-1">
          <CreditCard size={18} /> Payment Method
        </label>
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
      <h5 className="fw-bold mt-4">Order Summary</h5>
      <ul className="list-group mb-3">
        {cartItems.map((item) => (
          <li
            className="list-group-item d-flex justify-content-between align-items-center"
            key={item._id}
          >
            <span>
              {item.product?.name} x {item.qty}
            </span>
            <span className="d-flex align-items-center gap-1">
              <IndianRupee size={14} />
              {item.qty * item.product?.price}
            </span>
          </li>
        ))}
        <li className="list-group-item d-flex justify-content-between bg-light fw-semibold">
          <span>Total</span>
          <span className="d-flex align-items-center gap-1">
            <IndianRupee size={16} /> {totalPrice}
          </span>
        </li>
      </ul>

      <button
        className="btn btn-success w-100 d-flex justify-content-center align-items-center gap-2"
        onClick={handlePlaceOrder}
        disabled={loading}
      >
        {loading ? "Placing Order..." : "Confirm & Place Order"}
      </button>
    </div>
  );
}

export default CheckoutPage;
