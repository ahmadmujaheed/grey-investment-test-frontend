import { useState } from "react";
import { Form, Input, Button, Checkbox, message, Spin } from "antd";
import { Mail, Lock } from "lucide-react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";

// 🔌 Central API integration Layer & Auth Store configuration hooks
import { loginUser } from "../api/authApi";
import { useAuthStore } from "../store/useAuthStore";

const Login = () => {
  const navigate = useNavigate();
  const setAuthSession = useAuthStore((state) => state.setAuthSession);
  const [loading, setLoading] = useState(false);

  // Core execution engine on submitting credentials
  const onFinish = async (values) => {
    const { email, password } = values;

    try {
      setLoading(true);
      const responseData = await loginUser({ email, password });

      // 🔥 CHANGE THIS LINE to use accessToken
      setAuthSession(responseData.accessToken, responseData.user);

      message.success(`Welcome back, ${responseData.user.name || "User"}!`);

      if (responseData.user?.role === "superadmin") {
        navigate("/superadmin", { replace: true });
      } else if (responseData.user?.role === "admin") {
        navigate("/dashboard");
      } else {
        navigate("/user-dashboard");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#1F1F1F] flex flex-col lg:flex-row font-sans antialiased selection:bg-[#34D399]/10 selection:text-[#34D399]">
      {/* Visual Panel (Top on Mobile, Left Side on Desktop) */}
      <div className="w-full lg:w-1/2 h-64 sm:h-80 lg:h-auto relative overflow-hidden">
        {/* <img
          src={investment}
          alt="Investment growth illustration"
          className="w-full h-full object-cover"
        /> */}

        {/* Elegant light-to-dark gradient overlay over the image */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#090A0F] via-slate-950/20 lg:via-slate-950/40 to-transparent flex flex-col justify-end p-6 sm:p-10 lg:p-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white leading-tight tracking-tight">
              Invest today,
              <br />
              <span className="text-[#34D399] drop-shadow-sm">
                secure tomorrow.
              </span>
            </h1>

            <p className="mt-2 sm:mt-4 lg:mt-6 text-[#9CA3AF] text-sm sm:text-base lg:text-lg max-w-md font-medium leading-relaxed hidden sm:block">
              Grey Investment helps you grow your wealth with smart strategies
              and real insights.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Form Container Panel (Bottom on Mobile, Right Side on Desktop) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-4 sm:px-6 py-10 lg:py-0 bg-[#1F1F1F]">
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          {/* Dashboard cohesive card layout */}
          <div className="bg-[#1F2937] border border-slate-800 rounded-none p-6 sm:p-10 shadow-2xl">
            {/* Header / Logo */}
            <div className="mb-8 lg:mb-10">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Grey <span className="text-[#34D399]">Investment</span>
              </h2>

              <p className="text-[#9CA3AF] mt-2 text-xs sm:text-sm font-medium">
                Welcome back. Sign in to continue to administration.
              </p>
            </div>

            <Form layout="vertical" onFinish={onFinish} requiredMark={false}>
              {/* Email Field */}
              <Form.Item
                label={
                  <span className="text-[#9CA3AF] font-bold uppercase tracking-wider text-xs">
                    Email
                  </span>
                }
                name="email"
                rules={[
                  {
                    type: "email",
                    message: "Please enter a valid email address",
                  },
                  {
                    required: true,
                    message: "Please enter email",
                  },
                ]}
              >
                <Input
                  size="large"
                  disabled={loading}
                  prefix={<Mail size={16} className="text-[#9CA3AF] mr-2" />}
                  placeholder="name@company.com"
                  className="h-12 bg-[#090A0F]! border-slate-800! text-white! placeholder:text-slate-600! rounded-none! hover:border-[#3B82F6]! focus:border-[#3B82F6]! focus:bg-transparent! focus:shadow-none! transition-all duration-200 font-semibold disabled:opacity-50"
                />
              </Form.Item>

              {/* Password Field */}
              <Form.Item
                label={
                  <span className="text-[#9CA3AF] font-bold uppercase tracking-wider text-xs">
                    Password
                  </span>
                }
                name="password"
                rules={[
                  {
                    required: true,
                    message: "Please enter password",
                  },
                ]}
              >
                <Input.Password
                  size="large"
                  disabled={loading}
                  prefix={<Lock size={16} className="text-[#9CA3AF] mr-2" />}
                  placeholder="Enter password"
                  className="h-12 !bg-[#090A0F] !border-slate-800 !text-white placeholder:!text-slate-600 !rounded-none hover:!border-[#3B82F6] focus:!border-[#3B82F6] focus:!shadow-none transition-all duration-200 font-semibold [&_.ant-input-password-icon]:!text-[#9CA3AF] disabled:opacity-50"
                />
              </Form.Item>

              {/* Remember Me & Forgot Password Link */}
              <div className="flex justify-between items-center mb-8 text-[11px] sm:text-xs">
                <Checkbox
                  disabled={loading}
                  className="text-[#9CA3AF] font-bold uppercase tracking-wider [&_.ant-checkbox-inner]:!bg-[#090A0F] [&_.ant-checkbox-inner]:!border-slate-800 [&_.ant-checkbox-inner]:!rounded-none [&_.ant-checkbox-checked_.ant-checkbox-inner]:!bg-[#34D399] [&_.ant-checkbox-checked_.ant-checkbox-inner]:!border-[#34D399] [&_.ant-checkbox-wrapper:hover_.ant-checkbox-inner]:!border-[#34D399] disabled:opacity-50"
                >
                  Remember me
                </Checkbox>

                <button
                  type="button"
                  disabled={loading}
                  className="text-[#3B82F6] hover:text-blue-400 font-bold uppercase tracking-wider transition-colors duration-200 disabled:opacity-40"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Cohesive Action Button */}
              <Button
                htmlType="submit"
                type="primary"
                size="large"
                block
                disabled={loading}
                className="!h-12 !bg-[#34D399] hover:!bg-[#06D6A0] active:!bg-[#06D6A0] !text-[#090A0F] !font-bold !text-xs uppercase tracking-wider !border-none !rounded-none shadow-none transition-all duration-200 flex items-center justify-center gap-2 disabled:bg-slate-800 disabled:text-slate-500"
              >
                {loading ? (
                  <Spin size="small" className="text-[#090A0F]" />
                ) : (
                  "Sign In"
                )}
              </Button>
            </Form>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
