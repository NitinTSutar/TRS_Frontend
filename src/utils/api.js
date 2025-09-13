import axios from "axios";
import { BASE_URL } from "./constants";

export const api = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginUser = async (credentials, isMaster = false) => {
  const endpoint = isMaster ? "/api/auth/master-signin" : "/api/auth/signin";
  const { data } = await api.post(endpoint, credentials);
  return data;
};

export const getProfile = async (isMaster = false) => {
  const endpoint = isMaster ? "/api/master/profile" : "/api/auth/profile";
  const { data } = await api.get(endpoint);
  return data;
};