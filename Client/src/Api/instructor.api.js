import { axiosClient } from '../AxiosClient/axios';

export const getInstructorAdventure = async (instructorId) => {
  try {
    const res = await axiosClient.get(`/api/adventure/instructor`, {
      withCredentials: true
    });
    return res;
  } catch (error) {
    console.error('Error fetching instructor adventures:', error);
    throw error;
  }
};

export const getAllSessions = async ({
  adventure = '',
  location = '',
  session_date = '',
} = {}) => {
  try {
    const params = new URLSearchParams();
    if (adventure && adventure.trim() !== '')
      params.append('adventure', adventure);
    if (location && location.trim() !== '') params.append('location', location);
    if (session_date && session_date.trim() !== '')
      params.append('session_date', session_date);
    const res = await axiosClient.get(
      `/api/session/instructors?${params.toString()}`
    );
    return res;
  } catch (error) {
    console.error('Error fetching all sessions:', error);
    throw error;
  }
};

export const getAllInstructors = async ({ page, limit, search, status } = {}) => {
  try {
    const params = {};
    if (page !== undefined) params.page = page;
    if (limit !== undefined) params.limit = limit;
    if (search !== undefined && search !== null && search !== "") {
      params.search = search;
    }
    if (status && status !== "all") {
      params.status = status;
    }
    const res = await axiosClient.get('/api/instructor', { params });
    return res;
  } catch (error) {
    console.error('Error fetching all instructors:', error);
    throw error;
  }
};

export const getInstructorById = async (id) => {
  try {
    const res = await axiosClient.get(`/api/instructor/${id}`);
    return res;
  } catch (error) {
    console.error('Error fetching instructor by ID:', error);
    throw error;
  }
};

export const deleteInstructor = async (id) => {
  try {
    const res = await axiosClient.delete(`/api/instructor/${id}`);
    return res;
  } catch (error) {
    console.error('Error deleting instructor:', error);
    throw error;
  }
};

export const changeDocumentStatusById = async (id, status) => {
  try {
    const res = await axiosClient.put(`/api/instructor/${id}`, { status });
    return res;
  } catch (error) {
    console.error('Error changing document status:', error);
    throw error;
  }
};

export const updateInstructor = async (id, data) => {
  try {
    const res = await axiosClient.patch(`/api/instructor/${id}`, data);
    return res;
  } catch (error) {
    console.error('Error updating instructor:', error);
    throw error;
  }
};

// Get instructor's own sessions with booking details
export const getInstructorSessionsWithBookings = async (queryParams = {}) => {
  try {
    const params = new URLSearchParams(queryParams).toString();
    const res = await axiosClient.get(
      `/api/session/instructor/my-sessions${params ? `?${params}` : ''
      }`,
      {
        withCredentials: true,
      }
    );
    return res;
  } catch (error) {
    console.error('Error fetching instructor sessions:', error);
    throw error;
  }
};

export const uploadInstructorMedia = async (formData) => {
  try {
    const res = await axiosClient.post('/api/instructor/portfolio', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res;
  } catch (error) {
    console.error('Error uploading instructor media:', error);
    throw error;
  }
};

export const deleteInstructorMedia = async (mediaUrl) => {
  try {
    const res = await axiosClient.delete('/api/instructor/portfolio', {
      withCredentials: true,
      data: { mediaUrl },
    });
    return res;
  } catch (error) {
    console.error('Error deleting instructor media:', error);
    throw error;
  }
};
