import { axiosClient } from '../AxiosClient/axios.js';
import i18n from '../i18.js';

// Function to update language headers
export const updateLanguageHeaders = (languageCode) => {
  axiosClient.defaults.headers['Accept-Language'] = languageCode;
  axiosClient.defaults.headers['X-Language'] = languageCode;
};

// Function to get current language
export const getCurrentLanguage = () => {
  // Try to get from localStorage first, then i18n, then default to 'en'
  try {
    const savedLanguage = localStorage.getItem('selectedLanguage');
    if (savedLanguage) return savedLanguage;
  } catch (error) {
    console.error('Error accessing localStorage:', error);
  }

  return i18n.language || 'en';
};

// Function to set language headers for a specific request config
export const setLanguageHeaders = (config, languageCode = null) => {
  const currentLanguage = languageCode || getCurrentLanguage();
  config.headers['Accept-Language'] = currentLanguage;
  config.headers['X-Language'] = currentLanguage;
  return config;
};
