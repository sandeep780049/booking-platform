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
      avgRating: roundRating(res[0].avg),
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

// Averages are stored rounded to one decimal so the denormalised values on
// Item/Instructor/Hotel stay readable instead of persisting full float tails
// such as 4.333333333333333.
const roundRating = (value) => Math.round((Number(value) || 0) * 10) / 10;

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
      avgReview: roundRating(res[0].avg),
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
      avgReview: roundRating(res[0].avg),
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

// Sort orders accepted by getReviews via ?sort=
const REVIEW_SORTS = {
  newest: { createdAt: -1 },
  oldest: { createdAt: 1 },
  highest: { rating: -1, createdAt: -1 },
  lowest: { rating: 1, createdAt: -1 },
};

// Resolve the public target params into a Review filter.
//
// instructorId is accepted as a User id because that is what the booking UI
// has to hand (Session.instructorId points at User), while Review.instructor
// points at the separate Instructor profile document. Returns null when an
// instructorId does not resolve to a profile, which callers surface as empty.
const resolveTargetFilter = async ({ instructorId, hotelId, itemId }) => {
  const filter = {};

  if (instructorId) {
    const user = await User.findById(instructorId).select("instructor");
    if (!user || !user.instructor) return null;
    filter.instructor = user.instructor._id ? user.instructor._id : user.instructor;
  }
  if (hotelId) filter.hotel = hotelId;
  if (itemId) filter.item = itemId;

  return filter;
};

export const getReviews = asyncHandler(async (req, res) => {
  const { instructorId, hotelId, itemId, rating, sort = "newest", page = 1, limit = 20 } = req.query;

  const filter = await resolveTargetFilter({ instructorId, hotelId, itemId });
  if (!filter) return res.json([]);

  if (rating) {
    const value = Number(rating);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      throw new ApiError(400, "Rating must be between 1 and 5");
    }
    filter.rating = value;
  }

  const currentPage = Math.max(Number(page) || 1, 1);
  // Clamp so a caller cannot ask for an unbounded slice.
  const perPage = Math.min(Math.max(Number(limit) || 20, 1), 50);

  const reviews = await Review.find(filter)
    .populate("user", "name email")
    .sort(REVIEW_SORTS[sort] || REVIEW_SORTS.newest)
    .skip((currentPage - 1) * perPage)
    .limit(perPage);

  res.json(reviews);
});

// Average rating plus a 5->1 star distribution for a target, used to render
// the review breakdown widget. Computed in one constant-memory aggregation.
export const getReviewSummary = asyncHandler(async (req, res) => {
  const emptyBreakdown = () =>
    [5, 4, 3, 2, 1].map((value) => ({ rating: value, count: 0, percentage: 0 }));

  const { instructorId, hotelId, itemId } = req.query;

  const filter = await resolveTargetFilter({ instructorId, hotelId, itemId });
  if (!filter) {
    return res.json({ avgRating: 0, totalReviews: 0, breakdown: emptyBreakdown() });
  }

  const [stats] = await Review.aggregate([
    { $match: filter },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        totalReviews: { $sum: 1 },
        five: { $sum: { $cond: [{ $eq: ["$rating", 5] }, 1, 0] } },
        four: { $sum: { $cond: [{ $eq: ["$rating", 4] }, 1, 0] } },
        three: { $sum: { $cond: [{ $eq: ["$rating", 3] }, 1, 0] } },
        two: { $sum: { $cond: [{ $eq: ["$rating", 2] }, 1, 0] } },
        one: { $sum: { $cond: [{ $eq: ["$rating", 1] }, 1, 0] } },
      },
    },
  ]);

  if (!stats) {
    return res.json({ avgRating: 0, totalReviews: 0, breakdown: emptyBreakdown() });
  }

  const counts = {
    5: stats.five,
    4: stats.four,
    3: stats.three,
    2: stats.two,
    1: stats.one,
  };

  res.json({
    avgRating: roundRating(stats.avgRating),
    totalReviews: stats.totalReviews,
    breakdown: [5, 4, 3, 2, 1].map((value) => ({
      rating: value,
      count: counts[value],
      percentage:
        stats.totalReviews === 0
          ? 0
          : Math.round((counts[value] / stats.totalReviews) * 100),
    })),
  });
});

export const getReview = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const review = await Review.findById(id).populate("user", "name email");
  if (!review) throw new ApiError(404, "Review not found");
  res.json(review);
});
