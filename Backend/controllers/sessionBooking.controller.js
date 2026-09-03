import { Booking } from "../models/booking.model.js";
import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Item } from "../models/item.model.js";
import { ItemBooking } from "../models/itemBooking.model.js";
import { HotelBooking } from "../models/hotelBooking.model.js";
import { createRevolutOrder } from "../utils/revolut.js";
import { Hotel } from "../models/hotel.model.js";
import mongoose from "mongoose";
import PayPalService from "../services/paypal.service.js";

// Helper function to calculate days between dates
const calculateDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  const difference = end.getTime() - start.getTime();
  return Math.ceil(difference / (1000 * 60 * 60 * 24));
};

// Helper function to validate session booking input
const validateSessionBookingInput = (sessionBooking) => {
  if (!sessionBooking) {
    throw new ApiError(400, "Session booking details are required");
  }

  const { session, groupMembers = [] } = sessionBooking;

  if (!session) {
    throw new ApiError(400, "Session ID is required");
  }

  if (!mongoose.Types.ObjectId.isValid(session)) {
    throw new ApiError(400, "Invalid session ID format");
  }

  return { session, groupMembers };
};

// Helper function to validate item booking input
const validateItemBookingInput = (items) => {
  if (!items || !Array.isArray(items)) return [];

  for (const item of items) {
    if (!item.item || !item.quantity) {
      throw new ApiError(400, "Item ID and quantity are required for each item");
    }

    if (!mongoose.Types.ObjectId.isValid(item.item)) {
      throw new ApiError(400, `Invalid item ID format: ${item.item}`);
    }

    if (item.quantity <= 0) {
      throw new ApiError(400, "Item quantity must be greater than 0");
    }

    if (!item.purchased && (!item.startDate || !item.endDate)) {
      throw new ApiError(400, "Start date and end date are required for rental items");
    }

    if (!item.purchased && new Date(item.endDate) <= new Date(item.startDate)) {
      throw new ApiError(400, "End date must be after start date for rental items");
    }
  }

  return items;
};

// Helper function to validate hotel booking input
const validateHotelBookingInput = (hotelBooking) => {
  if (!hotelBooking?.hotels?.[0]) return null;

  const hotel = hotelBooking.hotels[0];

  if (!hotel.hotel || !hotel.checkInDate || !hotel.checkOutDate) {
    throw new ApiError(400, "Hotel ID, check-in date, and check-out date are required");
  }

  if (!mongoose.Types.ObjectId.isValid(hotel.hotel)) {
    throw new ApiError(400, "Invalid hotel ID format");
  }

  if (new Date(hotel.checkOutDate) <= new Date(hotel.checkInDate)) {
    throw new ApiError(400, "Check-out date must be after check-in date");
  }

  return hotel;
};

// Helper function to process item bookings
const processItemBookings = async (items, userId, modeOfPayment, session, transactionId = null, dbSession = null) => {
  if (!items || items.length === 0) return { itemBooking: null };

  // Get unique item IDs and fetch them in parallel
  const uniqueItemIds = [...new Set(items.map(item => item.item))];
  const itemsData = dbSession
    ? await Item.find({ _id: { $in: uniqueItemIds } }).session(dbSession)
    : await Item.find({ _id: { $in: uniqueItemIds } });

  if (itemsData.length !== uniqueItemIds.length) {
    const foundIds = itemsData.map(item => item._id.toString());
    const missingIds = uniqueItemIds.filter(id => !foundIds.includes(id));
    if (missingIds.length > 0) {
      throw new ApiError(404, `Items not found: ${missingIds.join(', ')}`);
    }
  }

  // Create a map for quick lookup
  const itemsMap = new Map(itemsData.map(item => [item._id.toString(), item]));

  let itemPrice = 0;
  const processedItems = [];

  for (const item of items) {
    const itemData = itemsMap.get(item.item);

    if (item.purchased) {
      itemPrice += itemData.price * item.quantity;
      processedItems.push({
        item: item.item,
        quantity: item.quantity,
        rentalPeriod: null,
        purchase: true,
      });
    } else {
      const days = calculateDaysBetween(item.startDate, item.endDate);
      itemPrice += itemData.rentalPrice * item.quantity * days;
      processedItems.push({
        item: item.item,
        quantity: item.quantity,
        rentalPeriod: {
          startDate: item.startDate,
          endDate: item.endDate,
          days,
        },
        purchase: false,
      });
    }
  }

  const itemBookingData = {
    user: userId,
    items: processedItems,
    totalPrice: itemPrice,
    modeOfPayment,
    session,
  };

  // Add transactionId if provided
  if (transactionId) {
    itemBookingData.paymentOrderId = transactionId;
  }

  const itemBooking = dbSession
    ? await ItemBooking.create([itemBookingData], { session: dbSession }).then(result => result[0])
    : await ItemBooking.create(itemBookingData);

  return { itemBooking };
};

