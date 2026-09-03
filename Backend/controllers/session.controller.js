import { Session } from "../models/session.model.js";
import { Adventure } from "../models/adventure.model.js";
import { Instructor } from "../models/instructor.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { User } from "../models/user.model.js";

// Create a new session
export const createPreset = asyncHandler(async (req, res, next) => {
  const {
    days,
    startTime,
    capacity,
    location,
    instructorId,
    adventureId,
    notes = "",
    status = "active",
    unit = "perPerson",
    price,
  } = req.body;

  // === Validation ===
  if (!days || !Array.isArray(days) || days.length === 0) {
    throw new ApiError(400, "At least one day is required");
  }
  if (!startTime) {
    throw new ApiError(400, "startTime is required");
  }
  if (!capacity || capacity <= 0) {
    throw new ApiError(400, "Capacity must be a positive number");
  }
  if (!adventureId) {
    throw new ApiError(400, "adventureId is required");
  }
  if (!instructorId) {
    throw new ApiError(400, "instructorId is required");
  }
  if (!location) {
    throw new ApiError(400, "Location is required");
  }

  if (!price) {
    throw new ApiError(400, "Price is required");
  }

  // Check if adventure and instructor exist
  const [adventure, instructor] = await Promise.all([
    Adventure.findById(adventureId),
    User.findById(instructorId),
  ]);

  if (!adventure) throw new ApiError(404, "Adventure not found");
  if (!instructor && instructor.role === "user")
    throw new ApiError(404, "Instructor not found");

  const dayMap = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Web: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  const selectedDayIndices = days.map((day) => dayMap[day]);

  const sessions = [];
  const today = new Date();

  for (let i = 0; i < 30; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + i);
    const currentDayIndex = currentDate.getDay();

    if (selectedDayIndices.includes(currentDayIndex)) {
      const [hour, minute] = startTime.split(":");
      const sessionStart = new Date(currentDate);
      sessionStart.setHours(+hour, +minute, 0, 0);

      const sessionEnd = new Date(sessionStart);
      sessionEnd.setHours(sessionEnd.getHours() + 2);

      sessions.push({
        days: Object.keys(dayMap).find((k) => dayMap[k] === currentDayIndex),
        startTime: sessionStart,
        expiresAt: sessionEnd,
        price: price,
        priceType: unit,
        capacity,
        location,
        instructorId,
        adventureId,
        notes,
        status,
      });
    }
  }

  const created = await Session.insertMany(sessions);
  res.status(201).json({
    message: `${created.length} sessions created successfully`,
    sessions: created,
  });
});

export const createSession = asyncHandler(async (req, res, next) => {
  const {
    days,
    status,
    expiresAt,
    startTime,
    capacity,
    adventureId,
    price,
    instructorId,
    location,
  } = req.body;

  if (
    !days ||
    !expiresAt ||
    !startTime ||
    !capacity ||
    !adventureId ||
    !instructorId ||
    !location ||
    !price
  ) {
    throw new ApiError(400, "All fields are required");
  }

  const [adventure, instructor] = await Promise.all([
    Adventure.findById(adventureId),
    User.findById(instructorId),
  ]);

  if (!adventure || !instructor) {
    throw new ApiError(404, "Adventure or instructor not found");
  }

  if (instructor.role === "user") {
    throw new ApiError(403, "Only instructors can create sessions");
  }

  const session = new Session({
    days: Array.isArray(days) ? days[0] : days[0],
    status,
    expiresAt,
    startTime,
    capacity,
    adventureId,
    instructorId,
    location,
    price,
  });

  await session.save();

  res.status(201).json({
    message: "Session created successfully",
    session,
  });
});

// Update an existing session
export const updateSession = asyncHandler(async (req, res, next) => {
  const {
    days,
    status,
    expiresAt,
    startTime,
    capacity,
    adventureId,
    instructorId,
    location,
  } = req.body;
  const session = await Session.findById(req.params.id);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }
  // Optional: Prevent update if session is completed/cancelled/expired
  if (["completed", "cancelled", "expired"].includes(session.status)) {
    throw new ApiError(
      400,
      `Cannot update a session with status: ${session.status}`,
    );
  }

  // Validate fields if provided
  if (days && (!Array.isArray(days) || days.length === 0)) {
    throw new ApiError(400, "At least one day is required");
  }
  if (capacity !== undefined && capacity <= 0) {
    throw new ApiError(400, "Capacity must be a positive number");
  }
  if (startTime && expiresAt && new Date(startTime) >= new Date(expiresAt)) {
    throw new ApiError(400, "startTime must be before expiresAt");
  }
  // Check referenced adventure and instructor if changed
  if (adventureId && !(await Adventure.findById(adventureId))) {
    throw new ApiError(404, "Adventure not found");
  }
  if (instructorId && !(await Instructor.findById(instructorId))) {
    throw new ApiError(404, "Instructor not found");
  }
  // Prevent duplicate session (same adventure, instructor, and overlapping time)
  if (adventureId || instructorId || startTime || expiresAt) {
    const duplicate = await Session.findOne({
      _id: { $ne: session._id },
      adventureId: adventureId || session.adventureId,
      instructorId: instructorId || session.instructorId,
      $or: [
        {
          startTime: { $lte: expiresAt || session.expiresAt },
          expiresAt: { $gte: startTime || session.startTime },
        },
      ],
    });
    if (duplicate) {
      throw new ApiError(
        409,
        "A session with overlapping time already exists for this adventure and instructor",
      );
    }
  }
  Object.assign(session, req.body);
  await session.save();
  res.json(session);
});

