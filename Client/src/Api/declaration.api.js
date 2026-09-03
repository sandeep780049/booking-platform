import { axiosClient } from '../AxiosClient/axios';

// Get all declarations
export const getAllDeclarations = async () => {
  try {
    const response = await axiosClient.get('/api/declaration');
    return response.data.data;
  } catch (error) {
    console.error('Error fetching all declarations:', error);
    throw error;
  }
};

// Get declaration by ID
export const getDeclarationById = async (id) => {
  try {
    const response = await axiosClient.get(`/api/declaration/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching declaration by ID:', error);
    throw error;
  }
};

// Get declarations by title and version (search)
export const getDeclarationByTitleAndVersion = async (title, version = null) => {
  try {
    const params = { title };
    if (version) {
      params.version = version;
    }
    const response = await axiosClient.get('/api/declaration/search', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching declarations by title and version:', error);
    throw error;
  }
};

// Get latest declaration by title
export const getLatestDeclarationByTitle = async (title) => {
  try {
    const response = await axiosClient.get(`/api/declaration/latest/${title}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching latest declaration by title:', error);
    throw error;
  }
};

// Get declarations by adventure ID
export const getDeclarationsByAdventureId = async (adventureId) => {
  try {
    const response = await axiosClient.get(`/api/declaration/adventure/${adventureId}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching declarations by adventure ID:', error);
    throw error;
  }
};

// Create new declaration
export const createDeclaration = async (declarationData) => {
  try {
    const { title, version, content, adventures } = declarationData;
    const response = await axiosClient.post('/api/declaration', {
      title,
      version,
      content,
      adventures,
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating declaration:', error);
    throw error;
  }
};

// Update declaration
export const updateDeclaration = async (id, declarationData) => {
  try {
    const response = await axiosClient.put(`/api/declaration/${id}`, declarationData);
    return response.data.data;
  } catch (error) {
    console.error('Error updating declaration:', error);
    throw error;
  }
};

// Delete declaration
export const deleteDeclaration = async (id) => {
  try {
    const response = await axiosClient.delete(`/api/declaration/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error deleting declaration:', error);
    throw error;
  }
};

// Batch operations for multiple declarations
export const createMultipleDeclarations = async (declarationsArray) => {
  try {
    const promises = declarationsArray.map(declaration => 
      createDeclaration(declaration)
    );
    const results = await Promise.allSettled(promises);
    return results;
  } catch (error) {
    console.error('Error creating multiple declarations:', error);
    throw error;
  }
};

// Get declarations with pagination and search
export const getDeclarationsWithPagination = async ({ search = '', page = 1, limit = 10 }) => {
  try {
    const params = { search, page, limit };
    const response = await axiosClient.get('/api/declaration', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching declarations with pagination:', error);
    throw error;
  }
};

// Get declarations by date range
export const getDeclarationsByDateRange = async (startDate, endDate) => {
  try {
    const params = { startDate, endDate };
    const response = await axiosClient.get('/api/declaration', { params });
    return response.data.data;
  } catch (error) {
    console.error('Error fetching declarations by date range:', error);
    throw error;
  }
};