import {
  Briefcase,
  CheckCircle2,
  Wallet,
  Users,
  Landmark,
  TrendingUp,
  HandCoins,
  Clock3,
} from "lucide-react";

import { motion } from "motion/react";
import { Skeleton } from "antd";

const cardAnimation = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
    },
  },
};

const formatMoney = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const DashboardCards = ({ cards, loading }) => {
  const data = [
    {
      title: "Total Users",
      value: cards?.totalUsers || 0,
      icon: Users,
      color: "text-cyan-400",
      bg: "bg-cyan-500/10",
      description: "Registered investors",
    },

    {
      title: "Total Investments",
      value: cards?.totalInvestments || 0,
      icon: Briefcase,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      description: "All investments",
    },

    {
      title: "Pending Investments",
      value: cards?.pendingInvestments || 0,
      icon: Clock3,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      description: "Awaiting funding",
    },

    {
      title: "Running Investments",
      value: cards?.runningInvestments || 0,
      icon: TrendingUp,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      description: "Currently active",
    },

    {
      title: "Completed Investments",
      value: cards?.completedInvestments || 0,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10",
      description: "Successfully completed",
    },

    {
      title: "Archived Investments",
      value: cards?.archivedInvestments || 0,
      icon: Landmark,
      color: "text-slate-400",
      bg: "bg-slate-500/10",
      description: "Archived records",
    },

    {
      title: "Capital Raised",
      value: formatMoney(cards?.totalCapitalRaised || 0),
      icon: Wallet,
      color: "text-indigo-400",
      bg: "bg-indigo-500/10",
      description: "Total investor capital",
    },

    {
      title: "Company Profit",
      value: formatMoney(cards?.totalCompanyProfit || 0),
      icon: TrendingUp,
      color: "text-purple-400",
      bg: "bg-purple-500/10",
      description: "Company earnings",
    },

    {
      title: "Investor Profit",
      value: formatMoney(cards?.totalInvestorProfit || 0),
      icon: HandCoins,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      description: "Distributed to investors",
    },

    {
      title: "Total Withdrawn",
      value: formatMoney(cards?.totalWithdrawn || 0),
      icon: Wallet,
      color: "text-orange-400",
      bg: "bg-orange-500/10",
      description: "Approved withdrawals",
    },

    {
      title: "Pending Withdrawals",
      value: cards?.pendingWithdrawals || 0,
      icon: Clock3,
      color: "text-yellow-400",
      bg: "bg-yellow-500/10",
      description: "Waiting approval",
    },

    {
      title: "Rejected Withdrawals",
      value: cards?.rejectedWithdrawals || 0,
      icon: CheckCircle2,
      color: "text-red-400",
      bg: "bg-red-500/10",
      description: "Rejected requests",
    },

    {
      title: "Approved Withdrawals",
      value: cards?.approvedWithdrawals || 0,
      icon: CheckCircle2,
      color: "text-green-400",
      bg: "bg-green-500/10",
      description: "Successfully paid",
    },
  ];

  if (loading) {
    return (
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div
            key={index}
            className="bg-[#1F2937] border border-slate-800 rounded-2xl p-5"
          >
            <div className="flex justify-between">
              <div className="flex-1">
                <Skeleton.Input
                  active
                  size="small"
                  style={{
                    width: 120,
                    background: "#374151",
                  }}
                />

                <div className="mt-4">
                  <Skeleton.Input
                    active
                    size="large"
                    style={{
                      width: 140,
                      background: "#374151",
                    }}
                  />
                </div>

                <div className="mt-4">
                  <Skeleton.Input
                    active
                    size="small"
                    style={{
                      width: 100,
                      background: "#374151",
                    }}
                  />
                </div>
              </div>

              <Skeleton.Avatar
                active
                shape="square"
                size={48}
                style={{
                  background: "#374151",
                  borderRadius: 12,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      {data.map((item) => {
        const Icon = item.icon;

        return (
          <motion.div
            key={item.title}
            variants={cardAnimation}
            whileHover={{ y: -4 }}
            className="bg-[#1F2937] border border-slate-800 rounded-2xl p-5 transition-all duration-300 hover:border-slate-700"
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs uppercase tracking-wider text-slate-400">
                  {item.title}
                </p>

                <h2 className="text-2xl font-bold mt-3 text-white">
                  {item.value}
                </h2>

                <p className="text-xs text-slate-500 mt-2">
                  {item.description}
                </p>
              </div>

              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center ${item.bg}`}
              >
                <Icon className={item.color} size={22} />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
