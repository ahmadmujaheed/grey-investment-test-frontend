// store/useRequestStore.js
import { create } from "zustand";
import { fetchAllWithdrawalsApi, fetchApprovedWithdrawalTotalApi } from "../api/withdrawalApi";

export const useRequestStore = create((set) => ({
  requests: [],
  // Fetch and update the list
  fetchRequests: async () => {
    try {
      const data = await fetchAllWithdrawalsApi();
      set({ requests: data });
    } catch (error) {
      console.error("Failed to fetch requests", error);
    }
  },
  // Remove a request locally after approval/rejection
  removeRequest: (id) => set((state) => ({ 
    requests: state.requests.filter((r) => r._id !== id) 
  })),


  getApprovedWithdrawalTotal:async (investmentId, userId = null)=>{
    set({loadingTotal:true, error:null});
    try {
      const res = await fetchApprovedWithdrawalTotalApi(investmentId, userId);
      if(res.success){
        set({totalSummary: res.data, loadingTotal:false});
      }
    } catch (err) {
      set({
        error:err.response?.data?.message || "Failed to fetch total",
        loadingTotal: false,
      });
    }
  }
}));