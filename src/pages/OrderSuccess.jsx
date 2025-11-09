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
  const [progressStage, setProgressStage] = useState(1);
  const [expectedDate, setExpectedDate] = useState("");

  // Delivery stages
  const stages = ["Order Placed", "Packed", "Shipped", "Out for Delivery", "Delivered"];

  // === Fetch Order ===
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await orderAPI.getById(orderId);
        setOrder(data);

        // Calculate expected delivery (5 days from order date)
        const expected = new Date(data.createdAt);
        expected.setDate(expected.getDate() + 5);
        setExpectedDate(
          expected.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        );

        // Auto calculate delivery progress
        const orderDate = new Date(data.createdAt);
        const now = new Date();
        const daysPassed = Math.min(
          5,
          Math.max(1, Math.ceil((now - orderDate) / (1000 * 60 * 60 * 24)) + 1)
        );

        // If order is already delivered (from backend)
        if (data.isDelivered) {
          setProgressStage(stages.length); // move bar to 100%
        } else {
          setProgressStage(daysPassed);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();

    // Auto-refresh every 15 seconds to reflect real-time delivery update
    const interval = setInterval(fetchOrder, 15000);
    return () => clearInterval(interval);
  }, [orderId]);

  // === Success animation ===
  useEffect(() => {
    if (!loading && order) {
      setShowAnimation(true);
      const timer = setTimeout(() => setShowAnimation(false), 2400);
      return () => clearTimeout(timer);
    }
  }, [loading, order]);

  // === Inject Animations Once ===
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
      {/* Success Animation */}
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
              <svg viewBox="0 0 52 52" width="58" height="58">
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
              <h3 style={{ margin: 0, fontSize: 22, color: "#222", fontWeight: 700 }}>
                Order Successful!
              </h3>
              <p style={{ margin: 0, marginTop: 6, color: "#555" }}>
                Thank you — your order was placed successfully.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Order Details Section */}
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
          {/* === Left Details === */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <p><strong>Order ID:</strong> <span style={{ color: "#444" }}>{order._id}</span></p>
            <p><strong>Payment Method:</strong> {order.paymentMethod.toUpperCase()}</p>
            <p><strong>Status:</strong>{" "}
              <span style={{ color: order.isPaid ? "#28a745" : "#f0ad4e" }}>
                {order.isPaid ? "Paid" : "Pending"}
              </span>
            </p>
            <p><strong>Total Amount:</strong>{" "}
              <span style={{ fontWeight: 600 }}>₹{order.totalPrice.toLocaleString("en-IN")}</span>
            </p>
            <p><strong>Delivery Charge:</strong>{" "}
              {order.shippingPrice > 0 ? (
                <span>₹{order.shippingPrice}</span>
              ) : (
                <span style={{ color: "#28a745", fontWeight: 600 }}>Free</span>
              )}
            </p>
            <p><strong>Expected Delivery:</strong> {expectedDate}</p>
            {order.isDelivered && (
              <p style={{ color: "#28a745", fontWeight: 600 }}>
                 Delivered on{" "}
                {new Date(order.deliveredAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </p>
            )}
          </div>

          {/* === Right (Items List) === */}
          <div style={{ flex: 1, minWidth: 280 }}>
            <h5>Items Ordered</h5>
            <ul style={{ listStyle: "none", paddingLeft: 0, margin: 0 }}>
              {order.items.map((item, idx) => (
                <li
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    background: idx % 2 === 0 ? "#fafafa" : "transparent",
                    padding: "8px 10px",
                    borderRadius: 8,
                    marginBottom: 6,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: 45,
                          height: 45,
                          borderRadius: 6,
                          objectFit: "cover",
                          border: "1px solid #ddd",
                        }}
                      />
                    )}
                    <span style={{ color: "#333" }}>
                      {item.name} × {item.qty}
                    </span>
                  </div>
                  <strong>₹{(item.price * item.qty).toLocaleString("en-IN")}</strong>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Delivery Progress Bar */}
        <div style={{ marginTop: 30 }}>
          <h5>Delivery Status</h5>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              position: "relative",
              marginTop: 16,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                right: 0,
                height: 6,
                background: "#e9ecef",
                transform: "translateY(-50%)",
                borderRadius: 4,
              }}
            ></div>
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: 0,
                height: 6,
                width: `${(progressStage / stages.length) * 100}%`,
                background: order.isDelivered ? "#28a745" : "#0d6efd",
                transform: "translateY(-50%)",
                borderRadius: 4,
                transition: "width 0.6s ease",
              }}
            ></div>
            {stages.map((label, index) => (
              <div
                key={label}
                style={{
                  zIndex: 2,
                  textAlign: "center",
                  width: "20%",
                  color:
                    index + 1 <= progressStage
                      ? order.isDelivered
                        ? "#28a745"
                        : "#0d6efd"
                      : "#999",
                }}
              >
                <div
                  style={{
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background:
                      index + 1 <= progressStage
                        ? order.isDelivered
                          ? "#28a745"
                          : "#0d6efd"
                        : "#ccc",
                    margin: "0 auto 6px",
                  }}
                ></div>
                <small style={{ fontSize: 12 }}>{label}</small>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop: 28 }}>
          <Link to="/" className="btn btn-primary">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
