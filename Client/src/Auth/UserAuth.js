import {
  loginStart,
  loginSuccess,
  setUser,
  logout,
} from '../Store/UserSlice.js';
import { axiosClient } from '../AxiosClient/axios.js';
import { data } from 'react-router-dom';

export const UserRegister = async (data) => {
  try {
    const res = await axiosClient.post('/api/auth/signUp', data, {
      withCredentials: true,
    });
    return { success: true, status: res.status, data: res.data };
  } catch (err) {
    throw err;
  }
};

export const VerifyUser = async (data, dispatch) => {
  try {
    const res = await axiosClient.post('/api/auth/verifyOtp', data, {
      withCredentials: true,
    });
    if (res.status === 200 && dispatch) {
      const accessToken = res.data?.data?.accessToken;
      const refreshToken = res.data?.data?.user?.refreshToken;
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      dispatch(loginSuccess(res.data.data));
    }
    return { success: true, status: res.status, data: res.data };
  } catch (err) {
    throw err;
  }
};

export const UserLogin = async (data, dispatch) => {
  try {
    const res = await axiosClient.post('/api/auth/login', data, {
      withCredentials: true,
    });
    if (res.data.statusCode === 200 || res.status === 200) {
      // Persist the actual access token (not the refresh token) so the axios
      // interceptor sends the correct credential in the Authorization header.
      const accessToken = res.data?.data?.accessToken;
      const refreshToken = res.data?.data?.user?.refreshToken;
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      if (refreshToken) localStorage.setItem('refreshToken', refreshToken);
      dispatch(loginSuccess(res.data.data.user));
      return { success: true, status: res.status, data: res.data };
    }
    return { success: false, status: res.status, data: res.data };
  } catch (err) {
    throw err;
  }
};

export const ResendOtp = async (email) => {
  try {
    const data = { email: email };
    const res = await axiosClient.post('/api/auth/resendOtp', data);
    return { success: true, status: res.status, data: res.data };
  } catch (err) {
    throw err;
  }
};

export const ForgotPass = async (email) => {
  try {
    const data = { email: email };
    const res = await axiosClient.post('/api/auth/forgotPassword', data);
    return res;
  } catch (err) {
    return err;
  }
};

export const UpdatePass = async (data) => {
  try {
    const res = await axiosClient.post('/api/auth/updatePassword', data);
    return res;
  } catch (err) {
    return err;
  }
};

export const VerifyNewEmail = async (data) => {
  try {
    const res = await axiosClient.post(
      '/api/auth/verifyNewEmail',
      { newEmail: data },
      {
        withCredentials: true,
      }
    );
    if (res.status === 200) {
      return res;
    } else {
      return res.status;
    }
  } catch (err) {
    if (err.response) {
      return err.response.status;
    }
  }
};

export const UpdateEmail = async (data) => {
  try {
    const res = await axiosClient.post('/api/auth/updateEmail', data, {
      withCredentials: true,
    });
    if (res.status === 200) {
      return res;
    } else {
      return res.status;
    }
  } catch (err) {
    if (err.response) {
      return err.response.status;
    }
  }
};

export const UpdatePassword = async (data) => {
  try {
    const res = await axiosClient.post('/api/auth/updatePassword', data, {
      withCredentials: true,
    });
    if (res.status === 200) {
      return res;
    } else {
      return res.status;
    }
  } catch (err) {
    if (err.response) {
      return err;
    }
  }
};

export const GoogleLoginSuccess = async (response, dispatch) => {
  try {
    const res = await axiosClient.post(
      '/api/auth/signInWithGoogle',
      { token: response.credential },
      { withCredentials: true }
    );
    if (res.data) {
      const accessToken = res.data?.data?.accessToken;
      if (accessToken) localStorage.setItem('accessToken', accessToken);
      dispatch(loginSuccess(res.data.data));
      return { success: true, status: res.status, data: res.data };
    }
    return { success: false, status: res.status, data: res.data };
  } catch (err) {
    throw err;
  }
};

export const userLogout = async (dispatch) => {
  try {
    await axiosClient.post(
      '/api/auth/logout',
      {},
      {
        withCredentials: true,
      }
    );
    dispatch(logout());
    // Clear localStorage to fully logout
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('redirectAfterLogin');
    return 200;
  } catch (error) {
    // Even on error, clear localStorage
    dispatch(logout());
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('redirectAfterLogin');
    return error;
  }
};
