import { axiosClient } from '../AxiosClient/axios';

// Get website settings (admin only)
export const getWebsiteSettings = async () => {
  try {
    const response = await axiosClient.get('/api/website-settings', {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching website settings:', error);
    throw error;
  }
};

// Update website settings (admin only)
export const updateWebsiteSettings = async (settings) => {
  try {
    const response = await axiosClient.put('/api/website-settings', settings, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error('Error updating website settings:', error);
    throw error;
  }
};

// Get public website settings (no authentication required)
export const getPublicWebsiteSettings = async () => {
  try {
    const response = await axiosClient.get('/api/website-settings/public');
    return response.data;
  } catch (error) {
    console.error('Error fetching public website settings:', error);
    throw error;
  }
};
