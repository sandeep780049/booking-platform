import mongoose from "mongoose";

const adminSchema = new mongoose.Schema({
  adminRole: {
    type: [
      {
        type: String,
        enum: ["Hotel", "Instructor", "User", "Admin"],
      },
    ],
    required: true,
  },
});

export const Admin = mongoose.model("Admin", adminSchema);
