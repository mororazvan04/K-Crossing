import { products } from '../data';
import { Link, useParams, useNavigate, useLocation } from 'react-router-dom'; // Am adaugat useLocation
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';
import { useWishlist } from '../context/WishlistContext';
import { useState, useEffect } from 'react';
import { Heart, Ghost, ShoppingBag } from 'lucide-react';
import heroImg from '../assets/1.png';

// Marquee pe Alb (Banda cu text rulant)
const Marquee = ({ text }) => (
    <div className="overflow-hidden whitespace-nowrap py-4 border-y border-black/5 bg-white pointer-events-none select-none relative z-10">
        <motion.div
            initial={{ x: 0 }}
            animate={{ x: "-100%" }}
            transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
            className="flex gap-8 text-4xl md:text-6xl font-black italic tracking-tighter text-transparent stroke-text"
            style={{ WebkitTextStroke: "1px #e5e5e5" }}
        >
            {[...Array(4)].map((_, i) => (
                <span key={i} className="mx-4 text-gray-200">{text}</span>
            ))}
        </motion.div>
    </div>
);

export default function Home({ searchTerm }) {
    const { formatPrice, t } = useSettings();
    const { toggleWishlist, isInWishlist } = useWishlist();
    const { slug } = useParams();
    const navigate = useNavigate();
    const location = useLocation(); // 1. Hook pentru detectarea navigării din Navbar

    // --- STATE ---
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [pageTitle, setPageTitle] = useState('NO LIMITS');
    const [activeButton, setActiveButton] = useState('All');
    const [activeGender, setActiveGender] = useState('all');

    const categories = ['All', ...new Set(products.map(p => p.category))];

    // --- HELPER: SCROLL LA PRODUSE ---
    const scrollToProducts = () => {
        const section = document.getElementById('products-section');
        if (section) {
            // Calculăm poziția exactă scăzând meniul de sus
            const yCoordinate = section.getBoundingClientRect().top + window.pageYOffset;
            const yOffset = 180;
            window.scrollTo({ top: yCoordinate - yOffset, behavior: 'smooth' });
        }
    };

    // --- EFFECT: LOGICA DE FILTRARE ---
    useEffect(() => {
        let result = [...products];
        let title = t.noLimits;
        let btnState = 'All';

        // 1. FILTRARE DUPĂ GEN
        if (activeGender !== 'all') {
            result = result.filter(p => p.gender === activeGender || p.gender === 'unisex');
        }

        // 2. FILTRARE DUPĂ CATEGORIE/SLUG
        if (slug === 'sale') {
            result = result.filter(p => p.onSale === true);
            title = t.archiveSale;
            btnState = 'Sale';
        }
        else if (slug === 'new-drops') {
            result = result.filter(p => p.isNew === true);
            title = t.freshArrivals;
            btnState = 'New Drops';
        }
        else if (slug === 'collection') {
            title = t.fullCollection;
            btnState = 'All';
        }
        else if (slug) {
            result = result.filter(p => p.category.toLowerCase() === slug.toLowerCase());
            const catName = slug.charAt(0).toUpperCase() + slug.slice(1);
            title = (t[slug.toLowerCase()] || catName).toUpperCase();
            btnState = catName;
        }

        // 3. FILTRARE DUPĂ SEARCH
        if (searchTerm) {
            result = result.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()));
        }

        setFilteredProducts(result);

        if (activeGender !== 'all' && !slug) {
            title = activeGender === 'men' ? t.men.toUpperCase() : t.women.toUpperCase();
        } else if (!slug) {
            title = t.noLimits;
        }

        setPageTitle(title);
        setActiveButton(btnState);

    }, [slug, searchTerm, t, activeGender]);

    // --- EFFECT NOU: DETECTARE SCHIMBARE NAVBAR ---
    // Asta face scroll-ul să meargă când apeși pe butoanele de sus (Navbar)
    useEffect(() => {
        if (slug) {
            // Așteptăm puțin să se încarce produsele și apoi dăm scroll
            setTimeout(() => {
                scrollToProducts();
            }, 300);
        }
    }, [location, slug]); // Se activează la orice schimbare de pagină

    const handleFilterClick = (cat) => {
        if (cat === 'All') navigate('/');
        else navigate(`/category/${cat.toLowerCase()}`);
    };

    // --- FUNCȚIE PENTRU SCROLL AUTOMAT LA BUTOANE GEN ---
    const handleGenderSelect = (gender) => {
        setActiveGender(gender);
        // Scroll și la butoanele din Hero
        setTimeout(() => {
            scrollToProducts();
        }, 100);
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] flex flex-col pt-20">

            {/* --- HERO SECTION --- */}
            <div className="relative h-[80vh] md:h-[85vh] w-full overflow-hidden flex items-center justify-center z-0 shrink-0 bg-black">
                {/* Imaginea de fundal */}
                <img
                    src={heroImg}
                    className="w-full h-full object-cover opacity-90"
                    alt="Hero K-Crossing"
                />

                {/* Gradient Overlay pentru lizibilitate */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30" />

                {/* --- ZONA BUTOANE GEN (Modificată) --- */}
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center pt-32 md:pt-48">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                        className="flex flex-col md:flex-row gap-6 md:gap-12 items-center"
                    >
                        {/* BUTON BĂRBAȚI */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleGenderSelect('men')}
                            className={`
                                relative group overflow-hidden px-12 py-5 min-w-[200px]
                                font-black uppercase tracking-[0.25em] text-sm md:text-lg 
                                border border-white transition-all duration-500 ease-out
                                ${activeGender === 'men'
                                ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                                : 'bg-black/30 backdrop-blur-md text-white hover:bg-white hover:text-black'}
                            `}
                        >
                            <span className="relative z-10">{t.men}</span>
                        </motion.button>

                        {/* BUTON FEMEI */}
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleGenderSelect('women')}
                            className={`
                                relative group overflow-hidden px-12 py-5 min-w-[200px]
                                font-black uppercase tracking-[0.25em] text-sm md:text-lg 
                                border border-white transition-all duration-500 ease-out
                                ${activeGender === 'women'
                                ? 'bg-white text-black shadow-[0_0_30px_rgba(255,255,255,0.3)]'
                                : 'bg-black/30 backdrop-blur-md text-white hover:bg-white hover:text-black'}
                            `}
                        >
                            <span className="relative z-10">{t.women}</span>
                        </motion.button>
                    </motion.div>
                </div>

                {/* Fade jos */}
                <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-[#f5f5f5] to-transparent z-10"/>
            </div>

            {/* --- MARQUEE --- */}
            <Marquee text={t.freeShipping} />

            {/* --- FILTERS BAR --- */}
            <div className="sticky top-20 z-40 bg-[#f5f5f5]/95 backdrop-blur-lg py-6 border-b border-black/5">
                <div className="max-w-[1800px] mx-auto px-6 flex flex-col gap-4">

                    <div className="flex gap-4 overflow-x-auto no-scrollbar items-center justify-start">
                        <span className="text-xs text-gray-400 font-bold uppercase mr-4 hidden md:block shrink-0">{t.filterBy}</span>

                        <button
                            onClick={() => handleFilterClick('All')}
                            className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer active:scale-95 shrink-0 ${
                                activeButton === 'All'
                                    ? 'bg-black border-black text-white shadow-lg'
                                    : 'border-black/10 text-gray-500 hover:border-black hover:text-black bg-white'
                            }`}
                        >
                            {t.all}
                        </button>

                        {categories.filter(c => c !== 'All').map(cat => (
                            <button
                                key={cat}
                                onClick={() => handleFilterClick(cat)}
                                className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest border transition-all cursor-pointer active:scale-95 shrink-0 ${
                                    activeButton.toLowerCase() === cat.toLowerCase()
                                        ? 'bg-black border-black text-white shadow-lg'
                                        : 'border-black/10 text-gray-500 hover:border-black hover:text-black bg-white'
                                }`}
                            >
                                {t[cat.toLowerCase()] || cat}
                            </button>
                        ))}
                    </div>

                    {/* Indicator Gen Activ (Opțional) */}
                    {activeGender !== 'all' && (
                        <div className="text-[10px] uppercase font-bold tracking-widest text-gray-400 flex items-center gap-2">
                            Active Filter: <span className="text-black border-b-2 border-brand-accent">{activeGender === 'men' ? t.men : t.women}</span>
                            <button onClick={() => setActiveGender('all')} className="ml-2 hover:text-red-500 transition-colors cursor-pointer text-[10px] bg-gray-200 px-2 rounded">✕ Clear</button>
                        </div>
                    )}
                </div>
            </div>

            {/* --- PRODUCT GRID --- */}
            <div id="products-section" className="flex-grow w-full max-w-[1800px] mx-auto px-6 py-12 scroll-mt-32">
                <div className="mb-12 flex items-baseline gap-4">
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter text-black">
                        {pageTitle === t.noLimits ? <><span className="text-black">NO</span> <span className="text-brand-accent">LIMITS</span></> : <span className="text-black">{pageTitle}</span>}
                    </h1>
                </div>

                {filteredProducts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-12 gap-x-6 justify-start items-start">
                        <AnimatePresence>
                            {filteredProducts.map((product) => (
                                <motion.div
                                    key={product.id}
                                    layout
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="group relative w-full"
                                >
                                    {/* Card Produs */}
                                    <div className="relative aspect-[3/4] overflow-hidden bg-white mb-4 w-full shadow-sm group-hover:shadow-xl transition-all duration-500 border border-black/5">
                                        <div className="absolute top-2 left-2 z-20 flex flex-col gap-1">
                                            {product.isNew && <span className="bg-brand-accent text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">New</span>}
                                            {product.onSale && <span className="bg-black text-white text-[10px] font-bold px-2 py-1 uppercase tracking-widest">Sale</span>}
                                        </div>

                                        <Link to={`/product/${product.id}`} className="block w-full h-full">
                                            <img
                                                src={product.images ? product.images[0] : product.image}
                                                alt={product.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-700 ease-in-out"
                                            />

                                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition duration-300 flex items-center justify-center">
                                                <span className="bg-white text-black px-4 py-2 font-bold uppercase tracking-widest text-[10px] flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition duration-300 shadow-lg">
                                                    <ShoppingBag size={12} /> {t.details}
                                                </span>
                                            </div>
                                        </Link>

                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                toggleWishlist(product);
                                            }}
                                            className="absolute top-4 right-4 p-3 bg-white/80 backdrop-blur hover:bg-black hover:text-white rounded-full transition text-black z-20 cursor-pointer shadow-sm"
                                        >
                                            <Heart size={18} fill={isInWishlist(product.id) ? "currentColor" : "none"} className={isInWishlist(product.id) ? "text-red-500" : ""} />
                                        </button>
                                    </div>

                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="text-lg font-bold uppercase tracking-tight leading-none mb-1 text-black group-hover:text-brand-accent transition">
                                                <Link to={`/product/${product.id}`}>{product.name}</Link>
                                            </h3>
                                            <p className="text-[10px] text-gray-500 uppercase tracking-widest">
                                                {t[product.gender] || "Unisex"} — {t[product.category.toLowerCase()] || product.category}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            {product.onSale && <span className="block text-xs text-gray-400 line-through mr-1">{formatPrice(product.price * 1.2)}</span>}
                                            <span className={`block font-mono ${product.onSale ? 'text-red-600 font-bold' : 'text-black font-bold'}`}>{formatPrice(product.price)}</span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-32 text-center w-full h-full">
                        <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                            <Ghost size={40} className="text-gray-400" />
                        </div>
                        <h2 className="text-2xl font-black italic uppercase mb-2 text-black">
                            {t.noLimits}
                        </h2>
                        <button
                            onClick={() => { navigate('/'); setActiveGender('all'); }}
                            className="px-8 py-3 bg-black text-white font-bold uppercase tracking-widest hover:bg-brand-accent transition duration-300"
                        >
                            {t.fullCollection}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}