import { useState, useCallback } from 'react';
import {
  createTicket,
  getUserTickets,
  getTicketById,
  addTicketResponse,
  updateTicketStatus,
  getAllTickets,
} from '../Api/ticket.api.js';

export const useTicket = () => {
  const [tickets, setTickets] = useState([]);
  const [currentTicket, setCurrentTicket] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalTickets: 0,
    limit: 10,
  });

  // Reset error state
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  // Create a new ticket
  const handleCreateTicket = useCallback(async (ticketData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await createTicket(ticketData);
      
      // Add the new ticket to the beginning of the tickets array
      setTickets(prevTickets => [response.data, ...prevTickets]);
      
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to create ticket';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get user's tickets
  const handleGetUserTickets = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getUserTickets();
      setTickets(response.data || []);
      
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch tickets';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);
  // Get a specific ticket by ID
  const handleGetTicketById = useCallback(async (ticketId) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getTicketById(ticketId);
      setCurrentTicket(response.data);
      
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch ticket';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);
  // Add response to a ticket
  const handleAddTicketResponse = useCallback(async (ticketId, message) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await addTicketResponse(ticketId, message);
      
      // Update the current ticket if it matches
      if (currentTicket && currentTicket._id === ticketId) {
        setCurrentTicket(response.data);
      }
      
      // Update the ticket in the tickets array
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket._id === ticketId ? response.data : ticket
        )
      );
      
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to add response';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [currentTicket]);

  // Update ticket status
  const handleUpdateTicketStatus = useCallback(async (ticketId, status) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await updateTicketStatus(ticketId, status);
      
      // Update the current ticket if it matches
      if (currentTicket && currentTicket._id === ticketId) {
        setCurrentTicket(response.ticket);
      }
      
      // Update the ticket in the tickets array
      setTickets(prevTickets => 
        prevTickets.map(ticket => 
          ticket._id === ticketId ? response.ticket : ticket
        )
      );
      
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to update status';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, [currentTicket]);

  // Get all tickets (Admin function)
  const handleGetAllTickets = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllTickets(filters);
      setTickets(response.tickets || []);
      
      // Update pagination if provided
      if (response.pagination) {
        setPagination({
          currentPage: response.pagination.currentPage || 1,
          totalPages: response.pagination.totalPages || 1,
          totalTickets: response.pagination.totalTickets || 0,
          limit: response.pagination.limit || 10,
        });
      }
      
      return { success: true, data: response };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to fetch all tickets';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter tickets by status
  const getTicketsByStatus = useCallback((status) => {
    return tickets.filter(ticket => ticket.status === status);
  }, [tickets]);

  // Filter tickets by priority
  const getTicketsByPriority = useCallback((priority) => {
    return tickets.filter(ticket => ticket.priority === priority);
  }, [tickets]);

  // Filter tickets by category
  const getTicketsByCategory = useCallback((category) => {
    return tickets.filter(ticket => ticket.category === category);
  }, [tickets]);

  // Get ticket statistics
  const getTicketStats = useCallback(() => {
    const stats = {
      total: tickets.length,
      open: 0,
      inProgress: 0,
      resolved: 0,
      closed: 0,
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    tickets.forEach(ticket => {
      // Count by status
      switch (ticket.status) {
        case 'open':
          stats.open++;
          break;
        case 'in-progress':
          stats.inProgress++;
          break;
        case 'resolved':
          stats.resolved++;
          break;
        case 'closed':
          stats.closed++;
          break;
      }

      // Count by priority
      switch (ticket.priority) {
        case 'low':
          stats.low++;
          break;
        case 'medium':
          stats.medium++;
          break;
        case 'high':
          stats.high++;
          break;
        case 'critical':
          stats.critical++;
          break;
      }
    });

    return stats;
  }, [tickets]);

  // Clear current ticket
  const clearCurrentTicket = useCallback(() => {
    setCurrentTicket(null);
  }, []);

  // Reset all state
  const resetState = useCallback(() => {
    setTickets([]);
    setCurrentTicket(null);
    setError(null);
    setLoading(false);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalTickets: 0,
      limit: 10,
    });
  }, []);

  return {
    // State
    tickets,
    currentTicket,
    loading,
    error,
    pagination,
    
    // Actions
    createTicket: handleCreateTicket,
    getUserTickets: handleGetUserTickets,
    getTicketById: handleGetTicketById,
    addTicketResponse: handleAddTicketResponse,
    updateTicketStatus: handleUpdateTicketStatus,
    getAllTickets: handleGetAllTickets,
    
    // Utility functions
    getTicketsByStatus,
    getTicketsByPriority,
    getTicketsByCategory,
    getTicketStats,
    
    // State management
    clearError,
    clearCurrentTicket,
    resetState,
  };
};