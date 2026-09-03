import { axiosClient } from '../AxiosClient/axios';

/**
 * Search for users by email
 * @param {string} email - Email to search for
 * @returns {Promise} - API response
 */
export const searchUserByEmail = async (email) => {
  try {
    const response = await axiosClient.get(
      `/api/friends/search?email=${email}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get current user's friends list
 * @returns {Promise} - API response with list of friends
 */
export const getFriends = async () => {
  try {
    const response = await axiosClient.get('/api/friends/list');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Get friend requests
 * @param {string} type - Type of requests to fetch: "received", "sent", or "all"
 * @returns {Promise} - API response with friend requests
 */
export const getFriendRequests = async (type = 'received') => {
  try {
    const response = await axiosClient.get(
      `/api/friends/requests?type=${type}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Send a friend request
 * @param {string} receiverId - ID of the user to send request to
 * @returns {Promise} - API response
 */
export const sendFriendRequest = async (receiverId) => {
  try {
    const response = await axiosClient.post('/api/friends/request', {
      receiverId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Accept a friend request
 * @param {string} requestId - ID of the friend request
 * @returns {Promise} - API response
 */
export const acceptFriendRequest = async (requestId) => {
  try {
    const response = await axiosClient.patch(
      `/api/friends/request/${requestId}/accept`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reject a friend request
 * @param {string} requestId - ID of the friend request
 * @returns {Promise} - API response
 */
export const rejectFriendRequest = async (requestId) => {
  try {
    const response = await axiosClient.patch(
      `/api/friends/request/${requestId}/reject`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Remove a friend
 * @param {string} friendId - ID of the friend to remove
 * @returns {Promise} - API response
 */
export const removeFriend = async (friendId) => {
  try {
    const response = await axiosClient.delete(`/api/friends/${friendId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
