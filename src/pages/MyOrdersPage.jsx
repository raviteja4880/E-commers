import React, { useEffect, useState, useRef } from "react";
import { orderAPI } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import Loader from "./Loader";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaClock,
  FaTruck,
  FaMoneyBillWave,
  FaQrcode,
  FaCreditCard,
} from "react-icons/fa";

function MyOrdersPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const pollingRef = useRef(null);
  const ordersRef = useRef(orders);
  const navigate = useNavigate();

  // Keep ref updated
  useEffect(() => {
    ordersRef.current = orders;
  }, [orders]);

  // Fetch orders from backend
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

  // Polling payment status every 3 seconds
  useEffect(() => {
    fetchOrders();

    pollingRef.current = setInterval(async () => {
      try {
        const qrOrders = ordersRef.current.filter(
          (o) => !o.isPaid && o.paymentMethod === "qr"
        );

        if (qrOrders.length === 0) return;

        for (const order of qrOrders) {
          const { data } = await orderAPI.verifyPayment(order._id);

          if (data.status === "paid") {
            setOrders((prevOrders) =>
              prevOrders.map((o) =>
                o._id === order._id
                  ? {
                      ...o,
                      isPaid: true,
                      paymentMethod: data.paymentMethod || o.paymentMethod,
                    }
                  : o
              )
            );
          }
        }
      } catch (err) {
        console.error("Payment polling error:", err);
      }
    }, 3000);

    return () => clearInterval(pollingRef.current);
  }, []);

  // Refetch orders every 10s for updates
  useEffect(() => {
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (orders.length === 0)
    return <p className="text-center mt-5">No orders yet.</p>;

  return (
    <div className="container mt-4">
      <h2 className="mb-4">My Orders</h2>
      {orders.map((order) => (
        <div key={order._id} className="card mb-3 p-3 shadow-sm">
          <div className="d-flex justify-content-between mb-2">
            <span className="fw-semibold">Order #{order._id}</span>
            <span className="text-muted">
              {new Date(order.createdAt).toLocaleString()}
            </span>
          </div>

          <ul className="list-group mb-2">
            {order.items.map((item, idx) => (
              <li
                key={idx}
                className="list-group-item d-flex align-items-center"
              >
                <img
                  src={item.product?.image || item.image}
                  alt={item.name}
                  style={{ width: 50, marginRight: 10, borderRadius: "6px" }}
                />
                <span>
                  {item.name} <small className="text-muted">x {item.qty}</small>
                </span>
                <span className="ms-auto fw-semibold">
                  ₹{item.price * item.qty}
                </span>
              </li>
            ))}
          </ul>

          <p className="mb-1">
            Total: <strong>₹{order.totalPrice}</strong>
          </p>

          <p className="mb-1">
            {order.isPaid ? (
              <span className="text-success d-flex align-items-center gap-2">
                Payment Status: Paid <FaCheckCircle />
              </span>
            ) : (
              <span className="text-warning d-flex align-items-center gap-2">
                Payment Status: Pending <FaClock />
              </span>
            )}
          </p>

          <p className="mb-2">
            {order.isDelivered ? (
              <span className="text-success d-flex align-items-center gap-2">
                Delivery Status: Delivered <FaTruck />
              </span>
            ) : (
              <span className="text-danger d-flex align-items-center gap-2">
                Delivery Status: Not Delivered <FaTimesCircle />
              </span>
            )}
          </p>

          {/* Payment Options for Pending Orders */}
          {!order.isPaid && (
            <div className="d-flex align-items-center gap-2">
              {/* Show single "Pay Now" button for QR/Card orders */}
              {(order.paymentMethod === "qr" ||
                order.paymentMethod === "card") && (
                <button
                  className="btn btn-sm btn-success d-flex align-items-center gap-1"
                  onClick={() =>
                    navigate(`/payment/${order._id}?method=${order.paymentMethod}`)
                  }
                >
                  Pay Now
                </button>
              )}

              {/* COD: Dropdown that acts as button */}
              {order.paymentMethod === "COD" && (
                <CODDropdown orderId={order._id} />
              )}
            </div>
          )}

          <div className="d-flex gap-2 mt-3">
            <Link
              to={`/order-success/${order._id}`}
              className="btn btn-sm btn-outline-primary"
            >
              View Details
            </Link>
          </div>
        </div>
      ))}
    </div>
  );
}

// COD Dropdown Component (self-contained)
const CODDropdown = ({ orderId }) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="position-relative" ref={dropdownRef}>
      <button
        className="btn btn-sm btn-success d-flex align-items-center gap-2"
        onClick={() => setOpen(!open)}
      >
        Pay Now
      </button>

      {open && (
        <ul
          className="dropdown-menu show shadow mt-1"
          style={{
            position: "absolute",
            zIndex: 1050,
            display: "block",
            minWidth: "200px",
          }}
        >
          <li>
            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => {
                navigate(`/payment/${orderId}?method=qr`);
                setOpen(false);
              }}
            >
              <FaQrcode /> Pay via QR Code
            </button>
          </li>
          <li>
            <button
              className="dropdown-item d-flex align-items-center gap-2"
              onClick={() => {
                navigate(`/payment/${orderId}?method=card`);
                setOpen(false);
              }}
            >
              <FaCreditCard /> Pay via Debit Card
            </button>
          </li>
        </ul>
      )}
    </div>
  );
};

export default MyOrdersPage;
