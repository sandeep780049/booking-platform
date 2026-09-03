import { axiosClient } from '../AxiosClient/axios.js';

// Create a new hotel booking
export const createHotelBooking = async (bookingData) => {
  try {
    const res = await axiosClient.post('/api/hotelBooking/create', bookingData, {
      withCredentials: true,
    });
    return res;
  } catch (err) {
    return err;
  }
};

// Get all bookings for the current user
export const getMyHotelBookings = async () => {
  try {
    const res = await axiosClient.get('/api/hotelBooking/my-bookings', {
      withCredentials: true,
    });
    return res;
  } catch (err) {
    return err;
  }
};

// Get a specific hotel booking by ID
export const getHotelBookingById = async (id) => {
  try {
    const res = await axiosClient.get(`/api/hotelBooking/${id}`, {
      withCredentials: true,
    });
    return res;
  } catch (err) {
    return err;
  }
};

// Cancel a hotel booking
export const cancelHotelBooking = async (id) => {
  try {
    const res = await axiosClient.put(`/api/hotelBooking/${id}/cancel`, {}, {
      withCredentials: true,
    });
    return res;
  } catch (err) {
    return err;
  }
};
