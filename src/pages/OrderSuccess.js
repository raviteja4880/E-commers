import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { orderAPI } from "../services/api";

function OrderSuccessPage() {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  if (loading) return <p className="text-center mt-5">Loading order...</p>;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;
  if (!order) return <p className="text-center mt-5">Order not found.</p>;

  return (
    <div className="container mt-4">
      <h2>Order Confirmation</h2>
      <p>Order ID: <strong>{order._id}</strong></p>
      <p>Payment Method: <strong>{order.paymentMethod.toUpperCase()}</strong></p>
      <p>Status: <strong>{order.isPaid ? "Paid" : "Pending"}</strong></p>
      <p>Total Amount: <strong>₹{order.totalPrice}</strong></p>

      <h4 className="mt-4">Items</h4>
      <ul className="list-group mb-3">
        {order.items.map((item, idx) => (
          <li key={idx} className="list-group-item d-flex justify-content-between">
            {item.name} x {item.qty}
            <span>₹{item.price * item.qty}</span>
          </li>
        ))}
      </ul>

      <h5>Shipping Address</h5>
      <p>{order.shippingAddress}</p>

      {order.paymentMethod === "qr" && !order.isPaid && (
        <p className="text-warning">
          Scan the QR code on payment page to complete the payment.
        </p>
      )}

      <Link to="/" className="btn btn-primary mt-3">
        Back to Home
      </Link>
    </div>
  );
}

export default OrderSuccessPage;
