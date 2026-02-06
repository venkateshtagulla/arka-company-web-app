"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ChevronLeft, FileText, PenSquare, Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { usersApi, CrewData, InspectorData } from "@/lib/api";

interface UserDetails {
    userId: string;
    name: string;
    email: string;
    phone: string;
    role: string | null;
    idProofUrl: string | null;
    addressProofUrl: string | null;
    additionalDocs: string[] | null;
    userType: "crew" | "inspector";
}

export default function UserDetailsPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const resolvedParams = use(params);
    const searchParams = useSearchParams();
    const userType = searchParams.get("type") as "crew" | "inspector" | null;
    const [topAlert, setTopAlert] = useState<string | null>(null);
    const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [newPassword, setNewPassword] = useState("");
    const [isResetting, setIsResetting] = useState(false);

    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!userType) {
                setError("User type not specified");
                setIsLoading(false);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                if (userType === "inspector") {
                    const response = await usersApi.getInspectorById(resolvedParams.id);
                    if (response.success) {
                        const data: InspectorData = response.data;
                        setUserDetails({
                            userId: data.inspector_id,
                            name: `${data.first_name} ${data.last_name}`.trim(),
                            email: data.email,
                            phone: data.phone_number,
                            role: data.role || "Inspector",
                            idProofUrl: data.id_proof_url,
                            addressProofUrl: data.address_proof_url,
                            additionalDocs: data.additional_docs,
                            userType: "inspector",
                        });
                    } else {
                        setError(response.error || "Failed to fetch inspector details");
                    }
                } else {
                    const response = await usersApi.getCrewById(resolvedParams.id);
                    if (response.success) {
                        const data: CrewData = response.data;
                        setUserDetails({
                            userId: data.crew_id,
                            name: `${data.first_name} ${data.last_name}`.trim(),
                            email: data.email,
                            phone: data.phone_number,
                            role: data.role || "Crew",
                            idProofUrl: data.id_proof_url,
                            addressProofUrl: data.address_proof_url,
                            additionalDocs: data.additional_docs,
                            userType: "crew",
                        });
                    } else {
                        setError(response.error || "Failed to fetch crew details");
                    }
                }
            } catch (err) {
                console.error("Error fetching user details:", err);
                setError("Failed to fetch user details. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserDetails();
    }, [resolvedParams.id, userType]);

    // Loading State
    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-[#1B6486] animate-spin mb-4" />
                <p className="text-gray-500">Loading user details...</p>
            </div>
        );
    }

    // Error State
    if (error || !userDetails) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-gray-700 font-medium mb-2">Something went wrong</p>
                <p className="text-gray-500 mb-4">{error || "User details not found"}</p>
                <Link href="/users">
                    <button
                        className="px-6 py-2 rounded-lg text-white font-medium transition-shadow hover:shadow-md cursor-pointer"
                        style={{
                            background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                        }}
                    >
                        Back to Users
                    </button>
                </Link>
            </div>
        );
    }

    // Build documents array from user details
    const documents = [
        {
            label: "ID Proof:",
            displayName: "ID Proof",
            url: userDetails.idProofUrl
        },
        {
            label: "Address Proof:",
            displayName: "Address Proof",
            url: userDetails.addressProofUrl
        },
    ];

    // Add additional docs if present
    if (userDetails.additionalDocs && userDetails.additionalDocs.length > 0) {
        userDetails.additionalDocs.forEach((doc, index) => {
            documents.push({
                label: index === 0 ? "Additional files:" : "",
                displayName: `Additional Doc ${index + 1}`,
                url: doc,
            });
        });
    } else {
        documents.push({
            label: "Additional files:",
            displayName: "No files uploaded",
            url: null,
        });
    }



    const handleResetPassword = async () => {
        if (!newPassword) {
            return;
        }

        setIsResetting(true);
        try {
            if (userDetails?.userType === "inspector") {
                await usersApi.resetInspectorPassword(resolvedParams.id, newPassword);
            } else if (userDetails?.userType === "crew") {
                await usersApi.resetCrewPassword(resolvedParams.id, newPassword);
            }
            setIsResetModalOpen(false);
            setNewPassword("");
        } catch (err) {
            console.error("Error resetting password:", err);
        } finally {
            setIsResetting(false);
        }
    };

    const handleDeleteUser = async () => {
        setIsDeleting(true);
        setDeleteError(null);

        try {
            if (userDetails?.userType === "inspector") {
                await usersApi.deleteInspector(resolvedParams.id);
            } else if (userDetails?.userType === "crew") {
                await usersApi.deleteCrew(resolvedParams.id);
            }
            // Redirect to users list on success
            window.location.href = "/users";
        } catch (err: any) {
            const errorMessage =
            typeof err?.response?.data === "string"
                ? err.response.data
                : err?.response?.data?.message ||
                err?.response?.data?.error ||
                err.message ||
                "Failed to delete user. Please try again.";

            setDeleteError(errorMessage);
            setTopAlert(errorMessage);

        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-8 pb-12 relative">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Link
                        href="/users"
                        className="text-gray-900 font-medium hover:text-gray-700 transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        {userDetails.name}
                    </Link>
                </div>
                <p className="text-gray-500 text-sm ml-7">
                    View all details about the {userDetails.userType === "inspector" ? "inspector" : "crew member"} here
                </p>
            </div>

            {/* User Details Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 relative">
                <div className="absolute top-8 right-8 text-gray-400 cursor-pointer hover:text-gray-600">
                    <PenSquare className="w-5 h-5" />
                </div>
                <h2 className="text-base font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">
                    User Details:
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-y-8 gap-x-4">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">User ID:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {userDetails.userId.slice(0, 8)}...
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Name:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {userDetails.name}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Email:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {userDetails.email}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Phone:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {userDetails.phone || "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Role:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {userDetails.role || "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">User Type:</div>
                        <div className="text-sm font-semibold text-gray-900 capitalize">
                            {userDetails.userType}
                        </div>
                    </div>
                </div>
            </div>

            {/* Documents Upload Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-base font-bold text-gray-900 mb-8 border-b border-gray-100 pb-4">
                    Documents Upload
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {documents.map((doc, idx) => (
                        <div key={idx}>
                            {doc.label && (
                                <div className="text-xs text-gray-400 mb-2">{doc.label}</div>
                            )}
                            {doc.url ? (
                                <a
                                    href={doc.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 w-fit pr-8 hover:bg-gray-100 hover:border-gray-200 transition-colors cursor-pointer"
                                >
                                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-200">
                                        <FileText className="w-4 h-4 text-red-500" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-700">
                                        {doc.displayName}
                                    </span>
                                    <ExternalLink className="w-4 h-4 text-[#1B6486]" />
                                </a>
                            ) : (
                                <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100 w-fit pr-8">
                                    <div className="w-8 h-8 flex items-center justify-center bg-white rounded border border-gray-200">
                                        <FileText className="w-4 h-4 text-gray-300" />
                                    </div>
                                    <span className="text-sm font-medium text-gray-400">
                                        {doc.displayName}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8">
               {/* <button
                    onClick={() => setIsResetModalOpen(true)}
                    className="px-8 py-2.5 rounded-lg bg-gray-600 text-white text-sm font-medium hover:bg-gray-700 transition-colors shadow-sm cursor-pointer"
                >
                    Reset Password
                </button>*/}
                <button
                    onClick={() => setIsDeleteModalOpen(true)}
                    className="px-8 py-2.5 rounded-lg bg-[#D32F2F] text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-sm cursor-pointer"
                >
                    Delete User
                </button>
                {/* <button
                    className="px-8 py-2.5 rounded-lg text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                    style={{
                        background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                    }}
                >
                    Deactivate User
                </button> */}
            </div>

            {/* Reset Password Modal */}
            {isResetModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Reset Password</h3>
                        <p className="text-sm text-gray-500 mb-4">
                            Enter the new password for {userDetails.name}.
                        </p>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                            <input
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1B6486] focus:border-transparent text-gray-900"
                                placeholder="Enter new password"
                            />
                        </div>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsResetModalOpen(false);
                                    setNewPassword("");
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleResetPassword}
                                disabled={isResetting || !newPassword}
                                className="px-4 py-2 text-sm font-medium text-white rounded-lg transition-shadow hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                                style={{
                                    background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                                }}
                            >
                                {isResetting ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Resetting...</span>
                                    </div>
                                ) : (
                                    "Reset Password"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete User Confirmation Modal */}
            {isDeleteModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Delete User
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this user? This action cannot be undone.
                        </p>

                        {deleteError && (
                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <div className="flex items-start gap-2">
                                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                    <p className="text-sm text-red-800">{deleteError}</p>
                                </div>
                            </div>
                        )}

                        <div className="flex gap-3 justify-end">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setDeleteError(null);
                                }}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteUser}
                                disabled={isDeleting}
                                className="px-4 py-2 rounded-lg bg-[#D32F2F] text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
                                {isDeleting ? "Deleting..." : "Delete"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            

        </div>
    );
}
