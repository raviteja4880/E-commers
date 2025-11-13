import React, { useEffect, useState, useRef } from "react";
import { orderAPI } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import Loader from "./Loader";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTruck,
  FaQrcode,
  FaCreditCard,
} from "react-icons/fa";

// Unified Rupee formatter
const Rupee = ({ value, size = "1rem", bold = false, color = "#000" }) => (
  <span
    style={{
      fontFamily: "system-ui, sans-serif",
      fontSize: size,
      fontWeight: bold ? 600 : 500,
      color,
    }}
  >
    ₹{value?.toLocaleString("en-IN")}
  </span>
);

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const { data } = await orderAPI.getMyOrders();
      setOrders(data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (orders.length === 0)
    return <p className="text-center mt-5 fs-5 text-muted">No orders yet.</p>;

  return (
    <div
      className="container-fluid py-5 px-3 px-md-5"
      style={{ backgroundColor: "#f8f9fb", minHeight: "100vh" }}
    >
      <h2 className="text-center fw-bold mb-5" style={{ color: "#007bff" }}>
        My Orders
      </h2>

      <div
        className="order-grid"
        style={{
          display: "grid",
          gap: "24px",
          gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))",
          maxWidth: "1400px",
          margin: "0 auto",
        }}
      >
        {orders.map((order) => (
          <OrderCard key={order._id} order={order} navigate={navigate} />
        ))}
      </div>
    </div>
  );
}

// ========================= ORDER CARD =========================
const OrderCard = ({ order, navigate }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // FIXED: Use backend expectedDeliveryDate (NOT createdAt)
  const expectedDelivery = order.expectedDeliveryDate
    ? new Date(order.expectedDeliveryDate).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : "N/A";

  const deliveredDate = order.deliveredAt
    ? new Date(order.deliveredAt).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null;

  // DELIVERY STAGES FROM BACKEND
  const stages = ["Placed", "Packed", "Out for Delivery", "Delivered"];
  const stageIndex = (order.deliveryStage || 1) - 1;

  // Dropdown close handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        buttonRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !buttonRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="order-card position-relative"
      style={{
        background: "#fff",
        borderRadius: "16px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}
    >
      {/* HEADER */}
      <div
        className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom"
        style={{ background: "#f9fafc" }}
      >
        <span style={{ fontSize: "0.85rem" }}>
          <strong style={{ color: "#007bff" }}>
            #{order._id.slice(-6).toUpperCase()}
          </strong>
        </span>

        <span className="text-muted" style={{ fontSize: "0.85rem" }}>
          {new Date(order.createdAt).toLocaleDateString("en-IN")}
        </span>
      </div>

      {/* ITEMS */}
      <div className="p-3">
        {order.items.map((item, idx) => (
          <div
            key={idx}
            className="d-flex justify-content-between align-items-center mb-2"
          >
            <div className="d-flex align-items-center gap-2">
              <img
                src={item.image || item.product?.image}
                alt={item.name}
                style={{
                  width: 50,
                  height: 50,
                  borderRadius: 6,
                  objectFit: "cover",
                }}
              />

              <div>
                <div style={{ fontSize: "0.9rem", fontWeight: 500 }}>
                  {item.name}
                </div>
                <small className="text-muted">x {item.qty}</small>
              </div>
            </div>

            <Rupee value={item.price * item.qty} />
          </div>
        ))}
      </div>

      {/* TOTAL */}
      <div
        className="d-flex justify-content-between px-3 py-2 border-top border-bottom"
        style={{ background: "#f9fafc", fontWeight: "600" }}
      >
        <span>Total</span>
        <Rupee value={order.totalPrice} bold />
      </div>

      {/* DELIVERY TRACKING BAR */}
      <div className="px-3 pt-3 pb-2">
        <div className="fw-semibold mb-2">Delivery Progress</div>

        {/* Background Line */}
        <div
          style={{
            height: 6,
            borderRadius: 5,
            background: "#e0e0e0",
            position: "relative",
          }}
        >
          {/* Progress Line */}
          <div
            style={{
              height: 6,
              width: `${(stageIndex / 3) * 100}%`,
              background: order.isDelivered ? "#28a745" : "#007bff",
              borderRadius: 5,
              transition: "0.4s ease",
            }}
          ></div>
        </div>

        <div className="d-flex justify-content-between mt-2">
          {stages.map((s, i) => (
            <small
              key={s}
              style={{
                fontWeight: i <= stageIndex ? "700" : "500",
                color: i <= stageIndex ? "#007bff" : "#999",
              }}
            >
              {s}
            </small>
          ))}
        </div>
      </div>

      {/* STATUS BADGES */}
      <div className="px-3 py-2 d-flex flex-column gap-2">
        <StatusBadge
          isActive={order.isPaid}
          activeColor="#28a745"
          inactiveColor="#ffc107"
          icon={order.isPaid ? <FaCheckCircle /> : <FaClock />}
          label={order.isPaid ? "Paid" : "Payment Pending"}
        />

        <StatusBadge
          isActive={order.isDelivered}
          activeColor="#28a745"
          inactiveColor="#dc3545"
          icon={order.isDelivered ? <FaTruck /> : <FaTimesCircle />}
          label={order.isDelivered ? "Delivered" : "Not Delivered"}
        />
      </div>

      {/* BUTTONS */}
      <div className="px-3 pb-3">
        <Link
          to={`/order-success/${order._id}`}
          className="btn w-100 fw-semibold py-2"
          style={{
            borderRadius: "10px",
            border: "1.5px solid #007bff",
            color: "#007bff",
            background: "#fff",
          }}
        >
          View Details
        </Link>
      </div>

      {/* FOOTER - Expected / Delivered */}
      <div
        className="text-center border-top py-2"
        style={{ background: "#f9fafc", fontSize: "0.85rem" }}
      >
        {order.isDelivered ? (
          <span style={{ color: "#28a745", fontWeight: 600 }}>
            Delivered At: {deliveredDate}
          </span>
        ) : (
          <span>
            Expected Delivery:{" "}
            <strong style={{ color: "#333" }}>{expectedDelivery}</strong>
          </span>
        )}
      </div>
    </div>
  );
};

// ========================= STATUS BADGE =========================
const StatusBadge = ({ isActive, activeColor, inactiveColor, icon, label }) => (
  <div
    className="badge d-flex align-items-center justify-content-center gap-2"
    style={{
      backgroundColor: isActive ? `${activeColor}22` : `${inactiveColor}22`,
      color: isActive ? activeColor : inactiveColor,
      fontSize: "0.9rem",
      padding: "8px",
      borderRadius: "8px",
      width: "100%",
    }}
  >
    {icon} {label}
  </div>
);

export default MyOrdersPage;
