import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, X, HeartCrack, ArrowLeft } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Wishlist() {
    const { wishlist, toggleWishlist } = useWishlist();
    const { addToCart } = useCart();
    const { t, formatPrice } = useSettings();

    const moveToCart = (product) => {
        addToCart(product);
        toggleWishlist(product);
        toast.success(`${product.name} ${t.moveCart}`, {
            style: { background: '#fff', color: '#000', border: '1px solid #eee' },
            iconTheme: { primary: '#FF4D00', secondary: '#fff' }
        });
    };

    // --- STARE DE GOL ---
    if (wishlist.length === 0) {
        return (
            <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-center text-black pt-20">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center flex flex-col items-center"
                >
                    <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-400">
                        <HeartCrack size={40} />
                    </div>
                    <h1 className="text-3xl font-black italic mb-2 uppercase">{t.emptyWishlist}</h1>
                    <p className="text-gray-500 mb-8 uppercase tracking-widest text-xs">{t.emptyCartSubtext}</p>

                    <Link to="/" className="bg-black text-white px-8 py-4 font-black uppercase tracking-widest hover:bg-brand-accent transition duration-300 rounded">
                        {t.startHunting}
                    </Link>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f5f5f5] text-black pt-28 pb-12">
            <div className="max-w-[1800px] mx-auto px-6">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/10 pb-6 mb-12 gap-4">
                    <div className="flex items-baseline gap-4">
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-black leading-none">
                            WISHLIST
                        </h1>
                        <span className="text-brand-accent font-mono text-xl md:text-3xl font-bold">
                    // {wishlist.length.toString().padStart(2, '0')}
                </span>
                    </div>

                    <Link to="/" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black flex items-center gap-2 transition pb-2">
                        <ArrowLeft size={16} /> {t.collection || "Back to Collection"}
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <AnimatePresence>
                        {wishlist.map((product) => (
                            <motion.div
                                key={product.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="group relative bg-white border border-black/5 hover:shadow-xl transition duration-500"
                            >
                                {/* Imagine */}
                                <Link to={`/product/${product.id}`} className="block aspect-[3/4] overflow-hidden relative">
                                    <img
                                        src={product.images ? product.images[0] : product.image}
                                        alt={product.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-700"
                                    />

                                    <button
                                        onClick={(e) => {
                                            e.preventDefault();
                                            toggleWishlist(product);
                                        }}
                                        className="absolute top-2 right-2 p-2 bg-white/80 backdrop-blur hover:bg-red-500 hover:text-white text-black rounded-full transition z-20 cursor-pointer"
                                    >
                                        <X size={16} />
                                    </button>
                                </Link>

                                {/* Info */}
                                <div className="p-5">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h3 className="text-lg font-bold uppercase leading-none mb-1 text-black">{product.name}</h3>
                                            <p className="text-xs text-gray-500 uppercase tracking-widest">{product.category}</p>
                                        </div>
                                        <span className="font-mono text-brand-accent font-bold">{formatPrice(product.price)}</span>
                                    </div>

                                    <button
                                        onClick={() => moveToCart(product)}
                                        className="w-full py-3 border border-black/10 hover:bg-black hover:text-white font-bold uppercase text-xs tracking-widest transition flex items-center justify-center gap-2 cursor-pointer bg-gray-50 text-black"
                                    >
                                        <ShoppingBag size={14} /> {t.moveCart}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}