// Helper function to process hotel booking
const processHotelBooking = async (hotelData, userId, modeOfPayment, session, transactionId = null, dbSession = null) => {
  if (!hotelData) return { hotelBooking: null };

  const hotel = dbSession
    ? await Hotel.findById(hotelData.hotel).session(dbSession)
    : await Hotel.findById(hotelData.hotel);
  if (!hotel) {
    throw new ApiError(404, `Hotel with ID ${hotelData.hotel} not found`);
  }

  const nights = calculateDaysBetween(hotelData.checkInDate, hotelData.checkOutDate);
  const hotelPrice = hotel.price * nights;

  const hotelBookingData = {
    user: userId,
    hotel: hotelData.hotel,
    numberOfRooms: hotelData.numberOfRooms || 1,
    guests: hotelData.guests || 1,
    checkInDate: hotelData.checkInDate,
    checkOutDate: hotelData.checkOutDate,
    amount: hotelPrice,
    modeOfPayment,
    session,
  };

  // Add transactionId if provided
  if (transactionId) {
    hotelBookingData.transactionId = transactionId;
  }

  const hotelBooking = dbSession
    ? await HotelBooking.create([hotelBookingData], { session: dbSession }).then(result => result[0])
    : await HotelBooking.create(hotelBookingData);

  return { hotelBooking };
};

// Create a new session booking
export const createSessionBooking = asyncHandler(async (req, res) => {
  const { sessionBooking, itemBooking = {}, hotelBooking, modeOfPayment } = req.body;


  // Validate inputs
  const { session, groupMembers } = validateSessionBookingInput(sessionBooking);
  const validatedItems = validateItemBookingInput(itemBooking.items);
  const validatedHotel = validateHotelBookingInput(hotelBooking);

  const userId = req.user._id;

  // Start transaction for data consistency
  const session_db = await mongoose.startSession();
  await session_db.startTransaction();

  try {
    // Fetch session and user data in parallel
    const [sessionData, user] = await Promise.all([
      Session.findById(session).session(session_db),
      User.findById(userId).session(session_db)
    ]);

    if (!sessionData) {
      throw new ApiError(404, "Session not found");
    }

    if (!user) {
      throw new ApiError(404, "User not found");
    }

    // Check session capacity
    const totalParticipants = groupMembers.length + 1;

    const remainingCapacity = sessionData.capacity - totalParticipants;

    if (remainingCapacity < 0) {
      throw new ApiError(400, `Insufficient session capacity. Available slots: ${remainingCapacity}, Requested: ${totalParticipants}`);
    }

    // Calculate session price
    let totalPrice = sessionData.price * totalParticipants;

    // Calculate item prices if any
    let itemPrice = 0;
    if (validatedItems && validatedItems.length > 0) {
      // Get unique item IDs and fetch them in parallel for price calculation
      const uniqueItemIds = [...new Set(validatedItems.map(item => item.item))];
      const itemsData = await Item.find({ _id: { $in: uniqueItemIds } }).session(session_db);

      if (itemsData.length !== uniqueItemIds.length) {
        const foundIds = itemsData.map(item => item._id.toString());
        const missingIds = uniqueItemIds.filter(id => !foundIds.includes(id));
        if (missingIds.length > 0) {
          throw new ApiError(404, `Items not found: ${missingIds.join(', ')}`);
        }
      }

      // Create a map for quick lookup
      const itemsMap = new Map(itemsData.map(item => [item._id.toString(), item]));

      for (const item of validatedItems) {
        const itemData = itemsMap.get(item.item);

        if (item.purchased) {
          itemPrice += itemData.price * item.quantity;
        } else {
          const days = calculateDaysBetween(item.startDate, item.endDate);
          itemPrice += itemData.rentalPrice * item.quantity * days;
        }
      }
    }

    // Calculate hotel price if any
    let hotelPrice = 0;
    if (validatedHotel) {
      const hotel = await Hotel.findById(validatedHotel.hotel).session(session_db);
      if (!hotel) {
        throw new ApiError(404, `Hotel with ID ${validatedHotel.hotel} not found`);
      }
      const nights = calculateDaysBetween(validatedHotel.checkInDate, validatedHotel.checkOutDate);
      hotelPrice = (hotel.pricePerNight || hotel.price || 0) * nights;
    }

    // Calculate total price including all components
    totalPrice += itemPrice + hotelPrice;


    let paymentData;
    if (modeOfPayment === "revolut") {
      // Create payment order with complete total price
      paymentData = await createRevolutOrder(totalPrice, "GBP", "Session Booking Payment");
    } else {
      const payPalService = new PayPalService();
      paymentData = await payPalService.createOrder(totalPrice, 'GBP');
    }

    // Create main booking with transaction ID
    const booking = await Booking.create([{
      user: userId,
      session: session,
      groupMember: groupMembers,
      totalPrice: totalPrice,
      modeOfPayment,
      status: "pending",
      transactionId: paymentData.id,
    }], { session: session_db });

    // Update session with booking reference (add to array)
    await Session.findByIdAndUpdate(
      session,
      {
        $push: { booking: booking[0]._id }
      },
      { session: session_db }
    );

    // Process item bookings if any (prices already calculated)
    const { itemBooking } = await processItemBookings(
      validatedItems,
      userId,
      modeOfPayment,
      session,
      paymentData.id,
      session_db
    );

    // Process hotel booking if any (prices already calculated)
    const { hotelBooking } = await processHotelBooking(
      validatedHotel,
      userId,
      modeOfPayment,
      session,
      paymentData.id,
      session_db
    );

    // Commit transaction
    await session_db.commitTransaction();

    return res.status(201).json(
      new ApiResponse(
        201,
        {
          booking: booking[0],
          itemBooking,
          hotelBooking,
          totalPrice,
          paymentUrl: (modeOfPayment === "revolut") ? paymentData.checkout_url : paymentData.links[1].href,
        },
        "Session booking created successfully"
      )
    );

  } catch (error) {
    throw error;
    // Rollback transaction on error
    await session_db.abortTransaction();
  } finally {
    // End session
    await session_db.endSession();
  }
});

