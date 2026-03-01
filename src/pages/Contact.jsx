import { useState } from 'react';
import { Mail, Clock, Send, Loader2, ArrowRight } from 'lucide-react'; // Am scos MapPin, am adaugat ArrowRight
import toast from 'react-hot-toast';
import { useSettings } from '../context/SettingsContext';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser'; // <--- IMPORT IMPORTANT

export default function Contact() {
    const { t } = useSettings();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validare simplă
        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Please fill in all required fields."); // Sau folosește t.errorMsg dacă ai
            return;
        }

        setIsSubmitting(true);

        // Parametrii pentru EmailJS (trebuie să corespundă cu cei din Template-ul tău)
        const templateParams = {
            name: formData.name,
            email: formData.email,
            subject: formData.subject || 'Mesaj General',
            message: formData.message,
            time: new Date().toLocaleString('ro-RO')
        };

        // ⚠️ LOGICA DE TRIMITERE EMAILJS
        emailjs.send(
            'service_t5sjq55',       // Service ID (l-ai confirmat anterior)
            'template_1nbipm7',  // Template ID (cel creat de tine)
            templateParams,          // Datele din formular
            'jCcBhOkk0dcAkqIFx'      // Public Key
        )
            .then(() => {
                // SUCCES
                setIsSubmitting(false);
                setFormData({ name: '', email: '', subject: '', message: '' }); // Golim formularul
                toast.success(t.sentSuccess || "Message sent successfully!", {
                    style: { background: '#fff', color: '#000', border: '1px solid #eee' },
                    iconTheme: { primary: '#FF4D00', secondary: '#fff' }
                });
            })
            .catch((error) => {
                // EROARE
                console.error('FAILED...', error);
                setIsSubmitting(false);
                toast.error("Failed to send message. Please try again later.", {
                    style: { background: '#fff', color: 'red', border: '1px solid #eee' }
                });
            });
    };

    return (
        <div className="min-h-screen bg-[#f5f5f5] text-black pt-28 pb-12">
            <div className="max-w-[1200px] mx-auto px-6">

                {/* HEADER */}
                <div className="mb-16 border-b border-black/10 pb-8">
                    <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter mb-4 uppercase">
                        {t.contactTitle}
                    </h1>
                    <p className="text-gray-500 uppercase tracking-widest text-xs md:text-sm max-w-xl">
                        {t.contactSubtitle}
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24">

                    {/* --- STÂNGA: INFO --- */}
                    <div className="space-y-12">

                        <div className="space-y-8">
                            {/* Email */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white border border-black/5 flex items-center justify-center shrink-0">
                                    <Mail className="text-brand-accent" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase tracking-widest text-sm mb-1">{t.emailUs}</h3>
                                    <p className="text-gray-600 text-sm mb-1">{t.general}: <span className="font-mono text-black">kcrossing@atomicmail.io</span></p>
                                </div>
                            </div>

                            {/* Working Hours */}
                            <div className="flex items-start gap-4">
                                <div className="w-12 h-12 bg-white border border-black/5 flex items-center justify-center shrink-0">
                                    <Clock className="text-brand-accent" size={20} />
                                </div>
                                <div>
                                    <h3 className="font-bold uppercase tracking-widest text-sm mb-1">{t.workingHours}</h3>
                                    <p className="text-gray-600 text-sm">{t.monFri}: <span className="font-mono text-black">10:00 - 18:00</span></p>
                                    <p className="text-gray-600 text-sm">{t.weekend}: <span className="font-mono text-black">{t.closed}</span></p>
                                </div>
                            </div>
                        </div>

                        {/* FAQ Teaser */}
                        <div className="bg-black text-white p-8 relative overflow-hidden group">
                            <div className="relative z-10">
                                <h3 className="font-black italic text-2xl mb-2">{t.faqTitle}</h3>
                                <p className="text-gray-400 text-sm mb-6">{t.faqText}</p>
                                <Link to="/faq" className="text-xs font-bold uppercase tracking-widest border-b border-brand-accent pb-1 hover:text-brand-accent transition inline-block">
                                    {t.readFaq}
                                </Link>
                            </div>
                            <div className="absolute -right-4 -bottom-4 text-brand-accent/10">
                                <ArrowRight size={120} />
                            </div>
                        </div>

                    </div>

                    {/* --- DREAPTA: FORMULAR --- */}
                    <div className="bg-white border border-black/5 p-8 md:p-10 shadow-sm h-fit">
                        <h2 className="text-xl font-black italic uppercase mb-8">{t.sendMessageTitle}</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t.yourName}</label>
                                    <input
                                        required
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        type="text"
                                        className="w-full bg-[#f9f9f9] border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400 transition-colors"
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t.emailAddress}</label>
                                    <input
                                        required
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        type="email"
                                        className="w-full bg-[#f9f9f9] border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400 transition-colors"
                                        placeholder="john@example.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t.subject}</label>
                                <select
                                    name="subject"
                                    value={formData.subject}
                                    onChange={handleChange}
                                    className="w-full bg-[#f9f9f9] border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black transition-colors appearance-none cursor-pointer"
                                >
                                    <option value="">{t.selectTopic}</option>
                                    <option value="order">{t.topicOrder}</option>
                                    <option value="return">{t.topicReturn}</option>
                                    <option value="collab">{t.topicCollab}</option>
                                    <option value="other">{t.topicOther}</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{t.message}</label>
                                <textarea
                                    required
                                    name="message"
                                    value={formData.message}
                                    onChange={handleChange}
                                    rows="5"
                                    className="w-full bg-[#f9f9f9] border border-gray-200 p-4 text-sm focus:border-brand-accent outline-none text-black placeholder-gray-400 transition-colors resize-none"
                                    placeholder={t.messagePlaceholder}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full bg-black text-white font-black uppercase tracking-widest py-4 hover:bg-brand-accent hover:text-black transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : <Send size={18} />}
                                {isSubmitting ? t.sending : t.sendBtn}
                            </button>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}