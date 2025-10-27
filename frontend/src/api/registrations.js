import API from "./apiConfig";

// Register for Hackathon (creates team)
export const registerForHackathon = async (hackathonId, registrationData, token) => {
    const res = await API.post(`/register/${hackathonId}/register`, registrationData, {
        headers: { Authorization: `Bearer ${token}` },
    });
    return res.data;
};