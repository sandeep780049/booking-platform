import { useState } from 'react';
import { toast } from 'sonner';
import {
  fetchRegistrationLimits,
  createRegistrationLimit,
  updateRegistrationLimit,
  deleteRegistrationLimit,
  moveInstructorFromWaitlist,
} from '../Api/registrationLimit.api.js';

export const useRegistrationLimits = () => {
  const [limits, setLimits] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadLimits = async () => {
    try {
      setIsLoading(true);
      const response = await fetchRegistrationLimits();
      setLimits(response.data || []);
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Failed to fetch registration limits';
      toast.error(message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const createLimit = async (limitData) => {
    try {
      const response = await createRegistrationLimit(limitData);
      toast.success('Registration limit created successfully');
      await loadLimits();
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Failed to create limit';
      toast.error(message);
      throw error;
    }
  };

  const updateLimit = async (id, limitData) => {
    try {
      const response = await updateRegistrationLimit(id, limitData);
      toast.success('Limit updated successfully');
      await loadLimits();
      return response.data;
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Failed to update limit';
      toast.error(message);
      throw error;
    }
  };

  const deleteLimit = async (id) => {
    try {
      await deleteRegistrationLimit(id);
      toast.success('Limit deleted successfully');
      await loadLimits();
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Failed to delete limit';
      toast.error(message);
      throw error;
    }
  };

  const moveFromWaitlist = async (limitId, instructorId) => {
    try {
      await moveInstructorFromWaitlist(limitId, instructorId);
      toast.success('Instructor moved from waitlist successfully');
      await loadLimits();
    } catch (error) {
      const message =
        error?.response?.data?.message || 'Failed to move instructor';
      toast.error(message);
      throw error;
    }
  };

  return {
    limits,
    isLoading,
    loadLimits,
    createLimit,
    updateLimit,
    deleteLimit,
    moveFromWaitlist,
  };
};
