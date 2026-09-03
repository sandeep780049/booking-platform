import { axiosClient } from '../AxiosClient/axios';

export const getAllItems = async (page, limit, search, category) => {
  try {
    const response = await axiosClient.get('/api/items/', {
      params: {
        search,
        category,
        page,
        limit,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Error fetching items');
  }
};

export const getItemById = async (id) => {
  try {
    const res = await axiosClient.get(`/api/items/${id}`);
    return res;
  } catch (err) {
    throw new Error('Error fetching item');
  }
};
