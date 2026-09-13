import apiClient from "./apiClient";

// 👥 1. Fetch All Registered Platform Users with Aggregated Metrics
export const fetchAllUsers = async () => {
  const response = await apiClient.get("/users");
  // console.log(response);
  return response.data;
};

// 👤 2. Fetch Single User Profile Workspace Node by ID
export const fetchUserById = async (userId) => {
  const response = await apiClient.get(`/users/${userId}`);
  // console.log(response)
  return response.data;
};

// 🆕 3. Provision a New Investor Profile
export const createUser = async (userData) => {
  // userData structure: { name, email, phone }
  const response = await apiClient.post("/users", userData);
  // console.log(response);
  return response.data;
};

// 🔒 4. Change Password (First Login or Standard Security Update)
export const updateUserPassword = async (passwordPayload) => {
  // passwordPayload structure: { currentPassword, newPassword }
  const response = await apiClient.put(
    "/users/change-password",
    passwordPayload,
  );
  return response.data;
};

// Inside ../api/userApi.js
export const resetUserPassword = async (payload) => {
  const response = await apiClient.put(
    "/auth/reset-password",
    payload
  );

  return response.data;
};

export const updateUser = async (payload) => {
  const response = await apiClient.patch(
    "/users/update",
    payload
  );

  return response.data;
};

export const deleteUser = async (userId, password) => {
  const response = await apiClient.delete(`/users/${userId}`, {
    data: { password },
  });
  return response.data;
};

export const chargeUserMaintenanceFee = async (userId, payload) => {
  const response = await apiClient.post(`/users/${userId}/maintenance-fee`, payload);
  return response.data;
};

export const chargeAllMaintenanceFee = async (payload) => {
  const response = await apiClient.post("/users/maintenance-fee/all", payload);
  return response.data;
};

export const impersonateUser = async (userId, password) => {
  const response = await apiClient.post("/auth/impersonate", { userId, password });
  return response.data;
};
