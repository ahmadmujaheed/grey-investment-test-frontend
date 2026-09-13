import { useEffect, useState } from "react";
import {
  Building,
  Mail,
  Phone,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";
import { message, Skeleton } from "antd";
import { motion } from "motion/react";
import { getUserProfile, updateMyProfile } from "../api/authApi";
import { useAuthStore } from "../store/useAuthStore";

const fadeInUp = {
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: "easeOut" },
  },
};

const Profile = () => {
  const updateUserContext = useAuthStore((state) => state.updateUserContext);
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    getUserProfile()
      .then((response) => {
        const user = response.user;
        setProfile(user);
        setFormData({
          name: user.name || "",
          email: user.email || "",
          phone: user.phone || "",
        });
        updateUserContext(user);
      })
      .catch((error) => {
        message.error(
          error?.response?.data?.message || "Unable to load admin profile.",
        );
      })
      .finally(() => setLoading(false));
  }, [updateUserContext]);

  const initials = profile?.name
    ? profile.name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase()
    : "AD";

  const handleChange = (event) => {
    setFormData((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setSaving(true);
      const response = await updateMyProfile(formData);
      setProfile(response.user);
      setFormData({
        name: response.user.name,
        email: response.user.email,
        phone: response.user.phone,
      });
      updateUserContext(response.user);
      message.success(response.message || "Profile updated successfully.");
    } catch (error) {
      message.error(
        error?.response?.data?.message || "Unable to update profile.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="border border-slate-800 bg-[#1F2937] p-8">
        <Skeleton active />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-[#1F1F1F] min-h-screen text-[#9CA3AF]">
      <div className="border-b border-slate-800 pb-5">
        <div className="flex items-center gap-2 text-white">
          <User size={22} className="text-[#34D399]" />
          <h1 className="text-2xl font-bold tracking-tight">
            Administrative Profile
          </h1>
        </div>
        <p className="text-sm mt-1">
          View and update your administrator identity and contact details.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="border border-slate-800 bg-[#1F2937] p-6 space-y-6 text-center"
        >
          <div className="w-24 h-24 mx-auto rounded-full bg-[#090A0F] border-2 border-slate-800 flex items-center justify-center font-bold text-[#34D399] text-3xl">
            {initials}
          </div>

          <div>
            <h2 className="text-lg font-bold text-white">{profile?.name}</h2>
            <div className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 bg-[#090A0F] border border-slate-800 rounded-full text-[11px] font-semibold text-[#34D399] capitalize">
              <ShieldCheck size={12} /> {profile?.role}
            </div>
          </div>

        </motion.div>

        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="lg:col-span-2 border border-slate-800 bg-[#1F2937] p-6"
        >
          <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-5">
            <Building size={18} className="text-[#34D399]" />
            <h3 className="font-bold text-white uppercase tracking-wider text-xs">
              Identity and Communications
            </h3>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <label className="space-y-1.5 block">
              <span className="font-bold block">Full Name</span>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 font-semibold text-white focus:outline-none focus:border-[#34D399]"
              />
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="space-y-1.5 block">
                <span className="font-bold flex items-center gap-1">
                  <Mail size={12} /> Email Address
                </span>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 font-semibold text-white focus:outline-none focus:border-[#34D399]"
                />
              </label>

              <label className="space-y-1.5 block">
                <span className="font-bold flex items-center gap-1">
                  <Phone size={12} /> Phone Number
                </span>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2.5 bg-[#090A0F] border border-slate-800 font-semibold text-white focus:outline-none focus:border-[#34D399]"
                />
              </label>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-[#34D399] hover:bg-[#06D6A0] disabled:opacity-50 text-[#090A0F] font-bold px-5 py-2.5"
              >
                <Save size={14} />
                {saving ? "Saving..." : "Save Profile"}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default Profile;
