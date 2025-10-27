import API from "./apiConfig";

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