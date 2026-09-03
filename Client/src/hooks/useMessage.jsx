import { getChatHistoryApi } from "../Api/message.api.js";
import { useState } from "react";

export const useMessage = () => {
    const [messageHistory, setMessageHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const fetchMessageHistory = async (userId) => {
        setLoading(true);
        setError(null);
        try {
            const response = await getChatHistoryApi(userId);
            if (response.statusCode !== 200) {
                throw new Error('Failed to fetch message history');
            }
            if (response.data !== undefined && response.data.length === 0) {
                throw new Error('No messages found');
            }
            setMessageHistory(response.data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return {
        messageHistory,
        loading,
        error,
        fetchMessageHistory,
    };

}

