import { useState } from 'react';
import { getSendersApi } from '../Api/message.api.js';

export const useSenders = () => {
  const [senders, setSenders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchSenders = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getSendersApi();
      if (response?.statusCode !== 200) {
        throw new Error(response?.message || 'Failed to fetch senders');
      }
      setSenders(response.data || []);
    } catch (err) {
      setError(err.message || String(err));
    } finally {
      setLoading(false);
    }
  };

  return { senders, loading, error, fetchSenders };
};
