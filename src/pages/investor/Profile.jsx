import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";
import { message, Skeleton, Drawer, Tag, Popover, Button } from "antd";
import { useAuthStore } from "../../store/useAuthStore";
import {
  requestWithdrawalApi,
} from "../../api/withdrawalApi";
import { NIGERIAN_BANKS } from "../../utils/bank";
import { fetchInvestorAnalytics } from "../../api/analyticsApi";
import { updateMyProfile } from "../../api/authApi";

const Profile = () => {
  const { user, checkAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(8);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false); // Restored
  const history = [];
  const [formData, setFormData] = useState({
    amount: "",
    bankName: NIGERIAN_BANKS[0].name,
    accountName: "",
    accountNumber: "",
    source: "profit",
  });
  const [availableBalance, setAvailableBalance] = useState(0);

  useEffect(() => {
    fetchInvestorAnalytics()
      .then((result) => {
      if (result?.status === "success") {
        setAvailableBalance(result.summaryCards.availableBalance || 0);
      }
      })
      .catch((err) => {
        console.error("Dashboard calculation error:", err);
      });
  }, []);

  useEffect(() => {
    const init = async () => {
      try {
        const freshUser = await checkAuth();
        setProfileForm({
          name: freshUser.name || "",
          email: freshUser.email || "",
          phone: freshUser.phone || "",
        });
      } catch {
        message.error("Unable to load your profile.");
      } finally {
        setSyncing(false);
      }
    };
    init();
  }, [checkAuth]);

  const handleProfileUpdate = async (event) => {
    event.preventDefault();

    try {
      setSavingProfile(true);
      const response = await updateMyProfile(profileForm);
      useAuthStore.getState().updateUserContext(response.user);
      setProfileForm({
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
      });
      message.success(response.message || "Profile updated successfully.");
    } catch (err) {
      message.error(
        err?.response?.data?.message || "Unable to update profile.",
      );
    } finally {
      setSavingProfile(false);
    }
  };

  const handleWithdraw = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Ensure 'source' is included
      await requestWithdrawalApi({ ...formData, source: "profit" });
      message.success("Withdrawal request submitted!");
      setIsWithdrawOpen(false);
    } catch (err) {
      // The server is telling you exactly why it failed
      console.error(err.response?.data);
      message.error(err.response?.data?.message || "Withdrawal failed");
    } finally {
      setLoading(false);
    }
  };

  

