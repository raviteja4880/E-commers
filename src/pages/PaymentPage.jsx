import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { orderAPI, paymentAPI } from "../services/api";
import { useCart } from "../context/CartContext";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Loader from "./Loader";

function PaymentPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { clearCart } = useCart();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [qrCode, setQrCode] = useState(null);
  const [method, setMethod] = useState("qr");
  const [paymentId, setPaymentId] = useState(null);
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });
  const [cardErrors, setCardErrors] = useState({});
  const pollingRef = useRef(null);

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

  useEffect(() => {
    if (method === "qr" && order) handleInitiatePayment();
  }, [method, order]);

  const formatCardNumber = (value) => {
    const digits = value.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const luhnCheck = (num) => {
    const digits = num.replace(/\D/g, "");
    let sum = 0;
    let shouldDouble = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = parseInt(digits.charAt(i), 10);
      if (shouldDouble) {
        d *= 2;
        if (d > 9) d -= 9;
      }
      sum += d;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  const validateExpiry = (value) => {
    if (!/^\d{2}\/\d{2}$/.test(value)) return false;
    const [mmStr, yyStr] = value.split("/");
    const mm = parseInt(mmStr, 10);
    const yy = parseInt(yyStr, 10);
    if (mm < 1 || mm > 12) return false;
    const fullYear = 2000 + yy;
    const expiryDate = new Date(fullYear, mm, 0, 23, 59, 59);
    return expiryDate >= new Date();
  };

  const validateCvv = (cvv) => /^\d{3,4}$/.test(cvv);

  const validateCardDetails = () => {
    const errors = {};
    const digitsOnly = cardDetails.number.replace(/\D/g, "");

    if (digitsOnly.length !== 16) {
      errors.number = "Card number must be 16 digits.";
    } else if (!luhnCheck(digitsOnly)) {
      errors.number = "Invalid card number.";
    }

    if (!validateExpiry(cardDetails.expiry)) {
      errors.expiry = "Invalid or expired date.";
    }

    if (!validateCvv(cardDetails.cvv)) {
      errors.cvv = "CVV must be 3–4 digits.";
    }

    setCardErrors(errors);
    return Object.keys(errors).length === 0;
  };

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
        toast.info("QR Code generated. Please complete payment in your UPI app.");
        startPolling();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Payment initiation failed");
      toast.error("Payment initiation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmPayment = async () => {
    if (method === "card" && !validateCardDetails()) return;
    setLoading(true);
    try {
      if (method === "qr" || method === "card") {
        await paymentAPI.confirm(orderId);
      }
      await orderAPI.pay(orderId, { method, status: "paid" });
      toast.success("Payment successful!");
      clearCart();
      setTimeout(() => navigate(`/order-success/${orderId}`), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment confirmation failed");
    } finally {
      setLoading(false);
    }
  };

  const startPolling = () => {
    if (pollingRef.current) clearInterval(pollingRef.current);
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
            onClick={handleConfirmPayment}
            disabled={loading}
          >
            {loading ? "Processing..." : "Pay Now"}
          </button>
        </div>
      )}

      {method === "cod" && (
        <div className="text-center mt-3">
          <button
            className="btn btn-primary"
            disabled={loading}
            onClick={async () => {
              try {
                setLoading(true);
                await orderAPI.pay(orderId, { method: "COD", status: "paid" });
                toast.success("COD order confirmed!");
                clearCart();
                setTimeout(() => navigate(`/order-success/${orderId}`), 1200);
              } catch (err) {
                toast.error("Failed to confirm COD order.");
              } finally {
                setLoading(false);
              }
            }}
          >
            {loading ? "Confirming..." : "Confirm COD Order"}
          </button>
        </div>
      )}
    </div>
  );
}

export default PaymentPage;
