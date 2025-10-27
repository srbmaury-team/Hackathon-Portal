import axios from "axios";
import i18n from "../i18n/i18n";

// Allow overriding the backend URL via Vite env (VITE_API_URL).
// Default to a relative path `/api` so the Vite dev server can proxy requests to the backend
// during development (avoids mixed-origin/network issues when backend runs in a container).
const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const API = axios.create({
    baseURL: BASE_URL,
});

// Add request interceptor to include language header
API.interceptors.request.use(
    (config) => {
        const language = i18n.language || "en";
        config.headers["Accept-Language"] = language;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default API;