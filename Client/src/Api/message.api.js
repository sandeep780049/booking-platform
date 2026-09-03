import { axiosClient } from '../AxiosClient/axios.js';

const BASE_URL = '/api/messages';

// Get chat history with a specific user
export const getChatHistoryApi = async (userId) => {
  try {
    const response = await axiosClient.get(`${BASE_URL}?with=${userId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOwnerDetails = async (ownerId) => {
  try {
    const response = await axiosClient.get(`/api/users/${ownerId}`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all chats for the current user
export const getAllChats = async () => {
  try {
    const response = await axiosClient.get(`${BASE_URL}/chats`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get all distinct users who sent messages to the current user
export const getSendersApi = async () => {
  try {
    const response = await axiosClient.get(`${BASE_URL}/senders`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Mark a message as read
export const markMessageAsRead = async (messageId) => {
  try {
    const response = await axiosClient.patch(`${BASE_URL}/${messageId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
