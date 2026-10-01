import apiClient from "./apiClient";

export const fetchMaintenanceFeeHistory = async () => {
  const response = await apiClient.get("/settings/maintenance-fees/history");
  return response.data;
};

export const recordMaintenanceFeePayout = async (payout) => {
  const response = await apiClient.post("/settings/maintenance-fees/payouts", payout);
  return response.data;
};
