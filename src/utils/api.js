import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3000/api",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export const loginUser = async (credentials, isMaster = false) => {
  const endpoint = isMaster ? "/auth/master-signin" : "/auth/signin";
  const { data } = await api.post(endpoint, credentials);
  return data;
};

export const getProfile = async (isMaster = false) => {
  const endpoint = isMaster ? "/master/profile" : "/auth/profile";
  const { data } = await api.get(endpoint);
  return data;
};

export const signupUser = async (userData) => {
  const { data } = await api.post("/auth/signup", userData);
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

export const getMasterDashboardData = async () => {
  const { data } = await api.get("/master/dashboard");
  return data;
};

export const getCompanies = async () => {
  const { data } = await api.get("/master/companies");
  return data;
};

export const getCompanyDetails = async (companyId) => {
  const { data } = await api.get(`/master/companies/${companyId}`);
  return data;
};

export const updateCompanyDetails = async ({ companyId, updateData }) => {
  const { data } = await api.patch(`/master/companies/${companyId}`, updateData);
  return data;
};

export const createCompany = async (companyData) => {
  const { data } = await api.post("/master/create-company", companyData);
  return data;
};

export const updateProfile = async (updateData, isMaster = false) => {
  const endpoint = isMaster ? "/master/edit-profile" : "/auth/profile";
  const { data } = await api.patch(endpoint, updateData);
  return data;
};
