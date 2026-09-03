import mongoose from "mongoose";

const declarationSchema = new mongoose.Schema({
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
    adventures: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Adventure",
    }],
}, {
    timestamps: true,
});

export const Declaration = mongoose.model("Declaration", declarationSchema);