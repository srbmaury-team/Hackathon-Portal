const i18n = require("../config/i18n.js");

const i18nMiddleware = (req, res, next) => {
    // Get language from Accept-Language header, query param, or default to "en"
    let lang = req.query.lang || "en";
    
    if (req.headers["accept-language"]) {
        // Extract the primary language code (e.g., "en" from "en-US" or "en,hi;q=0.9")
        const headerLang = req.headers["accept-language"].split(",")[0].split("-")[0].trim();
        // Only use it if it's a supported locale
        if (["en", "hi", "te"].includes(headerLang)) {
            lang = headerLang;
        }
    }

    i18n.setLocale(req, lang);
    next();
};

module.exports = i18nMiddleware;
