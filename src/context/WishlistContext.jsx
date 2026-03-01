import { createContext, useContext, useState } from 'react';
import toast from 'react-hot-toast';

const WishlistContext = createContext();

export const useWishlist = () => useContext(WishlistContext);

export const WishlistProvider = ({ children }) => {
    const [wishlist, setWishlist] = useState([]);

    const toggleWishlist = (product) => {
        setWishlist(prev => {
            const exists = prev.find(item => item.id === product.id);
            if (exists) {
                toast.error('Removed from wishlist', {
                    style: { background: '#111', color: '#fff' }
                });
                return prev.filter(item => item.id !== product.id);
            } else {
                toast.success('Saved to wishlist', {
                    style: { background: '#111', color: '#fff' },
                    icon: '🖤'
                });
                return [...prev, product];
            }
        });
    };

    const isInWishlist = (id) => wishlist.some(item => item.id === id);

    return (
        <WishlistContext.Provider value={{ wishlist, toggleWishlist, isInWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};