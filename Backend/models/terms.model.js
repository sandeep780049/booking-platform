import mongoose from "mongoose";

const termsSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    version: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        enum: ["draft", "published"],
        default: "draft",
    },
    publishedBy: {
        type: String,
    },
    publishedAt: {
        type: Date, 
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });

// Compound unique index for title and version (allow same title with different versions)
termsSchema.index({ title: 1, version: 1 }, { unique: true });

export const Terms = mongoose.model("Terms", termsSchema);