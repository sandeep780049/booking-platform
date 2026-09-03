import { axiosClient } from '../AxiosClient/axios';

export const getInstructorBadge = async () => {
  const res = await axiosClient.get(`/api/achievement-rules/instructor/achievements`, {
    withCredentials: true,
  });
  return res;
};
