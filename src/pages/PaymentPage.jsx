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
  const initiatedRef = useRef(false);
  const confirmedRef = useRef(false);

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

  // ===== EXIT OR NAVIGATION ALERT =====
  useEffect(() => {
    const handleUnload = (e) => {
      if (initiatedRef.current && !confirmedRef.current) {
        // Show a toast before exit (using slight delay)
        setTimeout(() => {
          toast.error("Payment initiation failed or cancelled.");
        }, 50);
        e.preventDefault();
        e.returnValue = ""; // triggers browser native warning
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    return () => {
      if (initiatedRef.current && !confirmedRef.current) {
        toast.error("Payment initiation failed or cancelled.");
      }
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

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
      initiatedRef.current = true;

      if (method === "qr") {
        setQrCode(data.qrCodeUrl);
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
    await paymentAPI.confirm(orderId);
    confirmedRef.current = true;
    toast.success("Payment successful!");

    await Promise.resolve(clearCart());
    setTimeout(() => navigate(`/order-success/${orderId}`), 1000);
  } catch (err) {
    toast.error("Payment confirmation failed");
  } finally {
    setLoading(false);
  }
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
