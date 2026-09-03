import { Message } from "../models/message.model.js";

/**
 * Socket.IO initialization and event handlers
 */
const initSocketIO = (io) => {
  const userSocketMap = new Map();
  io.on("connection", (socket) => {
    // Listen for user joining a room
    socket.on("joinRoom", async ({ userId }) => {
      try {
        userSocketMap.set(userId, socket.id);
        socket.join(userId);
        console.log(`User ${userId} joined room: ${socket.id}`);
      } catch (error) {
        console.error(`Error joining room for user ${userId}:`, error);
      }
    });

    // Listen for user disconnecting
    socket.on("disconnect", () => {
      // Find the user by socket ID
      for (const [userId, socketId] of userSocketMap.entries()) {
        if (socketId === socket.id) {
          userSocketMap.delete(userId);
          console.log(`User ${userId} disconnected`);
          break;
        }
      }
    });

    // Send Message to a specific user
    socket.on("sendMessage", async ({ userId, message }) => {
      try {
        const isOnline = userSocketMap.has(userId);

        if (
          (message.content.length === 0 || message.content === null) &&
          (!message.attachments || message.attachments.length === 0)
        ) {
          return;
        }

        if (message.attachments) {
          if (typeof message.attachments === "string") {
            message.attachments = [message.attachments];
          } else if (Array.isArray(message.attachments)) {
            // Process each item in the array properly
            message.attachments = message.attachments
              .filter((item) => item !== null && item !== undefined)
              .map((item) => {
                if (typeof item === "object" && item !== null) {
                  return JSON.stringify(item); // Convert objects to JSON strings
                }
                return String(item);
              });
          } else if (
            typeof message.attachments === "object" &&
            message.attachments !== null
          ) {
            // For object type attachments, serialize to JSON string
            message.attachments = [JSON.stringify(message.attachments)];
          } else if (message.attachments !== null) {
            // Any other non-null type
            message.attachments = [String(message.attachments)];
          } else {
            message.attachments = [];
          }
        } else {
          message.attachments = [];
        }

        await Message.create({
          from: message.from,
          to: userId,
          content: message.content,
          timestamp: new Date(),
          attachments: message.attachments,
          isRead: false,
        });

        if (isOnline) {
          io.to(userId).emit("receiveMessage", message);
        }
      } catch (e) {
        console.error(
          `Error sending message from ${message.from} to ${userId}:`,
          e
        );
      }
    });

    // Mark message as read
    socket.on("markAsRead", async ({ messageId }) => {
      try {
        const message = await Message.findById(messageId);
        if (message) {
          message.isRead = true;
          await message.save();
        }
      } catch (e) {
        console.error(`Error marking message as read:`, e);
      }
    });
  });
};

export default initSocketIO;