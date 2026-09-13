import apiClient from "./apiClient";

/**
 * Register a new user account
 * @param {Object} userData - { name, email, password }
 */
export const registerUser = async (userData) => {
  const response = await apiClient.post("/auth/register", userData);
  return response.data;
};

/**
 * Log in an existing user
 * @param {Object} credentials - { email, password }
 */
export const loginUser = async (credentials) => {
  const response = await apiClient.post("/auth/login", credentials);
  return response.data;
};

/**
 * Fetch the authenticated user's profile details using token context
 */
export const getUserProfile = async () => {
  const response = await apiClient.get("/auth/profile");
  return response.data;
};

export const updateMyProfile = async (profileData) => {
  const response = await apiClient.patch("/auth/profile", profileData);
  return response.data;
};

/**
 * Updates the logged-in user's account password credentials safely.
 * @param {Object} passwordData - Container holding currentPassword and newPassword strings
 * @returns {Promise<Object>} Backend node execution data payload
 */
export const updateUserPassword = async (passwordData) => {
  const response = await apiClient.patch(
    "/auth/change-password",
    passwordData,
    { withCredentials: true },
  );
  return response.data;
};
