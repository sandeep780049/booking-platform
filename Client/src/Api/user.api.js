import { axiosClient } from '../AxiosClient/axios';

export const fetchUsers = async ({
  search = '',
  role = 'all',
  page = 1,
  limit = 10,
}) => {
  const params = { search, role, page, limit };
  const { data } = await axiosClient.get('/api/user', { params });
  return data;
};

export const deleteUser = async (userId) => {
  const { data } = await axiosClient.delete(`/api/user/${userId}`);
  return data;
};

export const getUserAdventures = async () => {
  const { data } = await axiosClient.get('/api/user/adventure', {
    withCredentials: true,
  });
  return data;
};

export const getUserAdventureExperiences = async () => {
  const { data } = await axiosClient.get('/api/user/adventure-experiences', {
    withCredentials: true,
  });
  return data;
};

export const updateUserProfile = async (payload) => {
  // If payload contains a file, convert to FormData
  let requestData = payload;
  let config = {
    withCredentials: true,
  };

  const hasProfilePictureFile =
    payload?.profilePicture &&
    ((typeof File !== 'undefined' && payload.profilePicture instanceof File) ||
      (typeof Blob !== 'undefined' && payload.profilePicture instanceof Blob));

  if (hasProfilePictureFile) {
    const formData = new FormData();
    formData.append('profilePicture', payload.profilePicture);

    // Append other fields
    if (payload.name) formData.append('name', payload.name);
    if (payload.bio) {
      if (Array.isArray(payload.bio)) {
        formData.append('bio', JSON.stringify(payload.bio));
      } else {
        formData.append('bio', payload.bio);
      }
    }
    if (payload.languages) {
      formData.append('languages', JSON.stringify(payload.languages));
    }

    requestData = formData;
    config.headers = {
      ...(config.headers || {}),
      'Content-Type': 'multipart/form-data',
    };
  }

  const { data } = await axiosClient.put('/api/user/profile', requestData, config);
  return data;
};

export const getCurrentUser = async () => {
  try {
    const { data } = await axiosClient.get('/api/user/me', {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    console.error(
      "Failed to fetch current user:",
      error.response?.data || error.message
    );
    throw new Error("Unable to retrieve user information");
  }
};

// Get the current user's achievements
export const getUserAchievements = async () => {
  try {
    const { data } = await axiosClient.get('/api/user/getUserAchievements', {
      withCredentials: true,
    });
    return data; // ApiResponse shape: { success, statusCode, message, data }
  } catch (error) {
    // Surface a friendly error while preserving original for debugging
    const payload = error?.response?.data || { message: error.message };
    console.error('Failed to fetch user achievements:', payload);
    throw error;
  }
};

// Admin: update any user's top-level role or other fields (admin-only route)
export const updateUser = async (id, payload) => {
  const { data } = await axiosClient.put(`/api/user/${id}`, payload, {
    withCredentials: true,
  });
  return data;
};

// Admin: create a new achievement rule
export const createAchievementRule = async (payload) => {
  const { data } = await axiosClient.post('/api/achievement-rules', payload, {
    withCredentials: true,
  });
  return data;
};

// Admin: update a rule
export const updateAchievementRule = async (id, payload) => {
  const { data } = await axiosClient.put(`/api/achievement-rules/${id}`, payload, {
    withCredentials: true,
  });
  return data;
};

// Admin: delete a rule
export const deleteAchievementRule = async (id) => {
  const { data } = await axiosClient.delete(`/api/achievement-rules/${id}`, {
    withCredentials: true,
  });
  return data;
};

// List rules (authed)
export const listAchievementRules = async (params = {}) => {
  const { data } = await axiosClient.get('/api/achievement-rules', {
    params,
    withCredentials: true,
  });
  return data;
};

// Evaluate my achievements now
export const evaluateMyAchievements = async () => {
  const { data } = await axiosClient.post('/api/achievement-rules/evaluate', {}, {
    withCredentials: true,
  });
  return data;
};

// Admin: create a new instructor achievement rule
export const createInstructorAchievementRule = async (payload) => {
  const { data } = await axiosClient.post('/api/achievement-rules/instructor', payload, {
    withCredentials: true,
  });
  return data;
};

// Admin: update instructor achievement rule
export const updateInstructorAchievementRule = async (id, payload) => {
  const { data } = await axiosClient.put(`/api/achievement-rules/instructor/${id}`, payload, {
    withCredentials: true,
  });
  return data;
};

// Admin: delete instructor achievement rule
export const deleteInstructorAchievementRule = async (id) => {
  const { data } = await axiosClient.delete(`/api/achievement-rules/instructor/${id}`, {
    withCredentials: true,
  });
  return data;
};

// Admin: list instructor achievement rules
export const listInstructorAchievementRules = async (params = {}) => {
  const { data } = await axiosClient.get('/api/achievement-rules/instructor', {
    params,
    withCredentials: true,
  });
  return data;
};

// Admin: get single instructor achievement rule
export const getInstructorAchievementRule = async (id) => {
  const { data } = await axiosClient.get(`/api/achievement-rules/instructor/${id}`, {
    withCredentials: true,
  });
  return data;
};

// Admin: evaluate specific instructor
export const evaluateSpecificInstructor = async (instructorId) => {
  const { data } = await axiosClient.post(`/api/achievement-rules/instructor/evaluate/${instructorId}`, {}, {
    withCredentials: true,
  });
  return data;
};

// Admin: evaluate all instructors
export const evaluateAllInstructors = async () => {
  const { data } = await axiosClient.post('/api/achievement-rules/instructor/evaluate-all', {}, {
    withCredentials: true,
  });
  return data;
};

// Instructor: evaluate my achievements
export const evaluateMyInstructorAchievements = async () => {
  const { data } = await axiosClient.post('/api/achievement-rules/instructor/evaluate', {}, {
    withCredentials: true,
  });
  return data;
};

// Get instructor achievements (both admin and instructor endpoints)
export const getInstructorAchievements = async (instructorId = null) => {
  const endpoint = instructorId 
    ? `/api/achievement-rules/instructor/achievements/${instructorId}`
    : '/api/achievement-rules/instructor/achievements';
  
  const { data } = await axiosClient.get(endpoint, {
    withCredentials: true,
  });
  return data;
};

