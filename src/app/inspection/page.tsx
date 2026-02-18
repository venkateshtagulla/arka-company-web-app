"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight, Loader2, AlertCircle, ClipboardList, Search, ChevronDown } from "lucide-react";
import { useInspectionStore } from "@/store/inspectionStore";

export default function InspectionPage() {
  const {
    inspections,
    isLoading: loading,
    error,
    page,
    hasNext,
    fetchInspections,
    setPagination,
  } = useInspectionStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchInspections(page, 20);
  }, [page, fetchInspections]);

  // Set all groups to expanded initially when data loads
  useEffect(() => {
    if (inspections.length > 0) {
      const initialExpanded: Record<string, boolean> = {};
      inspections.forEach(ins => {
        const vName = ins.vessel?.name || "Unassigned";
        initialExpanded[vName] = true;
      });
      setExpandedGroups(prev => ({ ...initialExpanded, ...prev }));
    }
  }, [inspections]);

  const toggleGroup = (vesselName: string) => {
    setExpandedGroups(prev => ({
      ...prev,
      [vesselName]: !prev[vesselName]
    }));
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPagination(page - 1, hasNext);
      fetchInspections(page - 1, 20);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      setPagination(page + 1, hasNext);
      fetchInspections(page + 1, 20);
    }
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
      assigned: "bg-blue-100 text-blue-700",
      "in-progress": "bg-yellow-100 text-yellow-700",
      completed: "bg-green-100 text-green-700",
      pending: "bg-gray-100 text-gray-700",
    };
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  // --- Filtering & Grouping Logic ---
  const filteredInspections = inspections.filter(inspection => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const vesselName = inspection.vessel?.name?.toLowerCase() || "";
    // Handle both forms array (new structure) and single form object (legacy/fallback)
    const formTitle = (inspection.forms?.[0]?.title || inspection.form?.title || "").toLowerCase();
    const inspectionId = inspection.assignment_id.toLowerCase();
    const inspectionName = (inspection.inspection_name || "").toLowerCase();
    
    // Check inspection name first as requested
    return inspectionName.includes(searchLower) ||
           vesselName.includes(searchLower) || 
           formTitle.includes(searchLower) || 
           inspectionId.includes(searchLower);
  });

  const groupedInspections = filteredInspections.reduce((acc, curr) => {
    const vesselName = curr.vessel?.name || "Unassigned";
    if (!acc[vesselName]) {
      acc[vesselName] = [];
    }
    acc[vesselName].push(curr);
    return acc;
  }, {} as Record<string, typeof inspections>);

  const sortedGroups = Object.entries(groupedInspections).sort((a, b) => a[0].localeCompare(b[0]));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inspection</h1>
          <p className="text-gray-500 mt-1">View all Inspection here</p>
        </div>
        <Link href="/inspection/create">
          <button
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium shadow-md transition-shadow hover:shadow-lg cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            <Plus className="w-5 h-5" />
            Assign Inspection
          </button>
        </Link>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Inspection List
          </h2>
          
          {/* Search Bar */}
          <div className="relative w-full md:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 text-black focus:outline-none focus:bg-white focus:ring-1 focus:ring-[#1F9EBD] focus:border-[#1F9EBD] sm:text-sm transition duration-150 ease-in-out"
              placeholder="Search vessel, form..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-[#1B6486] animate-spin mb-4" />
            <p className="text-gray-500">Loading inspections...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Something went wrong</p>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={() => fetchInspections(page, 20)}
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
        {!loading && !error && inspections.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <ClipboardList className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">No inspections found</p>
            <p className="text-gray-500 mb-4">Get started by assigning your first inspection.</p>
            <Link href="/inspection/create">
              <button
                className="flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-shadow hover:shadow-md cursor-pointer"
                style={{
                  background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                }}
              >
                <Plus className="w-4 h-4" />
                Assign Inspection
              </button>
            </Link>
          </div>
        )}

        {/* Grouped List */}
        {!loading && !error && inspections.length > 0 && (
          <>
            {filteredInspections.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-12">
                <p className="text-gray-500">No inspections match your search.</p>
              </div>
            ) : (
              <div className="space-y-6">
                {sortedGroups.map(([vesselName, groupInspections]) => (
                  <div key={vesselName} className="border border-gray-200 rounded-lg overflow-hidden">
                    {/* ID for navigation/anchoring if needed */}
                    
                    {/* Group Header */}
                    <div 
                      className="bg-gray-50 px-6 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors select-none"
                      onClick={() => toggleGroup(vesselName)}
                    >
                      <div className="flex items-center gap-3">
                         <div className={`p-1.5 rounded-md ${vesselName === "Unassigned" ? "bg-gray-200 text-gray-500" : "bg-blue-100 text-[#1B6486]"}`}>
                            {/* We could use a Ship icon here if we had one imported */}
                             <ClipboardList className="w-4 h-4" /> 
                         </div>
                         <div>
                            <h3 className="font-semibold text-gray-900 border-r border-gray-300 pr-3 mr-3 inline-block">
                              {vesselName}
                            </h3>
                            <span className="text-sm text-gray-500">
                              {groupInspections.length} inspection{groupInspections.length !== 1 ? 's' : ''}
                            </span>
                         </div>
                      </div>
                      
                      {expandedGroups[vesselName] ? (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                      )}
                    </div>

                    {/* Group Content Table */}
                    {expandedGroups[vesselName] && (
                      <div className="overflow-x-auto border-t border-gray-200">
                        <table className="w-full">
                          <thead className="bg-white">
                            <tr className="text-left border-b border-gray-100">
                              <th className="px-8 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Inspection Name
                              </th>
                              <th className="px-8 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Form Name
                              </th>
                              <th className="px-8 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Assigned User
                              </th>
                              <th className="px-8 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Due Date
                              </th>
                              <th className="px-8 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-8 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-50">
                            {groupInspections.map((inspection) => (
                              <tr
                                key={inspection.assignment_id}
                                className="hover:bg-gray-50 transition-colors group"
                              >
                                <td className="px-8 py-4 text-sm text-gray-600 font-medium">
                                  {inspection.inspection_name || "Inspection"}
                                </td>
                                <td className="px-8 py-4 text-sm text-gray-600">
                                  {inspection.forms?.[0]?.title || inspection.form?.title || "N/A"}
                                </td>
                                <td className="px-8 py-4 text-sm text-gray-600">
                                  {inspection.assignee?.email || "N/A"}
                                </td>
                                <td className="px-8 py-4 text-sm text-gray-600">
                                  {formatDate(inspection.due_date)}
                                </td>
                                <td className="px-8 py-4">
                                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(inspection.status)}`}>
                                    {inspection.status}
                                  </span>
                                </td>
                                <td className="px-8 py-4 text-center">
                                  <Link href={`/inspection/${inspection.vessel_id}/${inspection.assignment_id}`}>
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
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            
            {/* Pagination Footer */}
            <div className="flex items-center justify-between mt-8 pt-4">
              <span className="text-sm text-gray-500 font-medium">
                Page {page} • Showing {filteredInspections.length} of {inspections.length} loaded
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
