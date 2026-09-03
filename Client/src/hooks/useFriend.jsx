import { useState, useCallback } from 'react';
import {
  searchUserByEmail,
  getFriends,
  getFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend
} from '../Api/friend.api';

/**
 * Hook for managing friend-related operations
 * @returns {Object} Friend-related states and methods
 */
export const useFriend = () => {
  const [friends, setFriends] = useState([]);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [searchResult, setSearchResult] = useState(null);
  const [loading, setLoading] = useState({
    friends: false,
    requests: false,
    search: false,
    action: false,
  });
  const [error, setError] = useState({
    friends: null,
    requests: null,
    search: null,
    action: null,
  });

  // Fetch user's friends
  const fetchFriends = useCallback(async () => {
    setLoading(prev => ({ ...prev, friends: true }));
    setError(prev => ({ ...prev, friends: null }));

    try {
      const response = await getFriends();
      setFriends(response.data || []);
    } catch (err) {
      setError(prev => ({
        ...prev,
        friends: err.response?.data?.message || 'Failed to fetch friends'
      }));
    } finally {
      setLoading(prev => ({ ...prev, friends: false }));
    }
  }, []);

  // Fetch friend requests
  const fetchFriendRequests = useCallback(async () => {
    setLoading(prev => ({ ...prev, requests: true }));
    setError(prev => ({ ...prev, requests: null }));

    try {
      const receivedResponse = await getFriendRequests('received');
      setReceivedRequests(receivedResponse.data || []);

      const sentResponse = await getFriendRequests('sent');
      setSentRequests(sentResponse.data || []);
    } catch (err) {
      setError(prev => ({
        ...prev,
        requests: err.response?.data?.message || 'Failed to fetch friend requests'
      }));
    } finally {
      setLoading(prev => ({ ...prev, requests: false }));
    }
  }, []);

  // Search for a user by email
  const searchUser = useCallback(async (email) => {
    setLoading(prev => ({ ...prev, search: true }));
    setError(prev => ({ ...prev, search: null }));
    setSearchResult(null);

    try {
      const response = await searchUserByEmail(email);
      setSearchResult(response.data || null);
      return response.data;
    } catch (err) {
      setError(prev => ({
        ...prev,
        search: err.response?.data?.message || 'User not found'
      }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, search: false }));
    }
  }, []);

  // Send a friend request
  const sendRequest = useCallback(async (receiverId) => {
    setLoading(prev => ({ ...prev, action: true }));
    setError(prev => ({ ...prev, action: null }));

    try {
      const response = await sendFriendRequest(receiverId);
      // Update sent requests
      setSentRequests(prev => [...prev, response.data]);
      return response;
    } catch (err) {
      setError(prev => ({
        ...prev,
        action: err.response?.data?.message || 'Failed to send friend request'
      }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, []);

  // Accept a friend request
  const acceptRequest = useCallback(async (requestId) => {
    setLoading(prev => ({ ...prev, action: true }));
    setError(prev => ({ ...prev, action: null }));

    try {
      const response = await acceptFriendRequest(requestId);

      // Update friends list and remove from received requests
      setFriends(prev => [...prev, response.data.sender]);
      setReceivedRequests(prev => prev.filter(req => req._id !== requestId));

      return response;
    } catch (err) {
      setError(prev => ({
        ...prev,
        action: err.response?.data?.message || 'Failed to accept friend request'
      }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, []);

  // Reject a friend request
  const rejectRequest = useCallback(async (requestId) => {
    setLoading(prev => ({ ...prev, action: true }));
    setError(prev => ({ ...prev, action: null }));

    try {
      const response = await rejectFriendRequest(requestId);

      // Remove from received requests
      setReceivedRequests(prev => prev.filter(req => req._id !== requestId));

      return response;
    } catch (err) {
      setError(prev => ({
        ...prev,
        action: err.response?.data?.message || 'Failed to reject friend request'
      }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, []);

  // Remove a friend
  const removeFriendship = useCallback(async (friendId) => {
    setLoading(prev => ({ ...prev, action: true }));
    setError(prev => ({ ...prev, action: null }));

    try {
      const response = await removeFriend(friendId);

      // Update friends list
      setFriends(prev => prev.filter(friend => friend._id !== friendId));

      return response;
    } catch (err) {
      setError(prev => ({
        ...prev,
        action: err.response?.data?.message || 'Failed to remove friend'
      }));
      throw err;
    } finally {
      setLoading(prev => ({ ...prev, action: false }));
    }
  }, []);

  // Clear search results
  const clearSearchResult = useCallback(() => {
    setSearchResult(null);
  }, []);

  return {
    // State
    friends,
    receivedRequests,
    sentRequests,
    searchResult,
    loading,
    error,

    // Actions
    fetchFriends,
    fetchFriendRequests,
    searchUser,
    sendRequest,
    acceptRequest,
    rejectRequest,
    removeFriendship,
    clearSearchResult
  };
};