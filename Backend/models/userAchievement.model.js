import mongoose from "mongoose";

const userAchievementSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // One achievement record per user
      index: true,
    },

    // User basic info (for quick access without populate)
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

    // Adventure completion metrics
    totalCompletedAdventures: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Adventures grouped by category
    adventuresByCategory: {
      type: Map,
      of: Number,
      default: new Map(),
      // Example: { "hiking": 5, "skiing": 3, "paragliding": 2 }
    },

    // Experience points system
    totalExperiencePoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Experience points by category
    experienceByCategory: {
      type: Map,
      of: Number,
      default: new Map(),
      // Example: { "hiking": 350, "skiing": 200, "paragliding": 150 }
    },

    // Adventure statistics
    adventureStats: {
      uniqueCategories: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    // Achievement badges/milestones
    achievements: [
      {
        name: {
          type: String,
          required: true,
        },
        description: {
          type: String,
        },
        category: {
          type: String,
        },
        earnedAt: {
          type: Date,
          default: Date.now,
        },
        level: {
          type: Number,
          default: 1,
        },
      },
    ],

    // Metadata
    lastUpdated: {
      type: Date,
      default: Date.now,
    },

    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
userAchievementSchema.index({ userId: 1 });
userAchievementSchema.index({ level: -1 });
userAchievementSchema.index({ totalExperiencePoints: -1 });

// Update lastUpdated on save
userAchievementSchema.pre("save", function (next) {
  this.lastUpdated = new Date();
  next();
});

// Static method to create or update achievement
userAchievementSchema.statics.createOrUpdate = async function (
  achievementData
) {
  const { userId, ...updateData } = achievementData;

  return await this.findOneAndUpdate(
    { userId },
    {
      ...updateData,
      calculatedAt: new Date(),
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  );
};

export const UserAchievement = mongoose.model(
  "UserAchievement",
  userAchievementSchema
);
