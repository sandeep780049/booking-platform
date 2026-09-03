import mongoose from "mongoose";

const userAdventureExperienceSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    adventure: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Adventure",
      required: true,
      index: true,
    },
    experience: {
      type: Number,
      default: 0,
      min: 0,
    },
    completedSessions: {
      type: Number,
      default: 0,
      min: 0,
    },
    lastSessionDate: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to ensure one record per user-adventure combination
userAdventureExperienceSchema.index(
  { user: 1, adventure: 1 },
  { unique: true }
);

// Static method to calculate overall user level
userAdventureExperienceSchema.statics.calculateOverallLevel = async function (
  userId
) {
  const experiences = await this.find({ user: userId });

  if (experiences.length === 0) {
    return { overallLevel: 0, totalExperience: 0, averageLevel: 0 };
  }

  const totalExperience = experiences.reduce(
    (sum, exp) => sum + exp.experience,
    0
  );
  const averageLevel = Math.floor(totalExperience / experiences.length);
  const overallLevel = Math.floor(totalExperience / 1000); // Every 1000 exp = 1 level

  return {
    overallLevel,
    totalExperience,
    averageLevel,
    adventureCount: experiences.length,
  };
};

// Method to add experience for a specific adventure
userAdventureExperienceSchema.statics.addExperience = async function (
  userId,
  adventureId,
  expAmount
) {
  try {
    const result = await this.findOneAndUpdate(
      { user: userId, adventure: adventureId },
      {
        $inc: {
          experience: expAmount,
          completedSessions: 1,
        },
        $set: { lastSessionDate: new Date() },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    );
    return result;
  } catch (error) {
    // Handle duplicate key error if record already exists
    if (error.code === 11000) {
      return await this.findOneAndUpdate(
        { user: userId, adventure: adventureId },
        {
          $inc: {
            experience: expAmount,
            completedSessions: 1,
          },
          $set: { lastSessionDate: new Date() },
        },
        { new: true }
      );
    }
    throw error;
  }
};

export const UserAdventureExperience = mongoose.model(
  "UserAdventureExperience",
  userAdventureExperienceSchema
);
