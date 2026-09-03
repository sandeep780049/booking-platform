import { axiosClient } from '../AxiosClient/axios.js';

export const verify = async (data) => {
  try {
    const res = await axiosClient.post('/api/hotel/verify', data, {
      withCredentials: true,
    });
    return res;
  } catch (err) {
    return err;
  }
};
export const registerHotel = async (data) => {
  try {
    const res = await axiosClient.post('/api/hotel/', data, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  } catch (err) {
    return err;
  }
};

export const getHotelByOwnerId = async (id) => {
  try {
    const res = await axiosClient.get(`/api/hotel/${id}`, {
      withCredentials: true,
    });
    return res;
  } catch (err) {
    return err;
  }
};

export const getHotel = async ({
  search = '',
  page = 1,
  limit = 10,
  verified = 'all',
  location = null,
  category = null,
  minPrice = null,
  maxPrice = null,
  minRating = null,
  sortBy = 'createdAt',
  sortOrder = 'desc',
} = {}) => {
  try {
    const params = { search, page, limit, sortBy, sortOrder };
    if (verified && verified !== 'all') {
      params.verified = verified;
    }
    if (location !== null && location !== '') {
      params.location = location;
    }
    if (category !== null && category !== '') {
      params.category = category;
    }
    if (minPrice !== null) {
      params.minPrice = minPrice;
    }
    if (maxPrice !== null) {
      params.maxPrice = maxPrice;
    }
    if (minRating !== null) {
      params.minRating = minRating;
    }
    const res = await axiosClient.get('/api/hotel', {
      params,
      withCredentials: true,
    });
    return res;
  } catch (err) {
    return err;
  }
};

export const approve = async (id) => {
  try {
    const res = await axiosClient.put(`/api/hotel/approve/${id}`, {
      withCredentials: true,
    });
    return res;
  } catch (err) {
    return err;
  }
};

export const reject = async (id) => {
  try {
    const res = await axiosClient.put(`/api/hotel/reject/${id}`, {
      withCredentials: true,
    });
    return res;
  } catch (err) {
    return err;
  }
};

export const updateHotelRating = async (id, rating) => {
  try {
    const res = await axiosClient.put(
      `/api/hotel/rating/${id}`,
      { rating },
      { withCredentials: true }
    );
    return res;
  } catch (err) {
    return err;
  }
};

export const updateHotelPrice = async (id, priceData) => {
  try {
    const res = await axiosClient.put(`/api/hotel/price/${id}`, priceData, {
      withCredentials: true,
    });
    return res;
  } catch (err) {
    return err;
  }
};

export const updateHotel = async (id, data) => {
  try {
    const res = await axiosClient.put(`/api/hotel/update/${id}`, data, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  } catch (err) {
    return err;
  }
};

export const getHotelBookings = async (hotelId, queryParams = {}) => {
  try {
    const params = new URLSearchParams(queryParams).toString();
    const res = await axiosClient.get(
      `/api/hotelBooking/hotel/${hotelId}${params ? `?${params}` : ''}`,
      { withCredentials: true }
    );
    return res;
  } catch (err) {
    return err;
  }
};
