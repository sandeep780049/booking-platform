/**
 * Middleware to detect and set the preferred language for translation
 * Checks in order: query parameter, Accept-Language header, default to 'en'
 */
export const languageMiddleware = (req, res, next) => {
  // Priority 1: Query parameter 'lang' or 'language'
  let language = req.query.lang || req.query.language;

  if (!language) {
    // Priority 2: Accept-Language header
    const acceptLanguage = req.headers['accept-language'];
    if (acceptLanguage) {
      // Parse Accept-Language header and get the first language code
      const languages = acceptLanguage
        .split(',')
        .map(lang => lang.split(';')[0].trim())
        .map(lang => lang.split('-')[0]); // Get just the language code (e.g., 'en' from 'en-US')
      
      // Use the first supported language or fall back to 'en'
      const supportedLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'ko', 'zh', 'ar'];
      language = languages.find(lang => supportedLanguages.includes(lang)) || 'en';
    }
  }

  // Priority 3: Default to English
  if (!language) {
    language = 'en';
  }

  // Normalize language code (lowercase, max 2 characters)
  language = language.toLowerCase().substring(0, 2);

  // Set the language in the request object for use in controllers
  req.language = language;
  
  next();
};

/**
 * Helper function to get language from request
 * @param {Object} req - Express request object
 * @returns {string} - Language code
 */
export const getLanguage = (req) => {
  return req.language || 'en';
};
