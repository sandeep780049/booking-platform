import { Booking } from "../models/booking.model.js";
import { Cart } from "../models/cart.model.js";
import { ApiError } from "../utils/ApiError.js";
import { updateUserAchievement } from "../utils/updateUserAchievement.js";
import { UserAdventureExperience } from "../models/userAdventureExperience.model.js";
import emailService from "./email.service.js";
import messageService from "./message.service.js";

export class PaymentService {
  itemBooking = async (order_id, event, booking) => {
    // Check if this is an order completion event
    if (event === "ORDER_COMPLETED" || event === "ORDER_AUTHORISED") {
      if (!booking) {
        return { status: 200, message: "Webhook received" };
      }

      if (event === "ORDER_COMPLETED") {
        booking.paymentStatus = "completed";
        booking.status = "confirmed";
        booking.paymentCompletedAt = new Date();

        await Cart.findOneAndUpdate(
          { user: booking.user._id },
          { $set: { items: [] } }
        );
      } else if (event === "ORDER_AUTHORISED") {
        booking.paymentStatus = "completed";
      }

      await booking.save();

      // Send email confirmation
      try {
        const populatedBooking = await booking.populate([
          { path: 'user', select: 'name email phoneNumber' },
          { path: 'items.item', populate: { path: 'owner', select: 'name email' } }
        ]);
        // Check if user email exists before sending
        if (populatedBooking.user && populatedBooking.user.email) {
          await emailService.sendItemBookingConfirmation(populatedBooking);
        } else {
          console.warn('Item booking confirmation email not sent: user email not found');
        }
      } catch (emailError) {
        console.error('Failed to send item booking confirmation email:', emailError);
      }

      return {
        status: 200,
        message: "Payment completed successfully",
        booking: booking,
      };
    } else {
      throw new ApiError(400, `Unsupported event type: ${event}`);
    }
  };

  hotelBooking = async (order_id, event, booking) => {
    // Check if this is an order completion event
    if (event === "ORDER_COMPLETED" || event === "ORDER_AUTHORISED") {
      if (!booking) {
        return { status: 200, message: "Webhook received" };
      }

      if (event === "ORDER_COMPLETED") {
        booking.paymentStatus = "completed";
        booking.status = "confirmed";
      } else if (event === "ORDER_AUTHORISED") {
        booking.paymentStatus = "completed";
      }

      await booking.save();

      // Send email confirmation
      try {
        const populatedBooking = await booking.populate([
          { path: 'user', select: 'name email phoneNumber' },
          { path: 'hotel', populate: { path: 'owner', select: 'name email' } }
        ]);
        // Check if user email exists before sending
        if (populatedBooking.user && populatedBooking.user.email) {
          await emailService.sendHotelBookingConfirmation(populatedBooking);
        } else {
          console.warn('Hotel booking confirmation email not sent: user email not found');
        }

        // Send chat message from hotel owner to user
        if (populatedBooking?.hotel?.owner?._id && populatedBooking?.user?._id) {
          const bookingDetails = {
            type: 'hotel',
            hotelName: populatedBooking.hotel?.name || 'Hotel',
            checkIn: messageService.formatDate(populatedBooking.checkInDate),
            checkOut: messageService.formatDate(populatedBooking.checkOutDate),
            instructorName: populatedBooking.hotel.owner?.name || 'the hotel'
          };
          await messageService.sendBookingConfirmationMessage(
            populatedBooking.hotel.owner._id,
            populatedBooking.user._id,
            bookingDetails
          );
        }
      } catch (emailError) {
        console.error('Failed to send hotel booking confirmation email:', emailError);
      }

      return {
        status: 200,
        message: "Payment completed successfully",
        booking: booking,
      };
    } else {
      throw new ApiError(400, `Unsupported event type: ${event}`);
    }
  };

