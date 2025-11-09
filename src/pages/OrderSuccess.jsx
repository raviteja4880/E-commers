import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import Loader from "./Loader";

// ✅ Reusable Rupee formatter (consistent across app)
const Rupee = ({ value, size = "1rem", bold = false, color = "#000" }) => (
  <span
    style={{
      fontFamily:
        "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: size,
      fontWeight: bold ? 600 : 500,
      color,
      display: "inline-flex",
      alignItems: "baseline",
      gap: "2px",
    }}
  >
    <span
      style={{
        fontFamily: "sans-serif",
        fontWeight: 600,
        transform: "translateY(-0.5px)",
      }}
    >
      ₹
    </span>
    <span>{value?.toLocaleString("en-IN")}</span>
  </span>
);

function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [progressStage, setProgressStage] = useState(1);
  const [expectedDate, setExpectedDate] = useState("");

  const stages = [
    "Order Placed",
    "Packed",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const { data } = await orderAPI.getById(orderId);
        setOrder(data);

        // Expected delivery = 5 days from order creation
        const expected = new Date(data.createdAt);
        expected.setDate(expected.getDate() + 5);
        setExpectedDate(
          expected.toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
          })
        );

        // Calculate progress
        const orderDate = new Date(data.createdAt);
        const now = new Date();
        const daysPassed = Math.min(
          5,
          Math.max(1, Math.ceil((now - orderDate) / (1000 * 60 * 60 * 24)) + 1)
        );

        if (data.isDelivered) setProgressStage(stages.length);
        else setProgressStage(daysPassed);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load order");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) return <Loader />;
  if (error)
    return <p className="text-center mt-5 text-danger fw-semibold">{error}</p>;
  if (!order)
    return <p className="text-center mt-5 text-muted">Order not found.</p>;

  return (
    <div className="container py-4" style={{ maxWidth: "960px" }}>
      <h2 className="text-primary mb-4 fw-bold text-center">
        Order Details
      </h2>

      <div className="card shadow-sm p-4 rounded-4 border-0">
        <div className="row gy-3">
          {/* LEFT COLUMN */}
          <div className="col-md-6">
            <p>
              <strong>Order ID:</strong> {order._id}
            </p>
            <p>
              <strong>Payment Method:</strong>{" "}
              {order.paymentMethod?.toUpperCase()}
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span
                style={{
                  color: order.isPaid ? "#28a745" : "#f0ad4e",
                  fontWeight: 600,
                }}
              >
                {order.isPaid ? "Paid" : "Pending"}
              </span>
            </p>
            <p>
              <strong>Total:</strong>{" "}
              <Rupee value={order.totalPrice} bold size="1.05rem" />
            </p>
            <p>
              <strong>Expected Delivery:</strong> {expectedDate}
            </p>
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

          {/* RIGHT COLUMN */}
          <div className="col-md-6">
            <h5 className="fw-semibold mb-3">Items Ordered</h5>
            <ul className="list-unstyled m-0">
              {order.items.map((item, idx) => (
                <li
                  key={idx}
                  className="d-flex align-items-center justify-content-between border-bottom py-2"
                >
                  <div className="d-flex align-items-center gap-2">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        style={{
                          width: 50,
                          height: 50,
                          borderRadius: 6,
                          objectFit: "cover",
                          border: "1px solid #ddd",
                        }}
                      />
                    )}
                    <span className="fw-medium">
                      {item.name} × {item.qty}
                    </span>
                  </div>
                  <Rupee value={item.price * item.qty} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* DELIVERY STATUS */}
        <div className="mt-5">
          <h5 className="fw-semibold mb-3">Delivery Status</h5>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              position: "relative",
              padding: "10px 0",
              marginTop: 10,
            }}
          >
            {/* Background bar */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "5%",
                right: "5%",
                height: 6,
                background: "#e9ecef",
                borderRadius: 4,
              }}
            ></div>

            {/* Progress bar */}
            <div
              style={{
                position: "absolute",
                top: "50%",
                left: "5%",
                height: 6,
                width: `${(progressStage / stages.length) * 90}%`,
                background: order.isDelivered ? "#28a745" : "#0d6efd",
                borderRadius: 4,
                transition: "width 0.6s ease",
              }}
            ></div>

            {/* Stages */}
            {stages.map((label, index) => (
              <div
                key={label}
                style={{
                  zIndex: 2,
                  textAlign: "center",
                  width: `${100 / stages.length}%`,
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
                    width: 18,
                    height: 18,
                    borderRadius: "50%",
                    background:
                      index + 1 <= progressStage
                        ? order.isDelivered
                          ? "#28a745"
                          : "#0d6efd"
                        : "#ccc",
                    margin: "0 auto 8px",
                  }}
                ></div>
                <small
                  style={{
                    fontSize: 14,
                    fontWeight: 500,
                    whiteSpace: "nowrap",
                  }}
                >
                  {label}
                </small>
              </div>
            ))}
          </div>
        </div>

        {/* BUTTON */}
        <div className="mt-4 text-center">
          <Link to="/" className="btn btn-primary px-4 fw-semibold rounded-3">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccessPage;
