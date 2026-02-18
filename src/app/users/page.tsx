"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight, Loader2, AlertCircle, User, Search } from "lucide-react";
import { usersApi } from "@/lib/api";

interface UserDisplayData {
  id: string;
  name: string;
  role: string;
  email: string;
  vesselAssigned: string;
  status: string;
  userType: "crew" | "inspector";
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserDisplayData[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserDisplayData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const limit = 20;

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch both APIs in parallel
      const [crewRes, inspectorsRes] = await Promise.all([
        usersApi.getCrew(page, limit),
        usersApi.getInspectors(page, limit),
      ]);
      console.log("Inspector API Response:", inspectorsRes);

      const newUsers: UserDisplayData[] = [];

      // Process Crew Data
      if (crewRes.success) {
        const crewUsers = crewRes.data.crew.map((crew) => ({
          id: crew.crew_id,
          name: `${crew.first_name} ${crew.last_name}`,
          role: crew.role || "Crew",
          email: crew.email,
          vesselAssigned: "N/A", // Not provided by API
          status: "Active", // Not provided by API
          userType: "crew" as const,
        }));
        newUsers.push(...crewUsers);
      }

      // Process Inspector Data
      if (inspectorsRes.success) {
        const inspectorUsers = inspectorsRes.data.inspectors.map((inspector) => ({
          id: inspector.inspector_id,
          name: `${inspector.first_name} ${inspector.last_name}`,
          role: inspector.role || "Inspector",
          email: inspector.email,
          vesselAssigned: "N/A", // Not provided by API
          status: "Active", // Not provided by API
          userType: "inspector" as const,
        }));
        newUsers.push(...inspectorUsers);
      }

      setUsers(newUsers);
      setFilteredUsers(newUsers);

      // logic for pagination is tricky with two sources. 
      // For now, we'll assume next page exists if either has next.
      // Ideally, we'd handle merged pagination better.
      setHasNext(crewRes.data?.has_next || inspectorsRes.data?.has_next || false);

      if (!crewRes.success && !inspectorsRes.success) {
        setError("Failed to fetch users");
      }

    } catch (err) {
      setError("Failed to fetch users. Please try again.");
      console.error("Error fetching users:", err);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filter users based on search query
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredUsers(users);
    } else {
      const query = searchQuery.toLowerCase();
      const filtered = users.filter((user) => {
        return (
          user.name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.role.toLowerCase().includes(query) ||
          user.userType.toLowerCase().includes(query)
        );
      });
      setFilteredUsers(filtered);
    }
  }, [searchQuery, users]);

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-gray-500 mt-1">View all Users here</p>
        </div>
        <Link href="/users/create">
          <button
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium shadow-md transition-shadow hover:shadow-lg cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            <Plus className="w-5 h-5" />
            Create User
          </button>
        </Link>
      </div>

      {/* Content Card */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">User List</h2>

          {/* Search Bar */}
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
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
            <p className="text-gray-500">Loading users...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-16">
            <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
            <p className="text-gray-700 font-medium mb-2">Something went wrong</p>
            <p className="text-gray-500 mb-4">{error}</p>
            <button
              onClick={fetchUsers}
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
        {!loading && !error && filteredUsers.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16">
            <User className="w-16 h-16 text-gray-300 mb-4" />
            <p className="text-gray-700 font-medium mb-2">
              {searchQuery ? "No users found" : "No users found"}
            </p>
            <p className="text-gray-500 mb-4">
              {searchQuery
                ? `No users match "${searchQuery}". Try a different search term.`
                : "Get started by creating your first user."}
            </p>
            {!searchQuery && (
              <Link href="/users/create">
                <button
                  className="flex items-center gap-2 px-6 py-2 rounded-lg text-white font-medium transition-shadow hover:shadow-md cursor-pointer"
                  style={{
                    background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Create User
                </button>
              </Link>
            )}
          </div>
        )}

        {/* Table */}
        {!loading && !error && filteredUsers.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100/50 text-left border-b border-gray-100">
                    <th className="px-8 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider rounded-l-lg">
                      User ID
                    </th>
                    <th className="px-8 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-8 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-8 py-4 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                      Vessel Assigned
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
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors group"
                    >
                      <td className="px-8 py-6 text-sm text-gray-600 font-medium">
                        {user.id.slice(0, 8)}...
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-600">
                        {user.name}
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-600">
                        {user.role}
                      </td>
                      <td className="px-8 py-6 text-sm text-gray-600">
                        {user.vesselAssigned}
                      </td>
                      <td className="px-8 py-6">
                        <span className="inline-flex items-center text-sm text-gray-600">
                          {user.status}
                        </span>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <Link href={`/users/${user.id}?type=${user.userType}`}>
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
                  ? `Found ${filteredUsers.length} user${filteredUsers.length !== 1 ? "s" : ""} matching "${searchQuery}"`
                  : `Page ${page} • Showing ${filteredUsers.length} user${filteredUsers.length !== 1 ? "s" : ""}`
                }
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
