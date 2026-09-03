import { axiosClient } from '../AxiosClient/axios';

export const fetchRegistrationLimits = async () => {
  const { data } = await axiosClient.get('/api/registration-limits');
  return data;
};

export const createRegistrationLimit = async (limitData) => {
  const { data } = await axiosClient.post(
    '/api/registration-limits',
    limitData
  );
  return data;
};

export const updateRegistrationLimit = async (id, limitData) => {
  const { data } = await axiosClient.put(
    `/api/registration-limits/${id}`,
    limitData
  );
  return data;
};

export const deleteRegistrationLimit = async (id) => {
  const { data } = await axiosClient.delete(`/api/registration-limits/${id}`);
  return data;
};

export const getLimitByAdventureLocation = async (adventureId, locationId) => {
  const { data } = await axiosClient.get(
    `/api/registration-limits/${adventureId}/${locationId}`
  );
  return data;
};

export const moveInstructorFromWaitlist = async (limitId, instructorId) => {
  const { data } = await axiosClient.post(
    '/api/registration-limits/move-from-waitlist',
    {
      limitId,
      instructorId,
    }
  );
  return data;
};
