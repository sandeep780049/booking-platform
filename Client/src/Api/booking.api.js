import { axiosClient } from '../AxiosClient/axios';

export const createBooking = async (name, modeOfPayment) => {
  const res = await axiosClient.get(`/api/itemBooking/create?name=${name}&modeOfPayment=${modeOfPayment}`, {
    withCredentials: true,
  });
  return res;
};

// New cart-independent item booking
export const createDirectItemBooking = async (bookingData) => {
  const res = await axiosClient.post('/api/itemBooking/create-direct', bookingData, {
    withCredentials: true,
  });
  return res;
};

export const createHotelBooking = async (bookingData) => {
  const res = await axiosClient.post('/api/hotelBooking/create', bookingData, {
    withCredentials: true,
  });
  return res;
}

export const createSessionBooking = async (bookingData) => {
  const res = await axiosClient.post('/api/sessionBooking/create', bookingData, {
    withCredentials: true,
  });
  return res;
}

// Get all session bookings (admin only)
export const getAllSessionBookings = async (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  const res = await axiosClient.get(`/api/sessionBooking${params ? `?${params}` : ''}`, {
    withCredentials: true,
  });
  return res;
}

// Get current user's session bookings
export const getCurrentUserSessionBookings = async (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  const res = await axiosClient.get(`/api/sessionBooking/my-bookings${params ? `?${params}` : ''}`, {
    withCredentials: true,
  });
  return res;
}

// Get session bookings by user ID (admin only)
export const getSessionBookingsByUserId = async (userId, queryParams = {}) => {
  if (!userId) throw new Error('User ID is required');
  const params = new URLSearchParams(queryParams).toString();
  const res = await axiosClient.get(`/api/sessionBooking/user/${userId}${params ? `?${params}` : ''}`, {
    withCredentials: true,
  });
  return res;
}

// Get session booking by ID
export const getSessionBookingById = async (bookingId) => {
  if (!bookingId) throw new Error('Booking ID is required');
  const res = await axiosClient.get(`/api/sessionBooking/${bookingId}`, {
    withCredentials: true,
  });
  return res;
}

// Update session booking status
export const updateSessionBookingStatus = async (bookingId, status) => {
  if (!bookingId) throw new Error('Booking ID is required');
  if (!status) throw new Error('Status is required');
  const res = await axiosClient.patch(`/api/sessionBooking/${bookingId}/status`, { status }, {
    withCredentials: true,
  });
  return res;
}

// Cancel session booking
export const cancelSessionBooking = async (bookingId) => {
  if (!bookingId) throw new Error('Booking ID is required');
  const res = await axiosClient.patch(`/api/sessionBooking/${bookingId}/cancel`, {}, {
    withCredentials: true,
  });
  return res;
}

// Delete session booking (admin only)
export const deleteSessionBooking = async (bookingId) => {
  if (!bookingId) throw new Error('Booking ID is required');
  const res = await axiosClient.delete(`/api/sessionBooking/${bookingId}`, {
    withCredentials: true,
  });
  return res;
}

// Get session bookings by session ID
export const getSessionBookingsBySessionId = async (sessionId, queryParams = {}) => {
  if (!sessionId) throw new Error('Session ID is required');
  const params = new URLSearchParams(queryParams).toString();
  const res = await axiosClient.get(`/api/sessionBooking/session/${sessionId}${params ? `?${params}` : ''}`, {
    withCredentials: true,
  });
  return res;
}

// Get current user's hotel bookings
export const getCurrentUserHotelBookings = async (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  const res = await axiosClient.get(`/api/hotelBooking/my-bookings${params ? `?${params}` : ''}`, {
    withCredentials: true,
  });
  return res;
}

// Get current user's item bookings (assuming similar endpoint exists)
export const getCurrentUserItemBookings = async (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  const res = await axiosClient.get(`/api/itemBooking/my-bookings${params ? `?${params}` : ''}`, {
    withCredentials: true,
  });
  return res;
}

// Get all hotel bookings (admin only)
export const getAllHotelBookings = async (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  const res = await axiosClient.get(`/api/hotelBooking${params ? `?${params}` : ''}`, {
    withCredentials: true,
  });
  return res;
}

// Delete hotel booking (admin only)
export const deleteHotelBooking = async (bookingId) => {
  if (!bookingId) throw new Error('Booking ID is required');
  const res = await axiosClient.delete(`/api/hotelBooking/${bookingId}`, {
    withCredentials: true,
  });
  return res;
}

// Delete item booking (admin only)
export const deleteItemBooking = async (bookingId) => {
  if (!bookingId) throw new Error('Booking ID is required');
  const res = await axiosClient.delete(`/api/itemBooking/${bookingId}`, {
    withCredentials: true,
  });
  return res;
}

// Get all item bookings (admin only)
export const getAllItemBookings = async (queryParams = {}) => {
  const params = new URLSearchParams(queryParams).toString();
  const res = await axiosClient.get(`/api/itemBooking/all-bookings${params ? `?${params}` : ''}`, {
    withCredentials: true,
  });
  return res;
}