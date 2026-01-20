
import { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

export const useCart = () => {
    return useContext(CartContext);
};

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('pharmacy_cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error('Error loading cart from storage:', error);
            return [];
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem('pharmacy_cart', JSON.stringify(cart));
        } catch (error) {
            console.error('Error saving cart to storage:', error);
        }
    }, [cart]);

    const addToCart = (medicine, quantity = 1) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.medicine._id === medicine._id);
            
            if (existingItem) {
                // Check if adding quantity exceeds stock
                if (existingItem.quantity + quantity > medicine.stock) {
                    toast.error(`Cannot add more. Only ${medicine.stock} left in stock.`);
                    return prevCart;
                }
                
                toast.success('Cart updated');
                return prevCart.map(item => 
                    item.medicine._id === medicine._id 
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            
            if (quantity > medicine.stock) {
                toast.error(`Cannot add. Only ${medicine.stock} left in stock.`);
                return prevCart;
            }

            toast.success('Added to cart');
            return [...prevCart, { medicine, quantity }];
        });
    };

    const removeFromCart = (medicineId) => {
        setCart(prevCart => prevCart.filter(item => item.medicine._id !== medicineId));
        toast.success('Removed from cart');
    };

    const updateQuantity = (medicineId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(medicineId);
            return;
        }

        setCart(prevCart => 
            prevCart.map(item => {
                if (item.medicine._id === medicineId) {
                    if (newQuantity > item.medicine.stock) {
                        toast.error(`Only ${item.medicine.stock} items available`);
                        return item;
                    }
                    return { ...item, quantity: newQuantity };
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCart([]);
        toast.success('Cart cleared');
    };

    const getCartTotal = () => {
        return cart.reduce((total, item) => total + (item.medicine.price * item.quantity), 0);
    };

    const getCartCount = () => {
        return cart.reduce((count, item) => count + item.quantity, 0);
    };

    const value = {
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount
    };

    return (
        <CartContext.Provider value={value}>
            {children}
        </CartContext.Provider>
    );
};
