import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Minus, HelpCircle } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

// Componenta pentru un singur item (Întrebare + Răspuns)
const AccordionItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border border-black/5 bg-white overflow-hidden mb-4 rounded-sm shadow-sm hover:border-black/10 transition-colors">
            <button
                onClick={onClick}
                className="w-full flex justify-between items-center p-6 text-left focus:outline-none group"
            >
        <span className={`font-bold uppercase tracking-widest text-sm md:text-base ${isOpen ? 'text-brand-accent' : 'text-black group-hover:text-gray-600'} transition-colors`}>
          {question}
        </span>
                <span className={`text-black transition-transform duration-300 ${isOpen ? 'rotate-180 text-brand-accent' : ''}`}>
           {isOpen ? <Minus size={20} /> : <Plus size={20} />}
        </span>
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="p-6 pt-0 text-gray-500 text-sm leading-relaxed border-t border-black/5 bg-gray-50/50">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function FAQ() {
    const { t } = useSettings();
    const [openIndex, setOpenIndex] = useState(0); // Primul deschis implicit

    const handleToggle = (index) => {
        setOpenIndex(openIndex === index ? -1 : index);
    };

    // Grupăm întrebările pe categorii pentru a le afișa organizat
    const faqSections = [
        {
            title: t.catShipping,
            items: [
                { q: t.q1, a: t.a1 },
                { q: t.q2, a: t.a2 },
                { q: t.q3, a: t.a3 },
            ]
        },
        {
            title: t.catReturns,
            items: [
                { q: t.q4, a: t.a4 },
                { q: t.q5, a: t.a5 },
            ]
        },
        {
            title: t.catProducts,
            items: [
                { q: t.q6, a: t.a6 },
            ]
        }
    ];

    // Calculăm indexul global pentru a păstra unicitatea acordeonului
    let globalIndex = 0;

    return (
        <div className="min-h-screen bg-[#f5f5f5] text-black pt-28 pb-12">
            <div className="max-w-[1000px] mx-auto px-6">

                {/* HEADER */}
                <div className="text-center mb-16">
                    <div className="w-20 h-20 bg-white border border-black/5 rounded-full flex items-center justify-center mx-auto mb-6 text-brand-accent shadow-sm">
                        <HelpCircle size={32} />
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter mb-4 uppercase">
                        {t.faqPageTitle}
                    </h1>
                    <p className="text-gray-500 uppercase tracking-widest text-xs md:text-sm">
                        {t.faqSubtitle}
                    </p>
                </div>

                {/* LISTA DE ÎNTREBĂRI */}
                <div className="space-y-12">
                    {faqSections.map((section, sectionIdx) => (
                        <div key={sectionIdx}>
                            <h3 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 border-b border-black/5 pb-2">
                                {section.title}
                            </h3>

                            <div>
                                {section.items.map((item) => {
                                    const currentIndex = globalIndex++;
                                    return (
                                        <AccordionItem
                                            key={currentIndex}
                                            question={item.q}
                                            answer={item.a}
                                            isOpen={openIndex === currentIndex}
                                            onClick={() => handleToggle(currentIndex)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
}