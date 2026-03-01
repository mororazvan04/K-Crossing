import { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
    // 1. CITIM LIMBA DIN MEMORIA LOCALĂ (SAU DEFAULT 'en')
    const [lang, setLangState] = useState(() => {
        return localStorage.getItem('k-crossing-lang') || 'en';
    });

    // 2. CITIM MONEDA DIN MEMORIA LOCALĂ (SAU DEFAULT 'USD')
    const [currency, setCurrencyState] = useState(() => {
        return localStorage.getItem('k-crossing-currency') || 'USD';
    });

    // Funcții wrapper care salvează și în localStorage
    const setLang = (newLang) => {
        setLangState(newLang);
        localStorage.setItem('k-crossing-lang', newLang);
    };

    const setCurrency = (newCurrency) => {
        setCurrencyState(newCurrency);
        localStorage.setItem('k-crossing-currency', newCurrency);
    };

    const availableLanguages = [
        { code: 'en', name: '🇺🇸 English' },
        { code: 'ro', name: '🇷🇴 Română' },
        { code: 'fr', name: '🇫🇷 Français' },
        { code: 'de', name: '🇩🇪 Deutsch' },
        { code: 'es', name: '🇪🇸 Español' }
    ];

    const exchangeRates = {
        USD: { rate: 1, locale: 'en-US' },
        EUR: { rate: 0.92, locale: 'de-DE' },
        RON: { rate: 4.65, locale: 'ro-RO' },
        GBP: { rate: 0.79, locale: 'en-GB' },
        JPY: { rate: 150.5, locale: 'ja-JP' }
    };

    const t = translations[lang];

    const convertPrice = (priceInUSD) => {
        const currencyData = exchangeRates[currency];
        return priceInUSD * currencyData.rate;
    };

    const formatPrice = (priceInUSD) => {
        const currencyData = exchangeRates[currency];
        const convertedPrice = priceInUSD * currencyData.rate;

        return new Intl.NumberFormat(currencyData.locale, {
            style: 'currency',
            currency: currency,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(convertedPrice);
    };

    return (
        <SettingsContext.Provider value={{
            lang,
            setLang,
            currency,
            setCurrency,
            t,
            formatPrice,
            convertPrice,
            availableLanguages,
            exchangeRates
        }}>
            {children}
        </SettingsContext.Provider>
    );
};