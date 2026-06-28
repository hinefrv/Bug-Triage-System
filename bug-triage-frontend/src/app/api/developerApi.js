import axiosInstance from "./axiosConfig";

export const getDevelopers = async () => {
    const response = await axiosInstance.get("/v1/developers");
    return response.data;
};

export const getDeveloperById = async (id) => {
    const response = await axiosInstance.get(`/v1/developers/${id}`);
    return response.data;
};
