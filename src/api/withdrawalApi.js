import apiClient from "./apiClient"; // Ensure this points to your configured axios instance

// User: Request a withdrawal
export const requestWithdrawalApi = async (allocationId, data) => {
  const response = await apiClient.post(`/withdrawals/allocation/${allocationId}/request-withdrawal`, data);
  return response.data;
};

// User: Fetch personal withdrawal history
export const fetchUserWithdrawalHistory = async () => {
  const response = await apiClient.get("/withdrawals/my-history");
  //  console.log(response);
  return response.data;

};

// Admin: Get all requests
export const fetchAllWithdrawalsApi = async () => {
  const response = await apiClient.get("/withdrawals");
  // console.log(response);
  return response.data;
};

// In api/withdrawalApi.js
export const adminSetWithdrawalAmount = async (payload) => {
  const response = await apiClient.post("/withdrawals/allocation/withdrawable-limit", payload);
  // console.log("Response from server:", response);
  return response.data;
};


// Admin: Approve Withdrawal
export const approveWithdrawalApi = async (requestId) => {
  const response = await apiClient.patch("/withdrawals/approve", {
    requestId,
  });

  return response.data;
};

// Admin: Reject Withdrawal
export const rejectWithdrawalApi = async (requestId) => {
  const response = await apiClient.patch("/withdrawals/reject", {
    requestId,
  });

  return response.data;
};