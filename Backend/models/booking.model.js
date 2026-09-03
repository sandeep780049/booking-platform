import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true
    },
    groupMember: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        index: true,
      }
    ],
    session: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Session",
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    transactionId: {
      type: String,
    },
    amount: {
      type: Number,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    modeOfPayment: {
      type: String,
      enum: ["paypal", "cash", "revolut"],
      default: "cash",
    },
  },
  {
    timestamps: true,
  }
);

export const Booking = mongoose.model("Booking", bookingSchema);