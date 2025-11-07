import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { orderAPI, paymentAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader";

function PaymentPage() {
  const { orderId } = useParams();
  const [searchParams] = useSearchParams();
  const initialMethod = searchParams.get("method") || "qr";

  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [method, setMethod] = useState(initialMethod);
  const [paymentId, setPaymentId] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState({});
  const pollingRef = useRef(null);

  // Fetch order
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
    return () => pollingRef.current && clearInterval(pollingRef.current);
  }, [orderId]);

  // Auto-initiate for QR
  useEffect(() => {
    if (method === "qr" && order) handleInitiatePayment();
  }, [method, order]);

  // ====== CARD VALIDATION ======
  const validateCardDetails = () => {
    const errors = {};
    const digits = cardDetails.number.replace(/\D/g, "");
    if (digits.length !== 16) errors.number = "Card number must be 16 digits.";
    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiry))
      errors.expiry = "Invalid expiry format (MM/YY).";
    if (!/^\d{3,4}$/.test(cardDetails.cvv))
      errors.cvv = "CVV must be 3–4 digits.";
    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // ====== INITIATE PAYMENT ======
  const handleInitiatePayment = async () => {
    setLoading(true);
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
        toast.info("QR Code generated. Please complete payment in your UPI app.");
        startPolling();
      }
    } catch (err) {
      toast.error("Payment initiation failed");
      setError(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  // ====== CONFIRM PAYMENT ======
  const handleConfirmPayment = async () => {
    if (method === "card" && !validateCardDetails()) return;
    setLoading(true);
    try {
      // Confirm payment in backend
      await paymentAPI.confirm(orderId);
      toast.success("Payment successful!");
      clearCart();
      setTimeout(() => navigate(`/order-success/${orderId}`), 1200);
    } catch (err) {
      toast.error("Payment confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  // ====== POLLING (QR) ======
  const startPolling = () => {
    pollingRef.current = setInterval(async () => {
      try {
        const { data } = await paymentAPI.verify(orderId);
        if (data.status === "paid") {
          toast.success("Payment verified successfully!");
          clearCart();
          clearInterval(pollingRef.current);
          navigate(`/order-success/${orderId}`);
        }
      } catch (err) {
        console.error("Polling error:", err.message);
      }
    }, 5000);
  };

  if (!order) return <Loader />;

  return (
    <div className="container mt-4">
      <ToastContainer position="top-right" autoClose={2000} />
      <h2>Payment for Order #{order._id}</h2>
      <h5 className="mb-3">Total Amount: ₹{order.totalPrice}</h5>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* SHOW SELECTED METHOD (readonly) */}
      <div className="alert alert-secondary d-flex align-items-center gap-2">
        <strong>Payment Method:</strong> {method.toUpperCase()}
      </div>

      {/* QR PAYMENT */}
      {method === "qr" && qrCode && (
        <div className="text-center">
          <img src={qrCode} alt="QR Code" style={{ width: 220, height: 220 }} />
          <p className="mt-2 text-muted">
            Scan this QR to pay ₹{order.totalPrice}.
          </p>
          <button
            className="btn btn-success"
            onClick={handleConfirmPayment}
            disabled={loading}
          >
            {loading ? "Confirming..." : "I Have Paid"}
          </button>
        </div>
      )}

      {/* CARD PAYMENT */}
      {method === "card" && (
        <div className="card p-3 shadow-sm">
          <label className="form-label">Card Number</label>
          <input
            type="text"
            inputMode="numeric"
            className={`form-control mb-2 ${cardErrors.number ? "is-invalid" : ""}`}
            placeholder="1234 5678 9012 3456"
            value={cardDetails.number}
            onChange={(e) =>
              setCardDetails({ ...cardDetails, number: e.target.value })
            }
          />
          {cardErrors.number && (
            <div className="invalid-feedback">{cardErrors.number}</div>
          )}

          <div className="d-flex gap-2">
            <div style={{ flex: 1 }}>
              <label className="form-label">Expiry (MM/YY)</label>
              <input
                type="text"
                className={`form-control mb-2 ${cardErrors.expiry ? "is-invalid" : ""}`}
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, expiry: e.target.value })
                }
              />
              {cardErrors.expiry && (
                <div className="invalid-feedback">{cardErrors.expiry}</div>
              )}
            </div>

            <div style={{ width: 120 }}>
              <label className="form-label">CVV</label>
              <input
                type="password"
                className={`form-control mb-2 ${cardErrors.cvv ? "is-invalid" : ""}`}
                placeholder="CVV"
                value={cardDetails.cvv}
                onChange={(e) =>
                  setCardDetails({ ...cardDetails, cvv: e.target.value })
                }
              />
              {cardErrors.cvv && (
                <div className="invalid-feedback">{cardErrors.cvv}</div>
              )}
            </div>
          </div>

          <button
            className="btn btn-success w-100 mt-2"
            onClick={() => {
              handleInitiatePayment();
              setTimeout(() => handleConfirmPayment(), 1000);
            }}
            disabled={loading}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      )}

      {/* COD PAYMENT */}
      {method === "cod" && (
        <div className="alert alert-info mt-3 text-center">
          <strong>Cash on Delivery:</strong> Please pay the amount to the delivery partner when you receive your order.
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