// Delete a session
export const deleteSession = asyncHandler(async (req, res, next) => {
  const session = await Session.findById(req.params.id);
  if (!session) {
    throw new ApiError(404, "Session not found");
  }
  // Prevent deletion if session is completed or has a booking
  if (["completed", "cancelled", "expired"].includes(session.status)) {
    throw new ApiError(
      400,
      `Cannot delete a session with status: ${session.status}`,
    );
  }
  if (session.booking && session.booking.length > 0) {
    throw new ApiError(400, "Cannot delete a session that has a booking");
  }
  await session.deleteOne();
  res.json({ message: "Session deleted" });
});

export const getAllSessions = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    throw new ApiError(400, "Instructor id is required");
  }

  let sessions = await Session.find({ instructorId: id });

  if (!sessions || sessions.length === 0) {
    sessions = [];
  }

  return res.status(200).json(sessions);
});

// Get all sessions from other instructors (excluding current instructor)
export const getAllOtherInstructorsSessions = asyncHandler(
  async (req, res, next) => {
    const { excludeInstructor, startDate, endDate } = req.query;

    let query = {};

    // Exclude specific instructor if provided
    if (excludeInstructor) {
      query.instructorId = { $ne: excludeInstructor };
    }

    // Filter by date range if provided
    if (startDate || endDate) {
      query.startTime = {};
      if (startDate) {
        query.startTime.$gte = new Date(startDate);
      }
      if (endDate) {
        query.startTime.$lte = new Date(endDate);
      }
    }

    const sessions = await Session.find(query)
      .select("startTime expiresAt capacity status instructorId")
      .lean();

    return res.status(200).json({
      success: true,
      count: sessions.length,
      data: sessions,
    });
  },
);

export const getInstructorSessions = asyncHandler(async (req, res, next) => {
  const { location, session_date, adventure } = req.query;

  if (!location || !session_date || !adventure) {
    return res
      .status(400)
      .json({ message: "Location, sessionDate, and adventure are required" });
  }

  // Validate the date
  const sessionDate = new Date(session_date);
  if (isNaN(sessionDate.getTime())) {
    return res.status(400).json({ message: "Invalid session_date format" });
  }

  const nextDay = new Date(sessionDate);
  nextDay.setDate(nextDay.getDate() + 1);

  const sessions = await Session.find({
    adventureId: adventure,
    startTime: {
      $gte: sessionDate,
      $lt: nextDay,
    },
  })
    .populate({
      path: "instructorId",
      select: "name email profilePicture instructor",
      populate: {
        path: "instructor",
        select: "description avgReview portfolioMedias certificate languages commissionPercentage",
      },
    })
    .select("");

  if (!sessions || sessions.length === 0) {
  }

  if (!sessions || sessions.length === 0) {
    return res.status(404).json({ message: "No sessions found" });
  }

  return res.status(200).json(sessions);
});

// Get instructor's sessions with booking details
export const getInstructorSessionsWithBookings = asyncHandler(
  async (req, res) => {
    const {
      page = 1,
      limit = 10,
      status,
      sortBy = "startTime",
      sortOrder = "asc",
    } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build query object
    let query = { instructorId: req.user._id };

    if (status) {
      query.status = status;
    }

    // Sorting
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

    const sessions = await Session.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate({
        path: "adventureId",
        select: "name description category difficulty thumbnail medias price",
      })
      .populate({
        path: "location",
        select: "name address city state country",
      })
      .populate({
        path: "booking",
        populate: {
          path: "user groupMember",
          select: "name email phoneNumber",
        },
      });

    // Add computed status and available seats for each session
    const processedSessions = sessions.map((session) => {
      const now = new Date();
      const startTime = new Date(session.startTime);
      const expiresAt = new Date(session.expiresAt);

      let computedStatus = "upcoming";
      if (now > expiresAt) {
        computedStatus = "expired";
      } else if (now >= startTime) {
        computedStatus = "completed";
      }

      // Calculate available seats
      let bookedSeats = 0;
      if (session.booking && session.booking.length > 0) {
        session.booking.forEach(b => {
          bookedSeats += 1; // Main booker
          if (b.groupMember && b.groupMember.length > 0) {
            bookedSeats += b.groupMember.length;
          }
        });
      }

      const availableSeats = Math.max(0, session.capacity - bookedSeats);

      return {
        ...session.toObject(),
        computedStatus,
        bookedSeats,
        availableSeats,
        isBookable:
          computedStatus === "upcoming" &&
          availableSeats > 0 &&
          session.status === "active",
      };
    });

    const total = await Session.countDocuments(query);

    return res.status(200).json({
      statusCode: 200,
      data: {
        sessions: processedSessions,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      message: "Instructor sessions retrieved successfully",
    });
  },
);
