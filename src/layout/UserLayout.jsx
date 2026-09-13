import { useState, useEffect } from "react";
import {
  LayoutDashboard,
  TrendingUp,
  User,
  Settings,
  Menu,
  X,
  LogOut,
  Bell,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Link, useLocation, Outlet, useNavigate } from "react-router-dom";

// 🔌 Hook into your Zustand Auth Store
import { useAuthStore } from "../store/useAuthStore";
import apiClient from "../api/apiClient";

const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Extract state and logout mechanisms from store
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const isImpersonating = useAuthStore((state) => state.isImpersonating);
  const stopImpersonation = useAuthStore((state) => state.stopImpersonation);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Helper function to extract user name initials for the avatar
  const getUserInitials = () => {
    if (!user?.name) return "UI";
    const names = user.name.trim().split(" ");
    if (names.length > 1) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return names[0].slice(0, 2).toUpperCase();
  };

  // Central handle to manage clearing sessions and navigating away
  const handleLogoutAction = () => {
    logout();
    navigate("/", { replace: true });
  };

  const handleReturnToAdmin = async () => {
    try {
      await apiClient.post("/auth/impersonation/stop");
    } catch (error) {
      console.error("Could not record impersonation stop:", error);
    } finally {
      const auth = useAuthStore.getState();
      const restored = auth.isImpersonating ? stopImpersonation() : auth.user?.role === "superadmin";
      navigate(restored ? "/superadmin/users" : "/", { replace: true });
    }
  };

  // Automatically collapse sidebar on medium screens, and handle mobile breakpoint
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsCollapsed(true);
      } else {
        setIsCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // ✅ ADJUSTED: Tailored specifically for the investor branch paths
  const menuItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
      path: "/user-dashboard", // Main investor home matrix
    },
    {
      id: "investment",
      label: "Investments",
      icon: TrendingUp,
      path: "/user-dashboard/user-investments", // Investor personal asset rosters
    },
    { 
      id: "profile", 
      label: "Profile", 
      icon: User, 
      path: "/user-dashboard/user-profile" 
    },
    {
      id: "settings",
      label: "Settings",
      icon: Settings,
      path: "/user-dashboard/user-settings", // Security settings profile controls
    },
  ];

  return (
    <div className="min-h-screen bg-[#1F1F1F] font-sans antialiased text-[#9CA3AF]">
      {isImpersonating && (
        <div className="fixed top-0 left-0 right-0 z-[60] min-h-10 bg-amber-400 text-slate-950 px-4 py-2 flex items-center justify-center gap-4 text-sm font-bold">
          <span>You are impersonating {user?.name || user?.email}. This session is read-only.</span>
          <button type="button" onClick={handleReturnToAdmin} className="bg-slate-950 text-white px-3 py-1 text-xs uppercase tracking-wide">Return to Admin</button>
        </div>
      )}
      {/* 1. FIXED HEADER */}
      <header className={`fixed ${isImpersonating ? "top-10" : "top-0"} left-0 right-0 h-16 bg-[#1F2937] border-b border-slate-800 z-40 flex items-center justify-between px-6 shadow-sm shadow-[#090A0F]`}>
        <div className="flex items-center gap-4">
          {/* Mobile Hamburger Toggle */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 text-[#9CA3AF] hover:bg-[#090A0F] rounded-xl transition-colors"
          >
            {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-2 text-[#9CA3AF] hover:bg-[#090A0F] rounded-xl transition-colors"
          >
            <Menu size={20} />
          </button>

          {/* Business Logo */}
          <div className="flex items-center gap-2 select-none">
            <div className="w-8 h-8 rounded-lg bg-[#34D399] flex items-center justify-center text-[#090A0F] font-black text-lg">
              G
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              Grey <span className="text-[#34D399]">Investment</span>
            </span>
          </div>
        </div>

        {/* Right Header Controls */}
        <div className="flex items-center gap-4">
          <button className="p-2 text-[#9CA3AF] hover:bg-[#090A0F] rounded-xl relative transition-colors">
            <Bell size={20} />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#3B82F6] rounded-full" />
          </button>

          <div className="h-8 w-px bg-slate-800" />

          {/* 👤 Live Logged-In User Interface Frame */}
          <div className="flex items-center gap-3 bg-[#090A0F]/30 pl-2 pr-3 py-1.5 border border-slate-800/40 rounded-full">
            <div className="w-8 h-8 rounded-full bg-[#090A0F] border border-slate-800 overflow-hidden flex items-center justify-center font-bold text-[#34D399] text-xs uppercase tracking-wider select-none">
              {getUserInitials()}
            </div>
            <div className="flex flex-col">
              <span className="hidden sm:inline text-xs font-bold text-white leading-none">
                {user?.name || "Access User"}
              </span>
              <span className="hidden sm:inline text-[10px] text-[#34D399] font-semibold uppercase tracking-widest mt-0.5 leading-none">
                {user?.role || "user"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* 2. FIXED SIDEBAR (DESKTOP) */}
      <motion.aside
        animate={{ width: isCollapsed ? "5rem" : "16rem" }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`hidden lg:flex flex-col fixed ${isImpersonating ? "top-[6.5rem]" : "top-16"} bottom-0 left-0 bg-[#1F2937] border-r border-slate-800 z-30 overflow-x-hidden justify-between py-6 transition-[top] duration-300`}
      >
        {/* Navigation items */}
        <div className="px-4 space-y-1.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.id}
                to={item.path}
                className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm group transition-all cursor-pointer ${
                  isActive
                    ? "bg-[#34D399] text-[#090A0F]"
                    : "text-[#9CA3AF] hover:bg-[#090A0F] hover:text-white"
                }`}
              >
                <div className="shrink-0">
                  <Icon
                    size={20}
                    className={
                      isActive
                        ? "text-[#090A0F]"
                        : "text-[#9CA3AF] group-hover:text-white"
                    }
                  />
                </div>
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </Link>
            );
          })}
        </div>

        {/* Footer Logout Button (Desktop) */}
        <div className="px-4">
          <button 
            onClick={handleLogoutAction}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm text-rose-400 hover:bg-[#090A0F] transition-colors group cursor-pointer"
          >
            <div className="shrink-0">
              <LogOut
                size={20}
                className="text-rose-400 group-hover:text-rose-500"
              />
            </div>
            {!isCollapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                Logout
              </motion.span>
            )}
          </button>
        </div>
      </motion.aside>

      {/* 3. MOBILE SIDEBAR OVERLAY */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileOpen(false)}
              className="lg:hidden fixed inset-0 bg-[#090A0F]/70 backdrop-blur-sm z-40"
            />
            {/* Drawer */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className={`lg:hidden fixed ${isImpersonating ? "top-10" : "top-0"} bottom-0 left-0 w-64 bg-[#1F2937] border-r border-slate-800 z-50 p-6 flex flex-col justify-between shadow-2xl`}
            >
              <div className="space-y-8">
                {/* Mobile Header Brand */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#34D399] flex items-center justify-center text-[#090A0F] font-black text-lg">
                      G
                    </div>
                    <span className="text-xl font-bold tracking-tight text-white">
                      Grey <span className="text-[#34D399]">Investment</span>
                    </span>
                  </div>
                  <button
                    onClick={() => setIsMobileOpen(false)}
                    className="p-1 rounded-lg hover:bg-[#090A0F]"
                  >
                    <X size={20} className="text-[#9CA3AF]" />
                  </button>
                </div>

                {/* Mobile Menu Items */}
                <div className="space-y-1.5">
                  {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    
                    return (
                      <Link
                        key={item.id}
                        to={item.path}
                        onClick={() => setIsMobileOpen(false)}
                        className={`w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm ${
                          isActive
                            ? "bg-[#34D399] text-[#090A0F]"
                            : "text-[#9CA3AF] hover:bg-[#090A0F] hover:text-white"
                        }`}
                      >
                        <Icon size={20} />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>

              {/* Footer Logout Button (Mobile) */}
              <button 
                onClick={() => {
                  setIsMobileOpen(false);
                  handleLogoutAction();
                }}
                className="w-full flex items-center gap-4 px-4 py-3 rounded-xl font-semibold text-sm text-rose-400 hover:bg-[#090A0F] transition-colors cursor-pointer"
              >
                <LogOut size={20} />
                <span>Logout</span>
              </button>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* 4. DYNAMIC SCROLLABLE CONTENT CANVAS */}
      <motion.main
        animate={{
          paddingLeft:
            typeof window !== "undefined" && window.innerWidth < 1024
              ? "1.5rem"
              : isCollapsed
                ? "6.5rem"
                : "17.5rem",
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        className={`${isImpersonating ? "pt-[7.75rem]" : "pt-21"} pr-6 pb-12 min-h-screen transition-[padding] duration-300`}
      >
        {/* Render child investor pages here inside App.jsx routing configuration */}
        <Outlet />
      </motion.main>
    </div>
  );
};

export default UserLayout;