// Get all session bookings with optional filtering
export const getAllSessionBookings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    modeOfPayment,
    instructor,
    search,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query object
  let query = {};

  if (status) {
    query.status = status;
  }

  if (modeOfPayment) {
    query.modeOfPayment = modeOfPayment;
  }

  // Filter by instructor - need to find sessions with this instructor first
  if (instructor) {
    const instructorSessions = await Session.find({ instructorId: instructor }).select("_id");
    const sessionIds = instructorSessions.map(session => session._id);
    query.session = { $in: sessionIds };
  }

  // Search functionality - search by user name/email
  if (search) {
    const users = await User.find({
      $or: [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ],
    }).select("_id");

    const userIds = users.map((user) => user._id);
    query.user = { $in: userIds };
  }

  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const bookings = await Booking.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("user", "name email phoneNumber")
    .populate({
      path: "session",
      populate: [
        {
          path: "adventureId",
          select: "name description category difficulty",
        },
        { path: "instructorId", select: "name email phoneNumber" },
        { path: "location", select: "name address city state country" },
      ],
    });

  const total = await Booking.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "Session bookings retrieved successfully"
    )
  );
});

// Get session bookings by user ID
export const getSessionBookingsByUserId = asyncHandler(async (req, res) => {
  const { userId } = req.params;
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Validate user ID
  if (!userId) {
    throw new ApiError(400, "User ID is required");
  }

  // Check if user exists
  const userExists = await User.findById(userId);
  if (!userExists) {
    throw new ApiError(404, "User not found");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query object
  let query = { user: userId };

  if (status) {
    query.status = status;
  }

  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const bookings = await Booking.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("user", "name email phoneNumber")
    .populate({
      path: "session",
      populate: [
        {
          path: "adventureId",
          select: "name description category difficulty",
        },
        { path: "instructorId", select: "name email phoneNumber" },
        { path: "location", select: "name address city state country" },
      ],
    });

  const total = await Booking.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "User session bookings retrieved successfully"
    )
  );
});

// Get current user's session bookings
export const getCurrentUserSessionBookings = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query object
  let query = { user: req.user._id, groupMember: { $ne: req.user._id } };

  // if (status) {
  //   query.status = status;
  // }

  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const bookings = await Booking.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("user", "name email phoneNumber")
    .populate({
      path: "session",
      populate: [
        {
          path: "adventureId",
          select: "name description category thumbnail medias",
        },
        { path: "instructorId", select: "name email phoneNumber" },
        { path: "location", select: "name address city state country" },
      ],
    });

  const total = await Booking.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "Your session bookings retrieved successfully"
    )
  );
});

// Get a specific session booking by ID
export const getSessionBookingById = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    throw new ApiError(400, "Booking ID is required");
  }

  const booking = await Booking.findById(bookingId)
    .populate("user", "name email phoneNumber")
    .populate({
      path: "session",
      populate: [
        {
          path: "adventureId",
          select: "name description category difficulty",
        },
        { path: "instructorId", select: "name email phoneNumber" },
        { path: "location", select: "name address city state country" },
      ],
    });

  if (!booking) {
    throw new ApiError(404, "Session booking not found");
  }

  // Check if user is authorized to view this booking (user themselves or admin)
  if (
    req.user.role !== "admin" &&
    booking.user._id.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized to access this booking");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, booking, "Session booking retrieved successfully")
    );
});

