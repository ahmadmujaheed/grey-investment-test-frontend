import apiClient from "./apiClient";

export const fetchSuperAdminOverview = async () => {
  const response = await apiClient.get("/analytics/superadmin/overview");
  return response.data;
};
