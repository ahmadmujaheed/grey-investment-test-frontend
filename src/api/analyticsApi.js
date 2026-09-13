import apiClient from "./apiClient";

/**
 * 📊 Fetch system-wide analytical metrics summaries and timeline chart data feeds (Admin Only)
 * @returns {Promise<Object>} Processed dashboard payload mapping complete DB states
 */
export const fetchDashboardAnalytics = async () => {
  const response = await apiClient.get("/analytics/admin/dashboard");
  // console.log(response);
  return response.data;
};

export const fetchDashboardAnalyticsChart = async () => {
  const response = await apiClient.get("/analytics/admin/dashboard/charts");
  // console.log(response);
  return response.data;
};

/**
 * 📈 Fetch isolated, token-specific metrics for individual investor control panels (Investor Only)
 * @returns {Promise<Object>} Tailored metric payload with personal capital entries
 */
export const fetchInvestorAnalytics = async () => {
  const response = await apiClient.get("/analytics/dashboard");
  // console.log(response)
  return response.data;
};