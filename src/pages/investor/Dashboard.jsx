import { useEffect, useState } from "react";
import {
  Wallet,
  ShieldCheck,
  TrendingUp,
  Clock,
  RefreshCw,
  Eye,
  ArrowUpRight,
  DollarSign,
} from "lucide-react";
import { Skeleton } from "antd";
import { useAuthStore } from "../../store/useAuthStore";
import { fetchInvestorAnalytics } from "../../api/analyticsApi";
import { fetchUserById } from "../../api/userApi";
import { Link } from "react-router-dom";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const Dashboard = () => {
  const user = useAuthStore((state) => state.user);

  // Adjusted State Schema to align directly with your API response payload
  const [data, setData] = useState({
    cards: {
      activeInvestments: 0,
      availableBalance: 0,
      completedInvestments: 0,
      pendingWithdrawals: 0,
    },
    recentInvestments: [],
    recentTransactions: [],
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 7;

  // const getUser = async () => {
  //   try {
  //     const result = await fetchUserById(user?._id || user?.id);
  //     // console.log("User details fetched:", result);
  //   } catch (err) {
  //     console.error("User fetch error:", err);
  //   }
  // };

  const getAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchInvestorAnalytics();

      // console.log("Fetched analytics data:", result);

      // Using the exact structure from your data object sample
      if (result?.success || result?.status === "success") {
        setData({
          cards: result.cards || {
            activeInvestments: 0,
            availableBalance: 0,
            completedInvestments: 0,
            pendingWithdrawals: 0,
          },
          recentInvestments: result.recentInvestments || [],
          recentTransactions: result.recentTransactions || [],
        });
      }
    } catch (err) {
      console.error("Dashboard calculation error:", err);
      setError(
        err.response?.data?.message || "Failed to sync pipeline analytics.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAnalytics();
    // getUser();
  }, []);

  if (error) {
    return (
      <div className="p-8 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center max-w-xl mx-auto my-12 backdrop-blur-md">
        <p className="text-rose-400 font-medium text-sm">{error}</p>
        <button
          onClick={getAnalytics}
          className="mt-4 px-5 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 rounded-xl text-xs font-bold transition-all flex items-center gap-2 mx-auto cursor-pointer"
        >
          <RefreshCw size={14} /> Retry Connection
        </button>
      </div>
    );
  }

  const { cards, recentInvestments, recentTransactions } = data;

  const renderSkeletonRows = (rows = 3) => {
    return Array.from({ length: rows }).map((_, i) => (
      <tr key={`skeleton-${i}`} className="border-b border-slate-800/40">
        <td className="p-4 pl-6">
          <Skeleton.Input active size="small" style={{ width: 140 }} />
        </td>
        <td className="p-4">
          <Skeleton.Input active size="small" style={{ width: 90 }} />
        </td>
        <td className="p-4">
          <Skeleton.Input active size="small" style={{ width: 90 }} />
        </td>
        <td className="p-4">
          <Skeleton.Input active size="small" style={{ width: 90 }} />
        </td>
        <td className="p-4 pr-6 text-right">
          <Skeleton.Button active size="small" shape="round" />
        </td>
        <td className="p-4 pr-6 text-center">
          <Skeleton.Avatar active size="small" />
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-sans text-slate-200 p-1">
      {/* 🚀 Welcome Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-[#1F2937] to-[#111827] p-8 rounded-2xl border border-slate-800 shadow-xl">
        <h1 className="text-3xl font-extrabold text-white">
          Welcome back,{" "}
          <span className="text-[#34D399]">{user?.name || "Investor"}</span>
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Secure client access portal. Monitoring your asset nodes.
        </p>
      </div>

      {/* 📊 Summary Grid Metrics Card */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Available Balance",
            value: formatCurrency(cards?.availableBalance),
            icon: <Wallet size={18} className="text-[#34D399]" />,
          },
          {
            label: "Active Pools",
            value: cards?.activeInvestments || 0,
            icon: <TrendingUp size={18} className="text-blue-400" />,
          },
          {
            label: "Completed Portfolios",
            value:
              recentInvestments?.filter(
                (inv) => inv.investmentStatus === "completed",
              ).length || 0,
            icon: <ShieldCheck size={18} className="text-indigo-400" />,
          },
          {
            label: "Pending Withdrawals",
            value: cards?.pendingWithdrawals || 0,
            icon: <Clock size={18} className="text-amber-400" />,
          },
        ].map((item, index) => (
          <div
            key={index}
            className="border border-slate-800 bg-[#1F2937] p-5 rounded-xl flex items-center justify-between shadow-md"
          >
            <div>
              <span className="text-[10px] uppercase tracking-wider font-bold block text-[#9CA3AF]">
                {item.label}
              </span>
              <p className="mt-1 text-xl font-bold text-white">
                {item.value}
              </p>
            </div>
            <div className="p-2.5 bg-[#090A0F]/50 border border-slate-800 rounded-lg">
              {item.icon}
            </div>
          </div>
        ))}
      </div>

      {/* 📃 Full Investment Allocation View */}
      <div className="hidden">
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-[#1F2937] to-[#192231]">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Your Capital Allocations
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Comprehensive view of all your active investment pools and total
            asset performance.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#090A0F]/30 text-slate-400 border-b border-slate-800 font-semibold tracking-wider text-[11px] uppercase">
                <th className="p-4 pl-6">Asset Pool Name</th>
                <th className="p-4 text-right">Principal Deposited</th>
                <th className="p-4 text-right">Profit Earned</th>
                <th className="p-4 text-right">Total Value</th>
                <th className="p-4 pr-6 text-right">Status</th>
                <th className="p-4 text-center">View Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-slate-300 bg-[#1F2937]/40">
              {loading ? (
                renderSkeletonRows(3)
              ) : recentInvestments.length > 0 ? (
                recentInvestments.map((investment) => {
                  const totalValue =
                    (investment.principal || 0) +
                    (investment.profitEarned || 0);

                  return (
                    <tr
                      key={investment.allocationId}
                      className="hover:bg-[#090A0F]/20 transition-all"
                    >
                      <td className="p-4 pl-6 font-bold text-white">
                        <div className="flex items-center gap-3">
                          <img
                            src={
                              investment.image.url ||
                              "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=60"
                            }
                            alt={investment.title}
                            className="w-7 h-7 object-cover border border-slate-700 rounded bg-[#090A0F]"
                          />
                          <div>
                            <p className="capitalize">
                              {investment.title || "Asset Pool"}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                              {investment.reference}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 font-mono text-right text-white">
                        {formatCurrency(investment.principal)}
                      </td>
                      <td className="p-4 font-mono text-right text-emerald-400">
                        {formatCurrency(investment.profitEarned)}
                      </td>
                      <td className="p-4 font-mono text-right font-semibold text-white">
                        {formatCurrency(totalValue)}
                      </td>
                      <td className="p-4 pr-6 text-right">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                            investment.investmentStatus === "completed"
                              ? "border-emerald-500/20 bg-emerald-500/10 text-[#34D399]"
                              : "border-slate-700 bg-slate-800 text-yellow-400"
                          }`}
                        >
                          {investment.investmentStatus || "Active"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <Link
                          to={`user-investments/investment/${investment.investmentId}`}
                          state={{ allocationId: investment.allocationId }}
                          className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white inline-block"
                        >
                          <Eye size={16} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="p-8 text-center text-slate-500 italic"
                  >
                    No active investment pools found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔄 Recent Transactions Activity List */}
      <div className="bg-[#1F2937] border border-slate-800/60 rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-[#1F2937] to-[#192231]">
          <h3 className="text-sm font-bold text-white tracking-wide">
            Recent Account Actions
          </h3>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Track your real-time deposits, reinvestments, and withdrawal
            history.
          </p>
        </div>

        <div className="p-4 space-y-4">
          {loading ? (
            <div className="space-y-2">
              <Skeleton active paragraph={{ rows: 2 }} />
            </div>
          ) : (
            (() => {
              // 1. Process & Clean Filter
              const cleanedTransactions = (recentTransactions || [])
                .filter((tx) => {
                  const desc = (tx.description || "").toLowerCase();
                  return (
                    !desc.includes("shared") &&
                    !desc.includes("profit share") &&
                    !desc.includes("yield accrual")
                  );
                })
                // 2. Sort by newest first (using MongoDB _id timestamp generation fallback)
                .sort((a, b) => (b._id || "").localeCompare(a._id || ""));

              if (cleanedTransactions.length === 0) {
                return (
                  <div className="text-center p-8 text-slate-500 italic text-xs">
                    No recent transaction records to show.
                  </div>
                );
              }

              // 3. Dynamic Pagination Mathematics
              const totalPages = Math.ceil(
                cleanedTransactions.length / itemsPerPage,
              );
              const startIndex = (currentPage - 1) * itemsPerPage;
              const paginatedItems = cleanedTransactions.slice(
                startIndex,
                startIndex + itemsPerPage,
              );

              return (
                <>
                  <div className="divide-y divide-slate-800/60 overflow-y-auto custom-scrollbar pr-1">
                    {paginatedItems.map((tx) => {
                      const desc = (tx.description || "").toLowerCase();

                      let badgeColor =
                        "text-blue-400 bg-blue-500/10 border-blue-500/20";
                      let iconColor = "text-blue-400 bg-[#090A0F]";
                      let actionTypeLabel = "Account Action";

                      if (tx.withdrawalRequest || desc.includes("withdraw")) {
                        badgeColor =
                          "text-rose-400 bg-rose-500/10 border-rose-500/20";
                        iconColor = "text-rose-400 bg-rose-950/20";
                        actionTypeLabel = "Withdrawal";
                      } else if (
                        desc.includes("limit") ||
                        desc.includes("eligible")
                      ) {
                        badgeColor =
                          "text-[#34D399] bg-emerald-500/10 border-emerald-500/20";
                        iconColor = "text-[#34D399] bg-emerald-950/20";
                        actionTypeLabel = "Limit Update";
                      } else if (desc.includes("reinvest")) {
                        badgeColor =
                          "text-amber-400 bg-amber-500/10 border-amber-500/20";
                        iconColor = "text-amber-400 bg-amber-950/20";
                        actionTypeLabel = "Reinvestment";
                      } else if (desc.includes("maintenance fee")) {
                        badgeColor =
                          "text-amber-400 bg-amber-500/10 border-amber-500/20";
                        iconColor = "text-amber-400 bg-amber-950/20";
                        actionTypeLabel = "System Maintenance Fee";
                      }

                      return (
                        <div
                          key={tx._id}
                          className="flex items-center justify-between py-3.5 text-xs first:pt-0 last:pb-0 hover:bg-[#090A0F]/10 px-2 rounded-lg transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div
                              className={`p-2 border border-slate-800 rounded-lg shrink-0 ${iconColor}`}
                            >
                              {tx.withdrawalRequest ||
                              desc.includes("withdraw") ? (
                                <ArrowUpRight size={14} />
                              ) : (
                                <DollarSign size={14} />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-white truncate text-[12px] capitalize">
                                {tx.description || `${actionTypeLabel} Managed`}
                              </p>
                              {/* <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                                Ref: {tx._id?.substring(0, 8)}...
                              </p> */}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span className="font-mono font-bold text-white text-right min-w-[70px]">
                              {tx.amount ? formatCurrency(tx.amount) : "—"}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* 🔘 Navigation Tray Component (Renders contextually if total items count is greater than 10) */}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-[11px] text-slate-400 font-medium">
                      <div>
                        Showing{" "}
                        <span className="text-white font-semibold">
                          {startIndex + 1}
                        </span>{" "}
                        to{" "}
                        <span className="text-white font-semibold">
                          {Math.min(
                            startIndex + itemsPerPage,
                            cleanedTransactions.length,
                          )}
                        </span>{" "}
                        of{" "}
                        <span className="text-white font-semibold">
                          {cleanedTransactions.length}
                        </span>{" "}
                        actions
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          disabled={currentPage === 1}
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          className="px-3 py-1.5 bg-[#090A0F]/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="px-2 text-slate-500">
                          Page{" "}
                          <span className="text-slate-300 font-bold">
                            {currentPage}
                          </span>{" "}
                          / {totalPages}
                        </span>
                        <button
                          disabled={currentPage === totalPages}
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages),
                            )
                          }
                          className="px-3 py-1.5 bg-[#090A0F]/40 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 disabled:opacity-30 disabled:hover:bg-transparent transition-all cursor-pointer disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
                      </div>
                    </div>
                  )}
                </>
              );
            })()
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
