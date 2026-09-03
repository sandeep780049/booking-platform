import mongoose from "mongoose";

// Defines a rule like: for a specific adventure (or globally),
// when user's completedSessions reaches a threshold, award an achievement.
const achievementRuleSchema = new mongoose.Schema(
  {
    // Human-readable unique name for the rule
    name: { type: String, required: true, trim: true },
    // Optional alternate display title (backward-compatible)
    title: { type: String, trim: true },
    description: { type: String, default: "" },
    // Optional UI grouping label, e.g., "Tree Climbing"
    label: { type: String, default: "" },

    // If set, the rule applies to this specific adventure.
    // If null, treat as a global rule across all adventures (sum of sessions).
    adventure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Adventure",
      default: null,
      index: true,
    },

    // Target audience for the achievement rule
    targetType: {
      type: String,
      enum: ["user", "instructor"],
      default: "user",
      index: true,
    },

    // Metric to evaluate for threshold.
    metric: {
      type: String,
      enum: ["completedSessions", "confirmedBookings", "rating", "joiningDate", "bookingCount"],
      default: "completedSessions",
    },

    // Threshold for the metric. e.g., 1, 5, 10
    threshold: { type: Number, required: true, min: 1 },

    // Additional criteria for instructor achievements
    instructorCriteria: {
      // Minimum rating threshold (for instructor achievements)
      minRating: {
        type: Number,
        min: 0,
        max: 5,
      },
      // Minimum months since joining (for instructor achievements)
      minMonthsSinceJoining: {
        type: Number,
        min: 0,
      },
      // Minimum number of bookings received (for instructor achievements)
      minBookings: {
        type: Number,
        min: 0,
      },
    },

    // Controls whether this rule is currently used for awarding.
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Prevent duplicate names for the same adventure and target type to keep UX clean
achievementRuleSchema.index({ adventure: 1, name: 1, targetType: 1 }, { unique: true, sparse: true });

export const AchievementRule = mongoose.model(
  "AchievementRule",
  achievementRuleSchema
);
