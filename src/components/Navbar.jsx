import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Search, Heart, Globe, X } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

export default function Navbar({ onSearch }) {
    const { cart } = useCart();
    const { wishlist } = useWishlist();
    const { lang, setLang, currency, setCurrency, availableLanguages, exchangeRates, t } = useSettings();
    const navigate = useNavigate();

    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const settingsRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (settingsRef.current && !settingsRef.current.contains(event.target)) {
                setIsSettingsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [settingsRef]);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-xl border-b border-black/5 transition-all duration-300">
                <div className="max-w-[1800px] mx-auto px-6 h-20 flex justify-between items-center">

                    <Link to="/" className="text-3xl font-black tracking-tighter italic z-50 cursor-pointer text-black">
                        K <span className="text-brand-accent">CROSSING</span>
                    </Link>

                    {/* MENIU CENTRAL - Text gri închis */}
                    <div className="hidden md:flex gap-8 text-sm font-bold tracking-widest uppercase text-gray-500">
                        <Link to="/category/new-drops" className="hover:text-black transition cursor-pointer">{t.newDrops}</Link>
                        <Link to="/category/collection" className="hover:text-black transition cursor-pointer">{t.collection}</Link>
                        <Link to="/category/sale" className="hover:text-brand-accent transition text-brand-accent cursor-pointer">{t.sale}</Link>

                        {/* LINK-UL DE CONTACT */}
                        <Link to="/contact" className="hover:text-black transition cursor-pointer">
                            {t.contact || "CONTACT"}
                        </Link>
                    </div>

                    <div className="flex items-center gap-6 z-50">

                        {/* SETĂRI */}
                        <div className="relative" ref={settingsRef}>
                            <button
                                onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                                className={`hover:text-black transition flex items-center gap-1 ${isSettingsOpen ? 'text-black' : 'text-gray-500'}`}
                            >
                                <Globe size={20} />
                                <span className="text-[10px] font-bold uppercase hidden md:block">{lang.toUpperCase()} / {currency}</span>
                            </button>

                            <AnimatePresence>
                                {isSettingsOpen && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full right-0 mt-6 w-56 bg-white border border-black/5 p-5 rounded-2xl shadow-xl flex flex-col gap-5 z-50"
                                    >
                                        <div>
                                            <h3 className="text-xs text-gray-400 font-bold uppercase mb-3 tracking-widest px-1">Language</h3>
                                            <div className="flex flex-col gap-1">
                                                {availableLanguages.map((l) => (
                                                    <button
                                                        key={l.code}
                                                        onClick={() => { setLang(l.code); setIsSettingsOpen(false); }}
                                                        className={`text-left text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-3 transition-all ${lang === l.code ? 'bg-black/5 text-brand-accent' : 'text-gray-500 hover:bg-black/5 hover:text-black'}`}
                                                    >
                                                        <span className="text-lg leading-none">{l.name.split(' ')[0]}</span>
                                                        <span>{l.name.split(' ')[1]}</span>
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="h-[1px] bg-black/5 w-full" />

                                        <div>
                                            <h3 className="text-xs text-gray-400 font-bold uppercase mb-3 tracking-widest px-1">Currency</h3>
                                            <div className="grid grid-cols-3 gap-2">
                                                {Object.keys(exchangeRates).map((curr) => (
                                                    <button
                                                        key={curr}
                                                        onClick={() => { setCurrency(curr); setIsSettingsOpen(false); }}
                                                        className={`text-center text-xs font-bold py-2 rounded-lg border transition-all ${currency === curr ? 'border-brand-accent text-brand-accent bg-brand-accent/10' : 'border-black/10 text-gray-500 hover:border-black/30 hover:text-black'}`}
                                                    >
                                                        {curr}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* ICONIȚE */}
                        <button onClick={() => setIsSearchOpen(!isSearchOpen)} className="hover:text-brand-accent transition text-gray-500 hover:text-black">
                            {isSearchOpen ? <X size={24} /> : <Search size={24} />}
                        </button>

                        <Link to="/wishlist" className="relative hover:text-red-500 transition cursor-pointer text-gray-500 hover:text-black">
                            <Heart size={24} />
                            {wishlist.length > 0 && <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"/>}
                        </Link>

                        <Link to="/cart" className="relative hover:text-brand-accent transition text-gray-500 hover:text-black">
                            <ShoppingBag size={24} />
                            {cart.length > 0 && (
                                <span className="absolute -top-2 -right-2 bg-brand-accent text-white text-[10px] font-black rounded-sm w-4 h-4 flex items-center justify-center">
                                    {cart.length}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </nav>

            {/* SEARCH OVERLAY */}
            <AnimatePresence>
                {isSearchOpen && (
                    <motion.div
                        initial={{ y: -20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        className="fixed top-20 left-0 w-full bg-white/90 backdrop-blur-xl border-b border-black/5 z-40 p-8 shadow-sm"
                    >
                        <div className="max-w-[1200px] mx-auto relative">
                            <Search className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-400" size={32} />
                            <input
                                autoFocus
                                type="text"
                                placeholder={t.searchPlaceholder.toUpperCase()}
                                onChange={(e) => onSearch && onSearch(e.target.value)}
                                className="w-full bg-transparent text-3xl md:text-5xl font-black text-black placeholder-gray-300 outline-none uppercase tracking-tighter pl-12 md:pl-16 py-4"
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}