import { axiosClient } from "../AxiosClient/axios";

export const createCategory = async (category) => {
    const res = await axiosClient.post("/api/category", { name: category });
    return res;
}

export const getCategories = async () => {
    const res = await axiosClient.get("/api/category");
    return res;
}