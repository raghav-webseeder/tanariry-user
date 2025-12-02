// src/context/CartContext.js
'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext();

const getItemId = (item) => item._id || item.id;

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_TO_CART': {
      const payloadId = getItemId(action.payload);
      const existing = state.find(item => getItemId(item) === payloadId);

      if (existing) {
        
        const newQuantity = existing.quantity + (action.payload.quantity || 1);
        return state.map(item =>
          getItemId(item) === payloadId
            ? { ...item, quantity: newQuantity }
            : item
        );
      }
   
      return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }];
    }

    case 'REMOVE_FROM_CART': {
      const idToRemove = action.payload;
      return state.filter(item => getItemId(item) !== idToRemove);
    }

    case 'UPDATE_QUANTITY': {
      const { id, quantity } = action.payload;
      if (quantity <= 0) {
        return state.filter(item => getItemId(item) !== id);
      }
      return state.map(item =>
        getItemId(item) === id
          ? { ...item, quantity }
          : item
      );
    }

    case 'CLEAR_CART':
      return [];

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [cart, dispatch] = useReducer(cartReducer, [], () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('cart');
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);


  const addToCart = (product) => {
    const quantity = product.quantity && product.quantity > 0 ? product.quantity : 1;
    const itemToAdd = {
      ...product,
      quantity
    };
    dispatch({ type: 'ADD_TO_CART', payload: itemToAdd });
  };

  const removeFromCart = (id) => {
    dispatch({ type: 'REMOVE_FROM_CART', payload: id });
  };

  const updateQuantity = (id, quantity) => {
    dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within CartProvider');
  return context;
};