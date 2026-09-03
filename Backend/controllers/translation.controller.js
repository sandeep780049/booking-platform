import { asyncHandler } from "../utils/asyncHandler.js";
import ApiResponse from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { 
  clearTranslationCache, 
  getSupportedLanguages,
  translateText 
} from "../utils/translation.js";
import redis from '../config/redis.config.js';


/**
 * Clear translation cache
 */
export const clearCache = asyncHandler(async (req, res) => {
  const { pattern } = req.query;
  
  try {
    await clearTranslationCache(pattern);
    res.status(200).json(new ApiResponse(200, "Translation cache cleared successfully"));
  } catch (error) {
    throw new ApiError(500, "Failed to clear translation cache");
  }
});

/**
 * Get cache statistics
 */
export const getCacheStats = asyncHandler(async (req, res) => {
  try {
    const keys = await redis.keys('translate:*');
    const totalCachedTranslations = keys.length;
    
    // Get memory usage
    const info = await redis.info('memory');
    const memoryLines = info.split('\r\n');
    const usedMemoryLine = memoryLines.find(line => line.startsWith('used_memory_human:'));
    const usedMemory = usedMemoryLine ? usedMemoryLine.split(':')[1] : 'Unknown';
    
    // Get language breakdown
    const languageStats = {};
    for (const key of keys) {
      const parts = key.split(':');
      if (parts.length >= 3) {
        const targetLang = parts[2];
        languageStats[targetLang] = (languageStats[targetLang] || 0) + 1;
      }
    }
    
    const stats = {
      totalCachedTranslations,
      usedMemory,
      languageBreakdown: languageStats,
      cacheKeyPattern: 'translate:{sourceLang}:{targetLang}:{base64Text}'
    };
    
    res.status(200).json(new ApiResponse(200, "Cache statistics fetched successfully", stats));
  } catch (error) {
    throw new ApiError(500, "Failed to fetch cache statistics");
  }
});

/**
 * Preload common translations into cache
 */
export const preloadTranslations = asyncHandler(async (req, res) => {
  const { texts, targetLanguages = ['es', 'fr', 'de'], sourceLanguage = 'en' } = req.body;
  
  if (!texts || !Array.isArray(texts)) {
    throw new ApiError(400, "Texts array is required");
  }
  
  try {
    const results = [];
    
    for (const targetLang of targetLanguages) {
      for (const text of texts) {
        const translatedText = await translateText(text, targetLang, sourceLanguage);
        results.push({
          originalText: text,
          translatedText,
          sourceLanguage,
          targetLanguage: targetLang
        });
      }
    }
    
    res.status(200).json(new ApiResponse(200, "Translations preloaded successfully", {
      processedTexts: texts.length,
      targetLanguages: targetLanguages.length,
      totalTranslations: results.length,
      results
    }));
  } catch (error) {
    throw new ApiError(500, "Failed to preload translations");
  }
});
