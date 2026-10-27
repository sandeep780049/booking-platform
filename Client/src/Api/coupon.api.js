import { axiosClient } from '../AxiosClient/axios';

// Validate a coupon against a booking amount before checkout
export const validateCoupon = async ({ code, amount }) => {
  const { data } = await axiosClient.post(
    '/api/coupons/validate',
    { code, amount },
    { withCredentials: true }
  );
  return data;
};
