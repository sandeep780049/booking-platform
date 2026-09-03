import { axiosClient } from '../AxiosClient/axios';

export const createAdmin = async (adminData) => {
  const res = await axiosClient.post('/api/admin/create', adminData);
  return res.data;
};

export const fetchAdmins = async ({ search = '', page = 1, limit = 10, role, adminRole } = {}) => {
  const params = { search, page, limit };
  if (role !== undefined && role !== null) params.role = role;
  if (adminRole !== undefined && adminRole !== null) params.adminRole = adminRole;
  const { data } = await axiosClient.get('/api/admin', { params });
  return data;
};

export const updateAdmin = async (adminData) => {
  const res = await axiosClient.put(`/api/admin/${adminData._id}`, adminData);
  return res.data;
};

export const deleteAdmin = async (adminId) => {
  const res = await axiosClient.delete(`/api/admin/${adminId}`);
  return res.data;
};

export const getAdminDashboardStats = async (range = "month", locationId = null) => {
  const params = {}
  if (range) params.range = range
  if (locationId) params.locationId = locationId
  const res = await axiosClient.get("/api/admin/dashboard/stats", { params })
  return res.data
}

export const getAdminDashboardLocations = async () => {
  const res = await axiosClient.get("/api/admin/dashboard/locations", { withCredentials: true })
  return res.data
}
