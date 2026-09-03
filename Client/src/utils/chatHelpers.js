/**
 * Format a message to ensure consistent fields regardless of source
 * @param {Object} message - The message object from API or socket
 * @returns {Object} Formatted message with consistent fields
 */
export const formatMessage = (message) => {
  return {
    // Preserve all original fields
    ...message,
    // Ensure consistent sender/receiver fields
    sender: message.from || message.sender,
    receiver: message.to || message.receiver,
    // Ensure consistent content field
    content: message.content || message.text,
    // Ensure timestamp field
    timestamp: message.timestamp || new Date(),
    // Ensure attachments field
    attachments: message.attachments || [],
  };
};

/**
 * Check if a message is from the current user
 * @param {Object} message - The message object
 * @param {string} userId - The current user's ID
 * @returns {boolean} Whether the message is from the current user
 */
export const isMessageFromUser = (message, userId) => {
  return message.sender === userId || message.from === userId;
};
