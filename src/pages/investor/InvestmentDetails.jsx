import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Wallet,
  TrendingUp,
  Landmark,
  Clock,
  RefreshCw,
  Coins,
  X,
  History,
  ArrowDownToLine,
  Repeat2,
} from "lucide-react";
import { Skeleton, Popover, Button, message } from "antd";
import { fetchInvestmentById } from "../../api/investmentApi";
import { requestWithdrawalApi } from "../../api/withdrawalApi"
import { NIGERIAN_BANKS } from "../../utils/bank";
import {
  formatCurrencyInput,
  sanitizeCurrencyInput,
} from "../../utils/currencyInput";



const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);

const InvestmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [investmentDetails, setInvestmentDetails] = useState();

  // Core structured database object wrapper matching your specific response structure
  const [details, setDetails] = useState({
    investment: null,
    myInvestment: null,
    history: [],
  });

  const [formData, setFormData] = useState({
    amount: "",
    bankName: NIGERIAN_BANKS[0]?.name || "",
    accountName: "",
    accountNumber: "",
    source: "profit",
  });

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetchInvestmentById(id);
      setInvestmentDetails(response?.myInvestment?.allocationId)
      // console.log(response)
      if (response?.success || response?.investment) {
        const returnedHistory = Array.isArray(response.history)
          ? response.history
          : [];
        const hasLimitHistory = returnedHistory.some(
          (event) => event.type === "withdrawable_limit",
        );
        const currentLimit = Number(
          response?.myInvestment?.withdrawableLimit || 0,
        );
        const history =
          !hasLimitHistory && currentLimit > 0
            ? [
                ...returnedHistory,
                {
                  id: `current-limit-${response.myInvestment.allocationId}`,
                  type: "withdrawable_limit",
                  amount: currentLimit,
                  status: "completed",
                  description: "Current withdrawable limit set by the admin.",
                  createdAt:
                    response.myInvestment.allocatedAt || new Date().toISOString(),
                  isCurrentSnapshot: true,
                },
              ]
            : returnedHistory;

        setDetails({
          investment: response.investment || null,
          myInvestment: response.myInvestment || null,
          history,
        });
      } else {
        setError("Invalid response payload structure returned.");
      }
    } catch (err) {
      console.error("Error loading investment:", err);
      setError(
        err.response?.data?.message ||
          "Failed to resolve contract ledger metadata.",
      );
    } finally {
      setLoading(false);
    }
  };

  // console.log(investmentDetails)

  useEffect(() => {
    loadData();
  }, [id]);

  // const handleWithdraw = async (e) => {
  //   if (e && typeof e.preventDefault === "function") e.preventDefault();

  //   const availableToWithdraw = details.myInvestment?.withdrawableLimit || 0;
  //   if (Number(formData.amount) > availableToWithdraw) {
  //     message.error(
  //       "Requested withdrawal value exceeds limit capacity allocation.",
  //     );
  //     return;
  //   }

  //   setIsSubmitting(true);
  //   try {
  //     await requestWithdrawalApi({
  //       ...formData,
  //       investmentId: id,
  //       allocationId: details.myInvestment?.allocationId,
  //     });
  //     message.success("Withdrawal request submitted successfully!");
  //     setIsWithdrawOpen(false);
  //     loadData();
  //   } catch (err) {
  //     console.error(err.response?.data);
  //     message.error(
  //       err.response?.data?.message || "Withdrawal operation failed",
  //     );
  //   } finally {
  //     setIsSubmitting(false);
  //   }
  // };

