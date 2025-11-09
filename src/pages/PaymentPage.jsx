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

  // ===== FETCH ORDER =====
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

  // ===== AUTO-INITIATE QR =====
  useEffect(() => {
    if (method === "qr" && order) handleInitiatePayment();
  }, [method, order]);

  // ===== CARD VALIDATION =====
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

  // ===== INITIATE PAYMENT =====
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
        startPolling();
      }
    } catch (err) {
      toast.error("Payment initiation failed");
      setError(err.response?.data?.message || "Failed to initiate payment");
    } finally {
      setLoading(false);
    }
  };

  // ===== CONFIRM PAYMENT =====
  const handleConfirmPayment = async () => {
    if (method === "card" && !validateCardDetails()) return;

    setLoading(true);
    try {
      const res = await paymentAPI.confirm(orderId);

      if (res?.data?.success) {
        clearCart();

        // Show Success Animation Overlay
        const overlay = document.createElement("div");
        overlay.innerHTML = `
          <div id="success-overlay" style="
            position: fixed; inset: 0;
            display: flex; justify-content: center; align-items: center;
            background: rgba(255,255,255,0.95);
            z-index: 9999;
            flex-direction: column;
            font-family: sans-serif;
            animation: fadeIn 0.3s ease-in;
          ">
            <div style="
              width: 120px; height: 120px;
              background: #28a745;
              border-radius: 50%;
              display: grid; place-items: center;
              animation: popIn 0.5s ease-out;
              box-shadow: 0 6px 25px rgba(40,167,69,0.25);
            ">
              <svg viewBox="0 0 52 52" width="58" height="58">
                <circle cx="26" cy="26" r="24" fill="transparent" stroke="rgba(255,255,255,0.2)" strokeWidth="2"/>
                <path d="M14 27 L22.5 35 L38 18"
                  fill="transparent" stroke="#fff" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"
                  style="stroke-dasharray: 1000; stroke-dashoffset: 1000; animation: draw 0.8s ease forwards 0.2s;"
                />
              </svg>
            </div>
            <h3 style="margin-top: 20px; color: #222;">Payment Successful!</h3>
            <p style="color: #555;">Your order has been placed successfully.</p>
          </div>
          <style>
            @keyframes draw { to { stroke-dashoffset: 0; } }
            @keyframes fadeIn { from {opacity: 0;} to {opacity: 1;} }
            @keyframes popIn { 0% {transform: scale(0);} 70% {transform: scale(1.1);} 100% {transform: scale(1);} }
          </style>
        `;
        document.body.appendChild(overlay);

        // Redirect after animation
        setTimeout(() => {
          document.getElementById("success-overlay")?.remove();
          navigate(`/order-success/${orderId}`);
        }, 2500);
      } else {
        toast.error("Payment confirmation failed");
      }
    } catch (err) {
      toast.error("Payment confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  // ===== POLLING (QR) =====
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
    <div className="container mt-4" style={{ maxWidth: "650px" }}>
      <ToastContainer position="top-right" autoClose={2000} />
      <div className="text-center mb-4">
        <h2 className="fw-bold">Payment for Order #{order._id}</h2>
        <h5 className="text-muted">Total Amount: ₹{order.totalPrice}</h5>
      </div>

      {error && (
        <div className="alert alert-danger text-center fw-semibold">{error}</div>
      )}

      <div className="alert alert-secondary text-center shadow-sm rounded-3 fw-semibold">
        <strong>Payment Method:</strong> {method.toUpperCase()}
      </div>

      {/* ===== QR PAYMENT ===== */}
      {method === "qr" && (
        <div className="text-center mt-4">
          {!qrCode && loading ? (
            <div
              className="d-flex flex-column align-items-center justify-content-center border rounded-4 shadow-sm p-4"
              style={{ height: 260 }}
            >
              <div className="spinner-border text-primary mb-3" role="status" />
              <p className="text-muted fw-semibold">
                Generating secure payment QR...
              </p>
            </div>
          ) : (
            qrCode && (
              <div className="p-4 border rounded-4 shadow-sm d-inline-block bg-light">
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="rounded-3 shadow-sm"
                  style={{ width: 220, height: 220 }}
                />
                <p className="mt-3 text-muted fw-semibold">
                  Scan this QR to pay ₹{order.totalPrice}.
                </p>
                <button
                  className="btn btn-success px-4 fw-semibold mt-2"
                  onClick={handleConfirmPayment}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      />
                      Confirming...
                    </>
                  ) : (
                    "I Have Paid"
                  )}
                </button>
              </div>
            )
          )}
        </div>
      )}

      {/* ===== CARD PAYMENT ===== */}
      {method === "card" && (
        <div className="card shadow-lg p-4 mt-4 border-0 rounded-4">
          <h5 className="text-center fw-semibold mb-4">Card Payment</h5>

          <label className="form-label fw-semibold">Card Number</label>
          <input
            type="text"
            inputMode="numeric"
            className={`form-control mb-2 py-2 ${
              cardErrors.number ? "is-invalid" : ""
            }`}
            placeholder="1234 5678 9012 3456"
            value={cardDetails.number}
            onChange={(e) =>
              setCardDetails({ ...cardDetails, number: e.target.value })
            }
          />
          {cardErrors.number && (
            <div className="invalid-feedback">{cardErrors.number}</div>
          )}

          <div className="d-flex gap-3 mt-3">
            <div className="flex-fill">
              <label className="form-label fw-semibold">Expiry (MM/YY)</label>
              <input
                type="text"
                className={`form-control py-2 ${
                  cardErrors.expiry ? "is-invalid" : ""
                }`}
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
              <label className="form-label fw-semibold">CVV</label>
              <input
                type="password"
                className={`form-control py-2 ${
                  cardErrors.cvv ? "is-invalid" : ""
                }`}
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
            className="btn btn-primary w-100 mt-4 py-2 fw-semibold rounded-3"
            onClick={() => {
              handleInitiatePayment();
              setTimeout(() => handleConfirmPayment(), 1000);
            }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                />
                Processing...
              </>
            ) : (
              "Pay Now"
            )}
          </button>
        </div>
      )}

      {/* ===== COD PAYMENT ===== */}
      {method === "cod" && (
        <div className="alert alert-info mt-4 text-center rounded-3 shadow-sm">
          <strong>Cash on Delivery:</strong> Please pay the amount to the
          delivery partner when you receive your order.
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
