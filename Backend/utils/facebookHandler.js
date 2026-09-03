import axios from "axios";

export const verifyFacebookToken = async (accessToken) => {
    try {
        // Fetch user profile from Facebook
        const userResponse = await axios.get(
            `https://graph.facebook.com/me?fields=id,name,email,picture&access_token=${accessToken}`
        );

        const user = userResponse.data;

        return user;
    } catch (error) {
        console.error("Error verifying Facebook token:", error.response.data);
        throw new Error("Invalid Facebook token");
    }
}


export const getFacebookAccessToken = async (code) => {
    const CLIENT_ID = process.env.FACEBOOK_CLIENT_ID;
    const CLIENT_SECRET = process.env.FACEBOOK_CLIENT_SECRET;
    const REDIRECT_URI = "http://localhost:5173/auth/signInWithFacebook";

    try {
        const tokenResponse = await axios.get(
            `https://graph.facebook.com/v11.0/oauth/access_token`,
            {
                params: {
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    redirect_uri: REDIRECT_URI,
                    code,
                },
            }
        );
        const accessToken = tokenResponse.data.access_token;
        return accessToken;
    } catch (error) {
        console.error("Error getting Facebook token:", error.response.data);
        throw new Error("Failed to get access token");
    }
};
