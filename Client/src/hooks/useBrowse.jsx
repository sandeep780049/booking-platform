import { fetchAllAdventures, fetchFilteredAdventures } from "../Api/adventure.api";
import { useState, useEffect } from "react";

export function useBrowse() {
    const [adventures, setAdventures] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        adventure: "",
        location: "",
        session_date: "",
    });

    const fetchAdventures = async () => {
        setIsLoading(true);
        try {
            const hasFilters =
                Boolean(filters.adventure?.trim()) ||
                Boolean(filters.location?.trim()) ||
                Boolean(filters.session_date?.trim());

            if (hasFilters) {
                const res = await fetchFilteredAdventures(filters);
                setAdventures(res.data?.data || []);
            } else {
                const res = await fetchAllAdventures();
                setAdventures(res.data?.adventures || []);
            }
        } catch (err) {
            setError(err);
            setAdventures([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAdventures();
    }, [filters]);

    return { adventures, isLoading, error, filters, setFilters };
}
