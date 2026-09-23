import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { message, Tag, Skeleton, Pagination } from "antd";
import { Wallet, TrendingUp, ShieldCheck, Eye } from "lucide-react";
import { fetchUserInvestments } from "../../api/investmentApi";

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [investmentsummary, setInvestmentsummary] = useState({
    totalPrincipal: 0,
    totalYield: 0,
    activePoolsCount: 0,
  });
  const [loading, setLoading] = useState(true);

  // Pagination States (Syncing state variables directly with the API payload)
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 6;

  const [selectedInv, setSelectedInv] = useState(null);

  // Load and refresh investments when the page changes
  const loadInvestments = async (page) => {
    try {
      setLoading(true);
      // Execute the API request passing current page index and item constraints
      const res = await fetchUserInvestments(page, pageSize);
      // console.log(res)
      setInvestments(res.investments || []);
      setTotalCount(res.count || 0);

      setInvestmentsummary(
        res.summary || {
          totalPrincipal:
            res.investments?.reduce(
              (acc, curr) => acc + (curr.principal || 0),
              0,
            ) || 0,
          totalYield:
            res.investments?.reduce(
              (acc, curr) => acc + (curr.profitEarned || 0),
              0,
            ) || 0,
          activePoolsCount:
            res.investments?.filter((inv) => inv.allocationStatus === "active")
              .length || 0,
        },
      );
    } catch (err) {
      message.error("Could not load investment data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments(currentPage);
  }, [currentPage]);

  // Adjust handleWithdrawal code wrapper as needed
  const handleWithdraw = async (e) => {
    e.preventDefault();
    // ... rest of your withdraw flow execution
  };

  // Color Mapping matching your actual API investmentStatus keys
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "orange";
      case "completed":
        return "green";
      case "paused":
        return "volcano";
      case "active":
        return "blue";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-8 sm:px-6 py-4">
      {/* Metrics Section */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <StatCard
          title="Total Money Invested"
          value={`₦${investmentsummary.totalPrincipal.toLocaleString()}`}
          icon={<Wallet className="w-5 h-5 text-emerald-400" />}
          gradient="from-emerald-500/10 to-transparent"
        />
        <StatCard
          title="Total Profit"
          value={`₦${investmentsummary.totalYield.toLocaleString()}`}
          icon={<TrendingUp className="w-5 h-5 text-emerald-400" />}
          gradient="from-emerald-500/10 to-transparent"
          highlight={true}
        />
        <StatCard
          title="Active Pools"
          value={investmentsummary.activePoolsCount}
          icon={<ShieldCheck className="w-5 h-5 text-emerald-400" />}
          gradient="from-emerald-500/10 to-transparent"
        />
      </div>

      {/* Investments Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-[#0b0d16] p-4 border border-slate-900 rounded-lg space-y-3"
            >
              <Skeleton active paragraph={{ rows: 3 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-8">
          {investments.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-lg bg-[#06070c]">
              <p className="text-slate-500 text-sm">
                No active investments found.
              </p>
            </div>
          ) : (
            <>
              {(() => {
                const withdrawableInvestments = investments.filter(
                  (inv) => Number(inv.withdrawableLimit || 0) > 0,
                );
                const otherInvestments = investments.filter(
                  (inv) => Number(inv.withdrawableLimit || 0) <= 0,
                );

                return (
                  <>
                    {/* Withdrawable investments — intentionally compact */}
                    {withdrawableInvestments.length > 0 && (
                      <section className="space-y-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-sm font-bold text-white">
                              Withdrawable Investments
                            </h3>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              Investments with a withdrawable limit set by the admin.
                            </p>
                          </div>
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-400/10 border border-emerald-400/15 px-2 py-1 rounded-full">
                            {withdrawableInvestments.length} Available
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                          <AnimatePresence mode="popLayout">
                            {withdrawableInvestments.map((inv) => (
                              <motion.div
                                key={inv.allocationId}
                                layout
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 8 }}
                                transition={{ duration: 0.2 }}
                                className="group relative border border-emerald-500/15 hover:border-emerald-500/35 bg-[#06070c] rounded-lg p-3 flex flex-col justify-between transition-all duration-200 shadow-lg"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="min-w-0">
                                    <Tag
                                      color={getStatusColor(inv.investmentStatus)}
                                      className="px-1.5 py-0 rounded text-[8px] uppercase font-bold tracking-wider m-0"
                                    >
                                      {inv.investmentStatus || "Active"}
                                    </Tag>
                                    <h4 className="font-bold text-white text-sm truncate tracking-wide pt-1.5 group-hover:text-emerald-400 transition-colors capitalize">
                                      {inv.title}
                                    </h4>
                                  </div>
                                  <Link
                                    to={`investment/${inv.investmentId}`}
                                    className="shrink-0 p-1.5 bg-slate-900/80 text-slate-400 hover:text-white rounded-md border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center"
                                    title="View Details"
                                  >
                                    <Eye size={13} />
                                  </Link>
                                </div>

                                <div className="mt-3 rounded-md bg-[#0a0c14] border border-slate-900 p-2.5">
                                  <p className="text-[9px] text-emerald-500/80 uppercase tracking-wider font-semibold">
                                    Withdrawable Limit
                                  </p>
                                  <p className="text-lg font-black text-emerald-400 mt-0.5 leading-tight">
                                    ₦{Number(inv.withdrawableLimit || 0).toLocaleString()}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2 mt-2.5">
                                  <div>
                                    <p className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">
                                      Available
                                    </p>
                                    <p className="text-xs font-bold text-slate-100 mt-0.5">
                                      ₦{Number(inv.availableToWithdraw || 0).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-[8px] text-slate-500 uppercase tracking-wider font-semibold">
                                      Profit
                                    </p>
                                    <p className="text-xs font-bold text-emerald-400 mt-0.5">
                                      +₦{Number(inv.profitEarned || 0).toLocaleString()}
                                    </p>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </section>
                    )}

                    {/* Investments without a withdrawable limit */}
                    {otherInvestments.length > 0 && (
                      <section className="space-y-3">
                        <div>
                          <h3 className="text-sm font-bold text-white">
                            Other Investments
                          </h3>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Investments that currently have no withdrawable limit.
                          </p>
                        </div>

                        <div className="overflow-x-auto border border-slate-800 rounded-lg bg-[#06070c]">
                          <table className="w-full min-w-[720px] text-left">
                            <thead className="bg-[#0a0c14] border-b border-slate-800">
                              <tr>
                                <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                  Investment
                                </th>
                                <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                  Principal
                                </th>
                                <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                  Profit
                                </th>
                                <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                  Total Value
                                </th>
                                <th className="px-4 py-3 text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                  Status
                                </th>
                                <th className="px-4 py-3 text-right text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                  Action
                                </th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900">
                              {otherInvestments.map((inv) => (
                                <tr
                                  key={inv.allocationId}
                                  className="hover:bg-slate-900/30 transition-colors"
                                >
                                  <td className="px-4 py-3">
                                    <p className="text-xs font-semibold text-white">
                                      {inv.title}
                                    </p>
                                  </td>
                                  <td className="px-4 py-3 text-xs font-semibold text-slate-200">
                                    ₦{Number(inv.principal || 0).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3 text-xs font-semibold text-emerald-400">
                                    +₦{Number(inv.profitEarned || 0).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3 text-xs font-semibold text-indigo-300">
                                    ₦{Number(inv.totalValue || (Number(inv.principal || 0) + Number(inv.profitEarned || 0))).toLocaleString()}
                                  </td>
                                  <td className="px-4 py-3">
                                    <Tag
                                      color={getStatusColor(inv.investmentStatus)}
                                      className="px-1.5 py-0 rounded text-[8px] uppercase font-bold tracking-wider m-0"
                                    >
                                      {inv.investmentStatus || "Active"}
                                    </Tag>
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <Link
                                      to={`investment/${inv.investmentId}`}
                                      className="inline-flex items-center gap-1.5 text-[10px] font-bold text-slate-300 hover:text-emerald-400 transition-colors"
                                    >
                                      <Eye size={13} />
                                      View
                                    </Link>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </section>
                    )}
                  </>
                );
              })()}

              {/* Pagination */}
              <div className="flex justify-center pt-4 border-t border-slate-900/60">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalCount}
                  onChange={(page) => setCurrentPage(page)}
                  showSizeChanger={false}
                  className="premium-pagination"
                />
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

const StatCard = ({ title, value, icon, gradient, highlight = false }) => (
  <div
    className={`p-5 relative border rounded-xl bg-[#06070c] overflow-hidden flex items-center justify-between transition-all duration-300 hover:border-slate-700 ${highlight ? "border-emerald-500/25 ring-1 ring-emerald-500/5" : "border-slate-800"}`}
  >
    <div
      className={`absolute inset-0 bg-gradient-to-tr ${gradient} pointer-events-none`}
    />
    <div className="relative z-10 space-y-2">
      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-wider">
        {title}
      </p>
      <p
        className={`text-2xl font-extrabold tracking-tight ${highlight ? "text-emerald-400" : "text-white"}`}
      >
        {value}
      </p>
    </div>
    <div className="relative z-10 p-3 bg-slate-900/60 border border-slate-800/80 rounded-lg">
      {icon}
    </div>
  </div>
);

export default Investments;
