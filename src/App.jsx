import "./App.css";
import { Routes, Route } from "react-router-dom";
import Login from "./pages/Login";

// Layouts
import DashboardLayout from "./layout/DashboardLayout";
import UserLayout from "./layout/UserLayout";
import SuperAdminLayout from "./layout/SuperAdminLayout";
import SuperAdminDashboard from "./pages/SuperAdminDashboard";

// Admin Only Pages
import Dashboard from "./pages/Dashboard";
import Investment from "./pages/Investment";
import Users from "./pages/Users";
import UserDetails from "./pages/UserDetails";
import UserInvestmentStatement from "./pages/UserInvestmentStatement";
import Settings from "./pages/Settings";
import Request from "./pages/Request";

// Shared Pages
import Profile from "./pages/Profile";

import UserDashboard from "./pages/investor/Dashboard";
import UserSettings from "./pages/investor/Settings";
import UserProfile from "./pages/investor/Profile";
import UserInvestment from "./pages/investor/Investments";
import InvestmentDetails from "./pages/investor/InvestmentDetails";

import ScrollToTop from "./components/ScrollToTop";

// Security Component
import ProtectedRoute from "./components/ProtectedRoute";
import AdminInvestmentDetails from "./components/AdminInvestmentDetails";

const App = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        {/* 🔓 Public Entry Route */}
        <Route path="/" element={<Login />} />

        {/* 🛡️ ADMIN ONLY BRANCH */}
        <Route element={<ProtectedRoute allowedRole="admin" />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route path="" element={<Dashboard />} />
            <Route path="investment" element={<Investment />} />
            <Route path="investment/:id" element={<AdminInvestmentDetails />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="users/:userId/investment/:investmentId" element={<UserInvestmentStatement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="profile" element={<Profile />} />
            <Route path="requests" element={<Request />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRole="superadmin" />}>
          <Route path="/superadmin" element={<SuperAdminLayout />}>
            <Route index element={<SuperAdminDashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="users/:id" element={<UserDetails />} />
            <Route path="users/:userId/investment/:investmentId" element={<UserInvestmentStatement />} />
          </Route>
        </Route>

        {/* 📈 INVESTOR (USER) ONLY BRANCH */}
        <Route element={<ProtectedRoute allowedRole="user" />}>
          <Route path="/user-dashboard" element={<UserLayout />}>
            <Route path="user-investments/investment/:id" element={<InvestmentDetails />} />
            <Route path="" element={<UserDashboard />} />
            <Route path="user-investments" element={<UserInvestment />} />
            <Route path="user-settings" element={<UserSettings />} />
            <Route path="user-profile" element={<UserProfile />} />
          </Route>
        </Route>

        {/* 🚫 Fallback/Catch-All Route for unauthorized attempts or 404s */}
        <Route
          path="*"
          element={
            <div className="min-h-screen bg-[#1F1F1F] text-white flex items-center justify-center font-sans">
              <div className="text-center space-y-2">
                <h1 className="text-4xl font-black text-rose-500">404</h1>
                <p className="text-sm text-slate-400">
                  Page Not Found or Access Unauthorized
                </p>
              </div>
            </div>
          }
        />
      </Routes>
    </>
  );
};

export default App;
