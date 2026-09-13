import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  FileText,
  Mail,
  Phone,
  Calendar,
  Wallet,
  TrendingUp,
  PiggyBank,
  RefreshCcw,
  Clock,
} from "lucide-react";
import { Tag, message, Skeleton } from "antd";
import { fetchUserById } from "../api/userApi";
import { fetchAllWithdrawalsApi } from "../api/withdrawalApi";

const money = (value = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(value) || 0);

const number = (value = 0) => Number(value) || 0;

const date = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const dateTime = (value) => {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-NG", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const available = (allocation) =>
  number(
    allocation?.availableBalance ??
      allocation?.remainingWithdrawable ??
      allocation?.availableToWithdraw,
  );

const investmentIdOf = (allocation) =>
  allocation?.investmentId ||
  allocation?.investment?._id ||
  allocation?.investment?.id ||
  "";

const getWithdrawalUserId = (item) =>
  item?.user?._id ||
  item?.user?.id ||
  item?.userId ||
  item?.investor?._id ||
  item?.investor?.id;

const getTransactionConfig = (type) => {
  switch (type) {
    case "withdrawable_limit":
      return { icon: Wallet, label: "Withdrawable allocation", cls: "text-amber-400" };
    case "withdrawal":
      return { icon: ArrowUpRight, label: "Withdrawal", cls: "text-rose-400" };
    case "allocation":
      return { icon: PiggyBank, label: "Investment", cls: "text-blue-400" };
    case "allocation_removed":
      return { icon: RefreshCcw, label: "Allocation removed", cls: "text-rose-400" };
    case "profit":
      return { icon: TrendingUp, label: "Profit", cls: "text-emerald-400" };
    case "reinvestment":
      return { icon: RefreshCcw, label: "Reinvestment", cls: "text-violet-400" };
    default:
      return { icon: ArrowDownLeft, label: type || "Account activity", cls: "text-slate-400" };
  }
};

const UserDetails = () => {
  const { id } = useParams();
  const isSuperAdmin = window.location.pathname.startsWith("/superadmin/");
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [withdrawals, setWithdrawals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      const response = await fetchUserById(id);
      const fullUser = response?.user || response?.data?.user || response?.data || response;
      setUser(fullUser);
    } catch (error) {
      console.error("Failed to load investor:", error);
      message.error(error?.response?.data?.message || "Could not load investor details.");
    } finally {
      setLoading(false);
    }

    try {
      setWithdrawalsLoading(true);
      const response = await fetchAllWithdrawalsApi();
      const list = response?.withdrawals || response?.requests || response?.data || [];
      const userId = String(id);
      setWithdrawals(
        Array.isArray(list)
          ? list.filter((item) => String(getWithdrawalUserId(item)) === userId)
          : [],
      );
    } catch (error) {
      console.warn("Could not load withdrawal history:", error);
      setWithdrawals([]);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const allocations = user?.allocations || [];

  const totals = useMemo(() => {
    const totalInvested = allocations.reduce((sum, a) => sum + number(a.principal), 0);
    const totalProfit = allocations.reduce((sum, a) => sum + number(a.profitEarned), 0);
    const totalValue = allocations.reduce(
      (sum, a) => sum + number(a.totalValue ?? number(a.principal) + number(a.profitEarned)),
      0,
    );
    const allocated = allocations.reduce((sum, a) => sum + number(a.withdrawableLimit), 0);
    const currentAvailable = allocations.reduce((sum, a) => sum + available(a), 0);
    const reinvested = allocations.reduce((sum, a) => sum + number(a.amountReinvested), 0);

    const approvedWithdrawals = withdrawals.filter(
      (w) => String(w.status || "").toLowerCase() === "approved",
    );
    const collected = approvedWithdrawals.reduce(
      (sum, w) => sum + number(w.amountFromBalance ?? w.amount),
      0,
    );

    return {
      totalInvested,
      totalProfit,
      totalValue,
      allocated,
      currentAvailable,
      reinvested,
      collected,
    };
  }, [allocations, withdrawals]);

  const statementRows = useMemo(() => {
    const raw = [
      ...(Array.isArray(user?.transactions) ? user.transactions : []),
      ...(Array.isArray(user?.history) ? user.history : []),
    ].map((item, index) => ({
      id: item._id || item.id || `transaction-${index}`,
      type: item.type,
      description: item.description || item.note || item.type,
      amount: number(item.amount),
      createdAt: item.createdAt || item.date || item.updatedAt,
      status: item.status || "completed",
    }));

    const withdrawalRows = withdrawals.map((item, index) => ({
      id: item._id || item.id || `withdrawal-${index}`,
      type: "withdrawal",
      description: item.description || "Investor withdrawal",
      amount: number(item.amountFromBalance ?? item.amount),
      createdAt: item.createdAt || item.requestedAt || item.updatedAt,
      status: item.status || "pending",
    }));

    const rows = [...raw, ...withdrawalRows];

    // If the user endpoint does not expose transaction history, still show
    // the financial events represented by the current allocation records.
    if (!rows.some((row) => row.type === "withdrawable_limit")) {
      allocations.forEach((allocation, index) => {
        const limit = number(allocation.withdrawableLimit);
        if (limit > 0) {
          rows.push({
            id: `allocation-limit-${allocation._id || index}`,
            type: "withdrawable_limit",
            description: `Withdrawable limit for ${allocation.investment?.title || "investment"}`,
            amount: limit,
            createdAt: allocation.allocatedAt || allocation.createdAt,
            status: "completed",
          });
        }
      });
    }

    return rows
      .filter((row) => row.amount !== 0 || row.description)
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }, [user, withdrawals, allocations]);

  const downloadStatement = () => {
    // Opens the browser's native print dialog. Choose "Save as PDF" to get
    // a proper downloadable A4 statement without adding another dependency.
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] text-white p-6">
        <Skeleton active paragraph={{ rows: 8 }} />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-[#1F1F1F] text-white p-6">
        <button onClick={() => navigate(isSuperAdmin ? "/superadmin/users" : "/dashboard/users")} className="inline-flex items-center gap-2 text-sm text-[#34D399]">
          <ArrowLeft size={16} /> Back to Investors
        </button>
        <p className="mt-10 text-center text-slate-400">Investor could not be found.</p>
      </div>
    );
  }

  return (
    <div className="user-details-page min-h-screen space-y-5 bg-[#1F1F1F] text-[#9CA3AF] print:bg-white print:text-black">
      <div className="print-letterhead hidden print:block">
        <div className="print-brand-row">
          <div>
            <div className="print-brand">GREY <span>INVESTMENT</span></div>
            <div className="print-subbrand">INVESTOR ACCOUNT STATEMENT</div>
          </div>
          <div className="print-statement-meta">
            <strong>Statement Date</strong><br />
            {date(new Date())}
          </div>
        </div>
        <div className="print-rule" />
      </div>

      <div className="flex flex-col gap-4 border-b border-slate-800 pb-5 sm:flex-row sm:items-center sm:justify-between print:border-b-black">
        <div>
          <button
            onClick={() => navigate(isSuperAdmin ? "/superadmin/users" : "/dashboard/users")}
            className="no-print mb-3 inline-flex items-center gap-2 text-xs font-bold text-[#34D399] hover:text-white"
          >
            <ArrowLeft size={15} /> Back to Investors
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#090A0F] text-lg font-bold text-[#34D399] print:border print:border-black print:bg-white print:text-black">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white print:text-black">{user.name || "Unknown investor"}</h1>
              <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs">
                <span className="inline-flex items-center gap-1"><Mail size={12} /> {user.email || "—"}</span>
                <span className="inline-flex items-center gap-1"><Phone size={12} /> {user.phone || "—"}</span>
                <span className="inline-flex items-center gap-1"><Calendar size={12} /> Joined {date(user.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={downloadStatement}
          className="no-print inline-flex items-center justify-center gap-2 bg-[#34D399] px-4 py-2.5 text-xs font-bold text-[#090A0F] hover:bg-[#06D6A0]"
        >
          <Download size={16} /> Download Statement / PDF
        </button>
      </div>

      <div className="print-profile-card hidden print:flex">
        <div className="print-avatar">{user.name?.charAt(0)?.toUpperCase() || "U"}</div>
        <div className="print-profile-main">
          <div className="print-profile-name">{user.name || "Unknown investor"}</div>
          <div className="print-profile-details">
            <span>{user.email || "—"}</span>
            <span>{user.phone || "—"}</span>
            <span>Joined {date(user.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="print-summary-grid grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SummaryCard icon={PiggyBank} label="Total Invested" value={money(totals.totalInvested)} />
        <SummaryCard icon={TrendingUp} label="Total Profit" value={money(totals.totalProfit)} accent="text-emerald-400" />
        <SummaryCard icon={FileText} label="Portfolio Value" value={money(totals.totalValue)} accent="text-blue-400" />
        <SummaryCard icon={Wallet} label="Admin Withdrawal Allocation" value={money(totals.allocated)} accent="text-amber-400" />
        <SummaryCard icon={ArrowUpRight} label="Amount Collected" value={money(totals.collected)} accent="text-rose-400" />
        <SummaryCard icon={Clock} label="Still Withdrawable" value={money(totals.currentAvailable)} accent="text-[#34D399]" />
      </div>

      <section className="print-section border border-slate-800 bg-[#1F2937] print:border-black print:bg-white">
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#090A0F] px-4 py-3 print:border-black print:bg-white">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wide text-white print:text-black">Account Statement</h2>
            <p className="mt-1 text-[11px] text-[#9CA3AF] print:text-black">Financial overview generated on {date(new Date())}.</p>
          </div>
          <FileText size={18} className="text-[#34D399] print:text-black" />
        </div>

        <div className="grid grid-cols-2 gap-px bg-slate-800 sm:grid-cols-4 print:bg-black">
          <StatementMetric label="Allocated" value={money(totals.allocated)} />
          <StatementMetric label="Collected" value={money(totals.collected)} />
          <StatementMetric label="Reinvested" value={money(totals.reinvested)} />
          <StatementMetric label="Current Balance" value={money(totals.currentAvailable)} highlight />
        </div>
      </section>

      <section className="print-section border border-slate-800 bg-[#1F2937] print:border-black print:bg-white">
        <div className="border-b border-slate-800 bg-[#090A0F] px-4 py-3 print:border-black print:bg-white">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white print:text-black">Transaction Statement</h2>
          <p className="mt-1 text-[11px] text-[#9CA3AF] print:text-black">Credits, withdrawals, allocations and other recorded account activity.</p>
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="statement-table w-full min-w-[780px] text-left text-xs print:min-w-0">
            <thead className="bg-[#090A0F] text-[10px] uppercase text-[#9CA3AF] print:bg-white print:text-black">
              <tr>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-black">
              {statementRows.length === 0 ? (
                <tr><td colSpan={5} className="px-4 py-10 text-center text-slate-500">No statement transactions are available for this investor.</td></tr>
              ) : statementRows.map((row) => {
                const config = getTransactionConfig(row.type);
                const Icon = config.icon;
                return (
                  <tr key={row.id} className="hover:bg-[#090A0F]/30 print:hover:bg-transparent">
                    <td className="whitespace-nowrap px-4 py-3 text-[#9CA3AF] print:text-black">{dateTime(row.createdAt)}</td>
                    <td className="px-4 py-3 font-semibold text-white print:text-black">
                      <span className="inline-flex items-center gap-2"><Icon size={14} className={`${config.cls} print:text-black`} /> {row.description || config.label}</span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${config.cls} print:text-black`}>{config.label}</td>
                    <td className="px-4 py-3 text-right font-mono font-bold text-white print:text-black">{money(row.amount)}</td>
                    <td className="px-4 py-3 text-right"><Tag className="m-0 uppercase print:border-black print:text-black" color={row.status === "approved" || row.status === "completed" ? "green" : row.status === "rejected" ? "red" : "orange"}>{row.status}</Tag></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="print-section border border-slate-800 bg-[#1F2937] print:border-black print:bg-white">
        <div className="border-b border-slate-800 bg-[#090A0F] px-4 py-3 print:border-black print:bg-white">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white print:text-black">Investment Allocations</h2>
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="allocation-table w-full min-w-[950px] text-left text-xs print:min-w-0">
            <thead className="bg-[#090A0F] text-[10px] uppercase text-[#9CA3AF] print:bg-white print:text-black">
              <tr>
                <th className="px-4 py-3">Investment</th>
                <th className="px-4 py-3 text-right">Principal</th>
                <th className="px-4 py-3 text-right">Profit</th>
                <th className="px-4 py-3 text-right">Total Value</th>
                <th className="px-4 py-3 text-right">Withdrawable Limit</th>
                <th className="px-4 py-3 text-right">Available</th>
                <th className="px-4 py-3 text-right">Reinvested</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-black">
              {allocations.length === 0 ? (
                <tr><td colSpan={8} className="px-4 py-10 text-center text-slate-500">No investment allocations.</td></tr>
              ) : allocations.map((allocation, index) => (
                <tr key={allocation._id || allocation.id || index}>
                  <td className="px-4 py-3 font-bold text-white print:text-black">
                    <Link
                      to={`${isSuperAdmin ? "/superadmin" : "/dashboard"}/users/${id}/investment/${investmentIdOf(allocation)}`}
                      className="group inline-flex items-center gap-2 hover:text-[#34D399] no-print"
                    >
                      <span>{allocation.investment?.title || "Unknown investment"}</span>
                    </Link>
                    <span className="print:inline hidden">{allocation.investment?.title || "Unknown investment"}</span>
                    <span className="block text-[10px] font-normal text-slate-500">{allocation.investment?.reference || "No reference"}</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-white print:text-black">{money(allocation.principal)}</td>
                  <td className="px-4 py-3 text-right font-mono text-emerald-400 print:text-black">{money(allocation.profitEarned)}</td>
                  <td className="px-4 py-3 text-right font-mono text-blue-400 print:text-black">{money(allocation.totalValue ?? number(allocation.principal) + number(allocation.profitEarned))}</td>
                  <td className="px-4 py-3 text-right font-mono text-amber-400 print:text-black">{money(allocation.withdrawableLimit)}</td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[#34D399] print:text-black">{money(available(allocation))}</td>
                  <td className="px-4 py-3 text-right font-mono text-violet-400 print:text-black">{money(allocation.amountReinvested)}</td>
                  <td className="px-4 py-3 text-right"><Tag className="m-0 uppercase print:border-black print:text-black" color="blue">{allocation.investment?.status || allocation.status || "unknown"}</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="print-section border border-slate-800 bg-[#1F2937] print:border-black print:bg-white">
        <div className="border-b border-slate-800 bg-[#090A0F] px-4 py-3 print:border-black print:bg-white">
          <h2 className="text-sm font-bold uppercase tracking-wide text-white print:text-black">Withdrawal History</h2>
        </div>
        <div className="overflow-x-auto print:overflow-visible">
          <table className="withdrawal-table w-full min-w-[750px] text-left text-xs print:min-w-0">
            <thead className="bg-[#090A0F] text-[10px] uppercase text-[#9CA3AF] print:bg-white print:text-black">
              <tr><th className="px-4 py-3">Date</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Bank / Account</th><th className="px-4 py-3 text-right">Status</th></tr>
            </thead>
            <tbody className="divide-y divide-slate-800 print:divide-black">
              {withdrawalsLoading ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center">Loading withdrawal history...</td></tr>
              ) : withdrawals.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-8 text-center text-slate-500">No withdrawal requests found.</td></tr>
              ) : withdrawals.map((item, index) => (
                <tr key={item._id || item.id || index}>
                  <td className="px-4 py-3 print:text-black">{dateTime(item.createdAt || item.requestedAt || item.updatedAt)}</td>
                  <td className="px-4 py-3 font-mono font-bold text-white print:text-black">{money(item.amountFromBalance ?? item.amount)}</td>
                  <td className="px-4 py-3 text-white print:text-black">{item.bankName || item.bank?.name || "—"}<span className="ml-2 text-slate-500">{item.accountNumber ? `••••${String(item.accountNumber).slice(-4)}` : ""}</span></td>
                  <td className="px-4 py-3 text-right"><Tag className="m-0 uppercase print:border-black print:text-black" color={item.status === "approved" ? "green" : item.status === "rejected" ? "red" : "orange"}>{item.status || "pending"}</Tag></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <div className="flex items-center justify-between border-t border-slate-800 pt-4 text-[10px] print:border-black print:text-black">
        <span>Grey Investment • Investor Statement</span>
        <span>Generated {dateTime(new Date())}</span>
      </div>
    </div>
  );
};

const SummaryCard = ({ icon: Icon, label, value, accent = "text-white" }) => (
  <div className="border border-slate-800 bg-[#1F2937] p-4 print:border-black print:bg-white">
    <div className="flex items-center gap-3">
      <div className="bg-[#090A0F] p-2.5 text-[#34D399] print:border print:border-black print:bg-white print:text-black"><Icon size={18} /></div>
      <div className="min-w-0">
        <p className="text-[10px] font-bold uppercase text-[#9CA3AF] print:text-black">{label}</p>
        <p className={`mt-1 truncate font-mono text-base font-bold ${accent} print:text-black`}>{value}</p>
      </div>
    </div>
  </div>
);

const StatementMetric = ({ label, value, highlight = false }) => (
  <div className="bg-[#1F2937] p-4 print:bg-white">
    <p className="text-[10px] uppercase text-[#9CA3AF] print:text-black">{label}</p>
    <p className={`mt-1 font-mono text-sm font-bold ${highlight ? "text-[#34D399]" : "text-white"} print:text-black`}>{value}</p>
  </div>
);

export default UserDetails;
