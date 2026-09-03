import { Event } from "../models/events.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import {
  translateObjectsFields,
  translateObjectFields,
} from "../utils/translation.js";
import { getLanguage } from "../middlewares/language.middleware.js";
import { reverseGeocode } from "../utils/geocoding.js";
export const createEvents = asyncHandler(async (req, res, next) => {
  const {
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    mapEmbedUrl,
    level,
    latitude,
    longitude,
    adventures,
    isNftEvent,
    nftReward,
    price,
  } = req.body;

  if (
    !title ||
    !description ||
    !date ||
    !startTime ||
    !endTime ||
    !location ||
    !latitude ||
    !longitude
  ) {
    return res.status(400).json({
      message: "All required fields including coordinates must be provided",
    });
  }

  // Get city and country directly from frontend
  const { city, country } = req.body;

  let medias = [];
  let image = null;

  if (req.files && req.files.medias) {
    const mediaFiles = Array.isArray(req.files.medias)
      ? req.files.medias
      : [req.files.medias];

    for (const file of mediaFiles) {
      const uploaded = await uploadOnCloudinary(file.path);
      if (uploaded && uploaded.url) {
        medias.push(uploaded.url);
        if (!image) image = uploaded.url;
      }
    }
  }

  // Parse adventures if provided as string
  let adventureIds = [];
  if (adventures) {
    try {
      adventureIds =
        typeof adventures === "string" ? JSON.parse(adventures) : adventures;
    } catch (error) {
      return res.status(400).json({
        message: "Invalid adventures format",
      });
    }
  }

  // Parse NFT reward settings if provided
  let nftRewardSettings = {};
  if (nftReward && typeof nftReward === "string") {
    try {
      nftRewardSettings = JSON.parse(nftReward);
    } catch (error) {
      nftRewardSettings = {};
    }
  } else if (nftReward && typeof nftReward === "object") {
    nftRewardSettings = nftReward;
  }

  const event = new Event({
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    coordinates: {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    },
    mapEmbedUrl: mapEmbedUrl || "",
    level: level || 1,
    image,
    medias,
    city,
    country,
    adventures: adventureIds || [],
    isNftEvent: isNftEvent === "true" || isNftEvent === true || false,
    price: price ? parseFloat(price) : 0,
    nftReward: {
      enabled: isNftEvent === "true" || isNftEvent === true || false,
      nftName: nftRewardSettings.nftName || "",
      nftDescription: nftRewardSettings.nftDescription || "",
      nftImage: nftRewardSettings.nftImage || "",
    },
  });

  await event.save();

  // Populate adventures in response
  const populatedEvent = await Event.findById(event._id).populate(
    "adventures",
    "name description thumbnail"
  );

  res.status(201).json({
    success: true,
    message: "Event created successfully",
    data: populatedEvent,
  });
});

export const getAllEvents = asyncHandler(async (req, res, next) => {
  const { search = "", page = 1, limit = 10 } = req.query;
  const language = getLanguage(req);

  const query = search
    ? {
        $or: [
          { title: { $regex: search, $options: "i" } },
          { description: { $regex: search, $options: "i" } },
        ],
      }
    : {};

  const skip = (parseInt(page) - 1) * parseInt(limit);
  const eventsData = await Event.find(query)
    .sort({ date: 1 })
    .skip(skip)
    .limit(parseInt(limit))
    .populate("adventures", "name description thumbnail");

  if (!eventsData || eventsData.length === 0) {
    return res.status(200).json({ message: "No events found" });
  }

  const plainEvents = eventsData.map((event) => event.toJSON());

  const events =
    language !== "en"
      ? await translateObjectsFields(
          plainEvents,
          ["title", "description", "location"],
          language
        )
      : plainEvents;

  res.status(200).json({
    success: true,
    data: events,
    total: events.length,
  });
});

export const getEventById = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const language = getLanguage(req);

  const eventData = await Event.findById(id).populate(
    "adventures",
    "name description thumbnail"
  );
  if (!eventData) {
    return res.status(404).json({ message: "Event not found" });
  }

  const plainEvent = eventData.toJSON();

  const event =
    language !== "en"
      ? await translateObjectFields(
          plainEvent,
          ["title", "description", "location"],
          language
        )
      : plainEvent;

  res.status(200).json({
    success: true,
    message: "Event retrieved successfully",
    data: event,
  });
});

export const updateEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const {
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    mapEmbedUrl,
    level,
    latitude,
    longitude,
    adventures,
    isNftEvent,
    nftReward,
    price,
  } = req.body;

  const updateData = {
    title,
    description,
    date,
    startTime,
    endTime,
    location,
    mapEmbedUrl: mapEmbedUrl || "",
    level: level || 1,
  };

  // Parse adventures if provided
  if (adventures !== undefined) {
    try {
      updateData.adventures =
        typeof adventures === "string"
          ? JSON.parse(adventures)
          : adventures || [];
    } catch (error) {
      return res.status(400).json({
        message: "Invalid adventures format",
      });
    }
  }

  // Handle NFT settings
  if (isNftEvent !== undefined) {
    updateData.isNftEvent = isNftEvent === "true" || isNftEvent === true;
  }

  if (nftReward !== undefined) {
    let nftRewardSettings = {};
    if (typeof nftReward === "string") {
      try {
        nftRewardSettings = JSON.parse(nftReward);
      } catch (error) {
        nftRewardSettings = {};
      }
    } else if (typeof nftReward === "object") {
      nftRewardSettings = nftReward;
    }

    updateData.nftReward = {
      enabled: updateData.isNftEvent || false,
      nftName: nftRewardSettings.nftName || "",
      nftDescription: nftRewardSettings.nftDescription || "",
      nftImage: nftRewardSettings.nftImage || "",
    };
  }

  // Update price if provided
  if (price !== undefined) {
    updateData.price = price ? parseFloat(price) : 0;
  }

  // Update coordinates and use city/country from frontend if provided
  if (latitude && longitude) {
    updateData.coordinates = {
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
    };
  }
  if (req.body.city) {
    updateData.city = req.body.city;
  }
  if (req.body.country) {
    updateData.country = req.body.country;
  }

  // Handle media uploads
  if (req.files && req.files.medias) {
    const mediaFiles = Array.isArray(req.files.medias)
      ? req.files.medias
      : [req.files.medias];
    const medias = [];
    let image = null;

    for (const file of mediaFiles) {
      const uploaded = await uploadOnCloudinary(file.path);
      if (uploaded && uploaded.url) {
        medias.push(uploaded.url);
        if (!image) image = uploaded.url;
      }
    }

    if (medias.length > 0) {
      updateData.medias = medias;
      updateData.image = image;
    }
  }

  const event = await Event.findByIdAndUpdate(id, updateData, {
    new: true,
  }).populate("adventures", "name description thumbnail");
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }

  res.status(200).json({
    success: true,
    message: "Event updated successfully",
    data: event,
  });
});

export const deleteEvent = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const event = await Event.findByIdAndDelete(id);
  if (!event) {
    return res.status(404).json({ message: "Event not found" });
  }
  res.status(200).json({ message: "Event deleted successfully" });
});
