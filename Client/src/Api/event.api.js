import { axiosClient } from '../AxiosClient/axios';

// Get all events with pagination and search
export const getEvents = async ({ search = '', page = 1, limit = 12 }) => {
  try {
    const params = {
      search,
      page,
      limit,
    };
    const { data } = await axiosClient.get('/api/events', {
      params,
      withCredentials: true,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// Get event by ID
export const getEventById = async (id) => {
  try {
    const { data } = await axiosClient.get(`/api/events/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// Create new event
export const createEvent = async (eventData) => {
  try {
    const formData = new FormData();

    // Append text fields
    Object.keys(eventData).forEach((key) => {
      if (key === 'images' && eventData[key]) {
        // Handle image files - send as 'medias' to match backend
        eventData[key].forEach((file, index) => {
          formData.append('medias', file);
        });
      } else if (key === 'coordinates' && eventData[key]) {
        // Handle coordinates separately
        formData.append('latitude', eventData[key].latitude);
        formData.append('longitude', eventData[key].longitude);
      } else if (key === 'adventures' && eventData[key]) {
        // Handle adventures array
        formData.append('adventures', JSON.stringify(eventData[key]));
      } else if (key === 'nftReward' && eventData[key]) {
        // Handle NFT reward object
        formData.append('nftReward', JSON.stringify(eventData[key]));
      } else if (eventData[key] !== undefined && eventData[key] !== null) {
        formData.append(key, eventData[key]);
      }
    });

    const { data } = await axiosClient.post('/api/events', formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// Update event
export const updateEvent = async (id, eventData) => {
  try {
    const formData = new FormData();

    // Append text fields
    Object.keys(eventData).forEach((key) => {
      if (key === 'images' && eventData[key]) {
        // Handle image files - send as 'medias' to match backend
        eventData[key].forEach((file, index) => {
          formData.append('medias', file);
        });
      } else if (key === 'coordinates' && eventData[key]) {
        // Handle coordinates separately
        formData.append('latitude', eventData[key].latitude);
        formData.append('longitude', eventData[key].longitude);
      } else if (key === 'adventures' && eventData[key]) {
        // Handle adventures array
        formData.append('adventures', JSON.stringify(eventData[key]));
      } else if (key === 'nftReward' && eventData[key]) {
        // Handle NFT reward object
        formData.append('nftReward', JSON.stringify(eventData[key]));
      } else if (eventData[key] !== undefined && eventData[key] !== null) {
        formData.append(key, eventData[key]);
      }
    });

    const { data } = await axiosClient.put(`/api/events/${id}`, formData, {
      withCredentials: true,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

// Delete event
export const deleteEvent = async (id) => {
  try {
    const { data } = await axiosClient.delete(`/api/events/${id}`, {
      withCredentials: true,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
