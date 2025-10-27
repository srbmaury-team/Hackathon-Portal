import API from "./apiConfig";

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