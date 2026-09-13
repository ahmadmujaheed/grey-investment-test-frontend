import { useState } from "react";
import { Crown, LayoutDashboard, LogOut, Menu, Users } from "lucide-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

const SuperAdminLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const items = [
    { label: "Overview", path: "/superadmin", icon: LayoutDashboard },
    { label: "Investor Access", path: "/superadmin/users", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#110d1b] text-slate-300">
      <header className="fixed inset-x-0 top-0 z-40 h-16 border-b border-violet-900/50 bg-[#181126] px-6 flex items-center justify-between">
        <div className="flex items-center gap-3"><button type="button" onClick={() => setIsCollapsed((value) => !value)} title={isCollapsed ? "Open sidebar" : "Close sidebar"} className="p-2 text-slate-400 hover:bg-violet-950 hover:text-white"><Menu size={20} /></button><Crown className="text-violet-400" size={24} /><div><p className="font-black text-white">Grey Control</p><p className="text-[9px] uppercase tracking-[0.25em] text-violet-400">Superadmin Console</p></div></div>
        <div className="text-right"><p className="text-sm font-bold text-white">{user?.name}</p><p className="text-[10px] uppercase text-violet-400">Superadmin</p></div>
      </header>
      <aside className={`fixed left-0 top-16 bottom-0 ${isCollapsed ? "w-20" : "w-64"} border-r border-violet-900/50 bg-[#181126] p-4 flex flex-col justify-between transition-[width] duration-300`}>
        <nav className="space-y-2">{items.map(({ label, path, icon: Icon }) => <Link key={path} to={path} title={isCollapsed ? label : undefined} className={`flex items-center gap-3 px-4 py-3 text-sm font-bold ${isCollapsed ? "justify-center" : ""} ${location.pathname === path ? "bg-violet-500 text-white" : "text-slate-400 hover:bg-violet-950/50 hover:text-white"}`}><Icon className="shrink-0" size={18} />{!isCollapsed && label}</Link>)}</nav>
        <button title={isCollapsed ? "Logout" : undefined} onClick={() => { logout(); navigate("/", { replace: true }); }} className={`flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-400 hover:bg-rose-950/30 ${isCollapsed ? "justify-center" : ""}`}><LogOut className="shrink-0" size={18} />{!isCollapsed && "Logout"}</button>
      </aside>
      <main className={`min-h-screen ${isCollapsed ? "pl-28" : "pl-72"} pr-8 pt-24 pb-12 transition-[padding] duration-300`}><Outlet /></main>
    </div>
  );
};

export default SuperAdminLayout;
