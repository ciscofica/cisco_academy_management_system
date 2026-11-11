import axios from "./axios";

export const getUsersRequest = () => axios.get("/users");
export const createUserRequest = (data) => axios.post("/users", data);
export const updateUserRequest = (id, data) => axios.put(`/users/${id}`, data);
