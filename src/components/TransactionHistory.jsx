import { useMemo, useState } from "react";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  PiggyBank,
  TrendingUp,
  RefreshCcw,
} from "lucide-react";
import { motion } from "motion/react";
import { Empty, Skeleton, Pagination } from "antd";

const PAGE_SIZE = 5;

const formatMoney = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const formatDate = (date) =>
  new Date(date).toLocaleString("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

const getTransactionConfig = (type) => {
  switch (type) {
    case "allocation":
      return {
        icon: PiggyBank,
        bg: "bg-blue-500/10",
        color: "text-blue-400",
        label: "Investment",
      };

    case "allocation_removed":
      return {
        icon: RefreshCcw,
        bg: "bg-red-500/10",
        color: "text-red-400",
        label: "Removed",
      };

    case "profit":
      return {
        icon: TrendingUp,
        bg: "bg-emerald-500/10",
        color: "text-emerald-400",
        label: "Profit",
      };

    case "withdrawable_limit":
      return {
        icon: Wallet,
        bg: "bg-yellow-500/10",
        color: "text-yellow-400",
        label: "Withdrawable",
      };

    case "withdrawal":
      return {
        icon: ArrowUpRight,
        bg: "bg-red-500/10",
        color: "text-red-400",
        label: "Withdrawal",
      };

    default:
      return {
        icon: ArrowDownLeft,
        bg: "bg-slate-500/10",
        color: "text-slate-400",
        label: type,
      };
  }
};

const TransactionHistory = ({
  transactions = [],
  loading = false,
}) => {
  const [currentPage, setCurrentPage] = useState(1);

  const paginatedTransactions = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;

    return transactions.slice(start, start + PAGE_SIZE);
  }, [transactions, currentPage]);

  if (loading) {
    return (
      <div className="bg-[#1F2937] rounded-2xl border border-slate-800 p-6 space-y-4">
        <Skeleton
          active
          paragraph={{ rows: 1 }}
        />

        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton
            key={i}
            active
            avatar
            paragraph={{ rows: 1 }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-[#1F2937] border border-slate-800 rounded-2xl p-6">

      {/* Header */}

      <div className="mb-5">

        <h2 className="text-base font-semibold text-white">
          Recent Transactions
        </h2>

        <p className="text-xs text-slate-400 mt-1">
          Latest activities across the platform
        </p>

      </div>

      {transactions.length === 0 ? (
        <Empty
          description={
            <span className="text-slate-400">
              No transactions found
            </span>
          }
        />
      ) : (
        <>
          <div className="space-y-2">

            {paginatedTransactions.map((item, index) => {
              const config = getTransactionConfig(item.type);

              const Icon = config.icon;

              return (
                <motion.div
                  key={item.transactionId}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: index * 0.05,
                  }}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-800 hover:bg-slate-800/40 transition"
                >
                  {/* Left */}

                  <div className="flex items-center gap-3 flex-1 min-w-0">

                    <div
                      className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${config.bg}`}
                    >
                      <Icon
                        className={config.color}
                        size={16}
                      />
                    </div>

                    <div className="min-w-0 flex-1">

                      <h3 className="text-sm font-medium text-white truncate">
                        {config.label}
                      </h3>

                      <p className="text-xs text-slate-400 truncate">
                        {item.description}
                      </p>

                      {item.investmentTitle && (
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {item.investmentTitle}
                        </p>
                      )}

                    </div>

                  </div>

                  {/* Right */}

                  <div className="text-right ml-4 flex-shrink-0">

                    <h3 className="text-sm font-semibold text-white">
                      {formatMoney(item.amount)}
                    </h3>

                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {formatDate(item.createdAt)}
                    </p>

                  </div>
                </motion.div>
              );
            })}

          </div>

          {transactions.length > PAGE_SIZE && (
            <div className="mt-5 flex justify-end">
              <Pagination
                current={currentPage}
                pageSize={PAGE_SIZE}
                total={transactions.length}
                showSizeChanger={false}
                size="small"
                onChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default TransactionHistory;