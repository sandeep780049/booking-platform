import { useState, useEffect } from "react";
import { getInstructorSessionsWithBookings } from "../Api/instructor.api";

export function useInstructorSessions(filters = {}) {
    const [sessions, setSessions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        totalPages: 0
    });

    const fetchSessions = async (page = 1) => {
        try {
            setIsLoading(true);
            setError(null);
            
            const response = await getInstructorSessionsWithBookings({
                page,
                limit: pagination.limit,
                sortBy: 'startTime',
                sortOrder: 'asc',
                ...filters
            });
            
            const responseData = response.data.data || response.data;
            setSessions(responseData.sessions || []);
            setPagination({
                page: responseData.page || 1,
                limit: pagination.limit,
                total: responseData.total || 0,
                totalPages: responseData.totalPages || 0
            });
            
        } catch (err) {
            console.error('Error fetching instructor sessions:', err);
            setError(err);
            setSessions([]);
        } finally {
            setIsLoading(false);
        }
    };

    // Helper functions for filtering sessions by computed status
    const getUpcomingSessions = () => {
        return sessions.filter(session => session.computedStatus === 'upcoming');
    };

    const getCompletedSessions = () => {
        return sessions.filter(session => session.computedStatus === 'completed');
    };

    const getExpiredSessions = () => {
        return sessions.filter(session => session.computedStatus === 'expired');
    };

    const getBookableSessions = () => {
        return sessions.filter(session => session.isBookable);
    };

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            fetchSessions(newPage);
        }
    };
    
    useEffect(() => {
        fetchSessions();
    }, [filters.status]); // Depend on filter changes
    
    return { 
        sessions, 
        isLoading, 
        error, 
        pagination,
        upcomingSessions: getUpcomingSessions(),
        completedSessions: getCompletedSessions(), 
        expiredSessions: getExpiredSessions(),
        bookableSessions: getBookableSessions(),
        handlePageChange,
        refetch: fetchSessions
    };
}
