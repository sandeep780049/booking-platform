import axios from "axios";
import { ApiError } from "../utils/ApiError.js";

// Helper function to create Revolut payment order
export const createRevolutOrder = async (
  amount,
  currency = "GBP",
  description = "Item Booking Payment"
) => {
  try {
    // Validate inputs
    if (!amount || amount <= 0) {
      throw new Error("Invalid amount provided");
    }

    if (!process.env.REVOLUT_SECRET_API_KEY) {
      throw new Error("Revolut API key not configured");
    }

    const redirectUrl =
      process.env.NODE_ENV === "production"
        ? `${process.env.FRONTEND_URL}/cart/success`
        : "https://4f93-2405-201-a423-5801-702b-aa6e-bdc3-2a08.ngrok-free.app/cart/success";

    const requestPayload = {
      amount: Math.round(amount * 100), // Convert to pence/cents as Revolut expects smallest currency unit
      currency: currency.toUpperCase(),
      description: description.substring(0, 255), // Limit description length
      capture_mode: "automatic", // Changed to automatic capture
      redirect_url: redirectUrl,
    };

    // Log the request data for debugging
    const config = {
      method: "post",
      maxBodyLength: Infinity,
      url: "https://sandbox-merchant.revolut.com/api/orders",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${process.env.REVOLUT_SECRET_API_KEY}`,
        "Revolut-Api-Version": "2024-09-01",
      },
      data: JSON.stringify(requestPayload),
    };

    const response = await axios(config);
    return response.data;
  } catch (error) {
    // Enhanced error logging
    console.error("Revolut order creation error:");
    console.error("Error message:", error.message);

    if (error.response?.data) {
      throw new ApiError(
        500,
        `Revolut API Error: ${
          error.response.data.message || "Failed to create payment order"
        }`
      );
    } else {
      throw new ApiError(500, `Payment service error: ${error.message}`);
    }
  }
};
