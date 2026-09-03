import mongoose from "mongoose";

const eventBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true,
    },
    participants: {
      type: Number,
      required: true,
      min: 1,
      max: 20,
      default: 1,
    },
    contactInfo: {
      email: {
        type: String,
        required: true,
      },
      phone: {
        type: String,
        required: true,
      },
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled", "completed"],
      default: "pending",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "refunded"],
      default: "pending",
    },
    paymentMethod: {
      type: String,
      enum: ["revolut", "paypal", "card"],
      default: "revolut",
    },
    paymentOrderId: {
      type: String,
      required: false,
    },
    transactionId: {
      type: String,
      required: false,
    },
    bookingDate: {
      type: Date,
      default: Date.now,
    },
    paymentCompletedAt: {
      type: Date,
      required: false,
    },
    cancelledAt: {
      type: Date,
      required: false,
    },
    cancelReason: {
      type: String,
      required: false,
    },
    adventureInstructors: [
      {
        adventure: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Adventure",
          required: true,
        },
        instructor: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
      },
    ],
    adventureCompletionStatus: [
      {
        adventure: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Adventure",
          required: true,
        },
        completed: {
          type: Boolean,
          default: false,
        },
        completedAt: {
          type: Date,
          required: false,
        },
      },
    ],
    nftEligible: {
      type: Boolean,
      default: false,
    },
    nftAwarded: {
      type: Boolean,
      default: false,
    },
    nftAwardedAt: {
      type: Date,
      required: false,
    },
    nftTokenId: {
      type: String,
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Add compound index for user and event to prevent duplicate bookings
eventBookingSchema.index({ user: 1, event: 1 });

// Add index for status queries
eventBookingSchema.index({ status: 1 });

// Add index for payment status queries
eventBookingSchema.index({ paymentStatus: 1 });

export const EventBooking = mongoose.model("EventBooking", eventBookingSchema);
