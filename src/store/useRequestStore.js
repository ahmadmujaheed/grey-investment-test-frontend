// store/useRequestStore.js
import { create } from "zustand";
import { fetchAllWithdrawalsApi } from "../api/withdrawalApi";

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
}));