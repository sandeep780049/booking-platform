import { axiosClient } from '../AxiosClient/axios';

export const postReview = async (data) => {
  // data: { instructorId?, hotelId?, rating, comment }
  const res = await axiosClient.post('/api/reviews', data, { withCredentials: true });
  return res.data;
};

export const fetchReviews = async (params) => {
  // params: { instructorId?, hotelId?, page, limit }
  const res = await axiosClient.get('/api/reviews', { params, withCredentials: true });
  return res.data;
};

export const updateReview = async (id, data) => {
  const res = await axiosClient.put(`/api/reviews/${id}`, data, { withCredentials: true });
  return res.data;
}

export const deleteReview = async (id) => {
  const res = await axiosClient.delete(`/api/reviews/${id}`, { withCredentials: true });
  return res.data;
}
