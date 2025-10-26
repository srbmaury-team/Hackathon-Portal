import axios from "axios";
import i18n from "../i18n/i18n";

const API = axios.create({
    baseURL: "http://localhost:5000/api", // backend base URL
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

// Google Login
export const googleLogin = async (idToken) => {
    const res = await API.post("/auth/google-login", { token: idToken });
    return res.data;
};

// Fetch Public Ideas
export const getPublicIdeas = async (token) => {
    const res = await API.get("/ideas/public-ideas", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Fetch User Ideas
export const getUserIdeas = async (token) => {
    const res = await API.get("/ideas/my", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Submit Idea
export const submitIdea = async (idea, token) => {
    const res = await API.post("/ideas/submit", idea, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Edit Idea
export const editIdea = async (id, updatedIdea, token) => {
    const res = await API.put(`/ideas/${id}`, updatedIdea, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Delete Idea
export const deleteIdea = async (id, token) => {
    const res = await API.delete(`/ideas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Fetch Announcements
export const getAnnouncements = async (token) => {
    const res = await API.get("/announcements", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Create Announcement
export const createAnnouncement = async (announcement, token) => {
    const res = await API.post("/announcements", announcement, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Update Announcement
export const updateAnnouncement = async (id, updatedAnnouncement, token) => {
    const res = await API.put(`/announcements/${id}`, updatedAnnouncement, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Delete Announcement
export const deleteAnnouncement = async (id, token) => {
    const res = await API.delete(`/announcements/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Fetch Users (for User Management)
export const getUsers = async (token) => {
    const res = await API.get("/users", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Update User Role
export const updateUserRole = async (userId, role, token) => {
    const res = await API.put(`/users/${userId}/role`, { role }, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Create Hackathon
export const createHackathon = async (hackathon, token) => {
    const res = await API.post("/hackathons", hackathon, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Get All Hackathons
export const getAllHackathons = async (token) => {
    const res = await API.get("/hackathons", {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Get Hackathon by ID
export const getHackathonById = async (id, token) => {
    const res = await API.get(`/hackathons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Update Hackathon
export const updateHackathon = async (id, updatedHackathon, token) => {
    const res = await API.put(`/hackathons/${id}`, updatedHackathon, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

// Delete Hackathon
export const deleteHackathon = async (id, token) => {
    const res = await API.delete(`/hackathons/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};

export default API;
