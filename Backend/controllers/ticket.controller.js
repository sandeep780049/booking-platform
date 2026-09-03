import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Ticket } from "../models/ticket.model.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { translateObjectsFields, translateObjectFields } from "../utils/translation.js";
import { getLanguage } from "../middlewares/language.middleware.js";

// Create a new support ticket
const createTicket = asyncHandler(async (req, res) => {
  const { subject, description, category, priority } = req.body;

  if (!subject || !description || !category) {
    throw new ApiError(400, "All required fields must be provided");
  }

  // Handle file uploads if any
  let attachmentURLs = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const uploadedFile = await uploadOnCloudinary(file.path);
      if (uploadedFile) {
        attachmentURLs.push(uploadedFile.url);
      }
    }
  }

  const ticket = await Ticket.create({
    user: req.user._id,
    subject,
    description,
    category,
    priority: priority || "medium",
    attachments: attachmentURLs,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, ticket, "Support ticket created successfully"));
});

// Get all tickets for current user
const getUserTickets = asyncHandler(async (req, res) => {
  const language = getLanguage(req);

  const ticketsData = await Ticket.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .select("-responses.responder");

  // Convert to plain objects
  const plainTickets = ticketsData.map(ticket => ticket.toJSON());

  let tickets;
  // Translate ticket fields if language is not English
  if (language !== 'en') {
    const fieldsToTranslate = ['subject', 'description', 'category'];
    tickets = await translateObjectsFields(plainTickets, fieldsToTranslate, language);
  } else {
    tickets = plainTickets;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, tickets, "User tickets retrieved successfully"));
});

// Get a specific ticket by ID
const getTicketById = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const language = getLanguage(req);

  const ticketData = await Ticket.findById(ticketId)
    .populate("user", "name email")
    .populate("responses.responder", "name");

  if (!ticketData) {
    throw new ApiError(404, "Ticket not found");
  }

  // Check if user owns this ticket or is admin
  if (
    ticketData.user._id.toString() !== req.user._id.toString() &&
    req.user.role !== "admin"
  ) {
    throw new ApiError(403, "You don't have permission to view this ticket");
  }

  // Convert to plain object
  const plainTicket = ticketData.toJSON();

  let ticket;
  // Translate ticket fields if language is not English
  if (language !== 'en') {
    const fieldsToTranslate = ['subject', 'description', 'category'];
    ticket = await translateObjectFields(plainTicket, fieldsToTranslate, language);

    // Also translate response messages
    if (ticket.responses && ticket.responses.length > 0) {
      const translatedResponses = await translateObjectsFields(
        ticket.responses,
        ['message'],
        language
      );
      ticket.responses = translatedResponses;
    }
  } else {
    ticket = plainTicket;
  }

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket retrieved successfully"));
});

// Add a response to a ticket
const addTicketResponse = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { message } = req.body;

  if (!message) {
    throw new ApiError(400, "Response message is required");
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  // Check if user owns this ticket or is admin
  const isOwner = ticket.user.toString() === req.user._id.toString();
  const isAdmin = req.user.role === "admin";

  if (!isOwner && !isAdmin) {
    throw new ApiError(
      403,
      "You don't have permission to respond to this ticket"
    );
  }

  // Add the response
  ticket.responses.push({
    responder: req.user._id,
    message,
    isAdmin: isAdmin,
  });

  // If admin is responding, update status to in-progress if it's open
  if (isAdmin && ticket.status === "open") {
    ticket.status = "in-progress";
  }

  await ticket.save();

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Re sponse added successfully"));
});

// Update ticket status
const updateTicketStatus = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { status } = req.body;

  if (
    !status ||
    !["open", "in-progress", "resolved", "closed"].includes(status)
  ) {
    throw new ApiError(400, "Valid status is required");
  }

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  // Only admins can change status, except users can close their own tickets
  if (
    req.user.role !== "admin" &&
    ticket.user.toString() !== req.user._id.toString()
  ) {
    throw new ApiError(
      403,
      "You don't have permission to update this ticket's status"
    );
  }

  ticket.status = status;
  await ticket.save();

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket status updated successfully"));
});

