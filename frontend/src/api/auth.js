import API from "./apiConfig";

// Google Login
export const googleLogin = async (idToken) => {
    const res = await API.post("/auth/google-login", { token: idToken });
    return res.data;
};