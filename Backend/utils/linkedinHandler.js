import axios from "axios";

export const verifyLinkedInToken = async (token) => {
    try {
        const response = await axios.get("https://api.linkedin.com/v2/userinfo", {
            headers: { Authorization: `Bearer ${token}` },
        });

        return response.data; // Contains user ID, email, and profile info
    } catch (error) {
        console.error("Error verifying LinkedIn token:", error.response.data);
        throw new Error("Invalid LinkedIn token");
    }
};

export const getLinkedInAccessToken = async (code) => {
    const CLIENT_ID = process.env.LINKEDIN_CLIENT_ID;
    const CLIENT_SECRET = process.env.LINKEDIN_CLIENT_SECRET;
    const REDIRECT_URI = "http://localhost:5173/auth/signInWithLinkedin";
    
    try {
        const response = await axios.post(
            "https://www.linkedin.com/oauth/v2/accessToken",
            new URLSearchParams({
                grant_type: "authorization_code",
                code,
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
            }),
            { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
        );

        return response.data.access_token;
    } catch (error) {
        console.error("Error getting LinkedIn token:", error.response.data);
        throw new Error("Failed to get access token");
    }
};
