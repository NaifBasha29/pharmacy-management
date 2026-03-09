import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load cart from storage on mount
  useEffect(() => {
    loadCart();
  }, []);

  // Save cart to storage whenever it changes
  useEffect(() => {
    saveCart();
  }, [cart]);

  const loadCart = async () => {
    try {
      const savedCart = await SecureStore.getItemAsync('cart');
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
    } catch (error) {
      console.log('Error loading cart:', error);
    }
  };

  const saveCart = async () => {
    try {
      await SecureStore.setItemAsync('cart', JSON.stringify(cart));
    } catch (error) {
      console.log('Error saving cart:', error);
    }
  };

  const addToCart = (medicine, quantity = 1) => {
    setCart(prev => {
      const existing = prev.find(item => item._id === medicine._id);
      if (existing) {
        return prev.map(item =>
          item._id === medicine._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...medicine, quantity }];
    });
  };

  const updateQuantity = (medicineId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(medicineId);
      return;
    }
    setCart(prev =>
      prev.map(item =>
        item._id === medicineId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (medicineId) => {
    setCart(prev => prev.filter(item => item._id !== medicineId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, item) => sum + ((item.price || 0) * (item.quantity || 0)), 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{
      cart,
      addToCart,
      updateQuantity,
      removeFromCart,
      clearCart,
      cartTotal,
      cartCount
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
