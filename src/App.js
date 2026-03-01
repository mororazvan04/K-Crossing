import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import { CartProvider } from './context/CartContext';
import { SettingsProvider } from './context/SettingsContext';
import { WishlistProvider } from './context/WishlistContext';
import Contact from './pages/Contact';
import FAQ from './pages/FAQ';

function ScrollToTop() {
    const { pathname } = useLocation();
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    return null;
}

function App() {
    const [searchTerm, setSearchTerm] = useState('');

    return (
        <SettingsProvider>
            <CartProvider>
                <WishlistProvider>
                    <BrowserRouter>
                        <ScrollToTop />
                        <Toaster position="bottom-center" />
                        <div className="min-h-screen flex flex-col bg-[#050505] text-white font-sans selection:bg-brand-accent selection:text-white">

                            <Navbar onSearch={setSearchTerm} />

                            <div className="flex-grow">
                                <Routes>
                                    {/* Ruta Principală */}
                                    <Route path="/" element={<Home searchTerm={searchTerm} />} />

                                    {/* RUTA MAGICĂ: Aceasta preia orice categorie din URL (ex: /category/sale) */}
                                    <Route path="/category/:slug" element={<Home searchTerm={searchTerm} />} />

                                    <Route path="/product/:id" element={<ProductDetails />} />
                                    <Route path="/cart" element={<Cart />} />
                                    <Route path="/checkout" element={<Checkout />} />
                                    <Route path="/wishlist" element={<Wishlist />} />
                                    <Route path="/contact" element={<Contact />} />
                                    <Route path="/faq" element={<FAQ />} />
                                </Routes>
                            </div>

                            <footer className="border-t border-white/10 bg-black py-12 text-center text-gray-500 text-xs tracking-widest uppercase">
                                <div className="mb-4 text-2xl font-black text-white italic">K CROSSING</div>
                                © 2026 Engineered in Romania.
                            </footer>
                        </div>
                    </BrowserRouter>
                </WishlistProvider>
            </CartProvider>
        </SettingsProvider>
    );
}

export default App;