import { Review } from "../models/review.model.js";
import { Instructor } from "../models/instructor.model.js";
import { User } from "../models/user.model.js";
import { Hotel } from "../models/hotel.model.js";
import { Item } from "../models/item.model.js";
async function recalcForItem(itemId) {
  const res = await Review.aggregate([
    { $match: { item: new mongoose.Types.ObjectId(itemId) } },
    {
      $group: {
        _id: "$item",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (res.length) {
    await Item.findByIdAndUpdate(itemId, {
      avgRating: res[0].avg,
      totalReviews: res[0].count,
    });
  } else {
    await Item.findByIdAndUpdate(itemId, {
      avgRating: 0,
      totalReviews: 0,
    });
  }
}
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import mongoose from "mongoose";

async function recalcForInstructor(instructorId) {
  const res = await Review.aggregate([
    { $match: { instructor: new mongoose.Types.ObjectId(instructorId) } },
    {
      $group: {
        _id: "$instructor",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (res.length) {
    await Instructor.findByIdAndUpdate(instructorId, {
      avgReview: res[0].avg,
      reviewCount: res[0].count,
    });
  } else {
    await Instructor.findByIdAndUpdate(instructorId, {
      avgReview: 0,
      reviewCount: 0,
    });
  }
}

async function recalcForHotel(hotelId) {
  const res = await Review.aggregate([
    { $match: { hotel: new mongoose.Types.ObjectId(hotelId) } },
    {
      $group: {
        _id: "$hotel",
        avg: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (res.length) {
    await Hotel.findByIdAndUpdate(hotelId, {
      avgReview: res[0].avg,
      reviewCount: res[0].count,
    });
  } else {
    await Hotel.findByIdAndUpdate(hotelId, {
      avgReview: 0,
      reviewCount: 0,
    });
  }
}

export const createReview = asyncHandler(async (req, res) => {
  const { instructorId, hotelId, itemId, rating, comment } = req.body;

  if (!rating || (rating < 1 || rating > 5)) {
    throw new ApiError(400, "Rating must be between 1 and 5");
  }

  if (!instructorId && !hotelId && !itemId) {
    throw new ApiError(400, "Target (instructorId, hotelId, or itemId) is required");
  }

  const reviewData = {
    user: req.user._id,
    rating,
    comment,
  };

  if (instructorId) {
    const user = await User.findById(instructorId);
    if (!user || !user.instructor) {
      throw new ApiError(404, "Instructor not found for provided user id");
    }
    reviewData.instructor = user.instructor._id ? user.instructor._id : user.instructor;
  }

  if (hotelId) {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) throw new ApiError(404, "Hotel not found");
    reviewData.hotel = hotelId;
  }

  if (itemId) {
    const item = await Item.findById(itemId);
    if (!item) throw new ApiError(404, "Item not found");
    reviewData.item = itemId;
  }

  // Prevent duplicate review by same user for same target
  const existing = await Review.findOne({
    user: req.user._id,
    instructor: reviewData.instructor || undefined,
    hotel: reviewData.hotel || undefined,
    item: reviewData.item || undefined,
  });
  if (existing) throw new ApiError(409, "User has already reviewed this item");

  const review = await Review.create(reviewData);

  if (review.instructor) await recalcForInstructor(review.instructor);
  if (review.hotel) await recalcForHotel(review.hotel);
  if (review.item) await recalcForItem(review.item);

  res.status(201).json(review);
});

export const updateReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, comment } = req.body;

  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, "Review not found");
  if (review.user.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not allowed to edit this review");

  if (rating) {
    if (rating < 1 || rating > 5) throw new ApiError(400, "Rating must be between 1 and 5");
    review.rating = rating;
  }
  if (comment !== undefined) review.comment = comment;

  await review.save();

  if (review.instructor) await recalcForInstructor(review.instructor);
  if (review.hotel) await recalcForHotel(review.hotel);
  if (review.item) await recalcForItem(review.item);

  res.json(review);
});

export const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id);
  if (!review) throw new ApiError(404, "Review not found");
  if (review.user.toString() !== req.user._id.toString())
    throw new ApiError(403, "Not allowed to delete this review");

  await Review.findByIdAndDelete(id);

  if (review.instructor) await recalcForInstructor(review.instructor);
  if (review.hotel) await recalcForHotel(review.hotel);
  if (review.item) await recalcForItem(review.item);

  res.json({ success: true });
});

export const getReviews = asyncHandler(async (req, res) => {
  const { instructorId, hotelId, itemId, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (instructorId) {
    const user = await User.findById(instructorId);
    if (!user || !user.instructor) {
      return res.json([]);
    }
    filter.instructor = user.instructor._id ? user.instructor._id : user.instructor;
  }
  if (hotelId) filter.hotel = hotelId;
  if (itemId) filter.item = itemId;

  const skip = (Number(page) - 1) * Number(limit);
  const reviews = await Review.find(filter)
    .populate("user", "name email")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(Number(limit));

  res.json(reviews);
});

export const getReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id).populate("user", "name email");
  if (!review) throw new ApiError(404, "Review not found");
  res.json(review);
});
