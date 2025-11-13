import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderAPI } from "../services/api";
import Loader from "./Loader";
import { ShoppingCart, Package, MapPin, Truck, CheckCircle } from "lucide-react";

// Reusable Rupee formatter
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

  // Stages same as backend
  const stages = [
    { label: "Order Placed", icon: ShoppingCart },
    { label: "Packed", icon: Package },
    { label: "Out for Delivery", icon: MapPin },
    { label: "Delivered", icon: CheckCircle },
  ];

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

  if (loading) return <Loader />;
  if (error)
    return <p className="text-center mt-5 text-danger fw-semibold">{error}</p>;
  if (!order)
    return <p className="text-center mt-5 text-muted">Order not found.</p>;

  // Track delivery progress from backend
  let stage = order.deliveryStage || 1;

  // Freeze at stage 3 when delayed
  if (order.delayMessage && stage < 4) {
    stage = 3;
  }

  const stageIndex = stage - 1;

  // Expected date (from backend)
  const expected = order.expectedDeliveryDate
    ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  return (
    <div className="container py-4" style={{ maxWidth: "960px" }}>
      <h2 className="text-primary mb-4 fw-bold text-center">Order Details</h2>

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
              <strong>Expected Delivery:</strong> {expected}
            </p>

            {order.delayMessage && (
              <p style={{ color: "#dc3545", fontWeight: 600 }}>
                ⚠ Your order may be delayed
              </p>
            )}

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

        {/* DELIVERY TRACKING */}
        <div className="mt-5">
          <h5 className="fw-semibold mb-3">Delivery Tracking</h5>

          <div className="position-relative" style={{ padding: "30px 0 20px" }}>
            {/* Line background */}
            <div
              style={{
                position: "absolute",
                top: "35%",
                left: "10%",
                right: "10%",
                height: 5,
                background: "#e9ecef",
                borderRadius: 5,
              }}
            ></div>

            {/* Progress line */}
            <div
              style={{
                position: "absolute",
                top: "35%",
                left: "10%",
                height: 5,
                width: `${(stageIndex / (stages.length - 1)) * 80}%`,
                background: order.isDelivered ? "#28a745" : "#0d6efd",
                borderRadius: 5,
                transition: "width 0.8s ease-in-out",
              }}
            ></div>

            {/* Stage icons */}
            <div
              className="d-flex justify-content-between"
              style={{ position: "relative", zIndex: 2 }}
            >
              {stages.map(({ label, icon: Icon }, index) => {
                const active = index <= stageIndex;
                const color = active
                  ? order.isDelivered
                    ? "#28a745"
                    : "#0d6efd"
                  : "#adb5bd";

                return (
                  <div
                    key={label}
                    className="text-center"
                    style={{
                      width: `${100 / stages.length}%`,
                      color,
                    }}
                  >
                    <div
                      style={{
                        width: 42,
                        height: 42,
                        borderRadius: "50%",
                        background: active ? color : "#dee2e6",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        margin: "0 auto 10px",
                        fontSize: "20px",
                        boxShadow: active
                          ? `0 0 10px ${color}80`
                          : "inset 0 0 3px rgba(0,0,0,0.1)",
                        transition: "all 0.3s ease",
                      }}
                    >
                      <Icon size={20} />
                    </div>
                    <div
                      style={{
                        fontSize: "0.9rem",
                        fontWeight: active ? 600 : 500,
                      }}
                    >
                      {label}
                    </div>
                  </div>
                );
              })}
            </div>
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
