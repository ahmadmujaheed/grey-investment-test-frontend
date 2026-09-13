import apiClient from "./apiClient";

// 1. Fetch All Active/Running Investment Packages (Paginated)
export const fetchAllInvestments = async (page = 1, limit = 10) => {
  const response = await apiClient.get(
    `/investments?page=${page}&limit=${limit}`,
  );
  // console.log(response);
  return response.data;
  // Returns: { data: [...], currentPage, totalPages }
};

// 2. Create a New Investment Package
export const createInvestment = async (formData) => {
  const response = await apiClient.post("/investments", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

// 3. Allocate a User and Amount to a Pool
export const addInvestorToPool = async (investmentId, payload) => {
  const response = await apiClient.post(
    `/investments/${investmentId}/investors`,
    payload,
  );

  return response.data;
};

// 4. End Investment & Share Profits
export const distributeInvestmentProfits = async (
  investmentId,
  distributionData,
) => {
  // distributionData expected structure:
  // { totalProfit: number, companyShare: number, investorShare: number }
  const response = await apiClient.patch(
    `/investments/${investmentId}/share-profit`,
    distributionData,
  );
  return response.data;
};

// 5. ARCHIVE Investment Package
export const archiveInvestmentPackage = async (investmentId) => {
  const response = await apiClient.patch(`/investments/archive`, {
    investmentId,
  });
  return response.data;
};

// 6. FETCH Archived Investment Packages (Paginated)
export const fetchArchivedInvestments = async () => {
  const response = await apiClient.get(
    `/investments/archived`,
  );
  return response.data;
};

// 7. RESTORE Archived Investment to Active
export const restoreInvestmentPackage = async (investmentId) => {
  const response = await apiClient.patch(
    `/investments/${investmentId}/restore`,
  );
  return response.data;
};

// 8. Fetch All Registered Platform Users (Paginated & Excludes Admin)
// Ensure your backend controller filters out the admin role as discussed
export const fetchAllUsers = async (page = 1, limit = 10) => {
  const response = await apiClient.get(`/users?page=${page}&limit=${limit}`);
  return response.data;
};

// 9. Remove User from Investment Pool
export const removeInvestorFromPool = async (investmentId, allocationId) => {
  const response = await apiClient.delete(
    `/investments/${investmentId}/remove-investors`,
    {
      data: { allocationId },
    },
  );

  return response.data;
};

// 10. Edit Investment Package Details (Admin Only)
export const editInvestment = async (investmentId, data) => {
  const response = await apiClient.patch(`/investments/${investmentId}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const resetCompletedInvestment = async (investmentId, password) => {
  const response = await apiClient.patch(
    `/investments/${investmentId}/reset-completed`,
    { password },
  );
  return response.data;
};

export const deleteInvestment = async (investmentId, password) => {
  const response = await apiClient.delete(`/investments/${investmentId}`, {
    data: { password },
  });
  return response.data;
};

export const updateInvestorAmount = async (
  investmentId,
  allocationId,
  amount,
) => {
  const response = await apiClient.patch(
    `/investments/${investmentId}/allocations/${allocationId}`,
    { amount },
  );
  return response.data;
};

// 11. Update Investment Package Status (Admin Only)
export const updateInvestmentStatus = async (investmentId, status) => {
  const response = await apiClient.patch(
    `/investments/${investmentId}/status`,
    { status },
  );
  return response.data;
};

// 12. Fetch Investments for the Logged-in User
export const fetchUserInvestments = async () => {
  const response = await apiClient.get(`/investments/my-investments`);
  // console.log(response)
  return response.data;
};

//13 Fetch Investment Details by ID
export const fetchInvestmentById = async (investmentId) => {
  const response = await apiClient.get(`/investments/${investmentId}`);
  return response.data;
};

//14 Set Withdrawal Limit
export const adminSetWithdrawalAmount = async (payload) => {
  const response = await apiClient.patch("/investments/allocation/withdrawable-limit", payload);
  // console.log("Response from server:", response);
  return response.data;
};