// Admin: Get all tickets (with filters)
const getAllTickets = asyncHandler(async (req, res) => {
  const { status, priority, category, assignedTo, page = 1, limit = 10, search } = req.query;
  const language = getLanguage(req);

  // Create the base filter
  const filter = {};
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (category) filter.category = category;

  // Filter by assignedTo
  if (assignedTo === 'unassigned') {
    filter.assignedTo = null;
  } else if (assignedTo) {
    filter.assignedTo = assignedTo;
  }

  // Add search functionality
  if (search) {
    // Create search conditions for ID, subject, and user name
    const searchConditions = [
      { subject: { $regex: search, $options: 'i' } }, // Case-insensitive search in subject
      { description: { $regex: search, $options: 'i' } } // Also search in description
    ];

    // If search looks like a valid ObjectId, include it in the search
    if (/^[0-9a-fA-F]{24}$/.test(search)) {
      searchConditions.push({ _id: search });
    }

    // To search by username, we need to find matching users first
    const matchingUsers = await User.find({
      name: { $regex: search, $options: 'i' }
    }).select('_id');

    // If we found users matching the search term, add their IDs to our search criteria
    if (matchingUsers.length > 0) {
      const userIds = matchingUsers.map(user => user._id);
      searchConditions.push({ user: { $in: userIds } });
    }

    // Add the search conditions to the filter
    filter.$or = searchConditions;
  }

  const ticketsData = await Ticket.find(filter)
    .sort({ updatedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate("user", "name email")
    .populate("assignedTo", "name email");

  const totalTickets = await Ticket.countDocuments(filter);

  // Convert to plain objects
  const plainTickets = ticketsData.map(ticket => ticket.toJSON());

  let tickets;
  // Translate ticket fields if language is not English
  if (language !== 'en') {
    const fieldsToTranslate = ['subject', 'description', 'category'];
    tickets = await translateObjectsFields(plainTickets, fieldsToTranslate, language);
  } else {
    tickets = plainTickets;
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tickets,
        totalTickets,
        totalPages: Math.ceil(totalTickets / limit),
        currentPage: Number(page),
      },
      "Tickets retrieved successfully"
    )
  );
});

// Admin: Delete a ticket
const deleteTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  // Only admins can delete tickets
  if (req.user.role !== "admin") {
    throw new ApiError(403, "You don't have permission to delete tickets");
  }

  await Ticket.findByIdAndDelete(ticketId);

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Ticket deleted successfully"));
});

// Admin: Assign ticket to an admin user
const assignTicket = asyncHandler(async (req, res) => {
  const { ticketId } = req.params;
  const { assignedTo } = req.body;

  const ticket = await Ticket.findById(ticketId);

  if (!ticket) {
    throw new ApiError(404, "Ticket not found");
  }

  // Validate the assigned user exists and is an admin
  if (assignedTo) {
    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      throw new ApiError(404, "Assigned user not found");
    }
    if (!['admin', 'superadmin'].includes(assignee.role)) {
      throw new ApiError(400, "Tickets can only be assigned to admin users");
    }
  }

  ticket.assignedTo = assignedTo || null;
  await ticket.save();

  // Populate the assignedTo field before returning
  await ticket.populate("assignedTo", "name email");
  await ticket.populate("user", "name email");

  return res
    .status(200)
    .json(new ApiResponse(200, ticket, "Ticket assigned successfully"));
});

// Get admin users for ticket assignment dropdown
const getAdminUsersForAssignment = asyncHandler(async (req, res) => {
  const adminUsers = await User.find({
    role: { $in: ['admin', 'superadmin'] }
  })
    .select('_id name email role')
    .sort({ name: 1 });

  return res
    .status(200)
    .json(new ApiResponse(200, adminUsers, "Admin users retrieved successfully"));
});

export {
  createTicket,
  getUserTickets,
  getTicketById,
  addTicketResponse,
  updateTicketStatus,
  getAllTickets,
  deleteTicket,
  assignTicket,
  getAdminUsersForAssignment,
};
