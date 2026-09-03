import mongoose from "mongoose";

const itemBookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: true,
    },
    items: [
      {
        item: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: {
          type: Number,
          min: 1,
          required: true,
        },
        rentalPeriod: {
          startDate: {
            type: Date,
          },
          endDate: {
            type: Date,
          },
          days: {
            type: Number,
            min: 1,
          },
        },
        purchase: {
          type: Boolean,
          default: false,
        },
      },
    ],
    status: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    amount: {
      type: Number,
      min: 0,
    },

    bookingDate: {
      type: Date,
      default: Date.now,
    },
    modeOfPayment: {
      type: String,
      enum: ["paypal", "cash", "revolut"],
      default: "revolut",
    },

    paymentOrderId: {
      type: String,
      trim: true,
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed", "cancelled"],
      default: "pending",
    },

    paymentCompletedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

export const ItemBooking = mongoose.model("ItemBooking", itemBookingSchema);
