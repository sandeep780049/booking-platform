import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper to validate and get auth headers
const getAuthHeaders = (token) => {
  if (
    !token ||
    token === 'null' ||
    token === 'undefined' ||
    token.trim() === ''
  ) {
    throw new Error('Invalid or missing authentication token');
  }
  return { Authorization: `Bearer ${token}` };
};

export const linkPayPalAccount = async (token) => {
  const res = await axios.post(
    `${API_URL}/payouts/connect`,
    {},
    {
      headers: getAuthHeaders(token),
    }
  );
  return res.data;
};

export const getPayPalLinkStatus = async (token) => {
  const res = await axios.get(`${API_URL}/payouts/status`, {
    headers: getAuthHeaders(token),
  });
  return res.data;
};

// Legacy function - keeping for backwards compatibility
export const getPayPalConnectUrl = async (token) => {
  return linkPayPalAccount(token);
};

export const submitPayPalSuccess = async (token, payload) => {
  const res = await axios.post(`${API_URL}/payouts/success`, payload, {
    headers: {
      ...getAuthHeaders(token),
      'Content-Type': 'application/json',
    },
  });
  return res.data;
};

export const handlePayPalCallback = async (query) => {
  const res = await axios.get(`${API_URL}/payouts/callback`, { params: query });
  return res.data;
};

export const createBatchPayout = async (data, token) => {
  const res = await axios.post(`${API_URL}/payouts/batch`, data, {
    headers: getAuthHeaders(token),
  });
  return res.data;
};

export const getBatchPayouts = async (batchId, token) => {
  const res = await axios.get(`${API_URL}/payouts/batch/${batchId}`, {
    headers: getAuthHeaders(token),
  });
  return res.data;
};

export const getUserPayouts = async (userId, token) => {
  const res = await axios.get(`${API_URL}/payouts/user/${userId}`, {
    headers: getAuthHeaders(token),
  });
  return res.data;
};
