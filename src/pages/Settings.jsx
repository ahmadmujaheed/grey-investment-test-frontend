import { useState } from "react";
import { 
  Settings as SettingsIcon,
  User, 
  Shield, 
  Save, 
  Lock, 
  Eye, 
  EyeOff,
  Percent
} from "lucide-react";
import { motion } from "motion/react";
import { message } from "antd";
import { chargeAllMaintenanceFee } from "../api/userApi";
import { formatCurrencyInput, sanitizeCurrencyInput } from "../utils/currencyInput";

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } }
};

const Settings = () => {
  // --- Edit Information State ---
  const [profileForm, setProfileForm] = useState({
    platformName: "Grey Pools Global Ltd",
    supportEmail: "operations@greypools.io"
  });

  // --- Reset Password State ---
  const [securityForm, setSecurityForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // --- Revenue Split State ---
  const [revenueSplit, setRevenueSplit] = useState({
    companyShare: 40,
    investorShare: 60
  });

  const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false });
  const [feeForm, setFeeForm] = useState({ amount: "", password: "" });
  const [chargingFee, setChargingFee] = useState(false);

  const handleBulkFee = async (e) => {
    e.preventDefault();
    try {
      setChargingFee(true);
      const result = await chargeAllMaintenanceFee(feeForm);
      message.success(result.message);
      setFeeForm({ amount: "", password: "" });
    } catch (error) {
      message.error(error.response?.data?.message || "Unable to charge maintenance fee.");
    } finally { setChargingFee(false); }
  };

  // --- Handlers ---
  const handleProfileSave = (e) => {
    e.preventDefault();
    message.success("Platform metadata updated successfully!");
  };

  const handleSecuritySave = (e) => {
    e.preventDefault();
    if (securityForm.newPassword !== securityForm.confirmPassword) {
      message.error("Credential confirmation mismatch. Please verify your entries.");
      return;
    }
    message.success("Administrative master password reset successfully!");
    setSecurityForm({ current: '', new: '', confirm: '' });
  };

  const handleRevenueSplitSave = (e) => {
    e.preventDefault();
    const total = Number(revenueSplit.companyShare) + Number(revenueSplit.investorShare);
    
    if (total !== 100) {
      message.error(`Allocation mismatch: Combined distribution must total exactly 100% (Currently: ${total}%).`);
      return;
    }
    
    message.success("Platform equity distribution schema saved successfully!");
  };

  return (
    <div className="space-y-6 bg-[#1F1F1F] min-h-screen text-[#9CA3AF]">
      
      {/* Page Title Header */}
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-white">
          <SettingsIcon size={22} className="text-[#34D399]" />
          <h1 className="text-2xl font-bold tracking-tight">System Settings</h1>
        </div>
        <p className="text-sm text-[#9CA3AF] mt-0.5">Manage administrative profile details, equity yield ratios, and secure system access passwords.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="border border-amber-500/30 bg-[#1F2937] p-6 rounded-none space-y-4 lg:col-span-2">
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <SettingsIcon size={18} className="text-amber-400" />
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">Charge All Active Investors Maintenance Fee</h3>
          </div>
          <p className="text-xs text-slate-400">The same amount will be deducted from each active investor's available profit. Investors with insufficient profit will be skipped.</p>
          <form onSubmit={handleBulkFee} className="grid md:grid-cols-3 gap-4 text-xs items-end">
            <div className="space-y-1.5"><label className="font-bold block">Amount (₦)</label><input type="text" inputMode="numeric" required value={formatCurrencyInput(feeForm.amount)} onChange={(e) => setFeeForm({ ...feeForm, amount: sanitizeCurrencyInput(e.target.value) })} className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white" placeholder="10,000" /></div>
            <div className="space-y-1.5"><label className="font-bold block">Administrator Password</label><input type="password" required value={feeForm.password} onChange={(e) => setFeeForm({ ...feeForm, password: e.target.value })} className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 text-white" /></div>
            <button disabled={chargingFee} className="py-2.5 bg-amber-500 text-slate-950 font-bold disabled:opacity-50">{chargingFee ? "Charging..." : "Charge Maintenance Fee"}</button>
          </form>
        </motion.div>
        
        {/* CARD 1: EDIT INFORMATION */}
        <motion.div 
          variants={fadeInUp} 
          initial="hidden" 
          animate="visible"
          className="border border-slate-800 bg-[#1F2937] p-6 rounded-none space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <User size={18} className="text-[#34D399]" />
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">Edit Platform Information</h3>
          </div>

          <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-bold text-[#9CA3AF] block">Firm Operating Brand Name</label>
              <input 
                type="text" 
                value={profileForm.platformName}
                onChange={(e) => setProfileForm({...profileForm, platformName: e.target.value})}
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#9CA3AF] block">System Operations Support Email</label>
              <input 
                type="email" 
                value={profileForm.supportEmail}
                onChange={(e) => setProfileForm({...profileForm, supportEmail: e.target.value})}
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit"
                className="flex items-center gap-2 bg-[#34D399] hover:bg-[#06D6A0] text-[#090A0F] font-bold text-xs px-4 py-2.5 rounded-none transition-colors"
              >
                <Save size={14} /> Save Changes
              </button>
            </div>
          </form>
        </motion.div>

        {/* CARD 2: REVENUE SPLIT CONFIGURATION */}
        <motion.div 
          variants={fadeInUp} 
          initial="hidden" 
          animate="visible"
          className="border border-slate-800 bg-[#1F2937] p-6 rounded-none space-y-4"
        >
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Percent size={18} className="text-[#34D399]" />
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">Revenue Split Allocation</h3>
          </div>

          <form onSubmit={handleRevenueSplitSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">Company Retention (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={revenueSplit.companyShare}
                    onChange={(e) => setRevenueSplit({...revenueSplit, companyShare: e.target.value})}
                    className="w-full pl-3 pr-8 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-[#9CA3AF] block">Investor Yield (%)</label>
                <div className="relative">
                  <input 
                    type="number" 
                    min="0"
                    max="100"
                    value={revenueSplit.investorShare}
                    onChange={(e) => setRevenueSplit({...revenueSplit, investorShare: e.target.value})}
                    className="w-full pl-3 pr-8 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">%</span>
                </div>
              </div>
            </div>

            {/* Visual Balance Bar */}
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between font-mono text-[10px] text-slate-500">
                <span>Company: {revenueSplit.companyShare || 0}%</span>
                <span>Investors: {revenueSplit.investorShare || 0}%</span>
              </div>
              <div className="w-full h-1.5 bg-[#090A0F] flex overflow-hidden">
                <div 
                  style={{ width: `${revenueSplit.companyShare}%` }} 
                  className="bg-[#3B82F6] transition-all duration-300"
                />
                <div 
                  style={{ width: `${revenueSplit.investorShare}%` }} 
                  className="bg-[#34D399] transition-all duration-300"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button 
                type="submit"
                className="flex items-center gap-2 bg-[#34D399] hover:bg-[#06D6A0] text-[#090A0F] font-bold text-xs px-4 py-2.5 rounded-none transition-colors"
              >
                <Save size={14} /> Update Split Schema
              </button>
            </div>
          </form>
        </motion.div>

        {/* CARD 3: RESET PASSWORD */}
        <motion.div 
          variants={fadeInUp} 
          initial="hidden" 
          animate="visible"
          className="border border-slate-800 bg-[#1F2937] p-6 rounded-none space-y-4 lg:col-span-2"
        >
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
            <Shield size={18} className="text-[#34D399]" />
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">Reset Password</h3>
          </div>

          <form onSubmit={handleSecuritySave} className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs items-end">
            <div className="space-y-1.5">
              <label className="font-bold text-[#9CA3AF] block">Current Password</label>
              <div className="relative">
                <input 
                  type={showPass.current ? "text" : "password"}
                  required
                  value={securityForm.currentPassword}
                  onChange={(e) => setSecurityForm({...securityForm, currentPassword: e.target.value})}
                  className="w-full pl-3 pr-10 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass({...showPass, current: !showPass.current})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-white"
                >
                  {showPass.current ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#9CA3AF] block">New Password</label>
              <div className="relative">
                <input 
                  type={showPass.new ? "text" : "password"}
                  required
                  value={securityForm.newPassword}
                  onChange={(e) => setSecurityForm({...securityForm, newPassword: e.target.value})}
                  className="w-full pl-3 pr-10 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass({...showPass, new: !showPass.new})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-white"
                >
                  {showPass.new ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="font-bold text-[#9CA3AF] block">Confirm New Password</label>
              <div className="relative">
                <input 
                  type={showPass.confirm ? "text" : "password"}
                  required
                  value={securityForm.confirmPassword}
                  onChange={(e) => setSecurityForm({...securityForm, confirmPassword: e.target.value})}
                  className="w-full pl-3 pr-10 py-2.5 bg-[#090A0F] border border-slate-800 rounded-none font-semibold text-white focus:outline-none focus:border-[#3B82F6] transition-all"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPass({...showPass, confirm: !showPass.confirm})}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] hover:text-white"
                >
                  {showPass.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <div className="md:col-span-3 pt-2 flex justify-end">
              <button 
                type="submit"
                className="flex items-center gap-2 bg-[#3B82F6] hover:bg-blue-600 text-white font-bold text-xs px-4 py-2.5 rounded-none transition-colors"
              >
                <Lock size={14} /> Reset Password
              </button>
            </div>
          </form>
        </motion.div>

      </div>
    </div>
  );
};

export default Settings;
