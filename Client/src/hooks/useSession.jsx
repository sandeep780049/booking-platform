import { se } from "date-fns/locale";
import { getAllSessions } from "../Api/instructor.api";
import { useState, useEffect } from "react";

export function useSessions(filters = { adventure, location, session_date }) {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [instructors, setInstructors] = useState([]);

    const fetchSessions = async () => {
        setIsLoading(true);
        setInstructors([]);
        try {
            if (!filters.adventure) {
                setSessions([]);
                return;
            }
            const res = await getAllSessions(filters);
            setSessions(res.data);
            res.data.map((session) => {
                const instructor = session.instructorId;
                setInstructors((prev) => [...prev, instructor]);
            });
        } catch (err) {
            setError(err);
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchSessions();
    }, [filters.adventure, filters.location, filters.session_date]);

    return { sessions, isLoading, error, instructors };
}