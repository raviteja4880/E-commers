import React, { createContext, useContext, useReducer } from "react";

const CartContext = createContext();

const initialState = {
  cartItems: [],
};

function cartReducer(state, action) {
  switch (action.type) {
    case "ADD_TO_CART": {
      const item = action.payload;
      const exist = state.cartItems.find((x) => x._id === item._id);
      if (exist) {
        return {
          ...state,
          cartItems: state.cartItems.map((x) =>
            x._id === item._id ? { ...x, qty: x.qty + 1 } : x
          ),
        };
      }
      return {
        ...state,
        cartItems: [...state.cartItems, { ...item, qty: 1 }],
      };
    }
    case "REMOVE_FROM_CART":
      return {
        ...state,
        cartItems: state.cartItems.filter((x) => x._id !== action.payload),
      };
    case "CLEAR_CART":
      return initialState;
    default:
      return state;
  }
}

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  return (
    <CartContext.Provider value={{ state, dispatch }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
