import API from "./apiConfig";

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