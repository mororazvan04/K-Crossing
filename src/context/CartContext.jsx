import { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
    // 1. INIȚIALIZARE
    const [cart, setCart] = useState(() => {
        try {
            const savedCart = localStorage.getItem('k-crossing-cart');
            return savedCart ? JSON.parse(savedCart) : [];
        } catch (error) {
            console.error("Error reading cart from localStorage", error);
            return [];
        }
    });

    // 2. SALVARE AUTOMATĂ
    useEffect(() => {
        localStorage.setItem('k-crossing-cart', JSON.stringify(cart));
    }, [cart]);

    // --- Funcții Coș ---

    const addToCart = (product) => {
        setCart((prevCart) => {
            // Generăm un ID Unic bazat pe ID-ul produsului ȘI Mărimea selectată
            // Ex: Dacă produsul are id 5 și mărimea L -> uniqueId = "5-L"
            const size = product.selectedSize || 'STD';
            const uniqueId = `${product.id}-${size}`;

            // Verificăm dacă acest produs specific (cu această mărime) există deja
            const existingItem = prevCart.find((item) => item.uniqueId === uniqueId);

            if (existingItem) {
                // Doar creștem cantitatea
                return prevCart.map((item) =>
                    item.uniqueId === uniqueId
                        ? { ...item, qty: item.qty + 1 }
                        : item
                );
            } else {
                // Adăugăm ca produs nou, salvând și uniqueId-ul pentru referințe viitoare
                return [
                    ...prevCart,
                    {
                        ...product,
                        qty: 1,
                        selectedSize: size,
                        uniqueId: uniqueId // Salvăm cheia unică
                    }
                ];
            }
        });
    };

    // Modificat să șteargă după uniqueId (ca să nu șteargă toate mărimile deodată)
    const removeFromCart = (uniqueId) => {
        setCart((prevCart) => prevCart.filter((item) => item.uniqueId !== uniqueId));
    };

    // Modificat să actualizeze după uniqueId
    const updateQty = (uniqueId, amount) => {
        setCart((prevCart) =>
            prevCart.map((item) => {
                if (item.uniqueId === uniqueId) {
                    const newQty = item.qty + amount;
                    return newQty > 0 ? { ...item, qty: newQty } : item;
                }
                return item;
            })
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQty, clearCart, total }}>
            {children}
        </CartContext.Provider>
    );
}

export const useCart = () => useContext(CartContext);