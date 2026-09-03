import mongoose from "mongoose";

const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    coordinates: {
      latitude: {
        type: Number,
        required: true,
      },
      longitude: {
        type: Number,
        required: true,
      },
    },
    mapEmbedUrl: {
      type: String,
      required: false,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
      default: 1,
    },
    image: {
      type: String,
      required: false,
    },
    medias: [
      {
        type: String,
        required: false,
      },
    ],
    city: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    adventures: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Adventure",
        },
      ],
      required: [true, "At least one adventure is required"],
      validate: {
        validator: function (v) {
          return Array.isArray(v) && v.length > 0;
        },
        message: "At least one adventure is required",
      },
    },
    isNftEvent: {
      type: Boolean,
      default: false,
    },
    nftReward: {
      enabled: {
        type: Boolean,
        default: false,
      },
      nftName: {
        type: String,
        required: false,
      },
      nftDescription: {
        type: String,
        required: false,
      },
      nftImage: {
        type: String,
        required: false,
      },
    },
    price: {
      type: Number,
      required: false,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

export const Event = mongoose.model("Event", eventSchema);
