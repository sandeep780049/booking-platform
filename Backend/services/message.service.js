import { Message } from "../models/message.model.js";

/**
 * Message Service for handling automated system messages
 */
class MessageService {
    /**
     * Send a booking confirmation message from service provider to user
     * @param {String} fromUserId - ID of the sender (instructor/hotel owner)
     * @param {String} toUserId - ID of the recipient (user who made booking)
     * @param {Object} bookingDetails - Details about the booking
     * @returns {Promise<Object>} Created message
     */
    async sendBookingConfirmationMessage(fromUserId, toUserId, bookingDetails) {
        try {
            if (!fromUserId || !toUserId) {
                console.warn('Cannot send booking message: missing user IDs');
                return null;
            }
            const messageContent = this.formatBookingMessage(bookingDetails, fromUserId);

            const message = await Message.create({
                from: fromUserId,
                to: toUserId,
                content: messageContent,
                timestamp: new Date(),
                attachments: [],
                isRead: false,
            });

            return message;
        } catch (error) {
            console.error('Error sending booking confirmation message:', error);
            return null;
        }
    }

    /**
     * Format booking details into a user-friendly message
     * @param {Object} bookingDetails - Booking information
     * @param {String} instructorId - ID of the instructor/service provider
     * @returns {String} Formatted message
     */
    formatBookingMessage(bookingDetails, instructorId) {
        const { type, adventureName, hotelName, eventTitle, date, time, checkIn, checkOut, location, instructorName } = bookingDetails;

        // Create chat link that can be used in the frontend
        const chatLink = `/chat?chat=${instructorId}`;
        const chatPrompt = `Click here to chat with ${instructorName || 'your instructor'}`;

        switch (type) {
            case 'session':
                return `Hi! Your booking for ${adventureName} on ${date} at ${time} has been confirmed. ${location ? `Location: ${location}. ` : ''}Looking forward to seeing you! Feel free to ask any questions. 💬 ${chatPrompt}`;

            case 'hotel':
                return `Hello! Your reservation at ${hotelName} from ${checkIn} to ${checkOut} is confirmed. We're excited to host you! Let us know if you need anything. 💬 ${chatPrompt}`;

            case 'event':
                return `Great news! Your booking for ${eventTitle} on ${date}${time ? ` at ${time}` : ''} is confirmed. ${location ? `Location: ${location}. ` : ''}Can't wait to see you there! Reach out if you have any questions. 💬 ${chatPrompt}`;

            default:
                return `Your booking has been confirmed! Looking forward to seeing you. Feel free to reach out if you have any questions. 💬 ${chatPrompt}: ${chatLink}`;
        }
    }

    /**
     * Format date for display
     * @param {Date|String} date - Date to format
     * @returns {String} Formatted date string
     */
    formatDate(date) {
        if (!date) return '';
        const d = new Date(date);
        return d.toLocaleDateString('en-US', {
            weekday: 'short',
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }

    /**
     * Format time for display
     * @param {String} time - Time string (HH:MM format)
     * @returns {String} Formatted time string
     */
    formatTime(time) {
        if (!time) return '';
        // If time is a Date, convert to string
        if (time instanceof Date) {
            time = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        } else if (typeof time === 'number') {
            time = new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
        } else if (typeof time !== 'string') {
            return 'N/A';
        }
        // Now safe to split
        const [hours, minutes] = time.split(':');
        const h = parseInt(hours);
        const ampm = h >= 12 ? 'PM' : 'AM';
        const displayHour = h % 12 || 12;
        return `${displayHour}:${minutes} ${ampm}`;
    }
}

export default new MessageService();
