import { useState, useEffect } from "react";
import {
  TrendingUp,
  ArrowUpRight,
  Percent,
  Calculator,
  Building,
  Users,
} from "lucide-react";
import { motion } from "motion/react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { message, Skeleton } from "antd";

// 🔌 Connects directly to your analytics API layer
import {
  fetchDashboardAnalytics,
  fetchDashboardAnalyticsChart,
} from "../api/analyticsApi";
import DashboardCards from "../components/DashboardCards";
import DashboardChart from "../components/DashboardChart";
import TransactionHistory from "../components/TransactionHistory";
import RecentInvestments from "../components/RecentInvestments";

// Motion animation presets
const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

// Standard local currency formatter helper
/**
 * Formats currency based on amount size.
 * Uses full formatting for small amounts and compact (M/B) for large totals.
 */
const formatNaira = (amount = 0) => {
  // Handle Billions
  if (amount >= 1_000_000_000) {
    return `₦${(amount / 1_000_000_000).toFixed(1)}B`;
  }

  // Handle Millions
  if (amount >= 1_000_000) {
    return `₦${(amount / 1_000_000).toFixed(1)}M`;
  }

  // Handle standard amounts (Thousands, Hundreds)
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

// Simplified chart axis numerical formatter (e.g., 2M, 500k)
const formatAxisValues = (num) => {
  if (num >= 1000000) return `₦ ${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `₦ ${(num / 1000).toFixed(0)}k`;
  return `₦ ${num}`;
};

const Dashboard = () => {
  // 💾 Core Dynamic Data States
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Profit Split Calculator Local State
  const [investorPct, setInvestorPct] = useState("");
  const [companyPct, setCompanyPct] = useState("");
  const [calcAmount, setCalcAmount] = useState("");

  const numericCalcAmount = parseFloat(calcAmount.replace(/,/g, "")) || 0;
  const investorPayout = numericCalcAmount * ((investorPct || 0) / 100);
  const companyFee = numericCalcAmount * ((companyPct || 0) / 100);

  const handleInvestorPctChange = (val) => {
    const v = Math.min(100, Math.max(0, parseFloat(val) || 0));
    setInvestorPct(v);
    setCompanyPct(100 - v);
  };

  const handleAmountChange = (e) => {
    const rawValue = e.target.value.replace(/[^0-9]/g, ""); // Strip everything but digits

    if (rawValue === "") {
      setCalcAmount("");
      return;
    }

    // Format for display
    const formatted = new Intl.NumberFormat("en-US").format(rawValue);
    setCalcAmount(formatted);
  };

  // 🔄 Request live backend data calculations on component mount
  useEffect(() => {
    const loadSystemAnalytics = async () => {
      try {
        setLoading(true);
        const data = await fetchDashboardAnalytics();
        setAnalyticsData(data);
      } catch (err) {
        message.error(
          err?.message ||
            "Failed to communicate with analytics engine database nodes.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadSystemAnalytics();
  }, []);

  // 💀 Skeleton Loader View (Perfect Dark Theme Matching)
  if (loading) {
    return (
      <div className="space-y-6 bg-[#1F1F1F] min-h-screen">
        {/* Header Skeleton */}
        <div className="space-y-2">
          <Skeleton.Button
            active
            style={{ width: 220, height: 28, backgroundColor: "#2A2A2A" }}
          />
          <Skeleton.Input
            active
            style={{ width: 420, height: 16, backgroundColor: "#2A2A2A" }}
          />
        </div>

        {/* Card Row Skeletons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="p-6 border border-slate-800 rounded-xl bg-[#1F2937] h-32 flex flex-col justify-between"
            >
              <Skeleton.Input
                active
                size="small"
                style={{ width: "60%", backgroundColor: "#2A2A2A" }}
              />
              <Skeleton.Button
                active
                style={{ width: "80%", height: 32, backgroundColor: "#2A2A2A" }}
              />
            </div>
          ))}
        </div>

        {/* Main Content Splitted Section Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-5 border border-slate-800 rounded-xl bg-[#1F2937] h-80 lg:col-span-2 space-y-4">
            <Skeleton.Input
              active
              style={{ width: "40%", backgroundColor: "#2A2A2A" }}
            />
            <div className="w-full h-56 bg-[#181F2A] animate-pulse rounded-lg" />
          </div>
          <div className="p-5 border border-slate-800 rounded-xl bg-[#1F2937] h-80 flex flex-col justify-between">
            <Skeleton.Input
              active
              style={{ width: "50%", backgroundColor: "#2A2A2A" }}
            />
            <div className="space-y-3 w-full">
              <div className="h-10 bg-[#181F2A] animate-pulse w-full" />
              <div className="h-20 bg-[#181F2A] animate-pulse w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Safe fallback bindings if the database response collections match empty states
  const summary = analyticsData?.summaryCards || {
    totalInvestedCapital: 0,
    totalPaidOut: 0,
    totalRegisteredUsers: 0,
    totalSystemProfit: 0,
    companyRevenue: 0,
  };

  const totalCapital = summary.totalInvestedCapital;
  const totalProfit = summary.totalSystemProfit;
  const totalPaidOut = summary.totalPaidOut;
  const companyRevenue = summary.companyRevenue;
  const totalUsers = summary.totalRegisteredUsers;
  const charts = analyticsData?.chartData || [];

  // Derived dashboard company values calculated over real-time database AUM pools
  const dynamicTotalInvestorCut =
    analyticsData?.summaryCards?.totalYieldEarned || 0;
  const dynamicTotalCompanyCut =
    analyticsData?.summaryCards?.totalCompanyFees || 0;

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
      className="space-y-6 bg-[#1F1F1F] min-h-screen text-[#9CA3AF]"
    >
      {/* Title Header */}
      <motion.div variants={fadeInUp}>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          Investor Dashboard
          <span className="text-[10px] font-mono bg-[#090A0F] border border-slate-800 text-[#34D399] px-2 py-0.5 font-bold uppercase tracking-widest rounded">
            LIVE DATA
          </span>
        </h1>
        <p className="text-sm text-[#9CA3AF] mt-0.5">
          Real-time breakdown of your investments and profit distributions.
        </p>
      </motion.div>

      {/* 1. Core Financial Metrics */}
      <DashboardCards cards={analyticsData?.cards} loading={loading} />

      {/* 2. Main Analytics & Interactive Split Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Chart */}
        <div className="lg:col-span-2">
          <DashboardChart />
        </div>

        {/* Right - Calculator */}
        <motion.div
          variants={fadeInUp}
          className="lg:col-span-1 p-5 border border-slate-800 rounded-xl bg-[#1F2937] flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-white">
              <Calculator size={18} className="text-[#34D399]" />
              <h3 className="font-bold text-base">Split Estimator</h3>
            </div>

            <p className="text-xs text-[#9CA3AF] leading-relaxed">
              Input any target investment return amount below to accurately
              compute how the returns divide up automatically.
            </p>

            <input
              type="text"
              inputMode="numeric"
              value={calcAmount}
              onChange={handleAmountChange}
              className="w-full px-3 py-2 bg-[#090A0F] border border-slate-700 text-white rounded"
              placeholder="Enter Profit Amount"
            />

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-[10px] text-slate-400">Investor %</label>

                <input
                  type="number"
                  value={investorPct}
                  onChange={(e) => handleInvestorPctChange(e.target.value)}
                  className="w-full bg-[#090A0F] border border-slate-700 p-2 text-white rounded"
                />
              </div>

              <div className="flex-1">
                <label className="text-[10px] text-slate-400">Company %</label>

                <input
                  disabled
                  value={companyPct}
                  className="w-full bg-[#090A0F] border border-slate-800 p-2 text-slate-500 rounded cursor-not-allowed"
                />
              </div>
            </div>

            <div className="bg-[#090A0F] p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Investor Payout:</span>

                <span className="font-bold text-[#34D399]">
                  {formatNaira(investorPayout)}
                </span>
              </div>

              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Company Fee:</span>

                <span className="font-bold text-slate-300">
                  {formatNaira(companyFee)}
                </span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
          <TransactionHistory
            transactions={analyticsData?.recentTransactions}
            loading={loading}
          />
          
          <RecentInvestments
            investments={analyticsData?.recentInvestments}
            loading={loading}
          />
      </div>
    </motion.div>
  );
};

export default Dashboard;
