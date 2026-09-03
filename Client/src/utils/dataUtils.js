/**
 * Data manipulation utilities
 */

/**
 * Group events by country
 * @param {Array} events - Array of events
 * @returns {Array} - Array of countries with their events
 */
export const groupEventsByCountry = (events) => {
  if (!events || events.length === 0) return []

  const countryMap = {}
  events.forEach(event => {
    if (!countryMap[event.country]) {
      countryMap[event.country] = {
        name: event.country,
        events: []
      }
    }
    countryMap[event.country].events.push(event)
  })

  return Object.values(countryMap)
}

/**
 * Sort events by date
 * @param {Array} events - Array of events
 * @param {string} order - 'asc' or 'desc'
 * @returns {Array} - Sorted events
 */
export const sortEventsByDate = (events, order = 'asc') => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.date)
    const dateB = new Date(b.date)
    return order === 'asc' ? dateA - dateB : dateB - dateA
  })
}

/**
 * Filter events by criteria
 * @param {Array} events - Array of events
 * @param {Object} filters - Filter criteria
 * @returns {Array} - Filtered events
 */
export const filterEvents = (events, filters) => {
  return events.filter(event => {
    if (filters.country && event.country !== filters.country) return false
    if (filters.city && event.city !== filters.city) return false
    if (filters.adventure && !event.adventures?.some(adv => adv.name === filters.adventure)) return false
    if (filters.dateFrom && new Date(event.date) < new Date(filters.dateFrom)) return false
    if (filters.dateTo && new Date(event.date) > new Date(filters.dateTo)) return false
    return true
  })
}

/**
 * Get unique values from array of objects
 * @param {Array} array - Array of objects
 * @param {string} key - Key to extract unique values from
 * @returns {Array} - Array of unique values
 */
export const getUniqueValues = (array, key) => {
  return [...new Set(array.map(item => item[key]).filter(Boolean))]
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} - Truncated text
 */
export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

/**
 * Format location string
 * @param {Object} event - Event object
 * @returns {string} - Formatted location string
 */
export const formatLocation = (event) => {
  const parts = [event.city, event.country].filter(Boolean)
  return parts.join(', ')
}

/**
 * Calculate pagination info
 * @param {number} currentPage - Current page number
 * @param {number} totalPages - Total number of pages
 * @returns {Object} - Pagination info
 */
export const calculatePagination = (currentPage, totalPages) => {
  const showEllipsis = totalPages > 7
  const startPage = Math.max(1, currentPage - 1)
  const endPage = Math.min(totalPages, currentPage + 1)
  
  return {
    showEllipsis,
    startPage,
    endPage,
    hasPrevious: currentPage > 1,
    hasNext: currentPage < totalPages
  }
}