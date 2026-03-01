import { useParams } from 'react-router-dom';
import { products } from '../data';
import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useWishlist } from '../context/WishlistContext';
import { useState } from 'react';
import { Heart, ShoppingBag, Truck, Shield, ChevronLeft, ChevronRight, Ruler } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import SizeGuideModal from '../components/SizeGuideModal';

export default function ProductDetails() {
    const { id } = useParams();
    const { addToCart } = useCart();
    const { formatPrice, t } = useSettings();
    const { toggleWishlist, isInWishlist } = useWishlist();

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [selectedSize, setSelectedSize] = useState(null);
    const [showSizeGuide, setShowSizeGuide] = useState(false);

    const product = products.find(p => p.id === parseInt(id));
    const images = product?.images && product.images.length > 0 ? product.images : [product?.image];

    // Logica de mărimi
    const isBottoms = product
        ? ['pants', 'shorts', 'belts', 'joggers', 'trousers', 'bottoms'].includes(product.category.toLowerCase())
        : false;

    const availableSizes = isBottoms
        ? ['28', '30', '32', '34', '36']
        : ['S', 'M', 'L', 'XL', 'XXL'];

    const handleAddToCart = () => {
        if (!product) return;

        if (!selectedSize) {
            toast.error("Please select a size first!", {
                style: { background: '#fff', color: '#000', border: '1px solid #red' },
                icon: '⚠️'
            });
            return;
        }

        addToCart({ ...product, selectedSize: selectedSize });

        toast.success(`${product.name} (Size: ${selectedSize}) ${t.addToCart}`, {
            style: { background: '#fff', color: '#000', border: '1px solid #eee' },
            iconTheme: { primary: '#FF4D00', secondary: '#fff' }
        });
    };

    const nextImage = () => setCurrentImageIndex((prev) => (prev + 1) % images.length);
    const prevImage = () => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);

    if (!product) return <div className="pt-32 text-center text-black">Product not found...</div>;

    return (
        <div className="bg-[#f5f5f5] min-h-screen text-black pt-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 max-w-[1800px] mx-auto">

                {/* GALERIE FOTO */}
                <div className="p-4 lg:p-8 flex flex-col gap-4 sticky top-20 h-fit">
                    <div className="relative aspect-[3/4] bg-white overflow-hidden group border border-black/5 shadow-sm">
                        <AnimatePresence mode='wait'>
                            <motion.img
                                key={currentImageIndex}
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ duration: 0.3 }}
                                src={images[currentImageIndex]}
                                alt={product.name}
                                className="w-full h-full object-cover"
                            />
                        </AnimatePresence>

                        {images.length > 1 && (
                            <>
                                <button onClick={prevImage} className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur text-black rounded-full opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-black hover:text-white cursor-pointer shadow-md">
                                    <ChevronLeft size={24} />
                                </button>
                                <button onClick={nextImage} className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/80 backdrop-blur text-black rounded-full opacity-0 group-hover:opacity-100 transition duration-300 hover:bg-black hover:text-white cursor-pointer shadow-md">
                                    <ChevronRight size={24} />
                                </button>
                            </>
                        )}
                        <div className="absolute top-4 left-4 flex flex-col gap-2">
                            {product.isNew && <span className="bg-brand-accent text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">New Season</span>}
                            {product.onSale && <span className="bg-black text-white px-3 py-1 text-xs font-bold uppercase tracking-widest">Sale</span>}
                        </div>
                    </div>
                    {images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {images.map((img, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentImageIndex(idx)}
                                    className={`relative w-24 aspect-[3/4] shrink-0 border transition duration-300 overflow-hidden cursor-pointer ${
                                        currentImageIndex === idx ? 'border-brand-accent opacity-100' : 'border-transparent opacity-50 hover:opacity-100'
                                    }`}
                                >
                                    <img src={img} alt="" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* INFO & OPTIONS */}
                <div className="relative border-l border-black/5 bg-[#f5f5f5]">
                    <div className="p-8 lg:p-16">
                        {/* AICI ESTE MODIFICAREA PENTRU GEN */}
                        <span className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
                            {t[product.gender] || "UNISEX"} — {t[product.category.toLowerCase()] || product.category}
                        </span>

                        <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-6 leading-tight text-black">
                            {product.name}
                        </h1>

                        <div className="text-3xl font-mono mb-8 border-b border-black/10 pb-8 flex justify-between items-center">
                            <div className="flex items-baseline gap-4">
                                {product.onSale && (
                                    <span className="text-lg text-gray-400 line-through">
                                        {formatPrice(product.price * 1.2)}
                                    </span>
                                )}
                                <span className={product.onSale ? "text-red-600 font-bold" : "text-black font-bold"}>
                                    {formatPrice(product.price)}
                                </span>
                            </div>
                            <button onClick={() => toggleWishlist(product)} className="p-3 bg-white hover:bg-gray-200 rounded-full transition cursor-pointer border border-black/5 shadow-sm">
                                <Heart size={28} className={`transition ${isInWishlist(product.id) ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-black"}`} />
                            </button>
                        </div>

                        <p className="text-gray-600 leading-relaxed mb-8 text-lg font-light">
                            {product.description}
                        </p>

                        {/* SELECTOR MĂRIMI */}
                        <div className="mb-8 border-b border-black/10 pb-8">
                            <div className="flex justify-between items-center mb-4">
                                <span className="font-bold uppercase text-sm tracking-widest text-black">Select Size</span>
                                <button
                                    onClick={() => setShowSizeGuide(true)}
                                    className="text-xs flex items-center gap-1 text-gray-500 hover:text-black border-b border-gray-300 pb-0.5 hover:border-black transition"
                                >
                                    <Ruler size={14}/> Size Guide
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                {availableSizes.map(size => (
                                    <button
                                        key={size}
                                        onClick={() => setSelectedSize(size)}
                                        className={`w-14 h-12 flex items-center justify-center border font-mono text-sm transition-all duration-300
                                        ${selectedSize === size
                                            ? 'bg-black text-white border-black scale-110 shadow-lg'
                                            : 'bg-white text-black border-gray-200 hover:border-black hover:bg-gray-50'
                                        }`}
                                    >
                                        {size}
                                    </button>
                                ))}
                            </div>
                            {!selectedSize && (
                                <p className="text-[10px] text-red-500 mt-2 uppercase tracking-wide font-bold animate-pulse">
                                    * Please select a size
                                </p>
                            )}
                        </div>

                        <button
                            onClick={handleAddToCart}
                            className={`w-full py-5 font-black uppercase tracking-widest transition duration-300 mb-6 flex items-center justify-center gap-3 cursor-pointer relative z-10 shadow-lg
                            ${selectedSize
                                ? 'bg-black text-white hover:bg-brand-accent hover:text-black active:scale-[0.99]'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                        >
                            <ShoppingBag size={20} /> {t.addToCart}
                        </button>

                        <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 uppercase tracking-widest mt-8">
                            <div className="flex items-center gap-2"><Truck size={16} /> {t.shippingInfo}</div>
                            <div className="flex items-center gap-2"><Shield size={16} /> {t.authentic}</div>
                        </div>

                        <div className="mt-12 space-y-4">
                            <div className="border-t border-black/10 pt-4">
                                <h3 className="font-bold mb-2 text-black">{t.composition}</h3>
                                <p className="text-sm text-gray-500">{product.specs?.Material || "Cotton Blend"}</p>
                            </div>
                            <div className="border-t border-black/10 pt-4">
                                <h3 className="font-bold mb-2 text-black">{t.details}</h3>
                                <p className="text-sm text-gray-500">{product.specs?.Features || "Standard Fit"}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <SizeGuideModal
                isOpen={showSizeGuide}
                onClose={() => setShowSizeGuide(false)}
                category={product.category || 'tops'}
            />
        </div>
    );
}