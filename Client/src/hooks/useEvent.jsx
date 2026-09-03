import { useState, useEffect, useRef } from "react";
import { getEvents } from "../Api/event.api";

const CACHE_KEY = 'events_cache';
const CACHE_DURATION = 3 * 60 * 1000; // 3 minutes

export function useEvents({
    search = "",
    page = 1,
    limit = 12,
    defer = false,
} = {}) {
    const [events, setEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(1);
    const abortControllerRef = useRef(null);

    useEffect(() => {
        // Cancel previous request if it exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const fetchEvents = async () => {
            // Check cache for initial page load
            if (page === 1 && !search) {
                try {
                    const cached = sessionStorage.getItem(CACHE_KEY);
                    if (cached) {
                        const { data, timestamp } = JSON.parse(cached);
                        if (Date.now() - timestamp < CACHE_DURATION) {
                            setEvents(data.events);
                            setTotal(data.total);
                            setTotalPages(data.totalPages);
                            return; // Use cached data
                        }
                    }
                } catch (err) {
                    console.error('Cache read error:', err);
                }
            }

            setIsLoading(true);
            setError(null);
            
            abortControllerRef.current = new AbortController();
            
            try {
                const res = await getEvents({
                    search,
                    page,
                    limit,
                }, { signal: abortControllerRef.current.signal });

                if (res) {
                    if (res.data) {
                        const eventsData = res.data.events || res.data || [];
                        setEvents(eventsData);
                        const totalCount = res.data.total || res.data.length || 0;
                        const pagesCount = res.data.totalPages || Math.ceil(totalCount / limit);
                        setTotal(totalCount);
                        setTotalPages(pagesCount);
                        
                        // Cache first page
                        if (page === 1 && !search) {
                            try {
                                sessionStorage.setItem(CACHE_KEY, JSON.stringify({
                                    data: { events: eventsData, total: totalCount, totalPages: pagesCount },
                                    timestamp: Date.now()
                                }));
                            } catch (err) {
                                console.error('Cache write error:', err);
                            }
                        }
                    }
                    // Check if response is an array directly
                    else if (Array.isArray(res)) {
                        setEvents(res);
                        setTotal(res.length);
                        setTotalPages(Math.ceil(res.length / limit));
                    }
                    // Check if response has events property directly
                    else if (res.events) {
                        setEvents(res.events);
                        setTotal(res.total || res.events.length || 0);
                        setTotalPages(res.totalPages || Math.ceil((res.total || res.events.length || 0) / limit));
                    }
                    // Fallback
                    else {
                        setEvents([]);
                        setTotal(0);
                        setTotalPages(1);
                    }
                } else {
                    setEvents([]);
                    setTotal(0);
                    setTotalPages(1);
                }
            } catch (err) {
                if (err.name !== 'AbortError') {
                    setError(err);
                    setEvents([]);
                    setTotal(0);
                    setTotalPages(1);
                }
            } finally {
                setIsLoading(false);
            }
        };
        
        if (defer) {
            const timer = setTimeout(fetchEvents, 500);
            return () => {
                clearTimeout(timer);
                if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                }
            };
        } else {
            fetchEvents();
        }

        return () => {
            if (abortControllerRef.current) {
                abortControllerRef.current.abort();
            }
        };
    }, [search, page, limit, defer]);
    
    return { events, isLoading, error, total, totalPages };
}
