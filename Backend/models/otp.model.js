import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
            index: true,
        },
        otp: {
            type: Number,
            required: true,
        },
        verified: {
            type: Boolean,
            default: false,
        },
        createdAt: {
            type: Date,
            default: Date.now,
            expires: 300 // 300 seconds = 5 minutes
        }
    }
);

export const Otp = mongoose.model("Otp", otpSchema);
