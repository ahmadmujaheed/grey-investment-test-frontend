import { create } from "zustand";
import axios from "axios";

export const useAuthStore = create((set, get) => ({
  // Base config parameters
  // baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api",
   baseUrl: import.meta.env.VITE_API_BASE_URL || "https://grey-investment-server.onrender.com/api",
  
  // Auth state variables - Now pulling safely from sessionStorage
  token: sessionStorage.getItem("auth_token") || null,
  user: sessionStorage.getItem("auth_user") ? JSON.parse(sessionStorage.getItem("auth_user")) : null,
  isAuthenticated: !!sessionStorage.getItem("auth_token"),
  loading: false,
  isImpersonating: sessionStorage.getItem("impersonation_active") === "true",
  impersonatedUser: sessionStorage.getItem("impersonation_user")
    ? JSON.parse(sessionStorage.getItem("impersonation_user"))
    : null,


  /**
   * Fetches the current user from the server to sync state
   */
checkAuth: async () => {
  set({ loading: true });
  try {
    const res = await axios.get(`${get().baseUrl}/auth/profile`, {
      headers: { Authorization: `Bearer ${get().token}` }
    });
    const user = res.data.user;
    sessionStorage.setItem("auth_user", JSON.stringify(user));
    set({ user, isAuthenticated: true });
    return user;
  } catch (error) {
    console.error("Auth check failed:", error);
    if (!get().isImpersonating || !get().stopImpersonation()) {
      get().logout();
    }
    throw error;
  } finally {
    set({ loading: false });
  }
},

  /**
   * Complete login session by storing tokens and profile context in sessionStorage
   */
  setAuthSession: (token, user) => {
    if (!token) {
      console.error("setAuthSession received an undefined or null token!");
    }
    
    // A normal login always starts a clean session. This also recovers from
    // an interrupted or expired impersonation flow.
    sessionStorage.removeItem("admin_auth_token");
    sessionStorage.removeItem("admin_auth_user");
    sessionStorage.removeItem("impersonation_active");
    sessionStorage.removeItem("impersonation_user");
    sessionStorage.setItem("auth_token", token);
    sessionStorage.setItem("auth_user", JSON.stringify(user));
    
    set({
      token,
      user,
      isAuthenticated: !!token,
      isImpersonating: false,
      impersonatedUser: null,
    });
  },

  startImpersonation: (token, user) => {
    const { token: adminToken, user: adminUser } = get();
    if (import.meta.env.DEV) {
      console.info("[IMPERSONATION] Session switch requested", {
        hasSuperadminToken: Boolean(adminToken),
        currentRole: adminUser?.role || null,
        hasImpersonationToken: Boolean(token),
        targetRole: user?.role || null,
        targetUserId: user?.id || user?._id || null,
      });
    }
    if (
      !adminToken ||
      adminUser?.role !== "superadmin" ||
      !token ||
      user?.role !== "user"
    ) {
      if (import.meta.env.DEV) {
        console.warn("[IMPERSONATION] Session switch validation failed");
      }
      return false;
    }

    // Overwrite any stale backup left by an interrupted earlier attempt with
    // the currently authenticated superadmin session.
    sessionStorage.setItem("admin_auth_token", adminToken);
    sessionStorage.setItem("admin_auth_user", JSON.stringify(adminUser));
    sessionStorage.setItem("impersonation_active", "true");
    sessionStorage.setItem("impersonation_user", JSON.stringify(user));
    sessionStorage.setItem("auth_token", token);
    sessionStorage.setItem("auth_user", JSON.stringify(user));
    set({ token, user, isAuthenticated: true, isImpersonating: true, impersonatedUser: user });
    if (import.meta.env.DEV) {
      console.info("[IMPERSONATION] Session switch completed", {
        activeRole: user.role,
        isImpersonating: true,
      });
    }
    return true;
  },

  stopImpersonation: () => {
    const adminToken = sessionStorage.getItem("admin_auth_token");
    const adminUserValue = sessionStorage.getItem("admin_auth_user");
    const adminUser = adminUserValue ? JSON.parse(adminUserValue) : null;

    sessionStorage.removeItem("admin_auth_token");
    sessionStorage.removeItem("admin_auth_user");
    sessionStorage.removeItem("impersonation_active");
    sessionStorage.removeItem("impersonation_user");

    if (!adminToken || !adminUser) {
      get().logout();
      return false;
    }

    sessionStorage.setItem("auth_token", adminToken);
    sessionStorage.setItem("auth_user", JSON.stringify(adminUser));
    set({ token: adminToken, user: adminUser, isAuthenticated: true, isImpersonating: false, impersonatedUser: null });
    return true;
  },

  /**
   * Update the cached user state properties cleanly in memory and sessionStorage
   */
  updateUserContext: (updatedUserFields) => {
    const currentSessionUser = get().user;
    const freshUserData = { ...currentSessionUser, ...updatedUserFields };
    
    sessionStorage.setItem("auth_user", JSON.stringify(freshUserData));
    set({ user: freshUserData });
  },

  /**
   * Clear the entire auth session and wipe sessionStorage details on logout
   */
  logout: () => {
    console.trace("Logout called from:");
    sessionStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_user");
    sessionStorage.removeItem("admin_auth_token");
    sessionStorage.removeItem("admin_auth_user");
    sessionStorage.removeItem("impersonation_active");
    sessionStorage.removeItem("impersonation_user");
    
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isImpersonating: false,
      impersonatedUser: null,
    });
  },
}));
