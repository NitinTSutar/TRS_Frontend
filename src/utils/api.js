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

// ... (Master api functions)

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
  const { data } = await api.patch(
    `/master/companies/${companyId}`,
    updateData
  );
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

// ... (Admin api functions)

export const getAdminDashboardData = async () => {
  const { data } = await api.get("/admin/dashboard");
  return data;
};

export const getCompanyUsers = async () => {
  const { data } = await api.get("/admin/users");
  return data;
};

export const updateUserByAdmin = async ({ userId, updateData }) => {
  const { data } = await api.patch(`/admin/users/${userId}`, updateData);
  return data;
};

export const getPassengerDetails = async (employeeIds) => {
  const { data } = await api.post("/admin/users/details", { employeeIds });
  return data;
};

export const getAdminTravelRequests = async () => {
  const { data } = await api.get("/admin/travel-requests");
  return data;
};

export const getAdminRequestDetails = async (requestId) => {
  const { data } = await api.get(`/admin/travel-requests/${requestId}`);
  return data;
};

export const addTravelOptions = async ({
  requestId,
  flightOptions,
  hotelOptions,
  cabOptions,
}) => {
  try {
    const { data } = await api.patch(
      `/admin/travel-requests/${requestId}/options`,
      {
        flightOptions,
        hotelOptions,
        cabOptions,
      }
    );
    return data;
  } catch (error) {
    // Log the error for debugging
    console.error("API Error:", error.response?.data || error.message);
    throw error;
  }
};

export const bookTravelRequest = async ({
  requestId,
  bookingData,
  flightFiles,
  hotelFiles,
}) => {
  const { flightBookings, hotelBookings, remarks } = bookingData;

  // Step 1: Upload all flight documents
  const uploadedFlightBookings = await Promise.all(
    (flightBookings || []).map(async (booking, index) => {
      if (flightFiles[index]) {
        const formData = new FormData();
        formData.append("documents", flightFiles[index]);
        const res = await api.post(
          `/admin/travel-requests/${requestId}/upload-documents`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return { ...booking, ticketUrl: res.data.documentUrls[0] };
      }
      return booking;
    })
  );

  // Step 2: Upload all hotel documents
  const uploadedHotelBookings = await Promise.all(
    (hotelBookings || []).map(async (booking, index) => {
      if (hotelFiles[index]) {
        const formData = new FormData();
        formData.append("documents", hotelFiles[index]);
        const res = await api.post(
          `/admin/travel-requests/${requestId}/upload-documents`,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        return { ...booking, confirmationUrl: res.data.documentUrls[0] };
      }
      return booking;
    })
  );

  // Step 3: Submit the booking details with all URLs
  const finalBookingData = {
    remarks,
    flightBookings: uploadedFlightBookings,
    hotelBookings: uploadedHotelBookings,
  };

  const { data } = await api.patch(
    `/admin/travel-requests/${requestId}/book`,
    finalBookingData
  );
  return data;
};

export const getEmployeeRequestDetails = async (requestId) => {
  const response = await api.get(`/employee/travel-requests/${requestId}`);
  return response.data;
};

// ... (Manager api functions)

export const getManagerDashboardData = async () => {
  const { data } = await api.get("/manager/dashboard");
  return data;
};

export const getManagerTravelRequests = async () => {
  const { data } = await api.get("/manager/travel-requests");
  return data;
};

export const getManagerRequestDetails = async (requestId) => {
  const { data } = await api.get(`/manager/travel-requests/${requestId}`);
  return data;
};

export const getManagerTeam = async () => {
  const { data } = await api.get("/manager/team");
  return data;
};

export const approveRequestByManager = async (requestId) => {
  const { data } = await api.patch(
    `/manager/travel-requests/${requestId}/approve`
  );
  return data;
};

export const rejectRequestByManager = async ({
  requestId,
  rejectionReason,
}) => {
  const { data } = await api.patch(
    `/manager/travel-requests/${requestId}/reject`,
    { rejectionReason }
  );
  return data;
};

// ... (Employee api functions)

export const getEmployeeTravelRequests = async () => {
  const { data } = await api.get("/employee/travel-requests");
  return data;
};

export const createTravelRequest = async (requestData) => {
  const { data } = await api.post("/employee/travel-request", requestData);
  return data;
};

export const selectTravelOption = async ({
  requestId,
  selectedFlightOptionIds,
  selectedHotelOptionIds,
}) => {
  const { data } = await api.patch(
    `/employee/travel-requests/${requestId}/select-option`,
    { selectedFlightOptionIds, selectedHotelOptionIds }
  );
  return data;
};

export const uploadEmployeeDocuments = async ({ requestId, formData }) => {
  const { data } = await api.post(
    `/employee/travel-requests/${requestId}/upload-documents`,
    formData,
    {
      headers: { "Content-Type": "multipart/form-data" },
    }
  );
  return data;
};
