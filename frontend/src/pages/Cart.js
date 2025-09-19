import React from "react";
import { useCart } from "../context/CartContext";

function Cart() {
  const { state, dispatch } = useCart();

  if (state.cartItems.length === 0) {
    return <h2 style={{ textAlign: "center", marginTop: "50px" }}>🛒 Your Cart is Empty</h2>;
  }

  const total = state.cartItems.reduce(
    (sum, item) => sum + item.price * item.qty,
    0
  );

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>Your Shopping Cart</h2>

      {state.cartItems.map((item) => (
        <div key={item._id} style={styles.cartItem}>
          <img src={item.image} alt={item.name} style={styles.image} />

          <div style={styles.details}>
            <h3>{item.name}</h3>
            <p style={styles.brand}>{item.brand}</p>
            <p style={styles.price}>₹{item.price}</p>
          </div>

          <div style={styles.actions}>
            <button
              style={styles.qtyBtn}
              onClick={() =>
                dispatch({ type: "REMOVE_FROM_CART", payload: item._id })
              }
            >
              –
            </button>
            <span style={styles.qty}>{item.qty}</span>
            <button
              style={styles.qtyBtn}
              onClick={() =>
                dispatch({ type: "ADD_TO_CART", payload: item })
              }
            >
              +
            </button>
          </div>

          <div style={styles.totalPrice}>
            ₹{(item.price * item.qty).toFixed(2)}
          </div>
        </div>
      ))}

      {/* Footer with total & buy button */}
      <div style={styles.footer}>
        <h3>Total: ₹{total.toFixed(2)}</h3>
        <button style={styles.buyBtn}>Buy Now</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: "20px",
    maxWidth: "800px",
    margin: "auto",
  },
  heading: {
    textAlign: "center",
    marginBottom: "20px",
  },
  cartItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
    padding: "15px",
    marginBottom: "15px",
    borderRadius: "10px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  image: {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "8px",
  },
  details: {
    flex: 1,
    marginLeft: "15px",
  },
  brand: {
    fontSize: "14px",
    color: "gray",
  },
  price: {
    fontSize: "16px",
    fontWeight: "bold",
    color: "green",
  },
  actions: {
    display: "flex",
    alignItems: "center",
  },
  qtyBtn: {
    padding: "5px 10px",
    fontSize: "18px",
    fontWeight: "bold",
    border: "1px solid #007bff",
    backgroundColor: "#fff",
    color: "#007bff",
    borderRadius: "5px",
    cursor: "pointer",
  },
  qty: {
    margin: "0 10px",
    fontSize: "16px",
    fontWeight: "bold",
  },
  totalPrice: {
    fontWeight: "bold",
    fontSize: "16px",
    marginLeft: "20px",
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "20px",
    padding: "15px",
    borderTop: "2px solid #ddd",
    position: "sticky",
    bottom: 0,
    backgroundColor: "#fff",
  },
  buyBtn: {
    padding: "10px 20px",
    backgroundColor: "#28a745",
    border: "none",
    color: "#fff",
    borderRadius: "8px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
  },
};

export default Cart;
