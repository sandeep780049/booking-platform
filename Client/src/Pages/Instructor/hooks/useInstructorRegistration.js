import { useState, useCallback, useEffect } from 'react';
import { validatePasswordMatch, validateFormData } from '../utils/validation';
import { axiosClient } from '../../../AxiosClient/axios';
import { toast } from 'sonner';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  bio: '',
  adventure: '',
  location: '',
  role: 'instructor',
  profileImage: null,
  mediaFiles: [],
  certificate: null,
  governmentId: null,
};

export const useInstructorRegistration = (adventures) => {
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});
  const [locations, setLocations] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const passwordError = validatePasswordMatch(
      formData.password,
      formData.confirmPassword
    );

    if (formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: passwordError,
      }));
    }
  }, [formData.password, formData.confirmPassword]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    setErrors((prev) => ({
      ...prev,
      [name]: '',
    }));
  }, []);

  const handleSelectChange = useCallback(
    (name, value) => {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));

      if (name === 'adventure') {
        const selectedAdventure = adventures?.find(
          (adventure) => adventure._id === value
        );
        setLocations(selectedAdventure?.location || []);
        setFormData((prev) => ({
          ...prev,
          location: '',
        }));
      }
    },
    [adventures]
  );

  const handleProfileImageChange = useCallback((file) => {
    setFormData((prev) => ({
      ...prev,
      profileImage: file,
    }));
  }, []);

  const handleMediaFilesChange = useCallback((files) => {
    setFormData((prev) => ({
      ...prev,
      mediaFiles: [...prev.mediaFiles, ...files],
    }));
  }, []);

  const handleRemoveMediaFile = useCallback((index) => {
    setFormData((prev) => ({
      ...prev,
      mediaFiles: prev.mediaFiles.filter((_, i) => i !== index),
    }));
  }, []);

  const handleDocumentChange = useCallback((type, file) => {
    setFormData((prev) => ({
      ...prev,
      [type]: file,
    }));

    setErrors((prev) => ({
      ...prev,
      [type]: '',
    }));
  }, []);

  const submitRegistration = async () => {
    const validationErrors = validateFormData(formData);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);

      const firstErrorField = Object.keys(validationErrors)[0];
      const el = document.getElementById(firstErrorField);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
      }

      return null;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Processing your application...');

    try {
      const data = new FormData();
      data.append('name', formData.name.trim());
      data.append('email', formData.email.trim());
      data.append('password', formData.password);
      data.append('confirmPassword', formData.confirmPassword);
      data.append('description', formData.bio.trim());
      data.append('adventure', formData.adventure);
      data.append('location', formData.location);
      data.append('role', formData.role);

      if (formData.profileImage) {
        data.append('profileImage', formData.profileImage);
      }

      if (formData.certificate) {
        data.append('certificate', formData.certificate);
      }

      if (formData.governmentId) {
        data.append('governmentId', formData.governmentId);
      }

      if (formData.mediaFiles?.length > 0) {
        formData.mediaFiles.forEach((file) => {
          data.append('portfolioMedias', file);
        });
      }

      const response = await axiosClient.post(
        '/api/auth/instructor/register',
        data,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      toast.success('Registration successful! Please verify your email.', {
        id: toastId,
      });

      return response.data;
    } catch (error) {
      const status = error?.response?.status;
      const message = error?.response?.data?.message;

      switch (status) {
        case 400:
          toast.error(
            message || 'Invalid input data. Please check all required fields.',
            { id: toastId }
          );
          break;
        case 409:
          toast.error(
            'An account with this email already exists. Please use a different email or try logging in.',
            { id: toastId }
          );
          setErrors((prev) => ({ ...prev, email: 'Email already in use' }));
          break;
        case 413:
          toast.error(
            'File size too large. Please reduce file sizes and try again.',
            { id: toastId }
          );
          break;
        case 500:
          toast.error('Server error. Please try again later.', { id: toastId });
          break;
        default:
          toast.error(message || 'Registration failed. Please try again.', {
            id: toastId,
          });
      }

      return null;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formData,
    errors,
    locations,
    isSubmitting,
    handleInputChange,
    handleSelectChange,
    handleProfileImageChange,
    handleMediaFilesChange,
    handleRemoveMediaFile,
    handleDocumentChange,
    submitRegistration,
  };
};
