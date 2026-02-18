"use client";

import React, { useState, useEffect, useCallback, use } from "react";
import Link from "next/link";
import {
  ChevronLeft,
  ChevronRight,
  Anchor,
  AlertCircle,
  Loader2,
  Ship,
  Hash,
  CheckCircle2,
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { vesselsApi, VesselData, inspectionApi } from "@/lib/api";
import { VesselUsersTab } from "@/components/VesselUsersTab";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function VesselDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [activeTab, setActiveTab] = useState<"defects" | "inspections" | "users">("inspections");
  const [vessel, setVessel] = useState<VesselData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVesselDetails = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vesselsApi.getById(resolvedParams.id);
      if (response.success) {
        console.log("Vessel data:", response.data);
        console.log("Inspections:", response.data.inspections);
        setVessel(response.data);
      } else {
        setError(response.message || "Failed to fetch vessel details");
      }
    } catch (err) {
      setError("Failed to fetch vessel details. Please try again.");
      console.error("Error fetching vessel details:", err);
    } finally {
      setLoading(false);
    }
  }, [resolvedParams.id]);

  useEffect(() => {
    fetchVesselDetails();
  }, [fetchVesselDetails]);

  const getStatusBadge = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-700";
    const statusStyles: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
      maintenance: "bg-yellow-100 text-yellow-700",
    };
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Loading State
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-10 h-10 text-[#1B6486] animate-spin mb-4" />
        <p className="text-gray-500">Loading vessel details...</p>
      </div>
    );
  }

  // Error State
  if (error || !vessel) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px]">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <p className="text-gray-700 font-medium mb-2">Something went wrong</p>
        <p className="text-gray-500 mb-4">{error || "Vessel not found"}</p>
        <div className="flex gap-4">
          <Link href="/vessels">
            <button className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors hover:bg-gray-50 cursor-pointer">
              Back to Vessels
            </button>
          </Link>
          <button
            onClick={fetchVesselDetails}
            className="px-6 py-2 rounded-lg text-white font-medium transition-shadow hover:shadow-md cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header / Back Link */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link
            href="/vessels"
            className="text-gray-500 hover:text-gray-700 transition-colors cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-lg font-medium text-gray-900">
            {vessel.name} — Vessel Overview
          </h1>
        </div>
        <button
          onClick={fetchVesselDetails}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          title="Refresh vessel data"
        >
          <ChevronRight className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2 uppercase tracking-wide">
            <Anchor className="w-3 h-3" />
            Vessel Name
          </div>
          <div className="text-2xl font-semibold text-gray-900">{vessel.name}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2 uppercase tracking-wide">
            <Ship className="w-3 h-3" />
            Vessel Type
          </div>
          <div className="text-2xl font-semibold text-gray-900">
            {vessel.vessel_type}
            {vessel.other_vessel_type && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                ({vessel.other_vessel_type})
              </span>
            )}
          </div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2 uppercase tracking-wide">
            <Hash className="w-3 h-3" />
            IMO Number
          </div>
          <div className="text-2xl font-semibold text-gray-900">{vessel.imo_number}</div>
        </div>
        <div className="bg-white p-6 rounded-xl border border-neutral-200">
          <div className="flex items-center gap-2 text-gray-400 text-xs mb-2 uppercase tracking-wide">
            <CheckCircle2 className="w-3 h-3" />
            Status
          </div>
          <span
            className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium capitalize ${getStatusBadge(
              vessel.status
            )}`}
          >
            {vessel.status}
          </span>
        </div>
      </div>

      <div className="border-b border-neutral-200 mt-8">
        <div className="flex w-full">
          <button
            onClick={() => setActiveTab("inspections")}
            className={cn(
              "flex-1 pb-4 text-base font-medium text-center transition-colors relative cursor-pointer",
              activeTab === "inspections"
                ? "text-gray-900 border-b-4 border-[#1F9EBD]"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            <span className="flex items-center justify-center gap-2">
              Inspections Assigned
              {vessel.inspections && vessel.inspections.length > 0 && (
                <span className="inline-flex items-center justify-center w-6 h-6 text-xs font-semibold text-white bg-[#1F9EBD] rounded-full">
                  {vessel.inspections.length}
                </span>
              )}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={cn(
              "flex-1 pb-4 text-base font-medium text-center transition-colors relative cursor-pointer",
              activeTab === "users"
                ? "text-gray-900 border-b-4 border-[#1F9EBD]"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Assigned Users
          </button>
          <button
            onClick={() => setActiveTab("defects")}
            className={cn(
              "flex-1 pb-4 text-base font-medium text-center transition-colors relative cursor-pointer",
              activeTab === "defects"
                ? "text-gray-900 border-b-4 border-[#1F9EBD]"
                : "text-gray-500 hover:text-gray-700"
            )}
          >
            Defect Dashboard
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          {activeTab === "inspections" && "Inspections Assigned"}
          {activeTab === "defects" && "Defect Dashboard"}
          {activeTab === "users" && "Assigned Users"}
        </h2>

        <div className="overflow-x-auto min-h-[300px]">
          {activeTab === "users" && <VesselUsersTab vesselId={resolvedParams.id} />}

          {activeTab === "inspections" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 rounded-l-lg">
                    Inspection Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                    Form
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                    Assignee
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                    Role
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                    Due Date
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 rounded-r-lg text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(!vessel.inspections || vessel.inspections.length === 0) ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <AlertCircle className="w-12 h-12 text-gray-300" />
                        <div>
                          <p className="text-gray-700 font-medium mb-1">No inspections assigned yet</p>
                          <p className="text-sm text-gray-500">Create a new inspection assignment for this vessel to get started.</p>
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  vessel.inspections.map((inspection) => (
                    <tr key={inspection.assignment_id} className="hover:bg-gray-50">
                      <td className="px-6 py-6 text-sm text-gray-900 font-medium">
                        {inspection.inspection_name}
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600">
                        {inspection.form_title}
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600">
                        {inspection.assignee_name}
                        <span className="block text-xs text-gray-400 capitalize">
                          {inspection.assignee_type}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600">
                        {inspection.role}
                      </td>
                      <td className="px-6 py-6 text-sm">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium capitalize",
                          inspection.priority?.toLowerCase() === "high" ? "bg-red-100 text-red-700" :
                            inspection.priority?.toLowerCase() === "medium" ? "bg-yellow-100 text-yellow-700" :
                              "bg-green-100 text-green-700"
                        )}>
                          {inspection.priority}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600">
                        {formatDate(inspection.due_date)}
                      </td>
                      <td className="px-6 py-6 text-sm">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium capitalize",
                          inspection.status?.toLowerCase() === "completed" ? "bg-green-100 text-green-700" :
                            inspection.status?.toLowerCase() === "in progress" ? "bg-blue-100 text-blue-700" :
                              "bg-gray-100 text-gray-700"
                        )}>
                          {inspection.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <Link href={`/inspection/${resolvedParams.id}/${inspection.assignment_id}`}>
                          <button
                            className="px-6 py-2 rounded-lg text-white text-xs font-medium transition-shadow hover:shadow-md cursor-pointer"
                            style={{
                              background:
                                "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                            }}
                          >
                            View Details
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}

          {activeTab === "defects" && (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 rounded-l-lg">
                    Defect Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                    Description
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                    Severity
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                    Status
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold text-gray-600 rounded-r-lg text-center">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {(!vessel.defects || vessel.defects.length === 0) ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No defects found.
                    </td>
                  </tr>
                ) : (
                  vessel.defects.map((defect) => (
                    <tr key={defect.defect_id} className="hover:bg-gray-50">
                      <td className="px-6 py-6 text-sm text-gray-900">
                        {defect.title}
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600">
                        {defect.description}
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600 capitalize">
                        {defect.priority}
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600 capitalize">
                        {defect.severity}
                      </td>
                      <td className="px-6 py-6 text-sm">
                        <span className={cn(
                          "px-2 py-1 rounded-full text-xs font-medium capitalize",
                          defect.status === "closed" ? "bg-green-100 text-green-700" :
                            "bg-red-100 text-red-700"
                        )}>
                          {defect.status}
                        </span>
                      </td>
                      <td className="px-6 py-6 text-center">
                        <Link href={`/defects/${resolvedParams.id}/${defect.defect_id}`}>
                          <button
                            className="px-6 py-2 rounded-lg text-white text-xs font-medium transition-shadow hover:shadow-md cursor-pointer"
                            style={{
                              background:
                                "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                            }}
                          >
                            View Details
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