const handleConfirm = async () => {
  setPopoverOpen(false); // Close popover
  await handleWithdraw(new Event("submit")); // Trigger your submit logic
};

  if (syncing)
    return (
      <div className="max-w-5xl mx-auto p-10">
        <Skeleton active />
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-8">
      {/* Identity Overview */}
      <div className="bg-[#1F2937] border border-slate-800 p-8 rounded-none">
        <h2 className="text-lg font-bold text-white mb-6">User Identity</h2>
        <form
          onSubmit={handleProfileUpdate}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
              Full Name
            </p>
            <input
              type="text"
              required
              value={profileForm.name}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  name: event.target.value,
                }))
              }
              className="w-full bg-[#090A0F] border border-slate-800 px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#34D399]"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
              Email
            </p>
            <input
              type="email"
              required
              value={profileForm.email}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  email: event.target.value,
                }))
              }
              className="w-full bg-[#090A0F] border border-slate-800 px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#34D399]"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
              Phone Number
            </p>
            <input
              type="tel"
              required
              value={profileForm.phone}
              onChange={(event) =>
                setProfileForm((current) => ({
                  ...current,
                  phone: event.target.value,
                }))
              }
              className="w-full bg-[#090A0F] border border-slate-800 px-3 py-2 text-white font-semibold focus:outline-none focus:border-[#34D399]"
            />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
              Account Role
            </p>
            <p className="text-white font-semibold capitalize">{user?.role}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[10px] uppercase tracking-wider text-[#9CA3AF] font-bold">
              Member Since
            </p>
            <p className="text-white font-semibold">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleDateString()
                : "Not available"}
            </p>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="w-full inline-flex items-center justify-center gap-2 bg-[#34D399] hover:bg-[#06D6A0] disabled:opacity-50 text-[#090A0F] font-bold px-4 py-2.5"
            >
              <Save size={14} />
              {savingProfile ? "Saving..." : "Save Profile"}
            </button>
          </div>
        </form>
      </div>

      {/* Financial Hub */}
      {/* <div className="bg-slate-900 border border-slate-800 p-8 rounded-none flex justify-between items-center">
        <div>
          <h2 className="text-base font-bold text-white">Financial Hub</h2>
          <p className="text-[#9CA3AF] text-xs">
            Manage your capital and monitor transactions.
          </p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={loadHistory}
            disabled={loadingHistory}
            className="px-6 py-2.5 bg-slate-800 text-white text-xs font-bold rounded-none hover:bg-slate-700 cursor-pointer"
          >
            {loadingHistory ? "Loading..." : "View History"}
          </button>
          <button
            onClick={() => setIsWithdrawOpen(true)}
            className="px-6 py-2.5 bg-[#34D399] text-[#090A0F] text-xs font-bold rounded-none hover:bg-[#06D6A0] cursor-pointer"
          >
            Withdraw Funds
          </button>
        </div>
      </div> */}

      {/* History Drawer */}
      <Drawer
        title={
          <span className="text-white uppercase tracking-wider font-bold">
            Transaction History
          </span>
        }
        width={1000}
        open={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        // This makes the close icon white
        closeIcon={<X className="text-white" size={20} />}
        styles={{
          header: {
            backgroundColor: "#090A0F",
            borderBottom: "1px solid #1F2937",
          },
          body: { backgroundColor: "#090A0F", padding: "0" },
        }}
      >
        {/* The rest of your table code remains the same */}
        <div className="border-x border-b border-slate-800">
          <div className="grid grid-cols-7 bg-[#1F2937] border-b border-slate-800 text-[#9CA3AF] text-xs font-bold uppercase tracking-wider">
            {[
              "Account Name",
              "Bank",
              "Account No.",
              "Amount",
              "From",
              "Date/Time",
              "Status",
            ].map((h) => (
              <div key={h} className="p-4">
                {h}
              </div>
            ))}
          </div>

          <div className="divide-y divide-slate-800">
            {history
              .slice((currentPage - 1) * pageSize, currentPage * pageSize)
              .map((item) => (
                <div
                  key={item._id}
                  className="grid grid-cols-7 p-3 items-center text-white text-xs"
                >
                  <div className="font-semibold capitalize">
                    {item.accountName}
                  </div>
                  <div className="capitalize">{item.bankName}</div>
                  <div>{item.accountNumber}</div>
                  <div className="text-[#34D399]">
                    ₦{item.amount.toLocaleString()}
                  </div>
                  <div className="capitalize">{item.source}</div>
                  <div className="text-slate-400">
                    {new Date(item.createdAt).toLocaleString()}
                  </div>
                  <div>
                    <Tag color={item.status === "approved" ? "green" : "gold"}>
                      {item.status.toUpperCase()}
                    </Tag>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Simple Pagination Control */}
        <div className="p-4 flex justify-end gap-2 text-white">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
            className="px-3 py-1 bg-slate-800 disabled:opacity-50"
          >
            Prev
          </button>
          <span className="px-3 py-1">{currentPage}</span>
          <button
            disabled={currentPage * pageSize >= history.length}
            onClick={() => setCurrentPage((p) => p + 1)}
            className="px-3 py-1 bg-slate-800 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </Drawer>

      {/* Withdrawal Modal */}
      {isWithdrawOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            onClick={() => !loading && setIsWithdrawOpen(false)}
            className="absolute inset-0 bg-[#090A0F]/70 backdrop-blur-xs"
          />
          <div className="bg-[#1F2937] border border-slate-800 rounded-none w-full max-w-sm p-6 relative z-10 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-base text-white">
                Request Withdrawal
              </h3>
              <button
                onClick={() => setIsWithdrawOpen(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleWithdraw} className="space-y-4 text-xs">
              {/* Amount Input */}
              <input
                type="number"
                min="1"
                placeholder="Amount"
                required
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white focus:outline-none focus:border-[#34D399]"
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setFormData({ ...formData, amount: val });
                }}
              />

              {/* Validation Warning */}
              {formData.amount > availableBalance && (
                <p className="text-red-500 text-[10px] -mt-2">
                  Amount exceeds your available principal: ₦
                  {availableBalance.toLocaleString()}
                </p>
              )}

              <select
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white"
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

              <input
                type="text"
                placeholder="Account Name"
                required
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white"
                onChange={(e) =>
                  setFormData({ ...formData, accountName: e.target.value })
                }
              />

              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]+"
                placeholder="Account Number"
                required
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white"
                onChange={(e) =>
                  setFormData({ ...formData, accountNumber: e.target.value })
                }
              />

            <Popover
  content={
    <div className="p-2 space-y-3">
      <p className="text-xs">Are these account details correct?</p>
      <div className="flex gap-2">
        <Button 
          size="small" 
          onClick={() => setPopoverOpen(false)} 
          disabled={isSubmitting} // Disable "No" while submitting
        >
          No
        </Button>
        <Button 
          size="small" 
          type="primary" 
          className="bg-[#34D399] border-none text-[#090A0F]" 
          loading={isSubmitting} // This triggers the Ant Design loader
          onClick={async () => {
            setIsSubmitting(true); // Start loader
            await handleConfirm(); // Your existing logic
            setIsSubmitting(false); // Stop loader (or it closes anyway on submit)
          }}
        >
          Yes, Send
        </Button>
      </div>
    </div>
  }
  title={<span className="text-xs">Confirm Details</span>}
  trigger="click"
  open={popoverOpen}
  onOpenChange={(visible) => setPopoverOpen(visible)}
>
  <button
    type="button"
    className="w-full py-3 font-bold bg-[#34D399] text-[#090A0F] hover:bg-[#28b485] transition-all"
  >
    Submit Request
  </button>
</Popover>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
