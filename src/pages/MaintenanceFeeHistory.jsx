import { useEffect, useState } from "react";
import { History, Plus, Trash2, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { message, Skeleton } from "antd";
import {
  fetchMaintenanceFeeHistory,
  recordMaintenanceFeePayout,
} from "../api/settingsApi";

const formatCurrency = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 2,
  }).format(Number(amount) || 0);

const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString();
};

const createPayoutRow = () => ({
  id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  investmentId: "",
  amount: "",
});

const MaintenanceFeeHistory = () => {
  const navigate = useNavigate();
  const [report, setReport] = useState({
    summary: { accumulated: 0, paid: 0, remaining: 0 },
    investments: [],
    entries: [],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isPayoutOpen, setIsPayoutOpen] = useState(false);
  const [payout, setPayout] = useState(() => ({
    allocations: [createPayoutRow()],
    description: "",
  }));

  const loadReport = async () => {
    const response = await fetchMaintenanceFeeHistory();
    setReport({
      summary: response?.summary || { accumulated: 0, paid: 0, remaining: 0 },
      investments: response?.investments || [],
      entries: response?.entries || [],
    });
  };

  useEffect(() => {
    loadReport()
      .catch((error) => {
        message.error(error?.response?.data?.message || "Unable to load maintenance fee history.");
      })
      .finally(() => setLoading(false));
  }, []);

  const updatePayoutAllocation = (rowId, key, value) => {
    setPayout((current) => ({
      ...current,
      allocations: current.allocations.map((row) =>
        row.id === rowId ? { ...row, [key]: value } : row,
      ),
    }));
  };

  const handlePayout = async (event) => {
    event.preventDefault();
    const allocations = payout.allocations.map(({ investmentId, amount }) => ({
      investmentId,
      amount: Number(amount),
    }));
    if (allocations.some((item) => !item.investmentId || !Number.isFinite(item.amount) || item.amount < 0.01)) {
      message.error("Select an investment and enter a valid amount on every row.");
      return;
    }

    try {
      setSaving(true);
      await recordMaintenanceFeePayout({ allocations, description: payout.description });
      message.success("Maintenance fund payment recorded.");
      setPayout({ allocations: [createPayoutRow()], description: "" });
      setIsPayoutOpen(false);
      await loadReport();
    } catch (error) {
      message.error(error?.response?.data?.message || "Unable to record maintenance fund payment.");
    } finally {
      setSaving(false);
    }
  };

  const hasUnselectedFund = report.investments.some(
    (investment) => investment.remaining > 0 &&
      !payout.allocations.some((row) => row.investmentId === investment._id),
  );
  const payoutTotal = payout.allocations.reduce(
    (sum, row) => sum + (Number(row.amount) || 0),
    0,
  );
  const fundedInvestments = report.investments.filter(
    (investment) => Number(investment.accumulated || 0) > 0,
  );

  return (
    <div className="min-h-screen space-y-6 bg-[#1F1F1F] text-[#9CA3AF]">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2 text-white">
            <History size={21} className="text-amber-400" />
            <h1 className="text-2xl font-bold tracking-tight">Maintenance Fee</h1>
          </div>
          <p className="mt-1 text-sm text-[#9CA3AF]">
            System maintenance shares by investment, including payments and remaining balances.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsPayoutOpen(true)}
          disabled={loading || !report.investments.some((item) => item.remaining > 0)}
          className="inline-flex items-center gap-2 bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Record Payment
        </button>
      </div>

      <div className="overflow-x-auto border border-slate-800 bg-[#1F2937]">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead className="bg-[#090A0F] text-[10px] uppercase tracking-wider text-[#9CA3AF]">
            <tr>
              <th className="px-4 py-3">#</th>
              <th className="px-4 py-3">Investment</th>
              <th className="px-4 py-3 text-right">System %</th>
              <th className="px-4 py-3 text-right">Accumulated</th>
              <th className="px-4 py-3 text-right">Paid</th>
              <th className="px-4 py-3 text-right">Remaining</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8"><Skeleton active paragraph={{ rows: 2 }} /></td></tr>
            ) : fundedInvestments.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-10 text-center text-slate-500">No investments have accumulated a system maintenance share.</td></tr>
            ) : (
              <>
                {fundedInvestments.map((investment, index) => (
                  <tr
                    key={investment._id}
                    role="link"
                    tabIndex={0}
                    aria-label={`Open ${investment.title} investment details`}
                    onClick={() => navigate(`/dashboard/investment/${investment._id}`)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        navigate(`/dashboard/investment/${investment._id}`);
                      }
                    }}
                    className="cursor-pointer hover:bg-[#111827] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#34D399]"
                  >
                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                    <td className="px-4 py-3">
                      <p className="font-bold text-white">{investment.title}</p>
                      <p className="mt-0.5 text-[10px] text-slate-500">{investment.reference || "—"}</p>
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-slate-400">{Number(investment.systemMaintenancePercentage || 0)}%</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-emerald-300">{formatCurrency(investment.accumulated)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-amber-300">{formatCurrency(investment.paid)}</td>
                    <td className="whitespace-nowrap px-4 py-3 text-right font-mono font-bold text-white">{formatCurrency(investment.remaining)}</td>
                  </tr>
                ))}
                <tr className="bg-[#090A0F]/60 font-bold text-white">
                  <td colSpan={3} className="px-4 py-3">Total</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-emerald-300">{formatCurrency(report.summary.accumulated)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono text-amber-300">{formatCurrency(report.summary.paid)}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-right font-mono">{formatCurrency(report.summary.remaining)}</td>
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>

      {isPayoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <button
            type="button"
            aria-label="Close payment form"
            onClick={() => !saving && setIsPayoutOpen(false)}
            className="absolute inset-0 bg-[#090A0F]/80 backdrop-blur-sm"
          />
          <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto border border-slate-700 bg-[#1F2937] p-5 shadow-2xl">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-slate-800 pb-3">
              <div>
                <h2 className="text-sm font-bold uppercase tracking-wider text-white">Record a payment</h2>
                <p className="mt-1 text-[11px] text-slate-400">Allocate the payment across one or more investments. Each amount is checked against that investment's available maintenance balance.</p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={() => setIsPayoutOpen(false)}
                aria-label="Close"
                className="text-slate-400 hover:text-white disabled:opacity-40"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handlePayout} className="space-y-4">
              <div className="space-y-3">
                {payout.allocations.map((row, index) => {
                  const selectedInvestment = report.investments.find(
                    (investment) => investment._id === row.investmentId,
                  );
                  const selectableInvestments = report.investments.filter(
                    (investment) => investment.remaining > 0 && (
                      investment._id === row.investmentId ||
                      !payout.allocations.some((other) =>
                        other.id !== row.id && other.investmentId === investment._id,
                      )
                    ),
                  );

                  return (
                    <div key={row.id} className="grid grid-cols-1 gap-2 border border-slate-800 bg-[#111827] p-3 sm:grid-cols-[minmax(0,1fr)_150px_auto] sm:items-end">
                      <label className="block space-y-1.5 text-xs">
                        <span className="font-bold text-slate-300">Investment {index + 1}</span>
                        <select
                          required
                          value={row.investmentId}
                          onChange={(event) => updatePayoutAllocation(row.id, "investmentId", event.target.value)}
                          className="w-full border border-slate-800 bg-[#090A0F] px-3 py-2.5 text-white"
                        >
                          <option value="">Select investment</option>
                          {selectableInvestments.map((investment) => (
                            <option key={investment._id} value={investment._id}>
                              {investment.title} — {formatCurrency(investment.remaining)} available
                            </option>
                          ))}
                        </select>
                      </label>
                      <label className="block space-y-1.5 text-xs">
                        <span className="font-bold text-slate-300">Amount (₦)</span>
                        <input
                          required
                          type="number"
                          min="0.01"
                          step="0.01"
                          max={selectedInvestment?.remaining || undefined}
                          value={row.amount}
                          onChange={(event) => updatePayoutAllocation(row.id, "amount", event.target.value)}
                          className="w-full border border-slate-800 bg-[#090A0F] px-3 py-2.5 text-white"
                        />
                      </label>
                      <button
                        type="button"
                        disabled={payout.allocations.length === 1 || saving}
                        onClick={() => setPayout((current) => ({
                          ...current,
                          allocations: current.allocations.filter((item) => item.id !== row.id),
                        }))}
                        aria-label={`Remove investment ${index + 1}`}
                        className="flex h-10 items-center justify-center border border-slate-700 px-3 text-slate-400 hover:text-rose-300 disabled:opacity-30"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  );
                })}
              </div>

              <button
                type="button"
                disabled={!hasUnselectedFund || saving}
                onClick={() => setPayout((current) => ({
                  ...current,
                  allocations: [...current.allocations, createPayoutRow()],
                }))}
                className="inline-flex items-center gap-2 text-xs font-bold text-emerald-300 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Plus size={15} /> Add another investment
              </button>

              <label className="block space-y-1.5 text-xs">
                <span className="font-bold text-slate-300">Recipient or payment details</span>
                <input
                  required
                  value={payout.description}
                  onChange={(event) => setPayout({ ...payout, description: event.target.value })}
                  className="w-full border border-slate-800 bg-[#090A0F] px-3 py-2.5 text-white"
                  placeholder="Describe who or what was paid"
                />
              </label>
              <p className="text-right text-xs font-mono text-slate-400">Total payment: <span className="font-bold text-white">{formatCurrency(payoutTotal)}</span></p>
              <div className="flex justify-end gap-2 border-t border-slate-800 pt-3">
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => setIsPayoutOpen(false)}
                  className="border border-slate-700 px-4 py-2 text-xs font-bold text-slate-300 disabled:opacity-40"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving || !report.investments.some((item) => item.remaining > 0)}
                  className="bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Recording payment..." : "Record Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaintenanceFeeHistory;
