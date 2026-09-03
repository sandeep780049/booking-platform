import { axiosClient } from '../AxiosClient/axios';

export const getLiveTerms = async (title) => {
  try {
    const response = await axiosClient.get('/api/terms/public/live', { params: { title } });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching live terms:', error);
    throw error;
  }
};

export const getAllTerms = async (title) => {
  try {
    const response = await axiosClient.get('/api/terms', { params: { title } });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all terms:', error);
    throw error;
  }
};

// Create new terms document
export const createTerms = async (title, content) => {
  try {
    const response = await axiosClient.post('/api/terms/create', {
      title,
      content,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating terms:', error);
    throw error;
  }
};

// Update existing terms document (creates new draft version)
export const updateTerms = async (title, content, baseVersion) => {
  try {
    const response = await axiosClient.put('/api/terms/update', {
      title,
      content,
      baseVersion,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating terms:', error);
    throw error;
  }
};

// Save draft terms (legacy function, keeping for backward compatibility)
export const saveDraftTerms = async (title, content, version) => {
  try {
    const response = await axiosClient.post('/api/terms/draft', {
      title,
      content,
      version,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error saving draft terms:', error);
    throw error;
  }
};

export const publishTerms = async (title, content, version, publishedBy) => {
  try {
    const response = await axiosClient.post('/api/terms/publish', {
      title,
      content,
      version,
      publishedBy,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error publishing terms:', error);
    throw error;
  }
};

export const restoreTermsVersion = async (title, version) => {
  try {
    const response = await axiosClient.post(
      `/api/terms/restore/${version}`,
      null,
      { params: { title } }
    );
    return response.data.data;
  } catch (error) {
    console.error('Error restoring terms version:', error);
    throw error;
  }
};

export const deleteTermsVersion = async (title, version) => {
  try {
    const response = await axiosClient.delete(`/api/terms/${version}`, {
      params: { title },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error deleting terms version:', error);
    throw error;
  }
};

export const getAllTermDocuments = async () => {
  try {
    const response = await axiosClient.get('/api/terms/all');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all term documents:', error);
    throw error;
  }
};
