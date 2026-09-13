import { useState } from "react";
import { ShieldAlert, KeyRound, Lock, Eye, EyeOff, RefreshCw, CheckCircle2, XCircle } from "lucide-react";
import { motion } from "motion/react";
import { message } from "antd";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/useAuthStore";
import { updateUserPassword } from "../../api/authApi";

const Settings = () => {
  // 🔌 Pull 'user' state and your store mutation actions
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate(); 
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [visibility, setVisibility] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const toggleVisibility = (field) => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const hasMinLength = formData.newPassword.length >= 8;
  const passwordsMatch = formData.newPassword && formData.newPassword === formData.confirmPassword;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hasMinLength) return message.error("New password must be at least 8 characters.");
    if (!passwordsMatch) return message.error("New password configurations do not match.");

    try {
      setLoading(true);
      await updateUserPassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      message.success("Password updated successfully!");
      setFormData({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      if (logout) {
        await logout();
      }
      navigate("/", { replace: true });
      
    } catch (err) {
      console.error("Password update error:", err);
      message.error(err.response?.data?.message || "Failed to update security credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto font-sans text-slate-200 p-4 space-y-6 min-h-screen">
      
      {/* 🔐 Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
          <KeyRound className="text-[#34D399]" size={24} />
          Account Security Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Update your access credentials to keep your live portfolio capital nodes completely secure.
        </p>
      </div>

      {/* Main Panel Box */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-b from-[#1F2937] to-[#18202F] border border-slate-800/80 rounded-2xl shadow-xl shadow-[#090A0F]/40 overflow-hidden"
      >
        <div className="p-5 border-b border-slate-800/60 bg-[#090A0F]/10 flex items-center gap-3">
          <div className="p-2 bg-amber-500/10 rounded-xl text-amber-400">
            <ShieldAlert size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Modify Authentication Secret</h3>
            <p className="text-[11px] text-slate-400">Ensure your new criteria uses unique combinations.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          
          <PasswordField 
            label="Current Password"
            name="currentPassword"
            value={formData.currentPassword}
            isVisible={visibility.current}
            onToggle={() => toggleVisibility("current")}
            onChange={handleChange}
          />

          <div className="h-px bg-slate-800/40 my-2" />

          <PasswordField 
            label="New Password"
            name="newPassword"
            value={formData.newPassword}
            isVisible={visibility.new}
            onToggle={() => toggleVisibility("new")}
            onChange={handleChange}
          />

          <PasswordField 
            label="Confirm New Password"
            name="confirmPassword"
            value={formData.confirmPassword}
            isVisible={visibility.confirm}
            onToggle={() => toggleVisibility("confirm")}
            onChange={handleChange}
          />

          {/* ⚡ Real-time Contextual Validation Hints */}
          {formData.newPassword && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="p-3.5 bg-[#090A0F]/40 rounded-xl border border-slate-800/60 space-y-2 text-[11px]"
            >
              <div className="flex items-center gap-2">
                {hasMinLength ? <CheckCircle2 size={14} className="text-[#34D399]" /> : <XCircle size={14} className="text-rose-400" />}
                <span className={hasMinLength ? "text-slate-300" : "text-slate-400"}>At least 8 characters long</span>
              </div>
              <div className="flex items-center gap-2">
                {passwordsMatch ? <CheckCircle2 size={14} className="text-[#34D399]" /> : <XCircle size={14} className="text-rose-400" />}
                <span className={passwordsMatch ? "text-slate-300" : "text-slate-400"}>Passwords match perfectly</span>
              </div>
            </motion.div>
          )}

          {/* Submit Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading || !hasMinLength || !passwordsMatch}
              className="px-5 py-2.5 bg-[#34D399] hover:bg-emerald-500 disabled:bg-slate-800/80 disabled:text-slate-500 font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <RefreshCw size={14} className="animate-spin" />
                  Updating Security Signature...
                </>
              ) : (
                "Save New Password"
              )}
            </button>
          </div>

        </form>
      </motion.div>
    </div>
  );
};

const PasswordField = ({ label, name, value, isVisible, onToggle, onChange }) => (
  <div className="space-y-1.5">
    <label className="text-xs font-semibold text-slate-400 block">{label}</label>
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">
        <Lock size={16} />
      </span>
      <input
        type={isVisible ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        required
        placeholder="••••••••"
        className="w-full pl-9 pr-10 py-2.5 bg-[#090A0F] border border-slate-800 focus:border-[#34D399] rounded-xl text-xs font-semibold text-white focus:outline-none transition-all"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
      >
        {isVisible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  </div>
);

export default Settings;
