import mongoose from "mongoose";

const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
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
          required: true,
          min: 1,
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
          default: false, // true if the item is being purchased
        },
      },
    ],
  },
  { timestamps: true }
);

export const Cart = mongoose.model("Cart", cartSchema);
