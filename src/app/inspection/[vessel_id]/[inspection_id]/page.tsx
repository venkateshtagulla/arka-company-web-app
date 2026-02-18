"use client";

import React, { use, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, AlertCircle, Trash2 } from "lucide-react";
import { useInspectionStore } from "@/store/inspectionStore";
import { InspectionAssignmentData, inspectionApi, formsApi } from "@/lib/api";

export default function InspectionDetailsPage({
    params,
}: {
    params: Promise<{ vessel_id:string,inspection_id: string }>;
}) {
    //const resolvedParams = use(params);
    const {vessel_id,inspection_id}=use(params);
    const router = useRouter();
    const { inspections, isLoading: storeLoading, fetchInspections, getInspectionById } = useInspectionStore();
    const [inspection, setInspection] = useState<InspectionAssignmentData | null>(null);
    const [inspectionForm, setInspectionForm] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);
    const [deleting, setDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    const handleDeleteInspection = async () => {
        if (!inspection?.form_id && !inspection?.forms?.[0]?.form_id) {
            setDeleteError("No form ID found for this inspection");
            return;
        }

        const formId = inspection.form_id || inspection.forms?.[0]?.form_id;
        if (!formId) {
            setDeleteError("No form ID found for this inspection");
            return;
        }

        setDeleting(true);
        setDeleteError(null);
        try {
            const response = await inspectionApi.deleteByFormId(vessel_id,inspection_id,formId);
            if (response.success) {
                // Refresh the inspections list and navigate back
                await fetchInspections();
                router.push("/inspection");
            } else {
                setDeleteError(response.message || "Failed to delete inspection");
            }
        } catch (err: any) {
            setDeleteError(err.response?.data?.message || "Failed to delete inspection. Please try again.");
            console.error("Error deleting inspection:", err);
        } finally {
            setDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    useEffect(() => {
        const loadInspection = async () => {
            setLoading(true);

            // First try to get from cache
            let foundInspection = getInspectionById(inspection_id);

            // If not in cache, fetch all inspections
            if (!foundInspection && inspections.length === 0) {
                await fetchInspections();
                foundInspection = getInspectionById(inspection_id);
            }

            if (foundInspection) {
                setInspection(foundInspection);
                // Fetch the detailed form with responses
                try {
                    // Use form_id from the inspection assignment
                    const formId = foundInspection.form_id || foundInspection.forms?.[0]?.form_id;
                    if (formId) {
                        const formData = await formsApi.getById(formId, foundInspection.assignment_id);
                        if (formData.success) {
                            setInspectionForm(formData.data);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch detailed form responses:", error);
                }
            } else {
                setInspection(null);
            }
            
            setLoading(false);
        };

        loadInspection();
    }, [inspection_id, inspections.length, fetchInspections, getInspectionById]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            assigned: "text-blue-600",
            "in-progress": "text-yellow-600",
            completed: "text-green-600",
            pending: "text-gray-600",
        };
        return statusColors[status.toLowerCase()] || "text-gray-600";
    };

    // Loading State
    if (loading || storeLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-[#1B6486] animate-spin mb-4" />
                <p className="text-gray-500">Loading inspection details...</p>
            </div>
        );
    }

    // Error/Not Found State
    if (!inspection) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-gray-700 font-medium mb-2">Inspection not found</p>
                <p className="text-gray-500 mb-4">The inspection you&apos;re looking for doesn&apos;t exist or has been removed.</p>
                <div className="flex gap-4">
                    <Link href="/inspection">
                        <button className="px-6 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium transition-colors hover:bg-gray-50 cursor-pointer">
                            Back to Inspections
                        </button>
                    </Link>
                    <button
                        onClick={() => {
                            fetchInspections();
                            router.refresh();
                        }}
                        className="px-6 py-2 rounded-lg text-white font-medium transition-shadow hover:shadow-md cursor-pointer"
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

    // Get form responses from API data (prefer detailed form fetch, fallback to assignment data)
    const questionsSource = inspectionForm?.questions || inspection.forms?.[0]?.questions;
    
    const responsesData = questionsSource?.map((q: any) => ({
        question: q.prompt,
        answer: q.answer || "Not answered",
        media_url: q.media_url,
        type: q.type,
    })) || [];

    const activitiesData = [
        { action: "Started Inspection", date: formatDateTime(inspection.created_at) },
        { action: "Inspection Assigned", date: formatDateTime(inspection.created_at) },
    ];

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Link
                        href="/inspection"
                        className="text-gray-900 font-medium hover:text-gray-700 transition-colors flex items-center gap-2 cursor-pointer"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        {inspection.vessel?.name || "Inspection Details"}
                    </Link>
                </div>
                <p className="text-gray-500 text-sm ml-7">
                    View all details about the Inspection here
                </p>
            </div>

            {/* Inspection Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-base font-bold text-gray-900 mb-6">
                    Inspection Info:
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-y-8 gap-x-4">
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Vessel:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {inspection.vessel?.name || "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Vessel Type:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {inspection.vessel?.vessel_type || "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Form used:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {inspection.forms?.[0]?.title || inspection.form?.title || "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Inspector assigned:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {inspection.assignee?.email || "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Role:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {inspection.role}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Priority:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {inspection.priority}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Due date:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {formatDate(inspection.due_date)}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Created By:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {inspection.admin?.email || "N/A"}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Status:</div>
                        <div className={`text-sm font-semibold capitalize ${getStatusColor(inspection.status)}`}>
                            {inspection.status}
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Progress:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {inspection.inspection_progress_percentage?.toFixed(0) || 0}%
                        </div>
                    </div>
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Assignment ID:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {inspection.assignment_id.slice(0, 8)}...
                        </div>
                    </div>
                </div>
            </div>

            {/* Form Responses Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-base font-bold text-gray-900 mb-6">
                    Form Responses:
                </h2>
                {responsesData.length === 0 ? (
                    <div className="text-gray-500 text-sm text-center py-8">
                        No responses yet
                    </div>
                ) : (
                    <div className="rounded-lg overflow-hidden">
                        <div className="grid grid-cols-[1fr_200px] bg-gray-100/50 py-3 px-6">
                            <div className="text-xs font-semibold text-gray-600">Questions</div>
                            <div className="text-xs font-semibold text-gray-600">Answer</div>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {responsesData.map((item: any, idx: number) => (
                                <div key={idx} className="grid grid-cols-[1fr_200px] py-4 px-6 items-center">
                                    <div className="text-sm text-gray-600">{item.question}</div>
                                    <div className="text-sm text-gray-900 font-medium">
                                        {(item.type === "image" || item.media_url || (typeof item.answer === 'string' && item.answer.startsWith("http"))) ? (
                                            <div className="flex flex-col gap-2">
                                                {/* Case 1: media_url exists */}
                                                {item.media_url && (
                                                    <a href={item.media_url} target="_blank" rel="noopener noreferrer">
                                                        <img
                                                            src={item.media_url}
                                                            alt="Response"
                                                            className="w-full h-auto max-h-40 object-contain rounded-lg border border-gray-200"
                                                        />
                                                    </a>
                                                )}
                                                
                                                {/* Case 2: No media_url, but answer is a URL */}
                                                {!item.media_url && typeof item.answer === 'string' && item.answer.startsWith("http") && (
                                                    <a href={item.answer} target="_blank" rel="noopener noreferrer">
                                                        <img
                                                            src={item.answer}
                                                            alt="Response"
                                                            className="w-full h-auto max-h-40 object-contain rounded-lg border border-gray-200"
                                                        />
                                                    </a>
                                                )}

                                                {/* Case 3: Image type but no URL found */}
                                                {item.type === "image" && !item.media_url && (!item.answer || !item.answer.startsWith("http")) && (
                                                     <span className="text-gray-400 italic">No image uploaded</span>
                                                )}

                                                {/* Case 4: Text answer accompanying image (or if answer is not a URL) */}
                                                {item.answer && item.answer !== "Not answered" && !item.answer.startsWith("http") && (
                                                    <span>{item.answer}</span>
                                                )}
                                            </div>
                                        ) : (
                                            item.answer
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Task Activities Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#1B6486] px-8 py-4">
                    <h2 className="text-white font-medium text-sm">Task activities</h2>
                </div>
                <div className="p-8">
                    <div className="space-y-6">
                        {activitiesData.map((activity, idx) => (
                            <div key={idx} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2.5 h-2.5 rounded-full bg-[#1B6486]"></div>
                                    <span className="text-sm text-gray-900 font-medium">
                                        {activity.action}
                                    </span>
                                </div>
                                <span className="text-xs text-gray-500">{activity.date}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Delete Error Message */}
            {deleteError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 font-medium">{deleteError}</span>
                    <button
                        onClick={() => setDeleteError(null)}
                        className="ml-auto text-red-500 hover:text-red-700"
                    >
                        ×
                    </button>
                </div>
            )}

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8">
                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    disabled={deleting}
                    className="px-6 py-2.5 rounded-lg bg-[#D32F2F] text-white text-sm font-medium hover:bg-red-700 transition-colors shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Trash2 className="w-4 h-4" />
                    Delete Inspection
                </button>
                <button
                    className="px-6 py-2.5 rounded-lg text-white text-sm font-medium shadow-sm hover:opacity-90 transition-opacity cursor-pointer"
                    style={{
                        background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                    }}
                >
                    Deactivate Inspection
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                                <Trash2 className="w-5 h-5 text-red-600" />
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900">Delete Inspection</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this inspection? This action cannot be undone and will permanently remove the inspection assignment.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={deleting}
                                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteInspection}
                                disabled={deleting}
                                className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {deleting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    <>
                                        <Trash2 className="w-4 h-4" />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
