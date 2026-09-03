import mongoose from "mongoose";

const instructorAchievementSchema = new mongoose.Schema(
  {
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // References the user who has instructor role
      required: true,
      unique: true, // One achievement record per instructor
      index: true,
    },

    // Instructor basic info (for quick access without populate)
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    level: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Current instructor metrics
    currentRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },

    totalBookingsReceived: {
      type: Number,
      default: 0,
      min: 0,
    },

    monthsSinceJoining: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Experience points system for instructors
    totalExperiencePoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Array of earned achievements
    achievements: [
      {
        name: {
          type: String,
          required: true,
          trim: true,
        },
        description: {
          type: String,
          default: "",
        },
        category: {
          type: String,
          default: "general",
          trim: true,
        },
        level: {
          type: Number,
          default: 1,
          min: 1,
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        icon: {
          type: String,
          default: "",
        },
        // Criteria that led to this achievement
        criteria: {
          rating: Number,
          monthsSinceJoining: Number,
          bookingCount: Number,
        },
      },
    ],

    // Performance badges
    badges: [
      {
        type: {
          type: String,
          enum: ["rating", "experience", "popularity", "loyalty"],
          required: true,
        },
        level: {
          type: String,
          enum: ["bronze", "silver", "gold", "platinum"],
          required: true,
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    // Statistics
    stats: {
      totalAchievements: {
        type: Number,
        default: 0,
        min: 0,
      },
      lastEvaluated: {
        type: Date,
        default: Date.now,
      },
      streak: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
instructorAchievementSchema.index({ level: -1 });
instructorAchievementSchema.index({ totalExperiencePoints: -1 });
instructorAchievementSchema.index({ currentRating: -1 });
instructorAchievementSchema.index({ "achievements.earnedAt": -1 });

// Virtual for achievement count
instructorAchievementSchema.virtual("achievementCount").get(function () {
  return this.achievements.length;
});

// Method to add achievement
instructorAchievementSchema.methods.addAchievement = function (achievement) {
  this.achievements.push(achievement);
  this.stats.totalAchievements = this.achievements.length;
  this.stats.lastEvaluated = new Date();
  return this.save();
};

// Method to calculate level based on experience points
instructorAchievementSchema.methods.calculateLevel = function () {
  // Simple level calculation: level = floor(experiencePoints / 100)
  this.level = Math.floor(this.totalExperiencePoints / 100);
  return this.level;
};

export const InstructorAchievement = mongoose.model(
  "InstructorAchievement",
  instructorAchievementSchema
);