const handleSubmitWithdrawal = async () => {
  // 1. Guard clause: Ensure the ID exists before attempting the API call
  if (!investmentDetails) {
    return message.error("Allocation ID not found.");
  }

  const requestedAmount = Number(formData.amount);
  const currentAvailableBalance = Number(
    details.myInvestment?.availableBalance || 0,
  );

  if (!Number.isFinite(requestedAmount) || requestedAmount <= 0) {
    return message.error("Enter a valid withdrawal amount.");
  }

  if (currentAvailableBalance <= 0) {
    return message.error(
      "You do not have an available withdrawal balance for this investment.",
    );
  }

  if (requestedAmount > currentAvailableBalance) {
    return message.error(
      `You can request a maximum of ${formatCurrency(currentAvailableBalance)}.`,
    );
  }

  setIsSubmitting(true);
  try {
    // 2. Destructure properties directly out of formData state object
    const { amount, bankName, accountNumber, accountName } = formData;

    // 3. Execute the API request with form state values
    await requestWithdrawalApi(investmentDetails, {
      amount,
      bankName,
      accountNumber,
      accountName,
    });

    // 4. Handle successful submission UI state updates
    message.success("Withdrawal request submitted successfully.");
    setIsWithdrawOpen(false); // Closes the modal matching your state name
    loadData();              // Reloads your backend data matching your loader name
    
  } catch (error) {
    // 5. Handle server-side validation or network errors cleanly
    console.error("Withdrawal error:", error);
    message.error(
      error?.response?.data?.message || "Failed to submit withdrawal request."
    );
  } finally {
    setIsSubmitting(false);
  }
};

  const handleConfirm = async () => {
    setPopoverOpen(false);
    await handleSubmitWithdrawal();
  };

  // Maps properties seamlessly into dynamic card blocks (now containing 6 cards)
 const availableBalance = details.myInvestment?.availableBalance || 0;

  const metrics = [
    {
      label: "Principal Deposited",
      val: details.myInvestment?.principal || 0,
      icon: Wallet,
      color: "text-emerald-400",
    },
    {
      label: "Profit Earned",
      val: details.myInvestment?.profitEarned || 0,
      icon: TrendingUp,
      color: "text-blue-400",
    },
    {
      label: "Amount Reinvested",
      val: details.myInvestment?.amountReinvested || 0,
      icon: Coins,
      color: "text-amber-400",
    },
    {
      label: "Liquid Available Balance",
      val: availableBalance,
      icon: Wallet,
      color: availableBalance === 0 ? "text-rose-200" : "text-emerald-200",
      // Dynamic background and border matching your dark theme palette
      customBg: availableBalance === 0 
        ? "bg-rose-950/40 border-rose-500/30" 
        : "bg-emerald-950/20 border-emerald-500/20",
    },
    {
      label: "Withdrawable Limit",
      val: details.myInvestment?.withdrawableLimit || 0,
      icon: Landmark,
      color: "text-white",
    },
    {
      label: "Total Pool Value",
      val: details.myInvestment?.totalInvestment || 0,
      icon: Clock,
      color: "text-indigo-400",
    },
  ];

  if (error) {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-rose-500/5 border border-rose-500/10 rounded-2xl text-center font-sans">
        <p className="text-rose-400 text-sm font-medium mb-4">{error}</p>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-bold transition-all cursor-pointer"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 text-slate-200 font-sans space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-xs font-semibold uppercase tracking-wider cursor-pointer"
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      {/* 🖼️ Premium Visual Asset Header Banner */}
      {!loading && (
        <div className="relative h-48 w-full rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-gradient-to-r from-[#1F2937] to-[#111827] flex items-end p-8">
          <img
            src={
              details.investment.image.url ||
              "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&auto=format&fit=crop&q=60"
            }
            alt={details.investment?.title}
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#111827] via-transparent to-transparent" />

          <div className="relative z-10">
            <span className="text-[10px] bg-emerald-500/10 border border-emerald-500/20 text-[#34D399] px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
              {details.investment?.status || "Asset Node"}
            </span>
            <h1 className="text-2xl font-black text-white mt-2 capitalize tracking-wide">
              {details.investment?.title || "Asset Pool"}
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Ref: {details.investment?.reference}
            </p>
          </div>
        </div>
      )}

      {/* 📊 Metrics Grid Layout */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((item, idx) => (
          <div
            key={idx}
            // Uses custom background and border classes if defined, otherwise defaults to original slate styles
            className={`${
              item.customBg || "bg-[#1F2937] border-slate-800/80"
            } border p-5 rounded-xl shadow-md flex flex-col justify-between transition-colors duration-200`}
          >
            <div className="flex justify-between items-center mb-3">
              <span className="text-[10px] uppercase font-bold tracking-wider text-[#9CA3AF]">
                {item.label}
              </span>
              <item.icon size={16} className={item.color} />
            </div>
            {loading ? (
              <Skeleton.Input active size="small" style={{ width: 110 }} />
            ) : (
              <span className={`text-xl font-bold font-mono ${item.color}`}>
                {formatCurrency(item.val)}
              </span>
            )}
          </div>
        ))}
      </div>

      <div className="bg-[#1F2937] border border-slate-800/60 rounded-xl p-6 shadow-xl">
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
            <History size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">
              Investment History
            </h3>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Withdrawals, limits and reinvestments for this investment.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="pt-5"><Skeleton active paragraph={{ rows: 4 }} /></div>
        ) : details.history.length === 0 ? (
          <p className="py-8 text-center text-xs text-slate-500">
            No investment activity has been recorded yet.
          </p>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {details.history.map((event) => {
              const isWithdrawal = event.type === "withdrawal";
              const isReinvestment = event.type === "reinvestment";
              const isMaintenanceFee = event.type === "maintenance_fee";
              const EventIcon = isWithdrawal
                ? ArrowDownToLine
                : isReinvestment
                  ? Repeat2
                  : Landmark;
              const title = isWithdrawal
                ? "Withdrawal request"
                : isReinvestment
                  ? "Money reinvested"
                  : isMaintenanceFee
                    ? "System maintenance fee"
                    : "Withdrawable limit added";

              return (
                <div key={`${event.type}-${event.id}`} className="flex gap-4 py-4">
                  <div className="mt-0.5 p-2 h-fit rounded-lg bg-slate-900/70 text-emerald-400">
                    <EventIcon size={16} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-bold text-white">{title}</p>
                      <span className="font-mono text-sm font-bold text-white">
                        {formatCurrency(event.amount)}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {event.description}
                    </p>
                    {event.destinationInvestment && (
                      <p className="text-[11px] text-amber-300 mt-1">
                        Destination: {event.destinationInvestment.title}
                        {event.destinationInvestment.reference
                          ? ` (${event.destinationInvestment.reference})`
                          : ""}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-3 mt-2 text-[10px] text-slate-500">
                      <span>
                        {event.isCurrentSnapshot
                          ? "Current recorded limit"
                          : new Date(event.createdAt).toLocaleString()}
                      </span>
                      <span className={`uppercase font-bold ${
                        event.status === "rejected"
                          ? "text-rose-400"
                          : event.status === "pending"
                            ? "text-amber-400"
                            : "text-emerald-400"
                      }`}>
                        {event.status}
                      </span>
                      {event.bankName && <span>{event.bankName}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Withdrawal Modal Structure */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !isSubmitting && setIsWithdrawOpen(false)}
            className="absolute inset-0 bg-[#090A0F]/70 backdrop-blur-sm"
          />
          <div className="bg-[#1F2937] border border-slate-800 rounded-xl w-full max-w-md p-6 relative z-10 space-y-4 shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-base text-white">
                Request Fund Withdrawal
              </h3>
              <button
                disabled={isSubmitting}
                onClick={() => setIsWithdrawOpen(false)}
                className="text-[#9CA3AF] hover:text-white transition-colors disabled:opacity-30 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitWithdrawal} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wide font-medium">
                  Withdrawal Amount
                </label>
                <input
                  type="text"
                  inputMode="decimal"
                  placeholder="1,000,000"
                  required
                  value={formatCurrencyInput(formData.amount)}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white rounded-lg focus:outline-none focus:border-[#34D399] font-mono"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      amount: sanitizeCurrencyInput(e.target.value),
                    })
                  }
                />
                {!loading &&
                  Number(formData.amount) > availableBalance && (
                    <p className="text-red-400 text-[10px] mt-1.5 font-medium">
                      You can request a maximum of{" "}
                      {formatCurrency(availableBalance)}.
                    </p>
                  )}
                {!loading && availableBalance <= 0 && (
                  <p className="text-red-400 text-[10px] mt-1.5 font-medium">
                    The admin has not made any money available for withdrawal.
                  </p>
                )}
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wide font-medium">
                  Destination Bank
                </label>
                <select
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white rounded-lg focus:outline-none focus:border-[#34D399]"
                  value={formData.bankName}
                  onChange={(e) =>
                    setFormData({ ...formData, bankName: e.target.value })
                  }
                >
                  <option value="">Select a Bank</option>
                  {NIGERIAN_BANKS.map((b) => (
                    <option key={b.code} value={b.name}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wide font-medium">
                  Account Holder Name
                </label>
                <input
                  type="text"
                  placeholder="John Doe"
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white rounded-lg focus:outline-none focus:border-[#34D399]"
                  onChange={(e) =>
                    setFormData({ ...formData, accountName: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1 text-[11px] uppercase tracking-wide font-medium">
                  10-Digit Account Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  pattern="\d{10}"
                  placeholder="0123456789"
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white rounded-lg focus:outline-none focus:border-[#34D399] font-mono"
                  onChange={(e) =>
                    setFormData({ ...formData, accountNumber: e.target.value })
                  }
                />
              </div>

              <div className="pt-2">
                <Popover
                  content={
                    <div className="p-2 space-y-3 max-w-[240px] ">
                      <p className="text-xs text-black">
                        Are you certain the inputted financial destination
                        parameters are accurate?
                      </p>
                      <div className="flex gap-2 justify-end">
                        <Button
                          size="small"
                          onClick={() => setPopoverOpen(false)}
                          disabled={isSubmitting}
                        >
                          No
                        </Button>
                        <Button
                          size="small"
                          type="primary"
                          className="bg-[#34D399] border-none text-[#090A0F] font-bold"
                          loading={isSubmitting}
                          onClick={handleConfirm}
                        >
                          Yes, Send
                        </Button>
                      </div>
                    </div>
                  }
                  title={
                    <span className="text-xs font-bold text-white">
                      Confirm Settlement Target
                    </span>
                  }
                  trigger="click"
                  open={popoverOpen}
                  onOpenChange={(visible) =>
                    !isSubmitting && setPopoverOpen(visible)
                  }
                >
                  <button
                    type="button"
                    disabled={
                      isSubmitting ||
                      !formData.amount ||
                      !formData.accountNumber ||
                      availableBalance <= 0 ||
                      Number(formData.amount) > availableBalance
                    }
                    className="w-full py-3 font-bold bg-[#34D399] text-[#090A0F] hover:bg-[#28b485] transition-all rounded-lg disabled:opacity-30 disabled:hover:bg-[#34D399] cursor-pointer disabled:cursor-not-allowed"
                  >
                    Submit Settlement Request
                  </button>
                </Popover>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📋 Detail Table Summary Section */}
      <div className="bg-[#1F2937] border border-slate-800/60 rounded-xl p-8 shadow-xl">
        <h3 className="text-sm font-bold text-white tracking-wide border-b border-slate-800 pb-4 uppercase">
          Investment Pipeline Context
        </h3>
        {loading ? (
          <div className="pt-4">
            <Skeleton active paragraph={{ rows: 4 }} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-2 mt-4">
            <InfoRow label="Pool Name" value={details.investment?.title} />
            <InfoRow
              label="Asset Lifecycle Status"
              value={details.investment?.status}
              isBadge
              badgeStyle={
                details.investment?.status === "pending"
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-emerald-500/10 text-[#34D399] border-emerald-500/20"
              }
            />
            <InfoRow
              label="Pipeline Allocation Reference"
              value={details.investment?.reference}
              isMono
            />
            <InfoRow
              label="Target Funding Volume"
              value={formatCurrency(details.investment?.targetAmount)}
              isMono
            />
            <InfoRow
              label="Allocated Cap"
              value={formatCurrency(details.investment?.totalAllocated)}
              isMono
            />
            <InfoRow
              label="Active Investors Tied"
              value={`${details.investment?.investorCount || 0} Entities`}
            />
            <InfoRow
              label="Allocation Timestamp"
              value={
                details.myInvestment?.allocatedAt
                  ? new Date(details.myInvestment.allocatedAt).toLocaleString()
                  : "—"
              }
            />
            <InfoRow
              label="Action Executable"
              value={
                <button
                  onClick={() => setIsWithdrawOpen(true)}
                  className="px-5 py-2 bg-[#34D399] text-[#090A0F] text-xs font-bold rounded-lg hover:bg-[#06D6A0] cursor-pointer transition-colors shadow-sm"
                >
                  Request Fund Payout
                </button>
              }
            />
          </div>
        )}
      </div>
    </div>
  );
};

const InfoRow = ({ label, value, isBadge, isMono, badgeStyle }) => (
  <div className="flex items-center justify-between border-b border-slate-800/60 py-3 text-xs">
    <span className="text-slate-400 font-medium">{label}</span>
    {isBadge ? (
      <span
        className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${badgeStyle || "bg-slate-800 text-slate-300 border-slate-700"}`}
      >
        {value || "Unknown"}
      </span>
    ) : (
      <span
        className={`font-semibold text-white ${isMono ? "font-mono text-[13px]" : "capitalize"}`}
      >
        {value || "—"}
      </span>
    )}
  </div>
);

export default InvestmentDetails;
