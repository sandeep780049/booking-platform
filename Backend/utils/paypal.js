import axios from "axios";

// PayPal access tokens expire (~9 hours); cache with an early-refresh buffer so
// long-running processes do not keep sending stale tokens for payout calls.
const TOKEN_REFRESH_BUFFER_MS = 60 * 1000; // refresh 60s before expiry
let cachedToken = null;

export const getAccessToken = async () => {
  if (
    cachedToken &&
    cachedToken.token &&
    cachedToken.expiresAt > Date.now() + TOKEN_REFRESH_BUFFER_MS
  ) {
    return cachedToken.token;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("PayPal credentials are missing in environment variables");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const paypalApiBase =
      process.env.PAYPAL_API_BASE ||
      (process.env.NODE_ENV === "production"
        ? "https://api-m.paypal.com"
        : "https://api-m.sandbox.paypal.com");

    const response = await axios.post(
      `${paypalApiBase}/v1/oauth2/token`,
      "grant_type=client_credentials",
      {
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    cachedToken = {
      token: response.data.access_token,
      expiresAt:
        Date.now() +
        (Number(response.data.expires_in) || 32400) * 1000 -
        TOKEN_REFRESH_BUFFER_MS,
    };

    return cachedToken.token;
  } catch (error) {
    // Clear any stale cached token so a retry will re-authenticate
    cachedToken = null;
    console.error("Error getting PayPal access token:", error);
    throw error;
  }
};