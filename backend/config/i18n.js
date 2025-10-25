const i18n = require("i18n");
const path = require("path");

i18n.configure({
    locales: ["en", "hi", "te"], // add more as needed
    defaultLocale: "en",
    directory: path.join(process.cwd(), "locales"),
    objectNotation: true,
    autoReload: true,
    syncFiles: true,
    queryParameter: "lang", // optional (?lang=hi)
});

module.exports = i18n;
