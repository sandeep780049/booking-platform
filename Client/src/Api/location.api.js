import { axiosClient } from "../AxiosClient/axios";

export const createLocation = async ({ name, description, position, address }) => {
  const data = {
    name,
    description,
    location: { type: "Point", coordinates: [position[1], position[0]] }, // GeoJSON expects [lng, lat]
    address,
  };
  const res = await axiosClient.post("/api/location", data, { withCredentials: true });
  return res.data;
};

export const updateLocation = async (id, { name, description, position, address }) => {
  const data = {
    name,
    description,
    location: { type: "Point", coordinates: [position[1], position[0]] },
    address,
  };
  const res = await axiosClient.put(`/api/location/${id}`, data, { withCredentials: true });
  return res.data;
};

export const deleteLocation = async (id) => {
  const res = await axiosClient.delete(`/api/location/${id}`, { withCredentials: true });
  return res.data;
};

export const fetchLocations = async () => {
  const res = await axiosClient.get("/api/location", { withCredentials: true });
  return res.data;
};

