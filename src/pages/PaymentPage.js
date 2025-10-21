import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI, paymentAPI } from "../services/api";
import { useCart } from "../context/CartContext";

function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { state, clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [method, setMethod] = useState("qr");
  const [paymentId, setPaymentId] = useState(null);
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvv: "" });

  const pollingRef = useRef(null);

  // Fetch order details
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await orderAPI.getById(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order");
      }
    };
    fetchOrder();

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [orderId]);

  // Initiate payment when method changes to QR automatically
  useEffect(() => {
    if (method === "qr" && order) {
      handleInitiatePayment();
    }
  }, [method, order]);

  const handleInitiatePayment = async () => {
    setLoading(true);
    setError("");

    try {
      const payload = {
        orderId,
        amount: order.totalPrice,
        method,
        ...(method === "card" ? { cardDetails } : {}),
      };

      const { data } = await paymentAPI.initiate(payload);
      setPaymentId(data.paymentId);

      if (method === "qr") {
        setQrCode(data.qrCodeUrl);
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  // Confirm payment
  const handleConfirmPayment = async () => {
    if (!paymentId) return;

    setLoading(true);
    setError("");

    try {
      await paymentAPI.confirm(orderId);
      clearCart();
      navigate(`/order-success/${orderId}`);
    } catch (err) {
      setError(err.response?.data?.message || "Payment confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  if (!order) return <p className="text-center mt-5">Loading order...</p>;

  return (
    <div className="container mt-4">
      <h2>Payment for Order #{order._id}</h2>
      <h5 className="mb-3">Total Amount: ₹{order.totalPrice}</h5>
      {error && <div className="alert alert-danger">{error}</div>}

      {/* Select Payment Method */}
      <div className="mb-3">
        <label className="form-label">Choose Payment Method:</label>
        <select
          className="form-select"
          value={method}
          onChange={(e) => {
            setMethod(e.target.value);
            setQrCode(null);
          }}
        >
          <option value="qr">Pay via QR Code</option>
          <option value="card">Pay via Debit Card</option>
          <option value="cod">Cash on Delivery</option>
        </select>
      </div>

      {/* QR Payment */}
      {method === "qr" && qrCode && (
        <div className="mb-3 text-center">
          <img src={qrCode} alt="QR Code" style={{ width: 200 }} />
          <p className="mt-2 text-muted">
            Scan the QR code with your UPI app. Amount: ₹{order.totalPrice}
          </p>
          <button className="btn btn-success" onClick={handleConfirmPayment} disabled={loading}>
            {loading ? "Confirming..." : "I Have Paid"}
          </button>
        </div>
      )}

      {/* Card Payment */}
      {method === "card" && (
        <div className="card p-3 shadow-sm">
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Card Number"
            value={cardDetails.number}
            onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
          />
          <input
            type="text"
            className="form-control mb-2"
            placeholder="Expiry (MM/YY)"
            value={cardDetails.expiry}
            onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
          />
          <input
            type="password"
            className="form-control mb-2"
            placeholder="CVV"
            value={cardDetails.cvv}
            onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
          />
          <button className="btn btn-success w-100" onClick={handleConfirmPayment} disabled={loading}>
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      )}

      {/* COD */}
      {method === "cod" && (
        <div className="text-center mt-3">
          <button className="btn btn-primary" onClick={() => { clearCart(); navigate(`/order-success/${orderId}`); }}>
            Confirm COD Order
          </button>
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
