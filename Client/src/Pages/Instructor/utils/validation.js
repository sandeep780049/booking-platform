export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password))
    return 'Password must contain at least one uppercase letter';
  if (!/[a-z]/.test(password))
    return 'Password must contain at least one lowercase letter';
  if (!/[0-9]/.test(password))
    return 'Password must contain at least one number';
  return '';
};

export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) return '';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

export const validateEmail = (email) => {
  if (!email) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return 'Invalid email format';
  return '';
};

export const validateFile = (file, maxSizeMB = 5, allowedTypes = []) => {
  if (!file) return 'File is required';

  const fileSizeInMB = file.size / (1024 * 1024);
  if (fileSizeInMB > maxSizeMB) {
    return `File size must be less than ${maxSizeMB}MB`;
  }

  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return `Invalid file type. Allowed types: ${allowedTypes.join(', ')}`;
  }

  return '';
};

export const validateFormData = (formData) => {
  const errors = {};

  if (!formData.name?.trim()) errors.name = 'Name is required';

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validatePasswordMatch(
    formData.password,
    formData.confirmPassword
  );
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  if (!formData.bio?.trim()) errors.bio = 'Bio is required';
  if (!formData.adventure) errors.adventure = 'Adventure is required';
  if (!formData.location) errors.location = 'Location is required';

  if (!formData.certificate) {
    errors.certificate = 'Certificate is required';
  } else {
    const certError = validateFile(formData.certificate, 5, [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ]);
    if (certError) errors.certificate = certError;
  }

  if (!formData.governmentId) {
    errors.governmentId = 'Government ID is required';
  } else {
    const idError = validateFile(formData.governmentId, 5, [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
    ]);
    if (idError) errors.governmentId = idError;
  }

  return errors;
};
