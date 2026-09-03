import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { Message } from "../models/message.model.js";
import mongoose from "mongoose";

/**
 * Get chat history with a specific user
 */
const getChatHistory = asyncHandler(async (req, res) => {
    const { with: otherUserId } = req.query;
    const currentUserId = req.user._id;

    if (!otherUserId) {
        throw new ApiError(400, "Other user ID is required");
    }

    // Find all messages between these two users and populate basic user info
    let messages = await Message.find({
        $or: [
            { from: currentUserId, to: otherUserId },
            { from: otherUserId, to: currentUserId }
        ]
    })
        .sort({ timestamp: 1 })
        .populate("from", "name role")
        .populate("to", "name role");

    // Mark all messages from the other user as read
    await Message.updateMany(
        { from: otherUserId, to: currentUserId, isRead: false },
        { isRead: true }
    );

    // If any sender is a hotel role, attach the hotel name (lookup Hotels by owner)
    const hotelSenders = new Set();
    messages.forEach((m) => {
        if (m.from && m.from.role === "hotel") {
            hotelSenders.add(m.from._id.toString());
        }
    });

    let hotelMap = {};
    if (hotelSenders.size > 0) {
        const { Hotel } = await import("../models/hotel.model.js");
        const owners = Array.from(hotelSenders).map((id) => mongoose.Types.ObjectId.createFromHexString(id));
        const hotels = await Hotel.find({ owner: { $in: owners } }).select("name owner").lean();
        hotels.forEach((h) => {
            if (h.owner) hotelMap[h.owner.toString()] = h.name;
        });
    }

    // attach hotelName to messages where applicable
    const resultMessages = messages.map((m) => {
        const obj = m.toObject ? m.toObject() : JSON.parse(JSON.stringify(m));
        if (obj.from && obj.from.role === "hotel") {
            obj.senderHotelName = hotelMap[obj.from._id.toString()] || null;
        }
        return obj;
    });

    return res.status(200).json(
        new ApiResponse(200, resultMessages, "Chat history fetched successfully")
    );
});

/**
 * Mark a message as read
 */
const markMessageAsRead = asyncHandler(async (req, res) => {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    const message = await Message.findById(messageId);

    if (!message) {
        throw new ApiError(404, "Message not found");
    }

    // Only the recipient can mark a message as read
    if (message.to.toString() !== currentUserId.toString()) {
        throw new ApiError(403, "You are not authorized to mark this message as read");
    }

    message.isRead = true;
    await message.save();

    return res.status(200).json(
        new ApiResponse(200, message, "Message marked as read")
    );
});

/**
 * Get all distinct users who have sent messages to the current user
 */
const getSenders = asyncHandler(async (req, res) => {
    const currentUserId = mongoose.Types.ObjectId.createFromHexString(req.user._id.toString());

    // Aggregate distinct senders and include a hotel lookup so we can return hotel name when the sender is a hotel
    const senders = await Message.aggregate([
        { $match: { to: currentUserId } },
        { $sort: { timestamp: -1 } },
        {
            $group: {
                _id: "$from",
                latestMessage: { $first: "$$ROOT" },
                unreadCount: {
                    $sum: {
                        $cond: [
                            { $and: [ { $eq: ["$to", currentUserId] }, { $eq: ["$isRead", false] } ] },
                            1,
                            0
                        ]
                    }
                }
            }
        },
        {
            $lookup: {
                from: "users",
                localField: "_id",
                foreignField: "_id",
                as: "user"
            }
        },
        { $unwind: "$user" },
        // lookup hotels where user is owner (will be empty array for non-hotel users)
        {
            $lookup: {
                from: "hotels",
                localField: "_id",
                foreignField: "owner",
                as: "hotel"
            }
        },
        { $unwind: { path: "$hotel", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 1,
                latestMessage: 1,
                unreadCount: 1,
                "user.name": 1,
                "user.avatar": 1,
                "user.email": 1,
                "user.role": 1,
                "hotel.name": 1,
                "user.profilePicture": 1
            }
        },
        { $sort: { "latestMessage.timestamp": -1 } }
    ]);

    return res.status(200).json(
        new ApiResponse(200, senders, "Senders fetched successfully")
    );
});

export { getChatHistory, markMessageAsRead, getSenders };