import mongoose from "mongoose";

const HotelSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    pricePerNight: {
      type: Number,
      required: true,
    },
    rating: {
      type: Number,
      default: 0,
    },
    location: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Location",
    },
    fullAddress: {
      type: String,
      required: true,
    },
    contactNo: {
      type: String,
      required: true,
    },
    managerName: {
      type: String,
      required: true,
    },
    noRoom: {
      type: Number,
      required: true,
    },
    category: {
      type: String,
      enum: ["camping", "hotel", "glamping"],
      required: true,
      default: "hotel",
    },
    description: {
      type: String,
    },
    verified: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    amenities: {
      type: [
        {
          type: String,
        },
      ],
      required: true,
    },
    website: {
      type: String,
    },
    socials: {
      type: [
        {
          type: String,
        },
      ],
    },
    price: {
      type: Number,
      required: true,
    },
    logo: {
      type: String,
    },
    medias: {
      type: [
        {
          type: String,
        },
      ],
    },
    license: {
      type: String,
    },
    certificate: {
      type: String,
    },
    insurance: {
      type: String,
    },
    avgReview: {
      type: Number,
      default: 0,
    },
    reviewCount: {
      type: Number,
      default: 0,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

export const Hotel = mongoose.model("Hotel", HotelSchema);
