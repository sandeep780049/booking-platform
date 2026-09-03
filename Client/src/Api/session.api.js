import { axiosClient } from '../AxiosClient/axios';

export const createPreset = async (data) => {
  try {
    const res = await axiosClient.post('/api/session/preset', data, {
      withCredentials: true,
    });

    if (res.status === 201) {
      return res;
    }
    return false;
  } catch (err) {
    console.error('Error creating preset:', err);
    throw err;
  }
};

export const createSession = async (data) => {
  try {
    const res = await axiosClient.post('/api/session', data, {
      withCredentials: true,
    });

    if (res.status === 201) {
      return res;
    }
    return false;
  } catch (err) {
    console.error('Error creating session:', err);
    throw err;
  }
};

export const getInstructorSessions = async (id) => {
  try {
    const res = await axiosClient.get(`/api/session/${id}`, {
      withCredentials: true,
    });
    if (res.status === 200) {
      return res;
    }
    throw new Error(`Unexpected status code: ${res.status}`);
  } catch (err) {
    console.error('Error fetching instructor sessions by ID:', err);
    throw err;
  }
};

export const getInstructorSessionsWithBookings = async (queryParams = {}) => {
  try {
    const params = new URLSearchParams(queryParams).toString();
    const res = await axiosClient.get(`/api/session/instructor/my-sessions${params ? `?${params}` : ''}`, {
      withCredentials: true,
    });
    if (res.status === 200) {
      return res;
    }
    throw new Error(`Unexpected status code: ${res.status}`);
  } catch (err) {
    console.error('Error fetching instructor sessions:', err);
    throw err;
  }
};

export const getAllOtherInstructorsSessions = async (currentInstructorId, startDate, endDate) => {
  try {
    const params = new URLSearchParams();
    if (currentInstructorId) params.append('excludeInstructor', currentInstructorId);
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const res = await axiosClient.get(`/api/session/all?${params.toString()}`, {
      withCredentials: true,
    });
    if (res.status === 200) {
      return res;
    }
    throw new Error(`Unexpected status code: ${res.status}`);
  } catch (err) {
    console.error('Error fetching other instructors sessions:', err);
    throw err;
  }
};

export const deleteSession = async (id) => {
  try {
    if (!id) {
      throw new Error('Session ID is required');
    }

    const res = await axiosClient.delete(`/api/session/${id}`, {
      withCredentials: true,
    });

    if (res.status === 200 || res.status === 204) {
      return res;
    }
    throw new Error(`Unexpected status code: ${res.status}`);
  } catch (err) {
    console.error('Error deleting session:', err);
    throw err;
  }
};
