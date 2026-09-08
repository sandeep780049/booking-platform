import { Booking } from "../models/booking.model.js";

/**
 * Compute the number of booked seats per session from all active
 * (pending or confirmed) bookings. Cancelled bookings free up their seats.
 *
 * @param {Array} sessions - Session documents (or ids) to compute for
 * @param {import("mongoose").ClientSession} [dbSession] - optional transaction session
 * @returns {Promise<Map<string, number>>} Map of session id -> booked seats
 */
export async function getSessionAvailability(sessions, dbSession = null) {
  const seatCounts = new Map();

  if (!sessions || sessions.length === 0) {
    return seatCounts;
  }

  const sessionIds = sessions.map((s) => s._id);

  const query = {
    session: { $in: sessionIds },
    status: { $in: ["pending", "confirmed"] },
  };

  const bookings = dbSession
    ? await Booking.find(query)
        .session(dbSession)
        .select("session groupMember")
    : await Booking.find(query).select("session groupMember");

  for (const booking of bookings) {
    const key = booking.session.toString();
    const count = 1 + (booking.groupMember ? booking.groupMember.length : 0);
    seatCounts.set(key, (seatCounts.get(key) || 0) + count);
  }

  return seatCounts;
}

/**
 * Build availability fields for a single session document given seat counts.
 *
 * @param {Object} session - Session document (must have _id, capacity, status)
 * @param {Map<string, number>} seatCounts - Map of session id -> booked seats
 */
export function getSessionAvailabilityFields(session, seatCounts = new Map()) {
  const bookedSeats = seatCounts.get(session._id.toString()) || 0;
  const availableSeats = Math.max(0, session.capacity - bookedSeats);
  return {
    bookedSeats,
    availableSeats,
    isBookable: session.status === "active" && availableSeats > 0,
  };
}