/**
 * Utility functions for handling file uploads in the chat
 */

/**
 * Validates if a file is provided
 * @param {File} file - The file to validate
 * @throws {Error} - If no file is provided
 */
const validateFile = (file) => {
  if (!file) throw new Error('No file provided');
};

/**
 * Creates a data URL from a file
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - A promise that resolves to the data URL
 */
export const fileToDataURL = (file) => {
  validateFile(file);
  
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

/**
 * Uploads a file to the server (simulation)
 * In a real app, this would call an API endpoint to upload the file to a server
 *
 * @param {File} file - The file to upload
 * @returns {Promise<{url: string, name: string, type: string, size: number}>} - A promise that resolves to the file metadata
 */
export const uploadFile = async (file) => {
  validateFile(file);
  
  const url = await fileToDataURL(file);
  
  return {
    url, // In a real app, this would be the URL returned by the server
    name: file.name,
    type: file.type,
    size: file.size,
  };
};

/**
 * Check if a file is an image based on its MIME type
 * @param {string} fileType - The MIME type of the file
 * @returns {boolean} - Whether the file is an image
 */
export const isImageFile = (fileType) => {
  return fileType.startsWith('image/');
};

/**
 * Debug helper for troubleshooting file browser issues
 * @param {string} action - The action being performed
 * @param {Object} data - Any relevant data to log
 */
export const debugFileUpload = (action, data = {}) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] FILE UPLOAD - ${action}:`, data);
};
