"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight, Loader2, AlertCircle, Ship, Search } from "lucide-react";
import { vesselsApi, VesselData } from "@/lib/api";

export default function VesselsPage() {
  const [vessels, setVessels] = useState<VesselData[]>([]);
  const [filteredVessels, setFilteredVessels] = useState<VesselData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 10;

  const fetchVessels = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await vesselsApi.getAll(page, limit);
      if (response.success) {
        setVessels(response.data.items);
        setFilteredVessels(response.data.items);
        setHasNext(response.data.has_next);
      } else {
        setError(response.message || "Failed to fetch vessels");
      }
    } catch (err) {
      setError("Failed to fetch vessels. Please try again.");
      console.error("Error fetching vessels:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchVessels();
  }, [fetchVessels]);

  // Filter vessels based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredVessels(vessels);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = vessels.filter((vessel) => {
        return (
          vessel.name?.toLowerCase().includes(query) ||
          vessel.vessel_type?.toLowerCase().includes(query) ||
          (vessel.other_vessel_type && vessel.other_vessel_type.toLowerCase().includes(query)) ||
          vessel.imo_number?.toLowerCase().includes(query) ||
          vessel.status?.toLowerCase().includes(query)
        );
      });
      setFilteredVessels(filtered);
    }
  }, [searchQuery, vessels]);

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

  const getStatusBadge = (status: string | null) => {
    if (!status) return "bg-gray-100 text-gray-700";
    const statusStyles: Record<string, string> = {
      active: "bg-green-100 text-green-700",
      inactive: "bg-gray-100 text-gray-700",
      maintenance: "bg-yellow-100 text-yellow-700",
    };
    return statusStyles[status.toLowerCase()] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Vessels</h1>
          <p className="text-gray-500 mt-1">
            Overview of vessels, defects, audits, and ongoing classes.
          </p>
        </div>
        <Link href="/vessels/create">
          <button
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium shadow-md transition-shadow hover:shadow-lg cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            <Plus className="w-5 h-5" />
            Create Vessel
          </button>
        </Link>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Vessels</h2>

          {/* Search Bar */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search vessels by name, type, IMO, or status..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 bg-gray-50 rounded-lg text-sm text-gray-900 border border-gray-200 focus:ring-2 focus:ring-[#1B6486] focus:border-transparent outline-none"
            />
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-10 h-10 text-[#1B6486] animate-spin mb-4" />
            <p className="text-gray-500">Loading vessels...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Something went wrong</p>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchVessels}
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
        {!loading && !error && filteredVessels.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <Ship className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">
              {searchQuery ? "No vessels found" : "No vessels found"}
            </p>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? `No vessels match "${searchQuery}". Try a different search term.`
                : "Get started by creating your first vessel."}
            </p>
            {!searchQuery && (
              <Link href="/vessels/create">
                <button
                  className="flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-shadow hover:shadow-md cursor-pointer"
                  style={{
                    background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Create Vessel
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && !error && filteredVessels.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-8 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-l-lg">
                      Vessel Name
                    </th>
                    <th className="px-8 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vessel Type
                    </th>
                    <th className="px-8 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      IMO Number
                    </th>
                    <th className="px-8 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-8 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-r-lg text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredVessels.map((vessel) => (
                    <tr
                      key={vessel.vessel_id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-8 py-6 text-sm font-medium text-gray-900">
                        {vessel.name}
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-600">
                        {vessel.vessel_type}
                        {vessel.other_vessel_type && ` (${vessel.other_vessel_type})`}
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-600">
                        {vessel.imo_number}
                      </td>
                      <td className="px-8 py-6">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getStatusBadge(
                            vessel.status
                          )}`}
                        >
                          {vessel.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <Link href={`/vessels/${vessel.vessel_id}`}>
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

            {/* Pagination Footer */}
            <div className="flex items-center justify-between mt-8 pt-4">
              <span className="text-sm text-gray-500 font-medium">
                {searchQuery
                  ? `Found ${filteredVessels.length} vessel${filteredVessels.length !== 1 ? "s" : ""} matching "${searchQuery}"`
                  : `Page ${page} • Showing ${filteredVessels.length} vessel${filteredVessels.length !== 1 ? "s" : ""}`
                }
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrevPage}
                  disabled={page === 1}
                  className={`p-2 rounded-lg text-white transition-opacity cursor-pointer ${page === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-[#1B6486] hover:opacity-90"
                    }`}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNext}
                  className={`p-2 rounded-lg text-white transition-opacity cursor-pointer ${!hasNext
                    ? "bg-gray-300 cursor-not-allowed"
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
