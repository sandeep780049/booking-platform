import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { FriendRequest } from "../models/freindRequest.model.js";

export const searchByEmailId = asyncHandler(async (req, res) => {
  const { email } = req.query;

  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  const user = await User.findOne({ email }).select(
    "name email profilePicture _id"
  );

  if (!user) {
    throw new ApiError(404, "User not found with this email");
  }

  // Check if the user is searching for themselves
  if (user._id.toString() === req.user._id.toString()) {
    throw new ApiError(400, "Cannot search for yourself");
  }

  // Check if they're already friends
  const currentUser = await User.findById(req.user._id);
  const isAlreadyFriend = currentUser.friends.includes(user._id);

  // Check if there's a pending friend request
  const existingRequest = await FriendRequest.findOne({
    $or: [
      { sender: req.user._id, receiver: user._id },
      { sender: user._id, receiver: req.user._id },
    ],
    status: "pending",
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user,
        isAlreadyFriend,
        hasPendingRequest: !!existingRequest,
        requestStatus: existingRequest
          ? {
              isSentByMe:
                existingRequest.sender.toString() === req.user._id.toString(),
              status: existingRequest.status,
            }
          : null,
      },
      "User found successfully"
    )
  );
});
export const sendFriendRequest = asyncHandler(async (req, res) => {
  const { receiverId } = req.body;

  if (!receiverId) {
    throw new ApiError(400, "Receiver ID is required");
  }

  // Check if receiver exists
  const receiver = await User.findById(receiverId);
  if (!receiver) {
    throw new ApiError(404, "User not found");
  }

  // Check if trying to send request to themselves
  if (receiverId === req.user._id.toString()) {
    throw new ApiError(400, "Cannot send friend request to yourself");
  }

  // Check if they're already friends
  const currentUser = await User.findById(req.user._id);
  if (currentUser.friends.includes(receiverId)) {
    throw new ApiError(400, "Already friends with this user");
  }

  // Check if request already exists
  const existingRequest = await FriendRequest.findOne({
    $or: [
      { sender: req.user._id, receiver: receiverId },
      { sender: receiverId, receiver: req.user._id },
    ],
    status: "pending",
  });

  if (existingRequest) {
    throw new ApiError(400, "Friend request already exists");
  }

  // Create friend request
  const friendRequest = await FriendRequest.create({
    sender: req.user._id,
    receiver: receiverId,
    status: "pending",
  });

  const populatedRequest = await FriendRequest.findById(friendRequest._id)
    .populate("sender", "name email profilePicture")
    .populate("receiver", "name email profilePicture");

  return res
    .status(201)
    .json(
      new ApiResponse(201, populatedRequest, "Friend request sent successfully")
    );
});
export const acceptFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  if (!requestId) {
    throw new ApiError(400, "Request ID is required");
  }

  // Find the friend request
  const friendRequest = await FriendRequest.findById(requestId);
  if (!friendRequest) {
    throw new ApiError(404, "Friend request not found");
  }

  // Check if the current user is the receiver
  if (friendRequest.receiver.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only accept requests sent to you");
  }

  // Check if request is still pending
  if (friendRequest.status !== "pending") {
    throw new ApiError(400, "This request has already been processed");
  }

  // Update request status to accepted
  friendRequest.status = "accepted";
  await friendRequest.save();

  // Add each user to the other's friends list
  await User.findByIdAndUpdate(friendRequest.sender, {
    $addToSet: { friends: friendRequest.receiver },
  });

  await User.findByIdAndUpdate(friendRequest.receiver, {
    $addToSet: { friends: friendRequest.sender },
  });

  const populatedRequest = await FriendRequest.findById(requestId)
    .populate("sender", "name email profilePicture")
    .populate("receiver", "name email profilePicture");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        populatedRequest,
        "Friend request accepted successfully"
      )
    );
});
export const rejectFriendRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;

  if (!requestId) {
    throw new ApiError(400, "Request ID is required");
  }

  // Find the friend request
  const friendRequest = await FriendRequest.findById(requestId);
  if (!friendRequest) {
    throw new ApiError(404, "Friend request not found");
  }

  // Check if the current user is the receiver
  if (friendRequest.receiver.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You can only reject requests sent to you");
  }

  // Check if request is still pending
  if (friendRequest.status !== "pending") {
    throw new ApiError(400, "This request has already been processed");
  }

  // Update request status to rejected
  friendRequest.status = "rejected";
  await friendRequest.save();

  const populatedRequest = await FriendRequest.findById(requestId)
    .populate("sender", "name email profilePicture")
    .populate("receiver", "name email profilePicture");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        populatedRequest,
        "Friend request rejected successfully"
      )
    );
});
export const getFriendRequests = asyncHandler(async (req, res) => {
  const { type = "received" } = req.query; // 'received', 'sent', or 'all'

  let query = {};

  if (type === "received") {
    query = { receiver: req.user._id, status: "pending" };
  } else if (type === "sent") {
    query = { sender: req.user._id, status: "pending" };
  } else if (type === "all") {
    query = {
      $or: [{ sender: req.user._id }, { receiver: req.user._id }],
    };
  } else {
    throw new ApiError(400, "Invalid type. Use 'received', 'sent', or 'all'");
  }

  const friendRequests = await FriendRequest.find(query)
    .populate("sender", "name email profilePicture")
    .populate("receiver", "name email profilePicture")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        friendRequests,
        "Friend requests retrieved successfully"
      )
    );
});

export const getFriendsList = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate("friends", "name email profilePicture level")
    .select("friends");

  if (!user) {
    throw new ApiError(404, "User not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, user.friends, "Friends list retrieved successfully")
    );
});

export const removeFriend = asyncHandler(async (req, res) => {
  const { friendId } = req.params;

  if (!friendId) {
    throw new ApiError(400, "Friend ID is required");
  }

  // Check if friend exists
  const friend = await User.findById(friendId);
  if (!friend) {
    throw new ApiError(404, "Friend not found");
  }

  // Check if they are actually friends
  const currentUser = await User.findById(req.user._id);
  if (!currentUser.friends.includes(friendId)) {
    throw new ApiError(400, "You are not friends with this user");
  }

  // Remove each user from the other's friends list
  await User.findByIdAndUpdate(req.user._id, { $pull: { friends: friendId } });

  await User.findByIdAndUpdate(friendId, { $pull: { friends: req.user._id } });

  // Update any accepted friend requests to show they were removed
  await FriendRequest.updateMany(
    {
      $or: [
        { sender: req.user._id, receiver: friendId },
        { sender: friendId, receiver: req.user._id },
      ],
      status: "accepted",
    },
    { status: "removed" }
  );

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Friend removed successfully"));
});
