import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart, ArrowLeft, Globe, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Cart() {
    const { cart, removeFromCart, updateQty, total } = useCart();
    const { t, formatPrice, convertPrice } = useSettings();

    // --- STATE PENTRU ESTIMARE LIVRARE ---
    const [selectedCountry, setSelectedCountry] = useState('Romania'); // Default
    const [countries, setCountries] = useState([]);
    const [countryRegions, setCountryRegions] = useState({}); // Dicționar: { "Japan": "Asia", "France": "Europe" }
    const [isLoading, setIsLoading] = useState(true);

    // 1. Încărcăm Țările și Regiunile
    useEffect(() => {
        fetch('https://restcountries.com/v3.1/all?fields=name,region')
            .then(res => res.json())
            .then(data => {
                const countryList = [];
                const regionMap = {};

                data.forEach(c => {
                    const name = c.name.common;
                    countryList.push(name);
                    regionMap[name] = c.region;
                });

                setCountries(countryList.sort());
                setCountryRegions(regionMap);
                setIsLoading(false);
            })
            .catch(() => {
                setCountries(['Romania', 'Germany', 'USA', 'France', 'Italy']);
                setIsLoading(false);
            });
    }, []);

    // --- LOGICA DE CALCUL COMPLEXĂ ---
    const getShippingRules = () => {
        if (!selectedCountry) return { cost: 15, threshold: 100, zone: "Standard" };

        const region = countryRegions[selectedCountry];

        if (selectedCountry === 'Romania') {
            return { cost: 5, threshold: 50, zone: "Domestic (RO)" };
        }
        if (region === 'Europe') {
            return { cost: 15, threshold: 100, zone: "Europe" };
        }
        if (region === 'Americas') {
            return { cost: 25, threshold: 150, zone: "The Americas" };
        }
        if (region === 'Asia' || region === 'Oceania') {
            return { cost: 35, threshold: 200, zone: "Asia & Pacific" };
        }
        return { cost: 40, threshold: 200, zone: "Global" };
    };

    const { cost: shippingCostUSD, threshold: freeThresholdUSD } = getShippingRules();

    // --- CALCULE FINALE ---
    const currentTotalConverted = convertPrice(total);
    const thresholdConverted = convertPrice(freeThresholdUSD);
    const isFreeShipping = currentTotalConverted >= thresholdConverted;

    const progress = Math.min((currentTotalConverted / thresholdConverted) * 100, 100);

    const finalShippingCost = isFreeShipping ? 0 : shippingCostUSD;
    const finalTotal = total + finalShippingCost;


    // --- STARE GOL ---
    if (cart.length === 0) return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 pt-20 bg-[#f5f5f5]">
            <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6 flex flex-col items-center"
            >
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6 text-gray-400">
                    <ShoppingCart size={40} />
                </div>
                <h2 className="text-3xl font-black italic text-black mb-2 uppercase">{t.emptyCart}</h2>
                <p className="text-gray-500 mb-8 uppercase tracking-widest text-xs">{t.emptyCartSubtext}</p>

                <Link to="/" className="bg-black text-white px-8 py-4 font-black uppercase tracking-widest rounded hover:bg-brand-accent transition duration-300">
                    {t.startHunting}
                </Link>
            </motion.div>
        </div>
    );

    return (
        <div className="bg-[#f5f5f5] min-h-screen pt-28 pb-12">
            <div className="max-w-[1800px] mx-auto px-6">

                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-black/10 pb-6 mb-12 gap-4">
                    <div className="flex items-baseline gap-4">
                        <h1 className="text-6xl md:text-8xl font-black italic tracking-tighter text-black leading-none">
                            {t.cart.toUpperCase()}
                        </h1>
                        <span className="text-brand-accent font-mono text-xl md:text-3xl font-bold">
                            // {cart.length.toString().padStart(2, '0')}
                        </span>
                    </div>

                    <Link to="/" className="text-xs font-bold uppercase tracking-widest text-gray-500 hover:text-black flex items-center gap-2 transition pb-2">
                        <ArrowLeft size={16} /> {t.collection || "Back to Collection"}
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* LISTA */}
                    <div className="lg:col-span-2 space-y-6">
                        <AnimatePresence>
                            {cart.map(item => (
                                <motion.div
                                    // Folosim uniqueId pentru cheie
                                    key={item.uniqueId || item.id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    className="flex gap-4 bg-white border border-black/5 p-4 items-center group shadow-sm hover:shadow-md transition-all"
                                >
                                    <div className="w-24 h-32 bg-gray-100 shrink-0 overflow-hidden relative">
                                        <img
                                            src={item.images ? item.images[0] : item.image}
                                            alt={item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    <div className="flex-1 min-w-0 flex flex-col justify-between h-32 py-1">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <h3 className="font-bold text-lg text-black truncate pr-4 uppercase leading-none tracking-tight">{item.name}</h3>

                                                {/* --- AFIȘARE MĂRIME & GEN --- */}
                                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                                    {/* ETICHETA DE MĂRIME */}
                                                    <span className="text-xs bg-gray-100 border border-gray-200 px-2 py-0.5 font-mono text-black font-bold">
                                                        SIZE: {item.selectedSize || 'STD'}
                                                    </span>

                                                    {/* ETICHETA DE GEN (NOUĂ) */}
                                                    <span className="text-[10px] text-gray-500 uppercase tracking-[0.1em] border-l border-gray-300 pl-2">
                                                        {t[item.gender] || 'UNISEX'}
                                                    </span>
                                                </div>

                                            </div>
                                            <p className="text-black font-mono font-bold text-lg">{formatPrice(item.price * item.qty)}</p>
                                        </div>

                                        <div className="flex justify-between items-end mt-auto">
                                            <div className="flex items-center gap-4 bg-gray-100 px-3 py-2">
                                                {/* Folosim item.uniqueId pentru update */}
                                                <button onClick={() => updateQty(item.uniqueId, -1)} className="text-gray-500 hover:text-black transition"><Minus size={14}/></button>
                                                <span className="font-mono w-6 text-center text-sm text-black font-bold">{item.qty}</span>
                                                <button onClick={() => updateQty(item.uniqueId, 1)} className="text-gray-500 hover:text-black transition"><Plus size={14}/></button>
                                            </div>

                                            {/* Folosim item.uniqueId pentru ștergere */}
                                            <button onClick={() => removeFromCart(item.uniqueId)} className="text-gray-400 hover:text-red-500 transition p-2 hover:bg-red-50 rounded">
                                                <Trash2 size={20} />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* SUMAR */}
                    <div className="h-fit">
                        <div className="bg-white border border-black/5 p-8 sticky top-24 shadow-sm">
                            <h3 className="text-xl font-black italic uppercase text-black mb-6 tracking-tighter">{t.orderSummary}</h3>

                            {/* SELECTOR ESTIMARE ȚARĂ */}
                            <div className="mb-6">
                                <label className="text-[10px] font-bold uppercase text-gray-400 mb-2 block flex items-center gap-1">
                                    <Globe size={12}/> Estimate Shipping For:
                                </label>
                                <select
                                    value={selectedCountry}
                                    onChange={(e) => setSelectedCountry(e.target.value)}
                                    className="w-full bg-gray-50 border border-gray-200 p-2 text-sm text-black font-bold uppercase focus:border-brand-accent outline-none cursor-pointer"
                                >
                                    {isLoading ? (
                                        <option>Loading countries...</option>
                                    ) : (
                                        countries.map(c => <option key={c} value={c}>{c}</option>)
                                    )}
                                </select>
                            </div>

                            {/* BARA DE PROGRES */}
                            <div className="mb-8">
                                <div className="flex justify-between text-[10px] mb-2 font-bold uppercase tracking-widest">
                                    <span className={isFreeShipping ? "text-green-600" : "text-gray-400"}>
                                        {isFreeShipping ? "Free Shipping Unlocked!" : `Add more for Free Shipping`}
                                    </span>
                                    <span className="text-gray-500 font-mono">{Math.round(progress)}%</span>
                                </div>
                                <div className="h-1 bg-gray-200 overflow-hidden w-full">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${progress}%` }}
                                        transition={{ duration: 0.5 }}
                                        className={`h-full ${isFreeShipping ? 'bg-green-500' : 'bg-brand-accent'}`}
                                    />
                                </div>
                                {!isFreeShipping && (
                                    <p className="text-[10px] text-gray-400 mt-2 text-right">
                                        Order over <span className="text-black font-bold">{formatPrice(freeThresholdUSD)}</span> for free shipping to {selectedCountry.substring(0,15)}.
                                    </p>
                                )}
                            </div>

                            <div className="space-y-4 mb-8 text-sm uppercase tracking-widest">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="text-black font-mono font-bold">{formatPrice(total)}</span>
                                </div>

                                <div className="flex justify-between text-gray-500">
                                    <span>{t.shipping} <span className="text-[10px]">({selectedCountry.substring(0, 3).toUpperCase()})</span></span>
                                    <span className={isFreeShipping ? "text-green-600 font-bold" : "text-black font-mono"}>
                                        {isFreeShipping ? "FREE" : formatPrice(shippingCostUSD)}
                                    </span>
                                </div>

                                <div className="border-t border-black/10 pt-4 flex justify-between font-bold text-xl text-black items-baseline">
                                    <span>{t.total}</span>
                                    <span className="text-brand-accent font-mono text-2xl">
                                        {formatPrice(finalTotal)}
                                    </span>
                                </div>
                            </div>

                            <Link to="/checkout" className="block w-full bg-black text-white hover:bg-brand-accent hover:text-black py-4 font-black uppercase tracking-widest text-center transition-all group">
                                {t.checkout} <ArrowRight className="inline ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}