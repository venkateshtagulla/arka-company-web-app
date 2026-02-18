"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, AlertCircle, AlertTriangle, Ship, ChevronDown, ChevronUp } from "lucide-react";
import { defectsApi, DefectData } from "@/lib/api";

interface DefectsByVessel {
  vesselId: string;
  vesselName: string;
  imoNumber: string;
  defects: DefectData[];
}

export default function DefectsPage() {
  const [defects, setDefects] = useState<DefectData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [expandedVessels, setExpandedVessels] = useState<Set<string>>(new Set());
  const limit = 10;

  const fetchDefects = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await defectsApi.getAll(page, limit);
      if (response.success) {
        setDefects(response.data.items);
        setHasNext(response.data.has_next);
        // Expand all vessels by default
        const vesselIds = new Set(response.data.items.map(d => d.vessel_id));
        setExpandedVessels(vesselIds);
      } else {
        setError(response.message || "Failed to fetch defects");
      }
    } catch (err) {
      setError("Failed to fetch defects. Please try again.");
      console.error("Error fetching defects:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchDefects();
  }, [fetchDefects]);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      setPage(page + 1);
    }
  };

  const toggleVessel = (vesselId: string) => {
    const newExpanded = new Set(expandedVessels);
    if (newExpanded.has(vesselId)) {
      newExpanded.delete(vesselId);
    } else {
      newExpanded.add(vesselId);
    }
    setExpandedVessels(newExpanded);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      pending: "bg-yellow-100 text-yellow-700",
      in_progress: "bg-blue-100 text-blue-700",
      approved: "bg-green-100 text-green-700",
      rejected: "bg-red-100 text-red-700",
      closed: "bg-gray-100 text-gray-700",
      open: "bg-yellow-100 text-yellow-700",
      resolved: "bg-green-100 text-green-700",
    };
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getSeverityBadge = (severity: string) => {
    const severityStyles: Record<string, string> = {
      critical: "bg-red-100 text-red-700",
      major: "bg-orange-100 text-orange-700",
      minor: "bg-blue-100 text-blue-700",
      medium: "bg-yellow-100 text-yellow-700",
    };
    return severityStyles[severity.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const getPriorityBadge = (priority: string) => {
    const priorityStyles: Record<string, string> = {
      high: "bg-red-100 text-red-700",
      urgent: "bg-red-100 text-red-700",
      medium: "bg-yellow-100 text-yellow-700",
      low: "bg-green-100 text-green-700",
    };
    return priorityStyles[priority.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, ' ');
  };

  // Group defects by vessel
  const defectsByVessel: DefectsByVessel[] = defects.reduce((acc, defect) => {
    const vesselId = defect.vessel_id||defect.vessel?.vessel_id ||`${defect.vessel?.imo_number}-${defect.vessel?.name}`;
    const vesselName = defect.vessel?.name || "Unknown Vessel";
    const imoNumber = defect.vessel?.imo_number || "N/A";

    const existingGroup = acc.find(group => group.vesselId === vesselId);
    if (existingGroup) {
      existingGroup.defects.push(defect);
    } else {
      acc.push({
        vesselId,
        vesselName,
        imoNumber,
        defects: [defect],
      });
    }
    return acc;
  }, [] as DefectsByVessel[]);

  // Sort vessels by name
  defectsByVessel.sort((a, b) => a.vesselName.localeCompare(b.vesselName));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Defects</h1>
          <p className="text-gray-500 mt-1">View and manage all defects grouped by vessel</p>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">
          Defects List
        </h2>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-[#1B6486] animate-spin mb-4" />
            <p className="text-gray-500">Loading defects...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Something went wrong</p>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchDefects}
              className="px-6 py-2 rounded-lg text-white font-medium transition-shadow hover:shadow-md cursor-pointer"
              style={{
                background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
              }}
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && defects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertTriangle className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">No defects found</p>
            <p className="text-gray-500">There are no defects reported yet.</p>
          </div>
        )}

        {/* Grouped Defects by Vessel */}
        {!loading && !error && defects.length > 0 && (
          <>
            <div className="space-y-4">
              {defectsByVessel.map((vesselGroup) => {
                const isExpanded = expandedVessels.has(vesselGroup.vesselId);

                return (
                  <div key={vesselGroup.vesselId} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* Vessel Header */}
                    <button
                      onClick={() => toggleVessel(vesselGroup.vesselId)}
                      className="w-full flex items-center justify-between px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <Ship className="w-5 h-5 text-[#1B6486]" />
                        <div className="text-left">
                          <h3 className="text-sm font-semibold text-gray-900">
                            {vesselGroup.vesselName}
                          </h3>
                          <p className="text-xs text-gray-500">
                            IMO: {vesselGroup.imoNumber} • {vesselGroup.defects.length} defect{vesselGroup.defects.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {isExpanded ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {/* Defects Table */}
                    {isExpanded && (
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="bg-gray-100/50 text-left border-b border-gray-100">
                              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Defect Title
                              </th>
                              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Form
                              </th>
                              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Reported By
                              </th>
                              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Severity
                              </th>
                              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Priority
                              </th>
                              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                Created
                              </th>
                              <th className="px-6 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wider text-center">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50 bg-white">
                            {vesselGroup.defects.map((defect) => (
                              <tr
                                key={defect.defect_id}
                                className="hover:bg-gray-50 transition-colors group"
                              >
                                <td className="px-6 py-4 text-xs text-gray-900 font-medium max-w-[200px]">
                                  <div className="truncate" title={defect.title}>
                                    {defect.title}
                                  </div>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-600">
                                  {defect.form?.title || "N/A"}
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-600">
                                  {defect.raised_by_inspector?.name || defect.raised_by_inspector?.email || "N/A"}
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getSeverityBadge(defect.severity)}`}>
                                    {defect.severity}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getPriorityBadge(defect.priority)}`}>
                                    {defect.priority}
                                  </span>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(defect.status)}`}>
                                    {formatStatus(defect.status)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 text-xs text-gray-600">
                                  {formatDate(defect.created_at)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                  <Link href={`/defects/${defect.vessel_id}/${defect.defect_id}`}>
                                    <button
                                      className="px-4 py-1.5 rounded-lg text-white text-xs font-medium transition-shadow hover:shadow-md cursor-pointer"
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
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between mt-8 pt-4">
              <span className="text-sm text-gray-500 font-medium">
                Page {page} • Showing {defects.length} defect{defects.length !== 1 ? "s" : ""} across {defectsByVessel.length} vessel{defectsByVessel.length !== 1 ? "s" : ""}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className={`p-2 rounded-lg text-white transition-opacity cursor-pointer ${page === 1
                    ? "bg-[#1B6486]/50 cursor-not-allowed"
                    : "bg-[#1B6486] hover:opacity-90"
                    }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNext}
                  className={`p-2 rounded-lg text-white transition-opacity cursor-pointer ${!hasNext
                    ? "bg-[#1B6486]/50 cursor-not-allowed"
                    : "bg-[#1B6486] hover:opacity-90"
                    }`}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
