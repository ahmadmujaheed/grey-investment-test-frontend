import { useEffect, useState } from "react";
import { Activity, Banknote, Crown, ShieldCheck, TrendingUp, Users } from "lucide-react";
import { Link } from "react-router-dom";
import { message } from "antd";
import { fetchSuperAdminOverview } from "../api/superAdminApi";

const money = (value = 0) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(Number(value) || 0);
const when = (value) => value ? new Date(value).toLocaleString("en-GB") : "—";

const SuperAdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSuperAdminOverview()
      .then(setData)
      .catch((error) => message.error(error.response?.data?.message || "Unable to load system overview."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="py-20 text-center text-violet-300">Loading complete system overview...</div>;

  const overview = data?.overview || {};
  const cards = [
    { label: "Investors", value: overview.users || 0, icon: Users },
    { label: "Administrators", value: overview.admins || 0, icon: ShieldCheck },
    { label: "Investment Pools", value: overview.investments?.count || 0, icon: TrendingUp },
    { label: "Total Principal", value: money(overview.allocations?.principal), icon: Banknote },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between"><div><div className="flex items-center gap-2 text-violet-400"><Crown size={18} /><span className="text-xs font-black uppercase tracking-[0.2em]">Platform authority</span></div><h1 className="mt-2 text-3xl font-black text-white">Complete System Overview</h1><p className="mt-2 text-sm text-slate-400">Platform health, financial exposure, admin activity, and privileged access.</p></div><Link to="/superadmin/users" className="bg-violet-500 px-5 py-3 text-center text-sm font-black text-white hover:bg-violet-400">Open Investor Access</Link></div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(({ label, value, icon: Icon }) => <div key={label} className="border border-violet-900/50 bg-[#181126] p-5"><Icon className="text-violet-400" size={20} /><p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 text-2xl font-black text-white">{value}</p></div>)}</div>

      <div className="grid gap-4 md:grid-cols-3"><div className="border border-violet-900/50 bg-[#181126] p-5"><p className="text-xs uppercase text-slate-500">Allocated Capital</p><p className="mt-2 text-xl font-black text-emerald-400">{money(overview.investments?.allocated)}</p></div><div className="border border-violet-900/50 bg-[#181126] p-5"><p className="text-xs uppercase text-slate-500">Recorded Profit</p><p className="mt-2 text-xl font-black text-violet-400">{money(overview.allocations?.profit)}</p></div><div className="border border-violet-900/50 bg-[#181126] p-5"><p className="text-xs uppercase text-slate-500">Pending Withdrawals</p><p className="mt-2 text-xl font-black text-amber-400">{overview.withdrawals?.pending?.count || 0} · {money(overview.withdrawals?.pending?.amount)}</p></div></div>

      <section className="border border-violet-900/50 bg-[#181126]"><div className="flex items-center gap-2 border-b border-violet-900/50 px-5 py-4"><Activity className="text-violet-400" size={18} /><h2 className="font-black text-white">Recent Admin Activity</h2></div><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-xs"><thead className="bg-[#110d1b] uppercase text-slate-500"><tr><th className="p-4">Administrator</th><th className="p-4">Action</th><th className="p-4">Route</th><th className="p-4">Result</th><th className="p-4">Time</th></tr></thead><tbody className="divide-y divide-violet-900/30">{(data?.recentAdminActivity || []).map((item) => <tr key={item._id}><td className="p-4"><p className="font-bold text-white">{item.actor?.name || "Unknown"}</p><p className="text-slate-500">{item.actor?.email}</p></td><td className="p-4 font-bold text-violet-300">{item.method}</td><td className="p-4 font-mono text-slate-300">{item.route}</td><td className={`p-4 font-bold ${item.statusCode < 400 ? "text-emerald-400" : "text-rose-400"}`}>{item.statusCode}</td><td className="p-4 text-slate-500">{when(item.createdAt)}</td></tr>)}{!data?.recentAdminActivity?.length && <tr><td colSpan={5} className="p-8 text-center text-slate-500">Admin actions will appear here after this update is running.</td></tr>}</tbody></table></div></section>

      <section className="border border-violet-900/50 bg-[#181126]"><div className="border-b border-violet-900/50 px-5 py-4"><h2 className="font-black text-white">Impersonation History</h2></div><div className="divide-y divide-violet-900/30">{(data?.recentImpersonations || []).map((item) => <div key={item._id} className="flex flex-col gap-1 px-5 py-4 text-sm md:flex-row md:items-center md:justify-between"><span><strong className="text-white">{item.admin?.email || "Superadmin"}</strong> {item.action} impersonating <strong className="text-violet-300">{item.targetUser?.email || "Unknown user"}</strong></span><span className="text-xs text-slate-500">{when(item.createdAt)}</span></div>)}{!data?.recentImpersonations?.length && <p className="p-8 text-center text-sm text-slate-500">No impersonation history yet.</p>}</div></section>
    </div>
  );
};

export default SuperAdminDashboard;
