import { useCart } from '../context/CartContext';
import { useSettings } from '../context/SettingsContext';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, Truck, Landmark, Bitcoin, Copy, Check, ShieldCheck, User, Building2, MapPin, ChevronRight, ChevronLeft, Lock, Loader2, X, Globe } from 'lucide-react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { jsPDF } from "jspdf";
import emailjs from '@emailjs/browser';

export default function Checkout() {
    const { cart, total, clearCart } = useCart();
    const { t, formatPrice, convertPrice } = useSettings();
    const navigate = useNavigate();

    // --- STATE FORMULAR (Cu Auto-Save) ---
    const [formData, setFormData] = useState(() => {
        const savedData = localStorage.getItem('k-checkout-form');
        return savedData ? JSON.parse(savedData) : {
            firstName: '', lastName: '', email: '', phone: '',
            companyName: '', vatNumber: '',
            country: '', state: '', city: '', address: '', zip: ''
        };
    });

    useEffect(() => {
        localStorage.setItem('k-checkout-form', JSON.stringify(formData));
    }, [formData]);

    // --- STATE API LOCAȚII ---
    const [countries, setCountries] = useState([]);
    const [states, setStates] = useState([]);
    const [cities, setCities] = useState([]);
    const [isLoadingCountries, setIsLoadingCountries] = useState(true);
    const [isLoadingStates, setIsLoadingStates] = useState(false);
    const [isLoadingCities, setIsLoadingCities] = useState(false);

    // --- DICȚIONAR METODE DE PLATĂ ---
    const paymentLabels = {
        card: "Card Bancar (Online)",
        cod: "Ramburs (Plata la Livrare)",
        bank: "Transfer Bancar",
        crypto: "Bitcoin / Crypto"
    };

    // --- LOGICA DE ZONARE & PREȚURI ---
    const euCountries = [
        'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Denmark',
        'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Ireland', 'Italy',
        'Latvia', 'Lithuania', 'Luxembourg', 'Malta', 'Netherlands', 'Poland', 'Portugal',
        'Romania', 'Slovakia', 'Slovenia', 'Spain', 'Sweden'
    ];

    const getShippingDetails = () => {
        const c = formData.country;
        if (!c) return { cost: 15, threshold: 100, zone: "Standard Rate" };
        if (c === 'Romania') return { cost: 5, threshold: 50, zone: "Domestic (RO)" };
        if (euCountries.includes(c)) return { cost: 15, threshold: 100, zone: "Europe Union" };
        if (['United States', 'Canada', 'Mexico', 'Brazil'].includes(c)) return { cost: 25, threshold: 150, zone: "The Americas" };
        return { cost: 35, threshold: 200, zone: "International" };
    };

    const { cost: shippingCostUSD, threshold: freeThresholdUSD, zone: shippingZone } = getShippingDetails();
    const currentTotalConverted = convertPrice(total);
    const isFreeShipping = currentTotalConverted >= convertPrice(freeThresholdUSD);
    const finalShippingCost = isFreeShipping ? 0 : shippingCostUSD;
    const finalTotal = total + finalShippingCost;

    // --- API FETCHING ---
    useEffect(() => {
        fetch('https://countriesnow.space/api/v0.1/countries/states')
            .then(res => res.json())
            .then(data => {
                const countryList = data.data.map(c => c.name).sort();
                setCountries(countryList);
                setIsLoadingCountries(false);
            })
            .catch(() => {
                setCountries(['Romania', 'United States', 'Germany', 'France', 'Italy']);
                setIsLoadingCountries(false);
            });
    }, []);

    useEffect(() => {
        if (formData.country) {
            fetch('https://countriesnow.space/api/v0.1/countries/states', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ country: formData.country })
            }).then(res => res.json()).then(data => {
                if (!data.error && data.data.states.length > 0) setStates(data.data.states);
            }).catch(console.error);
        }
    }, [formData.country]);

    const handleCountryChange = (e) => {
        const selectedCountry = e.target.value;
        setFormData(prev => ({ ...prev, country: selectedCountry, state: '', city: '' }));
        setStates([]); setCities([]);

        if (selectedCountry) {
            setIsLoadingStates(true);
            fetch('https://countriesnow.space/api/v0.1/countries/states', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ country: selectedCountry })
            }).then(res => res.json()).then(data => {
                if (!data.error && data.data.states.length > 0) setStates(data.data.states);
                setIsLoadingStates(false);
            }).catch(() => setIsLoadingStates(false));
        }
    };

    const handleStateChange = (e) => {
        const selectedState = e.target.value;
        setFormData(prev => ({ ...prev, state: selectedState, city: '' }));
        setCities([]);
        if (formData.country && selectedState) {
            setIsLoadingCities(true);
            fetch('https://countriesnow.space/api/v0.1/countries/state/cities', {
                method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ country: formData.country, state: selectedState })
            }).then(res => res.json()).then(data => {
                if (!data.error && data.data.length > 0) setCities(data.data.sort());
                setIsLoadingCities(false);
            }).catch(() => setIsLoadingCities(false));
        }
    };

    const handleChange = (e) => { setFormData({ ...formData, [e.target.name]: e.target.value }); };

    // --- STATE UI ---
    const [currentStep, setCurrentStep] = useState(1);
    const [isCompany, setIsCompany] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [isCopied, setIsCopied] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [show3DSecure, setShow3DSecure] = useState(false);
    const [smsCode, setSmsCode] = useState('');

    const validateStep = (step) => {
        if (step === 1) {
            if (!formData.firstName || !formData.lastName) { toast.error("Completează numele!"); return false; }
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(formData.email)) { toast.error("Email invalid! (ex: nume@gmail.com)"); return false; }
            const phoneRegex = /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/;
            if (!phoneRegex.test(formData.phone)) { toast.error("Număr telefon invalid!"); return false; }
            if (isCompany && (!formData.companyName || !formData.vatNumber)) { toast.error("Datele firmei sunt obligatorii!"); return false; }
        }
        if (step === 2) {
            if (!formData.country) { toast.error("Selectează țara!"); return false; }
            if (!formData.address) { toast.error("Adresa lipsește!"); return false; }
            if (!formData.zip) { toast.error("Codul poștal (ZIP) lipsește!"); return false; }
            if (!formData.city) { toast.error("Orașul lipsește!"); return false; }
        }
        return true;
    };

    const nextStep = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, 3));
        }
    };

    const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
    const handleStepSubmit = (e) => { e.preventDefault(); nextStep(); };

    const handleInitiateOrder = () => {
        if (paymentMethod === 'card') {
            setIsProcessing(true);
            setTimeout(() => { setIsProcessing(false); setShow3DSecure(true); }, 1500);
        } else {
            finishOrder();
        }
    };

    const handleConfirm3DSecure = (e) => {
        e.preventDefault();
        setIsProcessing(true);
        setTimeout(() => { setIsProcessing(false); setShow3DSecure(false); finishOrder(); }, 2000);
    };

    const cleanText = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "") : "";

    // --- GENERARE PDF (MODIFICAT PENTRU GEN & MĂRIMI) ---
    const generateInvoicePDF = (orderID) => {
        const doc = new jsPDF();
        const today = new Date().toLocaleDateString('ro-RO');
        const paymentDisplay = paymentLabels[paymentMethod] || paymentMethod.toUpperCase();

        doc.setFont("courier", "bold");
        doc.setFontSize(22);
        doc.text("K-CROSSING", 105, 20, null, null, "center");

        doc.setFontSize(10);
        doc.setFont("courier", "normal");
        doc.text("Romania", 105, 26, null, null, "center");
        doc.text("kcrossing@atomicmail.io", 105, 30, null, null, "center");

        doc.setLineWidth(0.5);
        doc.line(20, 35, 190, 35);

        doc.text(`FACTURA #:    ${orderID}`, 20, 45);
        doc.text(`DATA:         ${today}`, 20, 50);
        doc.text(`PLATA:        ${cleanText(paymentDisplay)}`, 20, 55);

        doc.text("CLIENT:", 110, 45);
        doc.text(cleanText(`${formData.firstName} ${formData.lastName}`), 110, 50);
        doc.text(cleanText(`${formData.city}, ${formData.country}`), 110, 55);
        doc.text(`${formData.email}`, 110, 60);

        let y = 75;
        doc.setFont("courier", "bold");
        doc.text("PRODUS", 20, y);
        doc.text("CANT", 140, y, null, null, "center");
        doc.text("PRET", 190, y, null, null, "right");
        doc.line(20, y + 2, 190, y + 2);
        y += 10;

        doc.setFont("courier", "normal");

        cart.forEach(item => {
            if (y > 270) {
                doc.addPage();
                y = 20;
                doc.setFont("courier", "bold");
                doc.text("PRODUS (cont.)", 20, y);
                doc.text("CANT", 140, y, null, null, "center");
                doc.text("PRET", 190, y, null, null, "right");
                doc.line(20, y + 2, 190, y + 2);
                doc.setFont("courier", "normal");
                y += 10;
            }

            // AICI E MODIFICAREA: Calculăm genul și construim numele
            const genderLabel = item.gender === 'women' ? 'FEMEI' : (item.gender === 'men' ? 'BARBATI' : 'UNISEX');
            let displayName = `${item.name} (${genderLabel} / ${item.selectedSize || 'STD'})`;

            const name = displayName.length > 35 ? displayName.substring(0, 35) + "..." : displayName;
            doc.text(name.toUpperCase(), 20, y);
            doc.text(item.qty.toString(), 140, y, null, null, "center");
            doc.text(formatPrice(item.price * item.qty), 190, y, null, null, "right");
            y += 7;
        });

        doc.line(20, y + 5, 190, y + 5);
        y += 15;

        if (y > 270) { doc.addPage(); y = 20; }

        doc.setFont("courier", "bold");
        doc.text("LIVRARE:", 140, y);
        const shippingDisplay = isFreeShipping ? "GRATUIT" : formatPrice(finalShippingCost);
        doc.text(shippingDisplay, 190, y, null, null, "right");
        y += 6;

        doc.setFontSize(14);
        doc.text("TOTAL:", 140, y);
        doc.text(formatPrice(finalTotal), 190, y, null, null, "right");

        doc.save(`K-Crossing_Factura_${orderID}.pdf`);
    };

    // --- TRIMITE EMAIL (MODIFICAT PENTRU GEN & MĂRIMI) ---
    const sendOrderEmail = async (orderID) => {
        const paymentDisplay = paymentLabels[paymentMethod] || paymentMethod.toUpperCase();

        // AICI E MODIFICAREA: Adaugam genul și mărimea în email
        const productList = cart.map(item => {
            const genderLabel = item.gender === 'women' ? 'FEMEI' : (item.gender === 'men' ? 'BARBATI' : 'UNISEX');
            return `${item.name} [${genderLabel} / ${item.selectedSize || 'STD'}] x${item.qty} - ${formatPrice(item.price * item.qty)}`;
        }).join('\n');

        const emailParams = {
            to_name: formData.firstName,
            to_email: formData.email,
            order_id: orderID,
            customer_address: `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}`,
            products: productList,
            shipping_cost: isFreeShipping ? "GRATUIT" : formatPrice(finalShippingCost),
            total_amount: formatPrice(finalTotal),
            payment_method: paymentDisplay
        };

        try {
            await emailjs.send('service_t5sjq55', 'template_m4vr87u', emailParams, 'jCcBhOkk0dcAkqIFx');
            console.log("Email sent!");
        } catch (error) {
            console.error("Email error:", error);
        }
    };

    const finishOrder = async () => {
        setIsProcessing(true);
        const orderID = Math.floor(Math.random() * 1000000);

        await sendOrderEmail(orderID);
        generateInvoicePDF(orderID);

        toast.success("Comanda a fost plasată! Factura descărcată.", {
            icon: '🚀',
            duration: 5000,
            style: { background: '#fff', color: '#000', border: '1px solid #eee' }
        });

        clearCart();
        localStorage.removeItem('k-checkout-form');
        setFormData({
            firstName: '', lastName: '', email: '', phone: '',
            companyName: '', vatNumber: '',
            country: '', state: '', city: '', address: '', zip: ''
        });

        setIsProcessing(false);
        setTimeout(() => { navigate('/'); }, 3000);
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text); setIsCopied(true);
        toast.success("Copied!"); setTimeout(() => setIsCopied(false), 2000);
    };

    const btcAddress = "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh";
    const bankDetails = { bank: "BRD International", iban: "RO49 ...", swift: "KBNKROBU" };

    return (
        <div className="bg-[#f5f5f5] min-h-screen text-black pt-28 pb-12 relative">
            <AnimatePresence>
                {show3DSecure && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isProcessing && setShow3DSecure(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="bg-white p-8 rounded-xl w-full max-w-md relative z-10 shadow-2xl">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-2 text-brand-accent">
                                    <ShieldCheck size={24} />
                                    <h3 className="font-bold uppercase tracking-wider">{t.secureTitle || "Secure Payment"}</h3>
                                </div>
                                <button onClick={() => setShow3DSecure(false)} disabled={isProcessing} className="text-gray-400 hover:text-black"><X size={20} /></button>
                            </div>
                            <div className="text-center space-y-6">
                                <div className="bg-gray-50 p-4 rounded text-sm text-gray-600 border border-gray-200"><p className="mb-2 font-bold">K-Bank Verification</p><p>{t.codeSent || "Enter SMS code"}</p><p className="text-black font-mono mt-1 font-bold">+40 7** *** *88</p></div>
                                <input type="text" autoFocus value={smsCode} onChange={(e) => setSmsCode(e.target.value)} placeholder="123456" className="w-full bg-white border border-gray-300 p-4 text-center text-2xl font-mono tracking-[0.5em] focus:border-brand-accent outline-none text-black rounded" maxLength={6} />
                                <button onClick={handleConfirm3DSecure} disabled={isProcessing || smsCode.length < 3} className="w-full bg-black text-white font-black uppercase tracking-widest py-4 hover:bg-brand-accent hover:text-black transition flex items-center justify-center gap-2 disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" /> : <Lock size={18} />}{isProcessing ? t.processing : t.confirm}</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <div className="max-w-[1200px] mx-auto px-6">
                <div className="mb-12 border-b border-black/10 pb-6">
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-6 text-black">{t.checkout}</h1>
                    <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest">
                        <span className={currentStep >= 1 ? "text-brand-accent" : "text-gray-400"}>01. {t.step1}</span>
                        <div className={`h-[1px] w-8 ${currentStep >= 2 ? "bg-brand-accent" : "bg-gray-300"}`} />
                        <span className={currentStep >= 2 ? "text-brand-accent" : "text-gray-400"}>02. {t.step2}</span>
                        <div className={`h-[1px] w-8 ${currentStep >= 3 ? "bg-brand-accent" : "bg-gray-300"}`} />
                        <span className={currentStep >= 3 ? "text-brand-accent" : "text-gray-400"}>03. {t.step3}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    <div className="lg:col-span-2">
                        <AnimatePresence mode='wait'>
                            {currentStep === 1 && (
                                <motion.div key="step1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <form onSubmit={handleStepSubmit} className="space-y-8">
                                        <div className="bg-white border border-black/5 p-8 rounded-sm shadow-sm">
                                            <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2 text-black"><User className="text-brand-accent" /> {t.step1}</h2>
                                            <div className="flex gap-4 mb-8">
                                                <button type="button" onClick={() => setIsCompany(false)} className={`flex-1 py-4 border font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${!isCompany ? 'border-brand-accent bg-brand-accent/10 text-brand-accent' : 'border-gray-200 text-gray-400 hover:border-black'}`}><User size={16}/> {t.individual}</button>
                                                <button type="button" onClick={() => setIsCompany(true)} className={`flex-1 py-4 border font-bold uppercase text-xs tracking-widest flex items-center justify-center gap-2 transition-all ${isCompany ? 'border-brand-accent bg-brand-accent/10 text-brand-accent' : 'border-gray-200 text-gray-400 hover:border-black'}`}><Building2 size={16}/> {t.legalEntity}</button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <input required name="firstName" value={formData.firstName} onChange={handleChange} type="text" placeholder="First Name" className="bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400" />
                                                <input required name="lastName" value={formData.lastName} onChange={handleChange} type="text" placeholder="Last Name" className="bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400" />
                                                <input required name="email" value={formData.email} onChange={handleChange} type="email" placeholder="Email Address" className="bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400 md:col-span-2" />
                                                <input required name="phone" value={formData.phone} onChange={handleChange} type="tel" placeholder="Phone Number" className="bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400 md:col-span-2" />
                                                {isCompany && (<div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-4 border-t border-gray-100 mt-4"><input required={isCompany} name="companyName" value={formData.companyName} onChange={handleChange} type="text" placeholder={t.companyName} className="bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400 md:col-span-2" /><input required={isCompany} name="vatNumber" value={formData.vatNumber} onChange={handleChange} type="text" placeholder={t.vatNumber} className="bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400 md:col-span-2" /></div>)}
                                            </div>
                                        </div>
                                        <button type="button" onClick={nextStep} className="w-full bg-brand-accent text-white font-black uppercase tracking-widest py-4 hover:bg-black transition flex items-center justify-center gap-2 cursor-pointer">
                                            {t.nextStep} <ChevronRight size={20} />
                                        </button>
                                    </form>
                                </motion.div>
                            )}

                            {currentStep === 2 && (
                                <motion.div key="step2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
                                    <form onSubmit={handleStepSubmit} className="space-y-8">
                                        <div className="bg-white border border-black/5 p-8 rounded-sm shadow-sm">
                                            <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2 text-black"><MapPin className="text-brand-accent" /> {t.step2}</h2>
                                            <div className="mb-6 bg-brand-accent/5 border border-brand-accent/20 p-4 rounded flex items-start gap-3">
                                                <Globe className="text-brand-accent shrink-0 mt-0.5" size={18} />
                                                <div className="text-sm text-gray-700">
                                                    <p className="font-bold mb-1 uppercase tracking-wider text-[10px]">Active Zone: {shippingZone}</p>
                                                    <p>Shipping cost: <span className="font-bold">{formatPrice(shippingCostUSD)}</span>. Free shipping over <span className="font-bold">{formatPrice(freeThresholdUSD)}</span>.</p>
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="md:col-span-2 relative">
                                                    <select required name="country" value={formData.country} onChange={handleCountryChange} className="w-full bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black appearance-none cursor-pointer">
                                                        <option value="" disabled>Select Country</option>
                                                        {isLoadingCountries ? <option disabled>Loading...</option> : countries.map(c => <option key={c} value={c}>{c}</option>)}
                                                    </select>
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400"><ChevronRight size={16} className="rotate-90" /></div>
                                                </div>
                                                <div className="relative">
                                                    {states.length > 0 ? (
                                                        <><select required name="state" value={formData.state} onChange={handleStateChange} disabled={isLoadingStates} className="w-full bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black appearance-none cursor-pointer"><option value="" disabled>Select State</option>{states.map(s => <option key={s.name} value={s.name}>{s.name}</option>)}</select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">{isLoadingStates ? <Loader2 size={16} className="animate-spin"/> : <ChevronRight size={16} className="rotate-90" />}</div></>
                                                    ) : (<input required name="state" value={formData.state} onChange={handleChange} type="text" placeholder="State / County" className="w-full bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400" />)}
                                                </div>
                                                <div className="relative">
                                                    {cities.length > 0 ? (
                                                        <><select required name="city" value={formData.city} onChange={handleChange} disabled={isLoadingCities} className="w-full bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black appearance-none cursor-pointer"><option value="" disabled>Select City</option>{cities.map(c => <option key={c} value={c}>{c}</option>)}</select><div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">{isLoadingCities ? <Loader2 size={16} className="animate-spin"/> : <ChevronRight size={16} className="rotate-90" />}</div></>
                                                    ) : (<input required name="city" value={formData.city} onChange={handleChange} type="text" placeholder="City" className="w-full bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400" />)}
                                                </div>
                                                <input required name="address" value={formData.address} onChange={handleChange} type="text" placeholder="Street Address" className="bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400 md:col-span-2" />
                                                <input required name="zip" value={formData.zip} onChange={handleChange} type="text" placeholder="ZIP Code" className="bg-white border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400 md:col-span-2" />
                                            </div>
                                        </div>
                                        <div className="flex gap-4">
                                            <button type="button" onClick={prevStep} className="flex-1 bg-white border border-gray-300 text-black font-bold uppercase tracking-widest py-4 hover:bg-gray-50 transition flex items-center justify-center gap-2 cursor-pointer"><ChevronLeft size={20} /> {t.back}</button>
                                            <button type="button" onClick={nextStep} className="flex-[2] bg-brand-accent text-white font-black uppercase tracking-widest py-4 hover:bg-black transition flex items-center justify-center gap-2 cursor-pointer">{t.nextStep} <ChevronRight size={20} /></button>
                                        </div>
                                    </form>
                                </motion.div>
                            )}

                            {currentStep === 3 && (
                                <motion.div key="step3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="space-y-8">
                                    <div className="bg-white border border-black/5 p-8 rounded-sm shadow-sm">
                                        <h2 className="text-xl font-bold uppercase mb-6 flex items-center gap-2 text-black"><CreditCard className="text-brand-accent" /> {t.step3}</h2>
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                            {[{ id: 'card', icon: CreditCard, label: t.creditCard }, { id: 'cod', icon: Truck, label: t.cod }, { id: 'bank', icon: Landmark, label: t.bankTransfer }, { id: 'crypto', icon: Bitcoin, label: t.crypto }].map((method) => (
                                                <button key={method.id} onClick={() => setPaymentMethod(method.id)} className={`flex flex-col items-center justify-center gap-3 p-4 border transition-all duration-300 ${paymentMethod === method.id ? 'border-brand-accent bg-brand-accent/10 text-brand-accent' : 'border-gray-200 text-gray-400 hover:border-black hover:text-black'}`}>
                                                    <method.icon size={24} /> <span className="text-[10px] font-bold uppercase tracking-widest text-center">{method.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                        <AnimatePresence mode='wait'>
                                            {paymentMethod === 'card' && (<motion.div key="card" initial={{opacity:0}} animate={{opacity:1}} className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center"><div className="space-y-4"><input type="text" placeholder={t.cardNumber} className="w-full bg-white border border-gray-200 p-4 text-sm font-mono focus:border-brand-accent outline-none text-black placeholder-gray-400" /><input type="text" placeholder={t.cardHolder} className="w-full bg-white border border-gray-200 p-4 text-sm font-mono focus:border-brand-accent outline-none text-black placeholder-gray-400" /><div className="grid grid-cols-2 gap-4"><input type="text" placeholder={t.expiry} className="w-full bg-white border border-gray-200 p-4 text-sm font-mono focus:border-brand-accent outline-none text-black placeholder-gray-400" /><input type="text" placeholder={t.cvv} className="w-full bg-white border border-gray-200 p-4 text-sm font-mono focus:border-brand-accent outline-none text-black placeholder-gray-400" /></div></div><div className="relative aspect-[1.58/1] bg-black rounded-xl border border-gray-800 p-6 flex flex-col justify-between shadow-xl text-white"><div className="flex justify-between items-start z-10"><span className="font-black italic text-white/30">K-BANK</span></div><div className="z-10"><div className="font-mono text-xl tracking-widest text-white mb-2">•••• •••• •••• ••••</div><div className="flex justify-between text-[10px] uppercase tracking-widest text-gray-400"><span>{t.cardHolder}</span><span>{t.expiry}</span></div></div></div></motion.div>)}
                                            {paymentMethod === 'cod' && (<motion.div key="cod" initial={{opacity:0}} animate={{opacity:1}} className="text-center py-8 border border-gray-200 bg-gray-50 border-dashed"><Truck size={48} className="mx-auto text-brand-accent mb-4" /><p className="text-lg font-bold uppercase mb-2 text-black">{t.cod}</p><p className="text-gray-500 text-sm max-w-md mx-auto">{t.codDesc}</p></motion.div>)}
                                            {paymentMethod === 'bank' && (<motion.div key="bank" initial={{opacity:0}} animate={{opacity:1}} className="bg-gray-50 border border-gray-200 p-6 space-y-4"><p className="text-sm text-gray-500 mb-4">{t.bankDesc}</p><div className="grid grid-cols-1 gap-4 font-mono text-sm"><div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-400">{t.bankName}</span><span className="text-black font-bold">{bankDetails.bank}</span></div><div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-400">{t.iban}</span><span className="text-brand-accent font-bold">{bankDetails.iban}</span></div><div className="flex justify-between border-b border-gray-200 pb-2"><span className="text-gray-400">{t.swift}</span><span className="text-black font-bold">{bankDetails.swift}</span></div></div></motion.div>)}
                                            {paymentMethod === 'crypto' && (<motion.div key="crypto" initial={{opacity:0}} animate={{opacity:1}} className="flex flex-col md:flex-row gap-8 items-center bg-gray-50 border border-gray-200 p-6"><div className="w-32 h-32 bg-white p-2 shrink-0 border border-gray-200"><img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${btcAddress}`} alt="BTC QR" className="w-full h-full" /></div><div className="flex-1 w-full"><p className="text-sm text-gray-500 mb-4">{t.cryptoDesc}</p><div className="relative"><div className="bg-white border border-gray-300 p-3 text-xs font-mono text-brand-accent break-all pr-10 rounded">{btcAddress}</div><button onClick={() => copyToClipboard(btcAddress)} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black">{isCopied ? <Check size={16} className="text-green-500"/> : <Copy size={16}/>}</button></div><div className="flex items-center gap-2 mt-4 text-[10px] text-gray-400 uppercase tracking-widest"><ShieldCheck size={14} className="text-green-500" /> Secure Blockchain Transaction</div></div></motion.div>)}
                                        </AnimatePresence>
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={prevStep} className="flex-1 bg-white border border-gray-300 text-black font-bold uppercase tracking-widest py-4 hover:bg-gray-50 transition flex items-center justify-center gap-2 cursor-pointer"><ChevronLeft size={20} /> {t.back}</button>
                                        <button onClick={handleInitiateOrder} disabled={isProcessing} className="flex-[2] bg-black text-white font-black uppercase tracking-widest py-4 hover:bg-brand-accent hover:text-black transition flex items-center justify-center gap-2 disabled:opacity-50">{isProcessing ? <Loader2 className="animate-spin" /> : (paymentMethod === 'card' || paymentMethod === 'crypto' ? t.pay : t.placeOrder)}</button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="h-fit">
                        <div className="bg-white border border-black/5 p-8 sticky top-24 shadow-sm">
                            <h3 className="text-xl font-black italic uppercase text-black mb-6">{t.orderSummary}</h3>
                            <div className="space-y-4 mb-8 text-sm uppercase tracking-widest">
                                <div className="flex justify-between text-gray-500">
                                    <span>Subtotal</span>
                                    <span className="text-black font-mono font-bold">{formatPrice(total)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>{t.shipping} {formData.country && <span className="text-[10px] text-gray-400">({formData.country.toUpperCase().substring(0, 10)})</span>}</span>
                                    <span className={isFreeShipping ? "text-green-600 font-bold" : "text-black font-mono"}>
                                        {isFreeShipping ? "FREE" : formatPrice(finalShippingCost)}
                                    </span>
                                </div>
                                <div className="border-t border-black/10 pt-4 flex justify-between font-bold text-xl text-black items-baseline">
                                    <span>{t.total}</span>
                                    <span className="text-brand-accent font-mono text-2xl">{formatPrice(finalTotal)}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}