"use client";

import React, { useState, useEffect } from "react";
import { Users as UsersIcon, Trash2, Loader2, AlertCircle, Check } from "lucide-react";
import {
    vesselAssignmentsApi,
    usersApi,
    VesselAssignment,
    InspectorData,
    CrewData,
} from "@/lib/api";

interface VesselUsersTabProps {
    vesselId: string;
}

export function VesselUsersTab({ vesselId }: VesselUsersTabProps) {
    const [assignments, setAssignments] = useState<VesselAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Assignment state
    const [selectedUserType, setSelectedUserType] = useState<"inspector" | "crew">("inspector");
    const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
    const [inspectors, setInspectors] = useState<InspectorData[]>([]);
    const [crew, setCrew] = useState<CrewData[]>([]);
    const [loadingUsers, setLoadingUsers] = useState(false);
    const [assigning, setAssigning] = useState(false);
    const [showUserDropdown, setShowUserDropdown] = useState(false);

    const fetchAssignments = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await vesselAssignmentsApi.getByVessel(vesselId);
            if (response.success) {
                setAssignments(response.data.assignments);
            } else {
                setError(response.message || "Failed to fetch assignments");
            }
        } catch (err) {
            setError("Failed to fetch assignments");
            console.error("Error fetching assignments:", err);
        } finally {
            setLoading(false);
        }
    };

    const fetchUsers = async () => {
        setLoadingUsers(true);
        try {
            const [inspectorsRes, crewRes] = await Promise.all([
                usersApi.getInspectors(1, 100),
                usersApi.getCrew(1, 100),
            ]);

            if (inspectorsRes.success) {
                setInspectors(inspectorsRes.data.inspectors);
            }
            if (crewRes.success) {
                setCrew(crewRes.data.crew);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => {
        fetchAssignments();
        fetchUsers();
    }, [vesselId]);

    const handleUserTypeChange = (type: "inspector" | "crew") => {
        setSelectedUserType(type);
        setSelectedUserIds(new Set());
        setShowUserDropdown(false);
    };

    const handleUserToggle = (userId: string) => {
        const newSelected = new Set(selectedUserIds);
        if (newSelected.has(userId)) {
            newSelected.delete(userId);
        } else {
            newSelected.add(userId);
        }
        setSelectedUserIds(newSelected);
    };

    const handleAssignUsers = async () => {
        if (selectedUserIds.size === 0) return;

        setAssigning(true);
        try {
            const promises = Array.from(selectedUserIds).map((userId) =>
                vesselAssignmentsApi.create({
                    vessel_id: vesselId,
                    user_id: userId,
                    user_type: selectedUserType,
                })
            );

            await Promise.all(promises);
            setSelectedUserIds(new Set());
            setShowUserDropdown(false);
            fetchAssignments();
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to assign users");
            console.error("Error assigning users:", err);
        } finally {
            setAssigning(false);
        }
    };

    const handleRemoveAssignment = async (vesselId: string,assignmentId: string) => {
        if (!confirm("Are you sure you want to remove this user assignment?")) return;

        try {
            const response = await vesselAssignmentsApi.delete(vesselId,assignmentId);
            if (response.success) {
                fetchAssignments();
            } else {
                alert(response.message || "Failed to remove assignment");
            }
        } catch (err: any) {
            alert(err.response?.data?.message || "Failed to remove assignment");
            console.error("Error removing assignment:", err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("en-US", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const availableUsers = selectedUserType === "inspector" ? inspectors : crew;
    const assignedUserIds = assignments
        .filter((a) => a.user_type === selectedUserType)
        .map((a) => a.user_id);
    const unassignedUsers = availableUsers.filter(
        (user) => !assignedUserIds.includes(
            selectedUserType === "inspector"
                ? (user as InspectorData).inspector_id
                : (user as CrewData).crew_id
        )
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 text-[#1B6486] animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-gray-700 font-medium mb-2">Failed to load assignments</p>
                <p className="text-gray-500 mb-4">{error}</p>
                <button
                    onClick={fetchAssignments}
                    className="px-6 py-2 rounded-lg text-white font-medium transition-shadow hover:shadow-md"
                    style={{
                        background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                    }}
                >
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Assign Users Section */}
            <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Assign Users to Vessel</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* User Type Dropdown */}
                    <div>
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            User Type
                        </label>
                        <select
                            value={selectedUserType}
                            onChange={(e) => handleUserTypeChange(e.target.value as "inspector" | "crew")}
                            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#1B6486] focus:outline-none"
                        >
                            <option value="inspector">Inspector</option>
                            <option value="crew">Crew</option>
                        </select>
                    </div>

                    {/* User Selection Dropdown with Checkboxes */}
                    <div className="relative">
                        <label className="block text-xs font-medium text-gray-700 mb-2">
                            Select {selectedUserType === "inspector" ? "Inspectors" : "Crew Members"}
                        </label>
                        <button
                            onClick={() => setShowUserDropdown(!showUserDropdown)}
                            className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-sm text-gray-900 focus:ring-2 focus:ring-[#1B6486] focus:outline-none text-left flex items-center justify-between"
                        >
                            <span className="text-gray-600">
                                {selectedUserIds.size === 0
                                    ? "Select users..."
                                    : `${selectedUserIds.size} selected`}
                            </span>
                            <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                            </svg>
                        </button>

                        {/* Dropdown Menu */}
                        {showUserDropdown && (
                            <div className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                                {loadingUsers ? (
                                    <div className="flex items-center justify-center py-8">
                                        <Loader2 className="w-5 h-5 text-[#1B6486] animate-spin" />
                                    </div>
                                ) : unassignedUsers.length === 0 ? (
                                    <div className="px-4 py-6 text-center text-sm text-gray-500">
                                        All {selectedUserType === "inspector" ? "inspectors" : "crew members"} are already assigned
                                    </div>
                                ) : (
                                    <div className="py-1">
                                        {unassignedUsers.map((user) => {
                                            const userId = selectedUserType === "inspector"
                                                ? (user as InspectorData).inspector_id
                                                : (user as CrewData).crew_id;
                                            const userName = `${user.first_name} ${user.last_name}`;
                                            const userEmail = user.email;
                                            const isSelected = selectedUserIds.has(userId);

                                            return (
                                                <label
                                                    key={userId}
                                                    className="flex items-center px-4 py-2.5 hover:bg-gray-50 cursor-pointer transition-colors"
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleUserToggle(userId)}
                                                        className="w-4 h-4 text-[#1B6486] border-gray-300 rounded focus:ring-[#1B6486] cursor-pointer"
                                                    />
                                                    <div className="ml-3 flex-1">
                                                        <p className="text-sm font-medium text-gray-900">{userName}</p>
                                                        <p className="text-xs text-gray-500">{userEmail}</p>
                                                    </div>
                                                    {isSelected && (
                                                        <Check className="w-4 h-4 text-[#1B6486]" />
                                                    )}
                                                </label>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Assign Button */}
                    <div className="flex items-end">
                        <button
                            onClick={handleAssignUsers}
                            disabled={selectedUserIds.size === 0 || assigning}
                            className="w-full px-4 py-2.5 rounded-lg text-white text-sm font-medium shadow-md transition-shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            style={{
                                background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                            }}
                        >
                            {assigning && <Loader2 className="w-4 h-4 animate-spin" />}
                            {assigning ? "Assigning..." : `Assign ${selectedUserIds.size > 0 ? `(${selectedUserIds.size})` : ""}`}
                        </button>
                    </div>
                </div>
            </div>

            {/* Assignments Table */}
            <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">Currently Assigned Users</h3>
                <div className="overflow-x-auto border border-gray-200 rounded-lg">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-gray-100 text-left">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600">
                                    Name
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600">
                                    Email
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600">
                                    Type
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600">
                                    Assigned Date
                                </th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-600 text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {assignments.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center">
                                        <UsersIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                        <p className="text-gray-500 mb-1">No users assigned to this vessel</p>
                                        <p className="text-gray-400 text-sm">Use the form above to assign users</p>
                                    </td>
                                </tr>
                            ) : (
                                assignments.map((assignment) => (
                                    <tr key={assignment.assignment_id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                                            {assignment.user_name || "Unknown"}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {assignment.user_email || "-"}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${assignment.user_type === "inspector"
                                                ? "bg-blue-100 text-blue-700"
                                                : "bg-green-100 text-green-700"
                                                }`}>
                                                {assignment.user_type}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {formatDate(assignment.created_at)}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleRemoveAssignment(assignment.vessel_id,assignment.assignment_id)}
                                                className="px-3 py-1.5 rounded-lg border border-red-300 text-red-600 text-xs font-medium hover:bg-red-50 transition-colors inline-flex items-center gap-1.5"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                                Remove
                                            </button>
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
