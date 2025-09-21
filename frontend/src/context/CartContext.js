import React, { createContext, useContext, useReducer, useEffect } from "react";
import * as API from "../services/api"; // import all API functions

const CartContext = createContext();

const initialState = {
  cartItems: [],
  loading: false,
  error: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case "FETCH_CART_REQUEST":
      return { ...state, loading: true, error: null };
    case "FETCH_CART_SUCCESS":
      return { ...state, loading: false, cartItems: action.payload };
    case "FETCH_CART_FAIL":
      return { ...state, loading: false, error: action.payload };

    case "ADD_TO_CART":
    case "UPDATE_CART":
    case "REMOVE_FROM_CART":
    case "CLEAR_CART":
      return { ...state, cartItems: action.payload };

    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // ================= Load Cart from DB =================
  const fetchCart = async () => {
    dispatch({ type: "FETCH_CART_REQUEST" });
    try {
      const items = await API.getCart();
      dispatch({ type: "FETCH_CART_SUCCESS", payload: items });
    } catch (error) {
      dispatch({ type: "FETCH_CART_FAIL", payload: error.message });
    }
  };

  // ================= Add to Cart =================
  const addToCart = async (productId, qty = 1) => {
    try {
      const items = await API.addToCart(productId, qty);
      dispatch({ type: "ADD_TO_CART", payload: items });
    } catch (error) {
      console.error("❌ Add to cart failed:", error);
    }
  };

  // ================= Update Quantity =================
  const updateCartQty = async (productId, qty) => {
    try {
      const items = await API.updateCartQty(productId, qty);
      dispatch({ type: "UPDATE_CART", payload: items });
    } catch (error) {
      console.error("❌ Update cart failed:", error);
    }
  };

  // ================= Remove Item =================
  const removeFromCart = async (productId) => {
    try {
      const items = await API.removeFromCart(productId);
      dispatch({ type: "REMOVE_FROM_CART", payload: items });
    } catch (error) {
      console.error("❌ Remove from cart failed:", error);
    }
  };

  // ================= Clear Cart =================
  const clearCart = async () => {
    try {
      const items = await API.clearCart();
      dispatch({ type: "CLEAR_CART", payload: items });
    } catch (error) {
      console.error("❌ Clear cart failed:", error);
    }
  };

  // ================= Load cart on mount =================
  useEffect(() => {
    fetchCart();
  }, []);

  return (
    <CartContext.Provider
      value={{ state, addToCart, updateCartQty, removeFromCart, clearCart, fetchCart }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
