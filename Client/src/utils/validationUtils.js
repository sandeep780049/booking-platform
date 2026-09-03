/**
 * Form validation utilities
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} - Whether email is valid
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 * @param {string} phone - Phone number to validate
 * @returns {boolean} - Whether phone is valid
 */
export const isValidPhone = (phone) => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))
}

/**
 * Validate booking form
 * @param {Object} formData - Form data to validate
 * @returns {Object} - Validation result with success and errors
 */
export const validateBookingForm = (formData) => {
  const errors = {}
  
  if (!formData.email) {
    errors.email = 'Email is required'
  } else if (!isValidEmail(formData.email)) {
    errors.email = 'Please enter a valid email address'
  }
  
  if (!formData.phone) {
    errors.phone = 'Phone number is required'
  } else if (!isValidPhone(formData.phone)) {
    errors.phone = 'Please enter a valid phone number'
  }
  
  if (!formData.participants || formData.participants < 1) {
    errors.participants = 'At least 1 participant is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate search form
 * @param {Object} searchData - Search data to validate
 * @returns {Object} - Validation result
 */
export const validateSearchForm = (searchData) => {
  const errors = {}
  
  if (!searchData.location?.trim()) {
    errors.location = 'Location is required'
  }
  
  if (!searchData.date) {
    errors.date = 'Date is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}