import React, { useEffect, useState, useRef } from "react";
import { orderAPI } from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import Loader from "./Loader";

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
    fetchOrders(); // initial fetch

    pollingRef.current = setInterval(async () => {
      try {
        const qrOrders = ordersRef.current.filter(
          o => !o.isPaid && o.paymentMethod === "qr"
        );

        if (qrOrders.length === 0) return;

        for (const order of qrOrders) {
          const { data } = await orderAPI.verifyPayment(order._id);

          if (data.status === "paid") {
            setOrders(prevOrders =>
              prevOrders.map(o =>
                o._id === order._id
                  ? { ...o, isPaid: true, paymentMethod: data.paymentMethod || o.paymentMethod }
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
  }, []); // Safe to keep empty array because we use ordersRef

  // Optional: fetch orders every 10s to catch new orders or changes
  useEffect(() => {
    const interval = setInterval(fetchOrders, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading) return <Loader />;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (orders.length === 0) return <p className="text-center mt-5">No orders yet.</p>;

  return (
    <div className="container mt-4">
      <h2>My Orders</h2>
      {orders.map(order => (
        <div key={order._id} className="card mb-3 p-3 shadow-sm">
          <div className="d-flex justify-content-between mb-2">
            <span>Order #{order._id}</span>
            <span>{new Date(order.createdAt).toLocaleString()}</span>
          </div>

          <ul className="list-group mb-2">
            {order.items.map((item, idx) => (
              <li key={idx} className="list-group-item d-flex align-items-center">
                <img
                  src={item.product?.image || item.image}
                  alt={item.name}
                  style={{ width: 50, marginRight: 10 }}
                />
                <span>{item.name} x {item.qty}</span>
                <span className="ms-auto">₹{item.price * item.qty}</span>
              </li>
            ))}
          </ul>

          <p>Total: <strong>₹{order.totalPrice}</strong></p>
          <p>
            Payment Status: <strong>{order.isPaid ? "Paid ✅" : "Pending ⏳"}</strong>
          </p>
          <p>
            Delivery Status: <strong>{order.isDelivered ? "Delivered ✅" : "Not Delivered ❌"}</strong>
          </p>

          <div className="d-flex gap-2">
            <Link to={`/order-success/${order._id}`} className="btn btn-sm btn-primary">
              View Details
            </Link>

            {!order.isPaid && order.paymentMethod === "qr" && (
              <button
                className="btn btn-sm btn-success"
                onClick={() => navigate(`/payment/${order._id}`)}
              >
                Pay Now
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default MyOrdersPage;
