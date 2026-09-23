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

  const withdrawableInvestments = investments.filter(
    (inv) => Number(inv.withdrawableLimit || 0) > 0,
  );

  const nonWithdrawableInvestments = investments.filter(
    (inv) => Number(inv.withdrawableLimit || 0) <= 0,
  );

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

      {/* Investments with a Withdrawable Limit */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-[#0b0d16] p-6 border border-slate-900 rounded-lg"
            >
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ))}
        </div>
      ) : investments.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-slate-800 rounded-lg bg-[#06070c]">
          <p className="text-slate-500 text-sm">No investments found.</p>
        </div>
      ) : (
        <div className="space-y-8">
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-white">
                  Withdrawable Investments
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  Investments where the admin has approved a withdrawable limit.
                </p>
              </div>
              <span className="rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                {withdrawableInvestments.length} available
              </span>
            </div>

            {withdrawableInvestments.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-800 bg-[#06070c] px-5 py-10 text-center">
                <p className="text-sm font-semibold text-slate-400">
                  No investment currently has a withdrawable limit.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {withdrawableInvestments.map((inv) => (
                    <motion.div
                      key={inv.allocationId}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.25 }}
                      className="group relative overflow-hidden rounded-xl border border-emerald-500/20 bg-[#06070c] p-5 shadow-xl transition-all duration-300 hover:border-emerald-400/40 hover:shadow-emerald-950/10"
                    >
                      <div className="absolute inset-x-0 top-0 h-1 bg-emerald-400/70" />
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Tag
                            color={getStatusColor(inv.investmentStatus)}
                            className="m-0 rounded px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider"
                          >
                            {inv.investmentStatus || "Active"}
                          </Tag>
                          <h4 className="pt-2 text-base font-black tracking-wide text-white group-hover:text-emerald-400">
                            {inv.title}
                          </h4>
                          <p className="mt-1 truncate text-[10px] font-mono text-slate-600">
                            {inv.reference || inv.investmentId}
                          </p>
                        </div>
                        <Link
                          to={`investment/${inv.investmentId}`}
                          className="shrink-0 rounded-lg border border-slate-800 bg-slate-900/80 p-2 text-slate-400 transition hover:border-emerald-500/30 hover:text-emerald-400"
                          title="View Investment"
                        >
                          <Eye size={15} />
                        </Link>
                      </div>

                      <div className="mt-5 rounded-lg border border-emerald-500/10 bg-[#0a0c14] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80">
                          Withdrawable Limit
                        </p>
                        <p className="mt-1 font-mono text-2xl font-black text-emerald-400">
                          ₦{Number(inv.withdrawableLimit || 0).toLocaleString()}
                        </p>
                      </div>

                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div className="rounded-lg border border-slate-900 bg-[#0a0c14] p-3">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            Available
                          </p>
                          <p className="mt-1 text-sm font-black text-white">
                            ₦{Number(inv.availableToWithdraw || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="rounded-lg border border-slate-900 bg-[#0a0c14] p-3">
                          <p className="text-[9px] font-bold uppercase tracking-wider text-slate-500">
                            Profit
                          </p>
                          <p className="mt-1 text-sm font-black text-emerald-400">
                            ₦{Number(inv.profitEarned || 0).toLocaleString()}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t border-slate-900 pt-3 text-xs">
                        <span className="text-slate-500">Principal</span>
                        <span className="font-bold text-slate-200">
                          ₦{Number(inv.principal || 0).toLocaleString()}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}
          </section>

          {/* Investments without a Withdrawable Limit */}
          <section className="space-y-4">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white">
                Other Investments
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Investments that currently have no withdrawable limit.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-800 bg-[#06070c]">
              <table className="w-full min-w-[760px] text-left text-xs">
                <thead className="bg-[#111827] text-[10px] uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Investment</th>
                    <th className="px-4 py-3 text-right">Principal</th>
                    <th className="px-4 py-3 text-right">Profit</th>
                    <th className="px-4 py-3 text-right">Total Value</th>
                    <th className="px-4 py-3 text-right">Withdrawable</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {nonWithdrawableInvestments.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                        All your investments currently have a withdrawable limit.
                      </td>
                    </tr>
                  ) : (
                    nonWithdrawableInvestments.map((inv) => (
                      <tr key={inv.allocationId} className="transition hover:bg-[#111827]">
                        <td className="px-4 py-4">
                          <div className="font-bold text-white">{inv.title}</div>
                          <div className="mt-1 text-[10px] font-mono text-slate-600">{inv.reference || inv.investmentId}</div>
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-bold text-slate-200">
                          ₦{Number(inv.principal || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-bold text-emerald-400">
                          ₦{Number(inv.profitEarned || 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-bold text-blue-400">
                          ₦{(Number(inv.principal || 0) + Number(inv.profitEarned || 0)).toLocaleString()}
                        </td>
                        <td className="px-4 py-4 text-right font-mono font-bold text-slate-500">
                          ₦0
                        </td>
                        <td className="px-4 py-4">
                          <Tag color={getStatusColor(inv.investmentStatus)} className="m-0 uppercase">
                            {inv.investmentStatus || "Active"}
                          </Tag>
                        </td>
                        <td className="px-4 py-4 text-right">
                          <Link
                            to={`investment/${inv.investmentId}`}
                            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-[10px] font-bold uppercase text-slate-300 transition hover:border-emerald-500/30 hover:text-emerald-400"
                          >
                            <Eye size={13} /> View
                          </Link>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex justify-center border-t border-slate-900/60 pt-6">
              <Pagination
                current={currentPage}
                pageSize={pageSize}
                total={totalCount}
                onChange={(page) => setCurrentPage(page)}
                showSizeChanger={false}
                className="premium-pagination"
              />
            </div>
          </section>
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
