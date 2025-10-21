import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { state, updateCartQty, removeFromCart, clearCart } = useCart();
  const { cartItems, totalPrice, loading, error } = state; // ✅ totalPrice from context
  const navigate = useNavigate();

  if (loading) return <p className="text-center mt-5">Loading cart...</p>;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;

  return (
    <div className="container mt-4">
      <h2>My Cart</h2>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <>
          <table className="table table-bordered mt-3">
            <thead>
              <tr>
                <th>Product</th>
                <th>Price</th>
                <th>Qty</th>
                <th>Subtotal</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {cartItems.map((item) => (
                <tr key={item._id || item.product?._id}>
                  <td>{item.product?.name || "Unnamed Product"}</td>
                  <td>₹{item.product?.price || 0}</td>
                  <td>
                    <div className="d-flex align-items-center">
                      <button
                        className="btn btn-sm btn-outline-secondary me-2"
                        onClick={() =>
                          updateCartQty(item.product?._id, item.qty - 1)
                        }
                        disabled={item.qty <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.qty}
                        min="1"
                        style={{ width: "60px", textAlign: "center" }}
                        onChange={(e) =>
                          updateCartQty(
                            item.product?._id,
                            Number(e.target.value)
                          )
                        }
                      />
                      <button
                        className="btn btn-sm btn-outline-secondary ms-2"
                        onClick={() =>
                          updateCartQty(item.product?._id, item.qty + 1)
                        }
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td>₹{(item.product?.price || 0) * item.qty}</td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => removeFromCart(item.product?._id)}
                    >
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <h4>Total: ₹{totalPrice}</h4> {/* ✅ backend-driven total */}
            <div>
              <button
                className="btn btn-outline-danger me-2"
                onClick={clearCart}
              >
                Clear Cart
              </button>

              <button
                className="btn btn-success"
                onClick={() => navigate("/checkout")}
              >
                Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