// Update session booking status
export const updateSessionBookingStatus = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;
  const { status } = req.body;

  if (!bookingId) {
    throw new ApiError(400, "Booking ID is required");
  }

  if (!status) {
    throw new ApiError(400, "Status is required");
  }

  const validStatuses = ["pending", "confirmed", "cancelled"];
  if (!validStatuses.includes(status)) {
    throw new ApiError(
      400,
      "Invalid status. Must be one of: " + validStatuses.join(", ")
    );
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Session booking not found");
  }

  // Check if user is authorized to update this booking
  if (
    req.user.role !== "admin" &&
    booking.user.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized to update this booking");
  }

  // If cancelling, remove booking reference from session array
  if (status === "cancelled" && booking.status !== "cancelled") {
    await Session.findByIdAndUpdate(booking.session, {
      $pull: { booking: bookingId },
    });
  }

  // If confirming a previously cancelled booking, add booking reference back to session
  if (status === "confirmed" && booking.status === "cancelled") {
    await Session.findByIdAndUpdate(booking.session, {
      $push: { booking: bookingId }
    });
  }

  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    { status },
    { new: true }
  )
    .populate("user", "name email phoneNumber")
    .populate({
      path: "session",
      populate: [
        {
          path: "adventureId",
          select: "name description category difficulty",
        },
        { path: "instructorId", select: "name email phoneNumber" },
        { path: "location", select: "name address city state country" },
      ],
    });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedBooking,
        "Session booking status updated successfully"
      )
    );
});

// Cancel session booking (user can cancel their own booking)
export const cancelSessionBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    throw new ApiError(400, "Booking ID is required");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Session booking not found");
  }

  // Check if user is authorized to cancel this booking
  if (
    req.user.role !== "admin" &&
    booking.user.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(403, "Not authorized to cancel this booking");
  }

  // Check if booking can be cancelled
  if (booking.status === "cancelled") {
    throw new ApiError(400, "Booking is already cancelled");
  }

  // Check if session has already started (optional business rule)
  const session = await Session.findById(booking.session);
  if (new Date() >= new Date(session.startTime)) {
    throw new ApiError(
      400,
      "Cannot cancel a booking for a session that has already started"
    );
  }

  // Update booking status to cancelled
  const updatedBooking = await Booking.findByIdAndUpdate(
    bookingId,
    { status: "cancelled" },
    { new: true }
  )
    .populate("user", "name email phoneNumber")
    .populate({
      path: "session",
      populate: [
        {
          path: "adventureId",
          select: "name description category difficulty",
        },
        { path: "instructorId", select: "name email phoneNumber" },
        { path: "location", select: "name address city state country" },
      ],
    });

  // Remove booking reference from session array
  await Session.findByIdAndUpdate(booking.session, {
    $pull: { booking: bookingId }
  });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedBooking,
        "Session booking cancelled successfully"
      )
    );
});

// Delete session booking (admin only)
export const deleteSessionBooking = asyncHandler(async (req, res) => {
  const { bookingId } = req.params;

  if (!bookingId) {
    throw new ApiError(400, "Booking ID is required");
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) {
    throw new ApiError(404, "Session booking not found");
  }

  // Remove booking reference from session array
  await Session.findByIdAndUpdate(booking.session, {
    $pull: { booking: bookingId }
  });

  // Delete the booking
  await Booking.findByIdAndDelete(bookingId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Session booking deleted successfully"));
});

// Get session bookings by session ID
export const getSessionBookingsBySessionId = asyncHandler(async (req, res) => {
  const { sessionId } = req.params;
  const {
    page = 1,
    limit = 10,
    status,
    sortBy = "createdAt",
    sortOrder = "desc",
  } = req.query;

  // Validate session ID
  if (!sessionId) {
    throw new ApiError(400, "Session ID is required");
  }

  // Check if session exists
  const sessionExists = await Session.findById(sessionId);
  if (!sessionExists) {
    throw new ApiError(404, "Session not found");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Build query object
  let query = { session: sessionId };

  if (status) {
    query.status = status;
  }

  // Sorting
  const sortOptions = {};
  sortOptions[sortBy] = sortOrder === "asc" ? 1 : -1;

  const bookings = await Booking.find(query)
    .sort(sortOptions)
    .skip(skip)
    .limit(parseInt(limit))
    .populate("user", "name email phoneNumber")
    .populate("groupMember", "name email phoneNumber")
    .populate({
      path: "session",
      populate: [
        {
          path: "adventureId",
          select: "name description category difficulty",
        },
        { path: "instructorId", select: "name email phoneNumber" },
        { path: "location", select: "name address city state country" },
      ],
    });

  const total = await Booking.countDocuments(query);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        bookings,
        total,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      "Session bookings retrieved successfully"
    )
  );
});