  eventBooking = async (order_id, event, booking) => {
    // Check if this is an order completion event
    if (event === "ORDER_COMPLETED" || event === "ORDER_AUTHORISED") {
      if (!booking) {
        return { status: 200, message: "Webhook received" };
      }

      if (event === "ORDER_COMPLETED") {
        booking.paymentStatus = "completed";
        booking.status = "confirmed";
        booking.paymentCompletedAt = new Date();
      } else if (event === "ORDER_AUTHORISED") {
        booking.paymentStatus = "completed";
        booking.status = "confirmed";
      }

      await booking.save();

      // Send email confirmation
      try {
        const populatedBooking = await booking.populate([
          { path: 'user', select: 'name email phoneNumber' },
          { path: 'event', select: 'title description date startTime endTime location city country' },
          { path: 'adventureInstructors.instructor', select: 'name email' }
        ]);
        // Check if user email exists before sending
        if (populatedBooking.user && populatedBooking.user.email) {
          await emailService.sendEventBookingConfirmation(populatedBooking);
        } else {
          console.warn('Event booking confirmation email not sent: user email not found');
        }

        // Send chat messages from each instructor to user
        if (populatedBooking?.adventureInstructors && populatedBooking?.user?._id) {
          // Send message from each instructor
          for (const adventureInstructor of populatedBooking.adventureInstructors) {
            if (adventureInstructor?.instructor?._id) {
              const bookingDetails = {
                type: 'event',
                eventTitle: populatedBooking.event?.title || 'Event',
                date: messageService.formatDate(populatedBooking.event?.date),
                time: messageService.formatTime(populatedBooking.event?.startTime),
                location: populatedBooking.event?.location || '',
                instructorName: adventureInstructor.instructor?.name || 'your instructor'
              };
              await messageService.sendBookingConfirmationMessage(
                adventureInstructor.instructor._id,
                populatedBooking.user._id,
                bookingDetails
              );
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send event booking confirmation email:', emailError);
      }

      return {
        status: 200,
        message: "Event booking payment completed successfully",
        booking: booking,
      };
    } else if (event === "ORDER_FAILED") {
      if (booking) {
        booking.paymentStatus = "failed";
        booking.status = "failed";
        await booking.save();
      }

      return {
        status: 200,
        message: "Event booking payment failed",
        booking: booking,
      };
    } else {
      throw new ApiError(400, `Unsupported event type: ${event}`);
    }
  };

  sessionBooking = async (order_id, event, booking) => {
    // Check if this is an order completion event
    if (event === "ORDER_COMPLETED" || event === "ORDER_AUTHORISED") {
      if (!booking) {
        return { status: 200, message: "Webhook received" };
      }

      // For session bookings, we only update the status since there's no paymentStatus field
      if (event === "ORDER_COMPLETED" || event === "ORDER_AUTHORISED") {
        const populatedBooking = await Booking.findById(booking._id).populate({
          path: "session",
          populate: {
            path: "adventureId",
            select: "exp"
          },
          select: "instructorId adventureId",
        });

        // Add experience for the adventure
        if (populatedBooking?.session?.adventureId) {
          const expAmount = populatedBooking.session.adventureId.exp || 50; // Default 50 if no exp defined
          await UserAdventureExperience.addExperience(
            booking.user._id,
            populatedBooking.session.adventureId._id,
            expAmount
          );
        }

        // Update achievements after adding experience
        await updateUserAchievement(booking.user._id);

        booking.status = "confirmed";
      }

      await booking.save();

      // Send email confirmation
      try {
        const populatedBooking = await Booking.findById(booking._id).populate([
          { path: 'user', select: 'name email phoneNumber' },
          {
            path: 'session', populate: [
              { path: 'adventureId', select: 'name' },
              { path: 'instructorId', select: 'name email' },
              { path: 'location', select: 'name' }
            ]
          },
          { path: 'groupMember', select: 'name email' }
        ]);

        // Check if user email exists before sending
        if (populatedBooking && populatedBooking.user && populatedBooking.user.email) {
          await emailService.sendSessionBookingConfirmation(populatedBooking);
        } else {
          console.warn('Session booking confirmation email not sent: user email not found');
        }

        // Send chat message from instructor to user
        if (populatedBooking?.session?.instructorId?._id && populatedBooking?.user?._id) {
          const bookingDetails = {
            type: 'session',
            adventureName: populatedBooking.session.adventureId?.name || 'Adventure Session',
            date: messageService.formatDate(populatedBooking.session.date),
            time: messageService.formatTime(populatedBooking.session.startTime),
            location: populatedBooking.session.location?.name || '',
            instructorName: populatedBooking.session.instructorId?.name || 'your instructor'
          };
          await messageService.sendBookingConfirmationMessage(
            populatedBooking.session.instructorId._id,
            populatedBooking.user._id,
            bookingDetails
          );
        }
      } catch (emailError) {
        console.error('Failed to send session booking confirmation email:', emailError);
      }

      return {
        status: 200,
        message: "Payment completed successfully",
        booking: booking,
      };
    } else {
      throw new ApiError(400, `Unsupported event type: ${event}`);
    }
  };

  // Handle PayPal webhook for event bookings
  eventBookingPayPal = async (orderId, paypalStatus, booking) => {
    // PayPal status values: APPROVED, VOIDED, COMPLETED, PAYER_ACTION_REQUIRED
    if (paypalStatus === "APPROVED" || paypalStatus === "COMPLETED") {
      if (!booking) {
        return { status: 200, message: "Webhook received" };
      }

      booking.paymentStatus = "completed";
      booking.status = "confirmed";
      booking.paymentCompletedAt = new Date();
      await booking.save();

      // Send email confirmation for PayPal payments
      try {
        const populatedBooking = await booking.populate([
          { path: 'user', select: 'name email phoneNumber' },
          { path: 'event', select: 'title description date startTime endTime location city country' },
          { path: 'adventureInstructors.instructor', select: 'name email' }
        ]);
        // Check if user email exists before sending
        if (populatedBooking.user && populatedBooking.user.email) {
          await emailService.sendEventBookingConfirmation(populatedBooking);
        } else {
          console.warn('Event booking confirmation email not sent: user email not found');
        }

        // Send chat messages from each instructor to user (PayPal)
        if (populatedBooking?.adventureInstructors && populatedBooking?.user?._id) {
          // Send message from each instructor
          for (const adventureInstructor of populatedBooking.adventureInstructors) {
            if (adventureInstructor?.instructor?._id) {
              const bookingDetails = {
                type: 'event',
                eventTitle: populatedBooking.event?.title || 'Event',
                date: messageService.formatDate(populatedBooking.event?.date),
                time: messageService.formatTime(populatedBooking.event?.startTime),
                location: populatedBooking.event?.location || '',
                instructorName: adventureInstructor.instructor?.name || 'your instructor'
              };
              await messageService.sendBookingConfirmationMessage(
                adventureInstructor.instructor._id,
                populatedBooking.user._id,
                bookingDetails
              );
            }
          }
        }
      } catch (emailError) {
        console.error('Failed to send event booking confirmation email:', emailError);
      }

      return {
        status: 200,
        message: "PayPal payment completed successfully",
        booking: booking,
      };
    } else if (paypalStatus === "VOIDED") {
      if (booking) {
        booking.paymentStatus = "failed";
        booking.status = "failed";
        await booking.save();
      }

      return {
        status: 200,
        message: "PayPal payment failed",
        booking: booking,
      };
    }

    return { status: 200, message: "Webhook received" };
  };
}
