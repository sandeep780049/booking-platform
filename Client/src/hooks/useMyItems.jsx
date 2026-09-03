import { useEffect, useState } from "react";
import { getAllItems } from "../Api/item.api";
import { createItems, updateItem, deleteItem } from "../Api/items.api";
import { toast } from "sonner"

export function useMyItems() {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [search, setSearch] = useState("");
    const [category, setCategory] = useState("");

    const fetchItems = async () => {
        setIsLoading(true);
        try {
            const res = await getAllItems(page, limit, search, category);
            setItems(res.message);
        } catch (err) {
            setError(err);
            setItems([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchItems();
    }, [page, limit, search, category]);

    const handleCreateItem = async (item) => {
        try {
            const res = await createItems(item);
            await fetchItems();
        } catch (error) {
            console.error("Error creating item:", error);
            throw error;
        }
    }

    const handleEditItem = async (itemId, updatedItem) => {
        try {
            const res = await updateItem(itemId, updatedItem);
            await fetchItems();
        } catch (error) {
            console.error("Error editing item:", error);
            throw error;
        }
    }

    const handleDeleteItem = async (itemId) => {
        const toastId = toast.loading("Deleting item...");
        try {
            const res = await deleteItem(itemId);
            await fetchItems();
            toast.success("Item deleted successfully", { id: toastId });
        } catch (error) {
            console.error("Error deleting item:", error);
            toast.error("Error deleting item", { id: toastId });
            throw error;
        }
    }

    return { items, isLoading, error, setPage, setLimit, page, limit, handleCreateItem, handleEditItem, handleDeleteItem, setSearch, setCategory, search };
}