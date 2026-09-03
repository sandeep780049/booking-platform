import mongoose from "mongoose";

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    instructor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Instructor",
    },
    hotel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Hotel",
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
    },
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
  },
  {
    timestamps: true,
  }
);

// Ensure a review targets either an instructor, hotel, or item
ReviewSchema.index({ user: 1, instructor: 1 }, { unique: true, partialFilterExpression: { instructor: { $type: 'objectId' } } });
ReviewSchema.index({ user: 1, hotel: 1 }, { unique: true, partialFilterExpression: { hotel: { $type: 'objectId' } } });
ReviewSchema.index({ user: 1, item: 1 }, { unique: true, partialFilterExpression: { item: { $type: 'objectId' } } });

export const Review = mongoose.model("Review", ReviewSchema);
