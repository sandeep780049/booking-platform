import mongoose from "mongoose";

const registrationLimitSchema = new mongoose.Schema(
  {
    adventure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Adventure",
      required: true,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
      required: true,
    },
    limit: {
      type: Number,
      required: true,
      min: 1,
    },
    currentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    waitlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Instructor",
      },
    ],
  },
  {
    timestamps: true,
  },
);

registrationLimitSchema.index({ adventure: 1, location: 1 }, { unique: true });

export const RegistrationLimit = mongoose.model(
  "RegistrationLimit",
  registrationLimitSchema,
);
