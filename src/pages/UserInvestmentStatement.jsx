import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowDownLeft,
  ArrowLeft,
  ArrowUpRight,
  CheckCircle2,
  Coins,
  Download,
  FileText,
  Landmark,
  PiggyBank,
  RefreshCcw,
  Wallet,
} from "lucide-react";
import { Skeleton, Tag, message } from "antd";
import { fetchUserById } from "../api/userApi";
import { fetchInvestmentById } from "../api/investmentApi";
import { fetchAllWithdrawalsApi } from "../api/withdrawalApi";

const money = (value = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const num = (value = 0) => Number(value) || 0;

const dateTime = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const dateOnly = (value) => {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const idOf = (value) => (value == null ? "" : String(value));

const investmentIdOf = (allocation) =>
  allocation?.investmentId ||
  allocation?.investment?._id ||
  allocation?.investment?.id ||
  "";

const allocationIdOf = (allocation) =>
  allocation?.allocationId || allocation?._id || allocation?.id || "";

const getItemInvestmentId = (item) =>
  item?.investmentId ||
  item?.investment?._id ||
  item?.investment?.id ||
  item?.investment?.investmentId ||
  "";

const getItemAllocationId = (item) =>
  item?.allocationId ||
  item?.allocation?._id ||
  item?.allocation?.id ||
  "";

const getWithdrawalUserId = (item) =>
  item?.user?._id ||
  item?.user?.id ||
  item?.userId ||
  item?.investor?._id ||
  item?.investor?.id ||
  "";

const getAvailable = (allocation) =>
  num(
    allocation?.availableBalance ??
      allocation?.availableToWithdraw ??
      allocation?.remainingWithdrawable,
  );

const eventMeta = (type = "") => {
  const value = String(type).toLowerCase();
  if (value.includes("withdrawable") || value.includes("limit")) {
    return { label: "Withdrawable limit", icon: Landmark, tone: "text-amber-400", direction: "credit" };
  }
  if (value.includes("withdraw")) {
    return { label: "Withdrawal", icon: ArrowUpRight, tone: "text-rose-400", direction: "debit" };
  }
  if (value.includes("reinvest")) {
    return { label: "Reinvestment", icon: RefreshCcw, tone: "text-violet-400", direction: "debit" };
  }
  if (value.includes("profit")) {
    return { label: "Profit credited", icon: ArrowDownLeft, tone: "text-emerald-400", direction: "credit" };
  }
  if (value.includes("allocation") || value.includes("invest")) {
    return { label: "Money invested", icon: PiggyBank, tone: "text-blue-400", direction: "credit" };
  }
  return { label: type || "Account activity", icon: Coins, tone: "text-slate-400", direction: "credit" };
};

const UserInvestmentStatement = () => {
  const { userId, investmentId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [investmentResponse, setInvestmentResponse] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = window.location.pathname.startsWith("/superadmin/");
  const backToUser = isSuperAdmin
    ? `/superadmin/users/${userId}`
    : `/dashboard/users/${userId}`;

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      setLoading(true);
      try {
        const [userResult, investmentResult, withdrawalResult] = await Promise.all([
          fetchUserById(userId),
          fetchInvestmentById(investmentId),
          fetchAllWithdrawalsApi(),
        ]);

        if (!mounted) return;

        const fullUser =
          userResult?.user || userResult?.data?.user || userResult?.data || userResult;
        setUser(fullUser);
        setInvestmentResponse(investmentResult);

        const list =
          withdrawalResult?.withdrawals ||
          withdrawalResult?.requests ||
          withdrawalResult?.data ||
          [];

        setWithdrawals(
          Array.isArray(list)
            ? list.filter((item) => String(getWithdrawalUserId(item)) === String(userId))
            : [],
        );
      } catch (error) {
        console.error("Failed to load investment statement:", error);
        message.error(
          error?.response?.data?.message || "Unable to load investment statement.",
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (userId && investmentId) load();
    return () => {
      mounted = false;
    };
  }, [userId, investmentId]);

  const allocation = useMemo(() => {
    const allocations = Array.isArray(user?.allocations) ? user.allocations : [];
    const found = allocations.find(
      (item) => idOf(investmentIdOf(item)) === idOf(investmentId),
    );
    if (found) return found;

    const investor = Array.isArray(investmentResponse?.investors)
      ? investmentResponse.investors.find(
          (item) =>
            idOf(item?.user?._id || item?.user?.id || item?.userId) === idOf(userId) &&
            idOf(item?.investmentId || investmentResponse?.investment?._id) === idOf(investmentId),
        )
      : null;

    return investor || investmentResponse?.myInvestment || null;
  }, [user, investmentResponse, investmentId, userId]);

  const investment = investmentResponse?.investment || allocation?.investment || {};

  const investmentTransactions = useMemo(() => {
    const allocationId = idOf(allocationIdOf(allocation));
    const invId = idOf(investmentId);

    const userTransactions = [
      ...(Array.isArray(user?.transactions) ? user.transactions : []),
      ...(Array.isArray(user?.history) ? user.history : []),
    ];

    const responseHistory = Array.isArray(investmentResponse?.history)
      ? investmentResponse.history
      : [];

    const matchesInvestment = (item) => {
      const itemInvId = idOf(getItemInvestmentId(item));
      const itemAllocId = idOf(getItemAllocationId(item));

      // Investment history returned by /investments/:id is already scoped to
      // the requested investment, so it is safe to include when it has no ids.
      const hasAnyLink = Boolean(itemInvId || itemAllocId);
      if (!hasAnyLink) return false;
      return itemInvId === invId || (allocationId && itemAllocId === allocationId);
    };

    const rows = [];

    userTransactions.filter(matchesInvestment).forEach((item, index) => {
      rows.push({
        id: item._id || item.id || `user-tx-${index}`,
        type: item.type || "account_activity",
        description: item.description || item.note || item.type || "Account activity",
        amount: num(item.amount),
        createdAt: item.createdAt || item.date || item.updatedAt,
        status: item.status || "completed",
      });
    });

    responseHistory.forEach((item, index) => {
      rows.push({
        id: item._id || item.id || `investment-history-${index}`,
        type: item.type || "account_activity",
        description: item.description || item.note || item.type || "Investment activity",
        amount: num(item.amount),
        createdAt: item.createdAt || item.date || item.updatedAt,
        status: item.status || "completed",
      });
    });

    const matchingWithdrawals = withdrawals.filter((item) => {
      const itemInvId = idOf(getItemInvestmentId(item));
      const itemAllocId = idOf(getItemAllocationId(item));
      return itemInvId === invId || (allocationId && itemAllocId === allocationId);
    });

    matchingWithdrawals.forEach((item, index) => {
      rows.push({
        id: item._id || item.id || `withdrawal-${index}`,
        type: "withdrawal",
        description: item.description || "Investor withdrawal",
        amount: num(item.amountFromBalance ?? item.amount),
        createdAt: item.createdAt || item.requestedAt || item.updatedAt,
        status: item.status || "pending",
        bankName: item.bankName || item.bank?.name,
        accountNumber: item.accountNumber,
      });
    });

    // The allocation itself is the source of truth for the current principal.
    // Add a money-invested event if the ledger did not already expose it.
    const hasInvestmentEvent = rows.some((row) => {
      const type = String(row.type || "").toLowerCase();
      return type.includes("allocation") || type.includes("invest");
    });

    if (!hasInvestmentEvent && num(allocation?.principal) > 0) {
      rows.push({
        id: `principal-${allocationId || invId}`,
        type: "allocation",
        description: "Money invested into this investment",
        amount: num(allocation.principal),
        createdAt: allocation?.allocatedAt || allocation?.createdAt || investment?.createdAt,
        status: "completed",
      });
    }

    const hasLimitEvent = rows.some((row) =>
      String(row.type || "").toLowerCase().includes("withdrawable"),
    );

    if (!hasLimitEvent && num(allocation?.withdrawableLimit) > 0) {
      rows.push({
        id: `limit-${allocationId || invId}`,
        type: "withdrawable_limit",
        description: "Withdrawable limit currently assigned to this investment",
        amount: num(allocation.withdrawableLimit),
        createdAt: allocation?.updatedAt || allocation?.allocatedAt || allocation?.createdAt,
        status: "completed",
        isSnapshot: true,
      });
    }

    const hasProfitEvent = rows.some((row) =>
      String(row.type || "").toLowerCase().includes("profit"),
    );

    if (!hasProfitEvent && num(allocation?.profitEarned) > 0) {
      rows.push({
        id: `profit-${allocationId || invId}`,
        type: "profit",
        description: "Profit credited to this investment",
        amount: num(allocation.profitEarned),
        createdAt: allocation?.profitDistributedAt || allocation?.completedAt || allocation?.updatedAt,
        status: "completed",
        isSnapshot: true,
      });
    }

    const hasReinvestmentEvent = rows.some((row) =>
      String(row.type || "").toLowerCase().includes("reinvest"),
    );

    if (!hasReinvestmentEvent && num(allocation?.amountReinvested) > 0) {
      rows.push({
        id: `reinvest-${allocationId || invId}`,
        type: "reinvestment",
        description: "Amount reinvested from this investment",
        amount: num(allocation.amountReinvested),
        createdAt: allocation?.updatedAt || allocation?.createdAt,
        status: "completed",
        isSnapshot: true,
      });
    }

    const seen = new Set();
    return rows
      .filter((row) => row.amount !== 0 || row.description)
      .sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0))
      .filter((row) => {
        const key = `${row.type}|${row.amount}|${row.createdAt}|${row.description}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [user, investmentResponse, withdrawals, allocation, investment, investmentId]);

  const totals = useMemo(() => {
    const principal = num(allocation?.principal);
    const profit = num(allocation?.profitEarned);
    const totalValue = num(
      allocation?.totalValue ?? allocation?.totalInvestment ?? principal + profit,
    );
    const limit = num(allocation?.withdrawableLimit);
    const available = getAvailable(allocation);
    const reinvested = num(allocation?.amountReinvested);

    const linkedWithdrawals = withdrawals.filter((item) => {
      const inv = idOf(getItemInvestmentId(item));
      const alloc = idOf(getItemAllocationId(item));
      return inv === idOf(investmentId) || (idOf(allocationIdOf(allocation)) && alloc === idOf(allocationIdOf(allocation)));
    });

    const withdrawn = linkedWithdrawals
      .filter((item) => String(item.status || "").toLowerCase() === "approved")
      .reduce((sum, item) => sum + num(item.amountFromBalance ?? item.amount), 0);

    return { principal, profit, totalValue, limit, available, reinvested, withdrawn, linkedWithdrawals };
  }, [allocation, withdrawals, investmentId]);

  const download = () => window.print();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] p-6 text-white">
        <Skeleton active paragraph={{ rows: 10 }} />
      </div>
    );
  }

  if (!user || !allocation) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] p-6 text-white">
        <button onClick={() => navigate(backToUser)} className="mb-6 inline-flex items-center gap-2 text-sm font-bold text-[#34D399]">
          <ArrowLeft size={16} /> Back to Investor
        </button>
        <div className="border border-slate-800 bg-[#1F2937] p-10 text-center">
          <p className="text-slate-400">This investment allocation could not be found for this investor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="investment-statement-page min-h-screen bg-[#1F1F1F] p-4 text-slate-300 sm:p-6">
      <div className="no-print mb-5 flex flex-col gap-3 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Link to={backToUser} className="inline-flex items-center gap-2 text-xs font-bold text-[#34D399] hover:text-white">
            <ArrowLeft size={15} /> Back to Investor Statement
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#090A0F] text-[#34D399] font-black">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-xl font-black text-white">{investment.title || "Investment"}</h1>
              <p className="text-xs text-slate-500">{user.name} • {investment.reference || `Investment ${investmentId}`}</p>
            </div>
          </div>
        </div>
        <button onClick={download} className="inline-flex items-center justify-center gap-2 bg-[#34D399] px-4 py-2.5 text-xs font-bold text-[#090A0F] hover:bg-[#06D6A0]">
          <Download size={16} /> Download Investment Statement / PDF
        </button>
      </div>

      <div className="print-only mb-5 hidden">
        <div className="flex items-start justify-between border-b-2 border-slate-900 pb-3">
          <div>
            <div className="text-xl font-black tracking-tight text-slate-900">GREY <span className="text-emerald-600">INVESTMENT</span></div>
            <div className="mt-1 text-[9px] font-bold tracking-[2px] text-slate-500">INVESTMENT TRANSACTION STATEMENT</div>
          </div>
          <div className="text-right text-[9px] text-slate-500"><strong className="text-slate-900">Generated</strong><br />{dateOnly(new Date())}</div>
        </div>
        <div className="mt-3 border-b border-slate-300 pb-3">
          <div className="text-sm font-black text-slate-900">{investment.title || "Investment"}</div>
          <div className="mt-1 text-[9px] text-slate-500">Investor: {user.name} • {user.email || "—"} • Ref: {investment.reference || investmentId}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Metric icon={PiggyBank} label="Money Invested" value={money(totals.principal)} />
        <Metric icon={ArrowDownLeft} label="Profit Earned" value={money(totals.profit)} tone="text-emerald-400" />
        <Metric icon={Wallet} label="Withdrawable Limit" value={money(totals.limit)} tone="text-amber-400" />
        <Metric icon={Wallet} label="Available to Withdraw" value={money(totals.available)} tone="text-[#34D399]" />
        <Metric icon={ArrowUpRight} label="Money Withdrawn" value={money(totals.withdrawn)} tone="text-rose-400" />
        <Metric icon={RefreshCcw} label="Reinvested" value={money(totals.reinvested)} tone="text-violet-400" />
        <Metric icon={Coins} label="Total Investment Value" value={money(totals.totalValue)} tone="text-blue-400" />
        <Metric icon={CheckCircle2} label="Investment Status" value={investment.status || allocation.status || "—"} tone="text-[#34D399]" />
      </div>

      <section className="statement-print-section mt-5 border border-slate-800 bg-[#1F2937]">
        <div className="border-b border-slate-800 bg-[#090A0F] px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-black uppercase tracking-wide text-white">Investment Transaction History</h2>
              <p className="mt-1 text-[11px] text-slate-500">Every recorded financial event that can be attributed to this investment allocation.</p>
            </div>
            <FileText size={18} className="text-[#34D399]" />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="investment-history-table w-full min-w-[850px] text-left text-xs">
            <thead className="bg-[#111827] text-[10px] uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Transaction</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {investmentTransactions.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">No transaction history is available for this investment.</td></tr>
              ) : investmentTransactions.map((row) => {
                const meta = eventMeta(row.type);
                const Icon = meta.icon;
                return (
                  <tr key={row.id} className="hover:bg-[#111827]">
                    <td className="whitespace-nowrap px-4 py-3 text-slate-500">{dateTime(row.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold text-white">
                      <span className="inline-flex items-start gap-2"><Icon size={14} className={`${meta.tone} mt-0.5 shrink-0`} /><span>{row.description}{row.isSnapshot ? <span className="ml-2 text-[9px] text-slate-500">current snapshot</span> : null}</span></span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${meta.tone}`}>{meta.label}</td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${meta.direction === "debit" ? "text-rose-400" : "text-emerald-400"}`}>
                      {meta.direction === "debit" ? "−" : "+"}{money(row.amount)}
                    </td>
                    <td className="px-4 py-3"><Tag color={String(row.status).toLowerCase() === "rejected" ? "red" : String(row.status).toLowerCase() === "pending" ? "orange" : "green"} className="m-0 uppercase">{row.status}</Tag></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="statement-print-section mt-5 border border-slate-800 bg-[#1F2937]">
        <div className="border-b border-slate-800 bg-[#090A0F] px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-white">Current Investment Position</h2>
        </div>
        <div className="grid grid-cols-2 gap-px bg-slate-800 sm:grid-cols-4">
          <Position label="Principal" value={money(totals.principal)} />
          <Position label="Profit" value={money(totals.profit)} />
          <Position label="Withdrawable Limit" value={money(totals.limit)} />
          <Position label="Available Balance" value={money(totals.available)} highlight />
        </div>
      </section>

      <section className="statement-print-section mt-5 border border-slate-800 bg-[#1F2937]">
        <div className="border-b border-slate-800 bg-[#090A0F] px-4 py-3">
          <h2 className="text-sm font-black uppercase tracking-wide text-white">Linked Withdrawal History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-left text-xs">
            <thead className="bg-[#111827] text-[10px] uppercase text-slate-500">
              <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3 text-right">Amount</th><th className="px-4 py-3">Bank / Account</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {totals.linkedWithdrawals.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No withdrawal request is linked to this investment.</td></tr>
              ) : totals.linkedWithdrawals.map((item, index) => (
                <tr key={item._id || item.id || index}>
                  <td className="px-4 py-3 text-slate-500">{dateTime(item.createdAt || item.requestedAt || item.updatedAt)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-rose-400">{money(item.amountFromBalance ?? item.amount)}</td>
                  <td className="px-4 py-3 text-white">{item.bankName || item.bank?.name || "—"} {item.accountNumber ? <span className="text-slate-500">••••{String(item.accountNumber).slice(-4)}</span> : null}</td>
                  <td className="px-4 py-3"><Tag color={String(item.status).toLowerCase() === "approved" ? "green" : String(item.status).toLowerCase() === "rejected" ? "red" : "orange"} className="m-0 uppercase">{item.status || "pending"}</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-5 flex items-center justify-between border-t border-slate-800 pt-4 text-[10px] text-slate-500">
        <span>Grey Investment • Investment Statement</span>
        <span>Generated {dateTime(new Date())}</span>
      </div>
    </div>
  );
};

const Metric = ({ icon: Icon, label, value, tone = "text-white" }) => (
  <div className="border border-slate-800 bg-[#1F2937] p-4">
    <div className="flex items-center gap-3">
      <div className="bg-[#090A0F] p-2.5 text-[#34D399]"><Icon size={18} /></div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase text-slate-500">{label}</p>
        <p className={`mt-1 truncate font-mono text-base font-black ${tone}`}>{value}</p>
      </div>
    </div>
  </div>
);

const Position = ({ label, value, highlight }) => (
  <div className="bg-[#1F2937] p-4">
    <p className="text-[10px] uppercase text-slate-500">{label}</p>
    <p className={`mt-1 font-mono text-sm font-black ${highlight ? "text-[#34D399]" : "text-white"}`}>{value}</p>
  </div>
);

export default UserInvestmentStatement;
