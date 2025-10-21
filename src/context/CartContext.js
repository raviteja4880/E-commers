import React, { createContext, useContext, useReducer, useEffect } from "react";
import { cartAPI } from "../services/api";

const CartContext = createContext();

const initialState = {
  cartItems: [],
  totalPrice: 0,
  loading: false,
  error: null,
};

function cartReducer(state, action) {
  switch (action.type) {
    case "REQUEST":
      return { ...state, loading: true, error: null };
    case "SUCCESS":
      return {
        ...state,
        loading: false,
        cartItems: action.payload.items || [],
        totalPrice: action.payload.totalPrice || 0,
      };
    case "FAILURE":
      return { ...state, loading: false, error: action.payload };
    case "CLEAR":
      return { ...state, cartItems: [], totalPrice: 0, loading: false };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Fetch cart
  const fetchCart = async () => {
    dispatch({ type: "REQUEST" });
    try {
      const { data } = await cartAPI.get();
      dispatch({ type: "SUCCESS", payload: data });
    } catch (err) {
      dispatch({
        type: "FAILURE",
        payload: err.response?.data?.message || "Failed to load cart",
      });
    }
  };

  // Auto load cart when provider mounts ✅
  useEffect(() => {
    fetchCart();
  }, []);

  // Add item
  const addToCart = async (productId, qty = 1) => {
    dispatch({ type: "REQUEST" });
    try {
      const { data } = await cartAPI.add(productId, qty);
      dispatch({ type: "SUCCESS", payload: data });
    } catch (err) {
      dispatch({
        type: "FAILURE",
        payload: err.response?.data?.message || "Add to cart failed",
      });
    }
  };

  // Update quantity
  const updateCartQty = async (productId, qty) => {
    if (!qty || qty <= 0) return; // prevent invalid qty
    dispatch({ type: "REQUEST" });
    try {
      const { data } = await cartAPI.update(productId, qty);
      dispatch({ type: "SUCCESS", payload: data });
    } catch (err) {
      dispatch({
        type: "FAILURE",
        payload: err.response?.data?.message || "Update failed",
      });
    }
  };

  // Remove item
  const removeFromCart = async (productId) => {
    dispatch({ type: "REQUEST" });
    try {
      const { data } = await cartAPI.remove(productId);
      dispatch({ type: "SUCCESS", payload: data });
    } catch (err) {
      dispatch({
        type: "FAILURE",
        payload: err.response?.data?.message || "Remove failed",
      });
    }
  };

  // Clear cart
  const clearCart = async () => {
    dispatch({ type: "REQUEST" });
    try {
      const { data } = await cartAPI.clear();
      dispatch({ type: "SUCCESS", payload: data }); // backend should return { items: [], totalPrice: 0 }
    } catch (err) {
      dispatch({
        type: "FAILURE",
        payload: err.response?.data?.message || "Clear cart failed",
      });
    }
  };

  return (
    <CartContext.Provider
      value={{ state, fetchCart, addToCart, updateCartQty, removeFromCart, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
