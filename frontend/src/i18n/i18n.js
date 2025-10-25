import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

// Import your translations
import en from "./en.json";
import hi from "./hi.json";
import te from "./te.json";

i18n
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: { translation: en },
            hi: { translation: hi },
            te: { translation: te },
        },
        fallbackLng: "en",
        lng: localStorage.getItem("language") || "en", // Set initial language from localStorage
        interpolation: {
            escapeValue: false, // React already escapes
        },
        detection: {
            order: ["localStorage", "navigator", "htmlTag"],
            caches: ["localStorage"], // persist language
        },
        react: {
            useSuspense: false, // Disable suspense to avoid loading issues
        },
    });

export default i18n;
