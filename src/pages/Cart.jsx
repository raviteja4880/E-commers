import React from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import Loader from "../pages/Loader";

function Cart() {
  const { state, updateCartQty, removeFromCart, clearCart } = useCart();
  const { cartItems, totalPrice, loading, error } = state;
  const navigate = useNavigate();

  if (loading) return <Loader />;
  if (error) return <p className="text-center mt-5 text-danger">{error}</p>;

  // ✅ Helper function to handle safe updates
  const handleQuantityChange = (productId, value) => {
    const qty = Math.max(1, Number(value) || 1); // Prevents 0 or NaN
    updateCartQty(productId, qty);
  };

  return (
    <div className="container mt-4 mb-5">
      <h2 className="fw-bold mb-4 text-center">My Cart</h2>

      {cartItems.length === 0 ? (
        <div className="text-center mt-5">
          <p>Your cart is empty.</p>
          <button className="btn btn-primary mt-3" onClick={() => navigate("/")}>
            Go Shopping
          </button>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="table align-middle border shadow-sm">
              <thead className="table-light">
                <tr>
                  <th>Product</th>
                  <th>Price</th>
                  <th>Quantity</th>
                  <th>Subtotal</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {cartItems.map((item) => {
                  const productId = item.product?._id ?? item.productId;
                  const productName = item.product?.name || "Product Unavailable";
                  const productPrice = item.product?.price || 0;

                  return (
                    <tr key={productId}>
                      <td>{productName}</td>
                      <td>₹{productPrice}</td>
                      <td>
                        <div className="d-flex align-items-center justify-content-center">
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() =>
                              handleQuantityChange(productId, item.qty - 1)
                            }
                            disabled={item.qty <= 1}
                          >
                            -
                          </button>

                          <input
                            type="number"
                            value={item.qty}
                            min="1"
                            style={{
                              width: "60px",
                              textAlign: "center",
                              border: "1px solid #ccc",
                              borderRadius: "5px",
                              padding: "4px",
                            }}
                            onChange={(e) =>
                              handleQuantityChange(productId, e.target.value)
                            }
                            onBlur={(e) => {
                              if (!e.target.value || e.target.value < 1) {
                                handleQuantityChange(productId, 1);
                              }
                            }}
                          />

                          <button
                            className="btn btn-sm btn-outline-secondary ms-2"
                            onClick={() =>
                              handleQuantityChange(productId, item.qty + 1)
                            }
                          >
                            +
                          </button>
                        </div>
                      </td>
                      <td>₹{(productPrice * item.qty).toFixed(2)}</td>
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
          </div>

          <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4 p-3 border rounded shadow-sm bg-light">
            <h4 className="mb-3 mb-md-0">Total: ₹{totalPrice.toFixed(2)}</h4>
            <div>
              <button
                className="btn btn-outline-danger me-3"
                onClick={clearCart}
              >
                Clear Cart
              </button>
              <button
                className="btn btn-success"
                onClick={() => navigate("/checkout")}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Cart;
