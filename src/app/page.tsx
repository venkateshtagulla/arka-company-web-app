"use client";

import React, { useEffect, useState } from "react";
import { ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import {
  dashboardApi,
  DashboardData,
  SummaryCard,
  RecentActivity,
  DashboardVessel,
} from "@/lib/api";

// Icon components for summary cards
const VesselIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M5 12l2-3 8-1 2 3" />
    <path d="M2 19h20" />
    <path d="M12 5l-2 3h4l-2-3z" />
  </svg>
);

const DefectIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const AuditIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" y1="13" x2="8" y2="13" />
    <line x1="16" y1="17" x2="8" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

// Map labels to icons
const getIconForLabel = (label: string) => {
  const lowerLabel = label.toLowerCase();
  if (lowerLabel.includes("vessel")) return <VesselIcon />;
  if (lowerLabel.includes("defect")) return <DefectIcon />;
  if (lowerLabel.includes("audit")) return <AuditIcon />;
  return <VesselIcon />;
};

// Format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Format timestamp for recent activities
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await dashboardApi.getData();
        if (response.success) {
          setDashboardData(response.data);
        } else {
          setError(response.error || "Failed to fetch dashboard data");
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch dashboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Prepare pie chart data from summary cards
  const getPieChartData = () => {
    if (!dashboardData) return [];

    const getValue = (keyword: string) =>
      dashboardData.summary_cards.find(c => c.label.toLowerCase().includes(keyword))?.value || 0;

    return [
      { name: "Total Vessels", value: getValue("vessel"), color: "#1B6486" },
      { name: "Open Defects", value: getValue("defect"), color: "#1F9EBD" },
      { name: "Complete Audits", value: getValue("audit"), color: "#64B5F6" },
    ].filter(item => item.value > 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B6486]" />
          <p className="text-gray-500">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-shadow hover:shadow-md cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const pieData = getPieChartData();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-1">
          Overview of vessels, defects , audits , and ongoing classes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (Cards + Activities) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {dashboardData?.summary_cards.map((card: SummaryCard, index: number) => (
              <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 text-gray-400 text-sm mb-2">
                  {getIconForLabel(card.label)}
                  {card.label}
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-bold text-gray-900">{card.value}</span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${card.trend === "up"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                      }`}
                  >
                    {card.trend === "up" ? (
                      <ArrowUpRight className="w-3 h-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="w-3 h-3 mr-1" />
                    )}
                    {card.change_percentage.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Activities */}
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div
              className="px-6 py-4 border-b border-gray-100 text-white"
              style={{
                background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
              }}
            >
              <h3 className="font-semibold text-sm">Recent activities</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {dashboardData?.recent_activities.length === 0 ? (
                <div className="px-6 py-8 text-center text-gray-500">
                  No recent activities
                </div>
              ) : (
                dashboardData?.recent_activities.slice(0, 4).map((activity: RecentActivity, i: number) => (
                  <div
                    key={i}
                    className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#1B6486]"></div>
                      <span className="text-sm font-medium text-gray-700">
                        {activity.action}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {formatTimestamp(activity.timestamp)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-1 bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col items-center justify-center h-full">
          <h3 className="text-sm font-medium text-gray-700 self-start mb-4">
            Overview Statistics
          </h3>
          <div className="flex-1 w-full flex items-center justify-center">
            {pieData.length === 0 ? (
              <div className="text-gray-400 text-sm">No data available</div>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={0}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>

          <div className="flex flex-col justify-center items-center gap-3 w-full mt-4">
            {pieData.map((entry, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                <span className="text-sm text-gray-600">
                  {entry.name} ({entry.value})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section - Vessels Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-gray-900">Vessels</h3>
          <button
            className="px-4 py-2 rounded-lg text-white text-sm font-medium transition-shadow hover:shadow-md cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            View all
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 text-left">
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 rounded-l-lg">
                  Vessel
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500">
                  Defects
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500">
                  Audits
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 rounded-r-lg text-right">
                  Last Updated
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {dashboardData?.vessels.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No vessels found
                  </td>
                </tr>
              ) : (
                dashboardData?.vessels.map((vessel: DashboardVessel) => (
                  <tr key={vessel.vessel_id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {vessel.vessel_name}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {vessel.defects_count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {vessel.audits_count}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 text-right">
                      {formatDate(vessel.last_updated)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
