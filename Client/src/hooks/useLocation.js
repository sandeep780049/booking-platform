import { useState, useEffect } from 'react';
import { fetchLocations } from '../Api/location.api';

const CACHE_KEY = 'locations_cache';
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

/**
 * useLocations - Fetches and caches all locations.
 * @param {boolean} defer - Whether to defer loading (default: false)
 * @returns {object} { locations, isLoading, error, refetch }
 */
export function useLocations(defer = false) {
  const [locations, setLocations] = useState(() => {
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

  const fetchLocationData = async () => {
    setIsLoading(true);
    try {
      const res = await fetchLocations();
      const locationsData = Array.isArray(res) ? res : res.data || [];
      setLocations(locationsData);
      
      // Cache the data
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify({
          data: locationsData,
          timestamp: Date.now()
        }));
      } catch (err) {
        console.error('Cache write error:', err);
      }
    } catch (err) {
      setLocations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const hasCache = locations.length > 0;
    
    if (!hasCache && !defer) {
      fetchLocationData();
    } else if (defer) {
      // Defer loading by a small timeout to prioritize critical content
      const timer = setTimeout(() => {
        if (!hasCache) {
          fetchLocationData();
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [defer]);

  return {
    locations,
    isLoading,
    refetch: fetchLocationData
  };
}