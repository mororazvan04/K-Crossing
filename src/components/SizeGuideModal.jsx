import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function SizeGuideModal({ isOpen, onClose, category }) {
    if (!isOpen) return null;

    // Definim tabelele în funcție de categorie
    const isBottoms = ['pants', 'shorts', 'belts', 'trousers'].includes(category.toLowerCase());

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[99] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                    className="bg-white p-8 max-w-2xl w-full relative z-10 border border-gray-200 shadow-2xl"
                >
                    <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X /></button>

                    <h2 className="text-2xl font-black italic uppercase mb-6 border-b-4 border-black inline-block">
                        Size Guide // {isBottoms ? 'BOTTOMS & BELTS' : 'TOPS & OUTERWEAR'}
                    </h2>

                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left uppercase font-mono">
                            <thead className="bg-black text-white">
                            <tr>
                                <th className="p-3">Label</th>
                                <th className="p-3">US / UK</th>
                                <th className="p-3">EU / RO</th>
                                <th className="p-3">CM (Waist/Chest)</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                            {isBottoms ? (
                                <>
                                    <tr><td className="p-3 font-bold">28</td><td className="p-3">28</td><td className="p-3">38</td><td className="p-3">71-74 cm</td></tr>
                                    <tr><td className="p-3 font-bold">30</td><td className="p-3">30</td><td className="p-3">40</td><td className="p-3">76-79 cm</td></tr>
                                    <tr><td className="p-3 font-bold">32</td><td className="p-3">32</td><td className="p-3">42</td><td className="p-3">81-84 cm</td></tr>
                                    <tr><td className="p-3 font-bold">34</td><td className="p-3">34</td><td className="p-3">44</td><td className="p-3">86-89 cm</td></tr>
                                    <tr><td className="p-3 font-bold">36</td><td className="p-3">36</td><td className="p-3">46</td><td className="p-3">91-95 cm</td></tr>
                                </>
                            ) : (
                                <>
                                    <tr><td className="p-3 font-bold">S</td><td className="p-3">34-36</td><td className="p-3">44-46</td><td className="p-3">90-95 cm</td></tr>
                                    <tr><td className="p-3 font-bold">M</td><td className="p-3">38-40</td><td className="p-3">48-50</td><td className="p-3">96-101 cm</td></tr>
                                    <tr><td className="p-3 font-bold">L</td><td className="p-3">42-44</td><td className="p-3">52-54</td><td className="p-3">102-107 cm</td></tr>
                                    <tr><td className="p-3 font-bold">XL</td><td className="p-3">46-48</td><td className="p-3">56-58</td><td className="p-3">108-113 cm</td></tr>
                                    <tr><td className="p-3 font-bold">XXL</td><td className="p-3">50-52</td><td className="p-3">60-62</td><td className="p-3">114-119 cm</td></tr>
                                </>
                            )}
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-4 text-xs text-gray-500 uppercase tracking-widest">* Measurements are approximate. Fits may vary by style.</p>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}