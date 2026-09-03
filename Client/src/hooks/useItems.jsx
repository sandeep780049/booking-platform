import { fetchAllItems } from "../Api/items.api";
import { useState, useEffect } from "react";

export function useBrowse(initFilters = {}) {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [filters, setFilters] = useState({
        page: 1,
        limit: 10,
        search: "",
        category: "",
        adventureId: initFilters?.adventureId || "",
    });

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [total, setTotal] = useState(0);

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const res = await fetchAllItems(filters);
            setItems(res.data.data.items);
            setTotal(res.data.data.total);
        } catch (err) {
            setError(err);
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };
    useEffect(() => {
        fetchItems();
    }, [filters]);


    return { items, isLoading, error, filters, setFilters, page, setPage, limit, setLimit, total };
}