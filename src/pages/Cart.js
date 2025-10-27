import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

function Cart() {
  const { state, updateCartQty, removeFromCart, clearCart } = useCart();
  const { cartItems, totalPrice, loading, error } = state;
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
              {cartItems.map((item) => {
                const productId = item.product?._id || item.product;
                const productName = item.product?.name || "Product Unavailable";
                const productPrice = item.product?.price || 0;

                return (
                  <tr key={item._id || productId}>
                    <td>{productName}</td>
                    <td>₹{productPrice}</td>
                    <td>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => updateCartQty(productId, item.qty - 1)}
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
                              productId,
                              Math.max(1, Number(e.target.value) || 1)
                            )
                          }
                        />

                        <button
                          className="btn btn-sm btn-outline-secondary ms-2"
                          onClick={() => updateCartQty(productId, item.qty + 1)}
                        >
                          +
                        </button>
                      </div>
                    </td>

                    <td>₹{productPrice * item.qty}</td>
                    <td>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => removeFromCart(productId)}
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <div className="d-flex justify-content-between align-items-center mt-4">
            <h4>Total: ₹{totalPrice}</h4>
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
