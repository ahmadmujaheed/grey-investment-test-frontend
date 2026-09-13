import { useState, useEffect } from "react";
import { Skeleton, message } from "antd";
import { fetchDashboardAnalyticsChart } from "../api/analyticsApi";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const formatMoney = (amount = 0) =>
  new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    maximumFractionDigits: 0,
  }).format(amount);

const DashboardChart = () => {
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadChart = async () => {
    try {
      setLoading(true);

      const response = await fetchDashboardAnalyticsChart();

    //   console.log("Chart Response:", response);

      if (!response.success) {
        throw new Error("Unable to load chart.");
      }

      const capitalGrowth = response.charts.capitalGrowth;

      const formattedData = capitalGrowth.labels.map((month, index) => ({
        month,
        amount: capitalGrowth.capital[index],
        companyProfit: capitalGrowth.companyProfit[index],
        investorProfit: capitalGrowth.investorProfit[index],
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error(error);

      message.error(
        error.message || "Failed to load dashboard chart."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChart();
  }, []);

  if (loading) {
    return (
      <div className="bg-[#1F2937] border border-slate-800 rounded-2xl p-6">
        <Skeleton active paragraph={{ rows: 1 }} title={{ width: 180 }} />

        <Skeleton.Image
          active
          style={{
            width: "100%",
            height: 320,
            marginTop: 20,
          }}
        />
      </div>
    );
  }

  return (
    <div className="bg-[#1F2937] border border-slate-800 rounded-2xl p-6">
      <div className="mb-6">
        <h2 className="text-white text-lg font-semibold">
          Monthly Capital Raised
        </h2>

        <p className="text-slate-400 text-sm mt-1">
          Capital invested into the platform every month.
        </p>
      </div>

      <div className="h-[350px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 20,
              left: 0,
              bottom: 0,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#334155"
              vertical={false}
            />

            <XAxis
              dataKey="month"
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              tickFormatter={(value) =>
                value === 0
                  ? "₦0"
                  : `₦${(value / 1000000).toFixed(1)}M`
              }
              tick={{ fill: "#94A3B8", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />

            <Tooltip
              formatter={(value) => formatMoney(value)}
              contentStyle={{
                background: "#111827",
                border: "1px solid #334155",
                borderRadius: 12,
                color: "#fff",
              }}
            />

            <Line
              type="monotone"
              dataKey="amount"
              stroke="#10B981"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: "#10B981", strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DashboardChart;
