import { useState, useEffect } from "react";
import { getCategories, createCategory } from "../Api/category.api";

export function useCategory() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const res = await getCategories();
                setCategories(res.data.message);
                setLoading(false);
            }
            catch (error) {
                console.error("Error fetching categories:", error);
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    const handleCreateCetegory = async (category) => {
        try {
            const res = await createCategory(category);
            setCategories((prev) => [...prev, res.data.message]);
        } catch (error) {
            console.error("Error creating category:", error);
            throw error;
        }
    }


    return { categories, loading, handleCreateCetegory };
}