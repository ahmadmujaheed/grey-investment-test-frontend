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

      {/* Grid Cards Section */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="bg-[#0b0d16] p-6 border border-slate-900 rounded-lg space-y-4"
            >
              <Skeleton active paragraph={{ rows: 4 }} />
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {investments.length === 0 ? (
            <div className="text-center py-16 border border-dashed border-slate-800 rounded-lg bg-[#06070c]">
              <p className="text-slate-500 text-sm">
                No active investments found.
              </p>
            </div>
          ) : (
            <>
              {/* Card Grid displaying server-side chunk */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {investments.map((inv) => (
                    <motion.div
                      key={inv.allocationId}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.25 }}
                      className="group relative border border-slate-800/80 hover:border-emerald-500/30 bg-[#06070c] rounded-xl p-5 flex flex-col justify-between transition-all duration-300 shadow-xl hover:shadow-emerald-950/5"
                    >
                      {/* Card Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div className="space-y-1">
                          <Tag
                            color={getStatusColor(inv.investmentStatus)}
                            className="px-2 py-0.5 rounded text-[9px] uppercase font-bold tracking-wider m-0"
                          >
                            {inv.investmentStatus || "Active"}
                          </Tag>
                          <h4 className="font-bold text-white text-base tracking-wide capitalize group-hover:text-emerald-400 transition-colors pt-1">
                            {inv.title}
                          </h4>
                        </div>
                        <Link
                          to={`investment/${inv.investmentId}`}
                          className="p-2 bg-slate-900/80 text-slate-400 hover:text-white rounded-lg border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center cursor-pointer"
                          title="View Details"
                        >
                          <Eye size={15} />
                        </Link>
                      </div>

                      {/* Card Financial Details */}
                      <div className="space-y-3.5 my-3">
                        <div className="flex justify-between items-center bg-[#0a0c14] p-3 rounded-lg border border-slate-900">
                          <div>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
                              Principal
                            </p>
                            <p className="text-sm font-bold text-slate-100 mt-0.5">
                              ₦{(inv.principal || 0).toLocaleString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-[10px] text-emerald-500/80 uppercase tracking-wider font-semibold">
                              Profit Earned
                            </p>
                            <p className="text-sm font-black text-emerald-400 mt-0.5">
                              +₦{(inv.profitEarned || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Available Profit Info */}
                        <div className="flex justify-between items-center text-xs px-1">
                          <span className="text-slate-500 font-medium">
                            Withdrawable Limit:
                          </span>
                          <span className="text-white font-bold">
                            ₦{(inv.withdrawableLimit || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Card Action Footer */}
                      {/* <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-600">
                          ID: ...{inv.allocationId.slice(-6)}
                        </span>

                        {inv.allocationStatus === "active" ? (
                          <button
                            onClick={() => {
                              setSelectedInv(inv);
                              setIsWithdrawModalOpen(true);
                            }}
                            className="px-4 py-2 bg-emerald-400/5 hover:bg-emerald-400 border border-emerald-500/20 hover:border-emerald-400 text-emerald-400 hover:text-black rounded-lg transition-all duration-250 cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Wallet size={13} />
                            <span>Withdraw</span>
                          </button>
                        ) : (
                          <span className="text-slate-600 text-[11px] font-semibold italic bg-slate-900/40 px-2.5 py-1 rounded border border-slate-900">
                            Locked Pool
                          </span>
                        )}
                      </div> */}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Ant Design Premium Styled Pagination */}
              <div className="flex justify-center pt-6 border-t border-slate-900/60">
                <Pagination
                  current={currentPage}
                  pageSize={pageSize}
                  total={totalCount} // Pointed directly to response total count metric
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
