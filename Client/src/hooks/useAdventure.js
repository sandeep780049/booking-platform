import { useState, useEffect } from 'react';
import { fetchAllAdventures } from '../Api/adventure.api';

const CACHE_KEY = 'adventures_cache';
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * useAdventures - Fetches and caches all adventures with pagination and search.
 * @param {boolean} defer - Whether to defer loading (default: false)
 * @returns {object} { adventures, isLoading, error, refetch, page, setPage, totalPages, total, limit, setLimit, search, setSearch }
 */
export function useAdventures(defer = false) {
  const [adventures, setAdventures] = useState(() => {
    // Initialize from cache if available
    try {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        const { data, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < CACHE_DURATION) {
          return data;
        }
      }
    } catch (err) {
      console.error('Cache read error:', err);
    }
    return [];
  });
  const [isLoading, setIsLoading] = useState(false);

  const fetchAdventures = async () => {
    setIsLoading(true);
    try {
      const res = await fetchAllAdventures();
      const adventuresData = res.data.adventures;
      setAdventures(adventuresData);
      
      // Cache the data
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: adventuresData,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Cache write error:', err);
      }
    } catch (err) {
      setAdventures([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch if we don't have cached data or if not deferred
    const hasCache = adventures.length > 0;
    
    if (!hasCache && !defer) {
      fetchAdventures();
    } else if (defer) {
      // Defer loading by a small timeout to prioritize critical content
      const timer = setTimeout(() => {
        if (!hasCache) {
          fetchAdventures();
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [defer]);

  return {
    adventures,
    isLoading,
    refetch: fetchAdventures,
  };
}
