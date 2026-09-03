/**
 * Date formatting and manipulation utilities
 */

/**
 * Format date for display
 * @param {string|Date} date - The date to format
 * @param {Object} options - Formatting options
 * @returns {string} - Formatted date string
 */
export const formatDate = (date, options = {}) => {
  if (!date) return ''
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }
  
  return new Date(date).toLocaleDateString('en-US', { ...defaultOptions, ...options })
}

/**
 * Format date with weekday
 * @param {string|Date} date - The date to format
 * @returns {string} - Formatted date string with weekday
 */
export const formatDateWithWeekday = (date) => {
  return formatDate(date, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

/**
 * Check if date is in the future
 * @param {string|Date} date - The date to check
 * @returns {boolean} - Whether the date is in the future
 */
export const isFutureDate = (date) => {
  return new Date(date) > new Date()
}

/**
 * Get days between two dates
 * @param {string|Date} startDate - Start date
 * @param {string|Date} endDate - End date
 * @returns {number} - Number of days between dates
 */
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end - start)
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}