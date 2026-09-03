import {axiosClient} from '../AxiosClient/axios';


export const fetchAllItems = async ({ search, category, page, limit, adventureId } = {}) => {
  let url = '/api/items/discover';
  const params = {};
  
  if (search) params.search = search;
  if (category) params.category = category;
  if (page) params.page = page;
  if (limit) params.limit = limit;
  if (adventureId) params.adventureId = adventureId;
  
  const res = await axiosClient.get(url, {
    params,
    withCredentials: true,
  });
  return res;
};

export const createItems = async (data) => {
  const res = await axiosClient.post('/api/items/upload', data, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const deleteItem = async (id) => {
  const res = await axiosClient.delete(`/api/items/${id}`, {
    withCredentials: true,
  });
  return res;
};

export const updateItem = async (id, data) => {
  const res = await axiosClient.put(`/api/items/${id}`, data, {
    withCredentials: true,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res;
};

export const postItemReview = async (data) => {
  const id = data.id;
  const res = await axiosClient.post(`/api/user/reviews/${id}`, data, {
    withCredentials: true,
  });
  if (res.status === 201) {
    return true;
  } else {
    return false;
  }
};

export const fetchTopReviewedItems = async () => {
  const res = await axiosClient.get('/api/item/top-reviewed', {
    withCredentials: true,
  });
  return res.data;
};
