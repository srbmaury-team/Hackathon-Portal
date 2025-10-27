import API from "./apiConfig";

// Fetch Users
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