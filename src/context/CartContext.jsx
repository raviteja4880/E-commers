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
        error: null,
      };

    case "FAILURE":
      return { ...state, loading: false, error: action.payload };

    case "CLEAR":
      return { ...state, cartItems: [], totalPrice: 0, loading: false, error: null };

    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Centralized function to safely fetch the user's cart
  const fetchCart = async () => {
    dispatch({ type: "REQUEST" });
    try {
      const { data } = await cartAPI.get();
      dispatch({ type: "SUCCESS", payload: data });
    } catch (err) {
      if (err.response?.status === 401) {
        // Unauthenticated — clear cart
        dispatch({ type: "CLEAR" });
      } else {
        dispatch({
          type: "FAILURE",
          payload: err.response?.data?.message || "Failed to load cart",
        });
      }
    }
  };

  // Load cart only if user is logged in
  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    if (userInfo?.token) fetchCart();
  }, []);

  // Add to Cart
  const addToCart = async (productId, qty = 1) => {
    dispatch({ type: "REQUEST" });
    try {
      await cartAPI.add(productId, qty);
      await fetchCart(); 
    } catch (err) {
      if (err.response?.status === 401) {
        dispatch({ type: "CLEAR" });
      } else {
        dispatch({
          type: "FAILURE",
          payload: err.response?.data?.message || "Failed to add to cart",
        });
      }
    }
  };

  const updateCartQty = async (productId, qty) => {
  if (qty <= 0) return removeFromCart(productId);
  dispatch({ type: "REQUEST" });
  try {
    const { data } = await cartAPI.update(productId, qty);
    dispatch({ type: "SUCCESS", payload: data });
  } catch (err) {
    dispatch({
      type: "FAILURE",
      payload: err.response?.data?.message || "Failed to update quantity",
    });
  }
};

const removeFromCart = async (productId) => {
  dispatch({ type: "REQUEST" });
  try {
    const { data } = await cartAPI.remove(productId);
    dispatch({ type: "SUCCESS", payload: data });
  } catch (err) {
    dispatch({
      type: "FAILURE",
      payload: err.response?.data?.message || "Failed to remove item",
    });
  }
};

  // Clear Cart
  const clearCart = async () => {
    dispatch({ type: "REQUEST" });
    try {
      await cartAPI.clear();
      dispatch({ type: "CLEAR" });
    } catch (err) {
      dispatch({
        type: "FAILURE",
        payload: err.response?.data?.message || "Failed to clear cart",
      });
    }
  };

  return (
    <CartContext.Provider
      value={{
        state,
        fetchCart,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => useContext(CartContext);
