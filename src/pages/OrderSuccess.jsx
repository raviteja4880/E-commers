import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import Loader from "./Loader";

function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showAnimation, setShowAnimation] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await orderAPI.getById(orderId);
        setOrder(data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  // Trigger animation AFTER loading completes and order is available
  useEffect(() => {
    if (!loading && order) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [loading, order]);

  // Inject animations once
  useEffect(() => {
    if (!document.getElementById("order-success-animations")) {
      const style = document.createElement("style");
      style.id = "order-success-animations";
      style.innerHTML = `
        @keyframes os-fadeIn { from { opacity: 0; transform: scale(.98); } to { opacity: 1; transform: scale(1); } }
        @keyframes os-pop { 0% { transform: scale(0); } 70% { transform: scale(1.06);} 100% { transform: scale(1);} }
        @keyframes os-draw { 0% { stroke-dashoffset: 1000; } 100% { stroke-dashoffset: 0; } }
      `;
      document.head.appendChild(style);
    }
  }, []);

  if (loading) return <Loader />;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;
  if (!order) return <p className="text-center mt-5">Order not found.</p>;

  return (
    <div
      className="container"
      style={{
        minHeight: "80vh",
        paddingTop: "40px",
        paddingBottom: "60px",
        display: "flex",
        justifyContent: "center",
      }}
    >
      {/* ✅ Success animation overlay */}
      {showAnimation && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(255,255,255,0.92)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
            pointerEvents: "auto",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "18px",
              animation: "os-fadeIn .35s ease-out",
            }}
          >
            <div
              style={{
                width: 120,
                height: 120,
                borderRadius: "50%",
                background: "#28a745",
                display: "grid",
                placeItems: "center",
                boxShadow: "0 8px 30px rgba(40,167,69,0.18)",
                transformOrigin: "center",
                animation: "os-pop .55s cubic-bezier(.2,.9,.2,1)",
              }}
            >
              <svg
                viewBox="0 0 52 52"
                width="58"
                height="58"
                style={{ display: "block" }}
              >
                <circle
                  cx="26"
                  cy="26"
                  r="24"
                  fill="transparent"
                  stroke="rgba(255,255,255,0.12)"
                  strokeWidth="2"
                />
                <path
                  d="M14 27 L22.5 35 L38 18"
                  fill="transparent"
                  stroke="#fff"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    strokeDasharray: 1000,
                    strokeDashoffset: 1000,
                    animation: "os-draw .8s ease forwards .15s",
                  }}
                />
              </svg>
            </div>

            <div style={{ textAlign: "center" }}>
              <h3
                style={{
                  margin: 0,
                  fontSize: 22,
                  color: "#222",
                  fontWeight: 700,
                }}
              >
                Order Successful!
              </h3>
              <p style={{ margin: 0, marginTop: 6, color: "#555" }}>
                Thank you — your order was placed successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Order details section */}
      <div
        style={{
          width: "100%",
          maxWidth: 960,
          background: "#fff",
          borderRadius: 12,
          padding: "26px",
          boxShadow: "0 6px 30px rgba(16,24,40,0.06)",
        }}
      >
        <h2 style={{ color: "#0d6efd", marginBottom: 14 }}>Order Confirmation</h2>

        <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
          <div style={{ flex: 1, minWidth: 280 }}>
            <p style={{ marginBottom: 8 }}>
              <strong>Order ID:</strong>{" "}
              <span style={{ color: "#444" }}>{order._id}</span>
            </p>
            <p style={{ marginBottom: 8 }}>
              <strong>Payment Method:</strong>{" "}
              <span style={{ color: "#444" }}>
                {order.paymentMethod.toUpperCase()}
              </span>
            </p>
            <p style={{ marginBottom: 8 }}>
              <strong>Status:</strong>{" "}
              <span style={{ color: order.isPaid ? "#28a745" : "#f0ad4e" }}>
                {order.isPaid ? "Paid" : "Pending"}
              </span>
            </p>
            <p style={{ marginBottom: 8 }}>
              <strong>Total Amount:</strong>{" "}
              <span style={{ color: "#222", fontWeight: 600 }}>
                ₹{order.totalPrice}
              </span>
            </p>
          </div>

          <div style={{ flex: 1, minWidth: 280 }}>
            <h5 style={{ marginTop: 0, marginBottom: 10 }}>Items</h5>
            <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
              {order.items.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "10px 12px",
                    borderRadius: 8,
                    background: idx % 2 === 0 ? "#fafafa" : "transparent",
                    marginBottom: 8,
                  }}
                >
                  <span style={{ color: "#333" }}>
                    {item.name} × {item.qty}
                  </span>
                  <strong style={{ color: "#111" }}>
                    ₹{item.price * item.qty}
                  </strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ marginTop: 18 }}>
          <h5 style={{ marginBottom: 8 }}>Shipping Address</h5>
          <p style={{ margin: 0, color: "#444" }}>{order.shippingAddress}</p>
        </div>

        {order.paymentMethod === "qr" && !order.isPaid && (
          <p style={{ color: "#856404", marginTop: 12 }}>
            Please scan the QR code on the payment page to complete your
            payment.
          </p>
        )}

        <div style={{ marginTop: 20 }}>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
