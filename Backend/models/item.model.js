import mongoose from "mongoose";
import { Category } from "./category.model.js";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    price: {
      type: Number,
      min: 0,
      default: 0,
    },
    rentalPrice: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    category: {
      type: String,
      required: true,
      validate: {
        validator: async function (value) {
          const exists = await Category.exists({ name: value });
          return !!exists;
        },
        message: (props) => `${props.value} is not a valid category`,
      },
    },
    adventures: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Adventure",
        required: true,
      },
    ],
    images: [
      {
        type: String,
        required: true,
      },
    ],
    rentalStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    purchaseStock: {
      type: Number,
      default: 0,
      min: 0,
    },
    purchase: {
      type: Boolean,
      required: true,
    },
    rent: {
      type: Boolean,
      required: true,
    },
    bookings: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Booking",
      },
    ],
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
      required: false,
    },
  },
  { timestamps: true }
);

itemSchema.index({ location: "2dsphere" });

export const Item = mongoose.model("Item", itemSchema);
