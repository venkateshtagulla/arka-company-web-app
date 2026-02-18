"use client";

import React, { use, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, AlertCircle, Clock, User, FileText, CheckCircle, XCircle, Send, Search, Image as ImageIcon } from "lucide-react";
import { defectsApi, DefectData } from "@/lib/api";

export default function DefectDetailsPage({
    params,
}: {
    params: Promise<{ vessel_id: string; defect_id: string }>;
}) {
    //const resolvedParams = use(params);
    const { vessel_id, defect_id } = use(params);
    const router = useRouter();
    const [defect, setDefect] = useState<DefectData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [approving, setApproving] = useState(false);
    const [closing, setClosing] = useState(false);
    const [actionSuccess, setActionSuccess] = useState<string | null>(null);
    const [actionError, setActionError] = useState<string | null>(null);

    // Comment state
    const [newComment, setNewComment] = useState("");
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        const fetchDefectDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await defectsApi.getById(vessel_id,defect_id);
                if (response.success) {
                    setDefect(response.data);
                } else {
                    setError(response.message || "Failed to fetch defect details");
                }
            } catch (err) {
                setError("Failed to fetch defect details. Please try again.");
                console.error("Error fetching defect details:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchDefectDetails();
    }, [defect_id]);

    const handleApprove = async () => {
        setApproving(true);
        setActionError(null);
        setActionSuccess(null);
        try {
            const response = await defectsApi.approve(vessel_id,defect_id);
            if (response.success) {
                setDefect(response.data);
                setActionSuccess("Defect approved successfully!");
                setTimeout(() => {
                    router.push("/defects");
                }, 1500);
            } else {
                setActionError(response.message || "Failed to approve defect");
            }
        } catch (err) {
            setActionError("Failed to approve defect. Please try again.");
            console.error("Error approving defect:", err);
        } finally {
            setApproving(false);
        }
    };

    const handleClose = async () => {
        setClosing(true);
        setActionError(null);
        setActionSuccess(null);
        try {
            const response = await defectsApi.close(vessel_id,defect_id);
            if (response.success) {
                setDefect(response.data);
                setActionSuccess("Defect closed successfully!");
                setTimeout(() => {
                    router.push("/defects");
                }, 1500);
            } else {
                setActionError(response.message || "Failed to close defect");
            }
        } catch (err) {
            setActionError("Failed to close defect. Please try again.");
            console.error("Error closing defect:", err);
        } finally {
            setClosing(false);
        }
    };
    console.log("DEFECT ANALYSIS DEBUG", defect);


    const handleAddComment = async () => {
        if (!newComment.trim()) return;

        setSubmittingComment(true);
        setActionError(null);
        setActionSuccess(null);
        try {
            const response = await defectsApi.addComment(vessel_id,defect_id, newComment.trim());
            if (response.success) {
                setDefect(response.data);
                setNewComment("");
                setActionSuccess("Comment added successfully!");
                setTimeout(() => setActionSuccess(null), 3000);
            } else {
                setActionError(response.message || "Failed to add comment");
            }
        } catch (err) {
            setActionError("Failed to add comment. Please try again.");
            console.error("Error adding comment:", err);
        } finally {
            setSubmittingComment(false);
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

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusColor = (status: string) => {
        const statusColors: Record<string, string> = {
            pending: "text-yellow-600",
            in_progress: "text-blue-600",
            approved: "text-green-600",
            rejected: "text-red-600",
            closed: "text-gray-600",
        };
        return statusColors[status.toLowerCase()] || "text-gray-600";
    };

    const getSeverityColor = (severity: string) => {
        const severityColors: Record<string, string> = {
            critical: "text-red-600",
            major: "text-orange-600",
            minor: "text-blue-600",
            medium: "text-yellow-600",
        };
        return severityColors[severity.toLowerCase()] || "text-gray-600";
    };

    const getPriorityColor = (priority: string) => {
        const priorityColors: Record<string, string> = {
            high: "text-red-600",
            medium: "text-yellow-600",
            low: "text-green-600",
        };
        return priorityColors[priority.toLowerCase()] || "text-gray-600";
    };

    const formatStatus = (status: string) => {
        return status.replace(/_/g, ' ');
    };

    const isActionDisabled = () => {
        if (!defect) return true;
        const status = defect.status.toLowerCase();
        return status === 'approved' || status === 'closed';
    };

    // Loading State
    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <Loader2 className="w-10 h-10 text-[#1B6486] animate-spin mb-4" />
                <p className="text-gray-500">Loading defect details...</p>
            </div>
        );
    }

    // Error State
    if (error || !defect) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
                <p className="text-gray-700 font-medium mb-2">Something went wrong</p>
                <p className="text-gray-500 mb-4">{error || "Defect not found"}</p>
                <Link href="/defects">
                    <button
                        className="px-6 py-2 rounded-lg text-white font-medium transition-shadow hover:shadow-md cursor-pointer"
                        style={{
                            background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                        }}
                    >
                        Back to Defects
                    </button>
                </Link>
            </div>
        );
        
    }

    return (
        <div className="space-y-8 pb-12">
            {/* Header */}
            <div>
                <div className="flex items-center gap-2 mb-1">
                    <Link
                        href="/defects"
                        className="text-gray-900 font-medium hover:text-gray-700 transition-colors flex items-center gap-2"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Defect Details
                    </Link>
                </div>
                <p className="text-gray-500 text-sm ml-7">
                    View all details about this defect
                </p>
            </div>

            {/* Action Success/Error Messages */}
            {actionSuccess && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">{actionSuccess}</span>
                </div>
            )}
            {actionError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="text-red-700 font-medium">{actionError}</span>
                </div>
            )}

            {/* Defect Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-base font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                    Defect Information
                </h2>
                <div className="space-y-6">
                    {/* Title */}
                    <div>
                        <div className="text-xs text-gray-500 mb-1">Defect Title:</div>
                        <div className="text-sm font-semibold text-gray-900">
                            {defect.title}
                        </div>
                    </div>

                    {/* Description */}
                    {defect.description && (
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Description:</div>
                            <div className="text-sm text-gray-900">
                                {defect.description}
                            </div>
                        </div>
                    )}

                    {/* Grid Info */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-y-6 gap-x-4">
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Status:</div>
                            <div className={`text-sm font-semibold capitalize ${getStatusColor(defect.status)}`}>
                                {formatStatus(defect.status)}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Severity:</div>
                            <div className={`text-sm font-semibold capitalize ${getSeverityColor(defect.severity)}`}>
                                {defect.severity}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Priority:</div>
                            <div className={`text-sm font-semibold capitalize ${getPriorityColor(defect.priority)}`}>
                                {defect.priority}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Due Date:</div>
                            <div className="text-sm font-semibold text-gray-900">
                                {defect.due_date ? formatDate(defect.due_date) : "Not set"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Vessel:</div>
                            <div className="text-sm font-semibold text-gray-900">
                                {defect.vessel?.name || "N/A"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Form:</div>
                            <div className="text-sm font-semibold text-gray-900">
                                {defect.form?.title || "N/A"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Reported By:</div>
                            <div className="text-sm font-semibold text-gray-900">
                                {defect.raised_by_inspector?.name || defect.raised_by_inspector?.email || "N/A"}
                            </div>
                        </div>
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Created:</div>
                            <div className="text-sm font-semibold text-gray-900">
                                {formatDate(defect.created_at)}
                            </div>
                        </div>
                        {defect.location_on_ship && (
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Location on Ship:</div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {defect.location_on_ship}
                                </div>
                            </div>
                        )}
                        {defect.equipment_name && (
                            <div>
                                <div className="text-xs text-gray-500 mb-1">Equipment Name:</div>
                                <div className="text-sm font-semibold text-gray-900">
                                    {defect.equipment_name}
                                </div>
                            </div>
                        )}
                        <div>
                            <div className="text-xs text-gray-500 mb-1">Last Updated:</div>
                            <div className="text-sm font-semibold text-gray-900">
                                {formatDate(defect.updated_at)}
                            </div>
                        </div>
                    </div>

                    {/* Triggered Question */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 mb-2">Triggered Question:</div>
                        <div className="text-sm text-gray-900 flex items-center gap-2">
                            <FileText className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-500">Q{defect.triggered_question_order}:</span>
                            {defect.triggered_question_text}
                        </div>
                    </div>

                    {/* Defect Photos */}
                    {defect.photos && defect.photos.length > 0 && (
                        <div>
                            <div className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide flex items-center gap-2">
                                <ImageIcon className="w-4 h-4" />
                                Defect Photos ({defect.photos.length})
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {defect.photos.map((photo, idx) => (
                                    <a
                                        key={idx}
                                        href={photo}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-[#1F9EBD] transition-all hover:shadow-lg"
                                    >
                                        <img
                                            src={photo}
                                            alt={`Defect photo ${idx + 1}`}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded">
                                                View Full
                                            </span>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
            {/* Defect Analysis Card - Only show if NEW analysis data exists */}
            {/* Debug - check if backend data is coming */}

            {(
  defect.detailed_description ||defect.type_of_event ||defect.immediate_causes_substandard_acts ||defect.immediate_causes_substandard_conditions ||defect.basic_causes_personal_factors ||defect.basic_causes_job_system_factors ||defect.corrective_action ||
  defect.preventive_action ||
  defect.lessons_learnt ||
  (defect.analysis_photos && defect.analysis_photos.length > 0)
) 
/*(defect.detailed_description || defect.corrective_action || defect.preventive_action)*/ && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-[#1B6486] to-[#1F9EBD] px-8 py-4 flex items-center gap-3">
                        <Search className="w-5 h-5 text-white" />
                        <h2 className="text-white font-medium text-sm">Defect Analysis</h2>
                    </div>
                    <div className="p-8 space-y-6">
                        {/* Main Analysis Fields */}
                        {defect.detailed_description/*defect.detailed_description*/ && (
                            <div>
                                <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Detailed Description</div>
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <p className="text-sm text-gray-800 leading-relaxed">{defect.detailed_description}</p>
                                </div>
                            </div>
                        )}

                        {defect.type_of_event && (
                            <div className="bg-gray-50 rounded-lg p-4">
                                <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Type of Event</div>
                                <div className="text-sm font-semibold text-gray-900">{defect.type_of_event}</div>
                            </div>
                        )}

                        {/* Root Cause Analysis Grid */}
                        {(defect.immediate_causes_substandard_acts || defect.immediate_causes_substandard_conditions || 
                          defect.basic_causes_personal_factors || defect.basic_causes_job_system_factors) && (
                            <div>
                                <div className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Root Cause Analysis</div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {defect.immediate_causes_substandard_acts && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="text-xs text-gray-500 mb-2 font-medium">Immediate Causes - Substandard Acts</div>
                                            <div className="text-sm text-gray-900">{defect.immediate_causes_substandard_acts}</div>
                                        </div>
                                    )}
                                    {defect.immediate_causes_substandard_conditions && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="text-xs text-gray-500 mb-2 font-medium">Immediate Causes - Substandard Conditions</div>
                                            <div className="text-sm text-gray-900">{defect.immediate_causes_substandard_conditions}</div>
                                        </div>
                                    )}
                                    {defect.basic_causes_personal_factors && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="text-xs text-gray-500 mb-2 font-medium">Basic Causes - Personal Factors</div>
                                            <div className="text-sm text-gray-900">{defect.basic_causes_personal_factors}</div>
                                        </div>
                                    )}
                                    {defect.basic_causes_job_system_factors && (
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <div className="text-xs text-gray-500 mb-2 font-medium">Basic Causes - Job/System Factors</div>
                                            <div className="text-sm text-gray-900">{defect.basic_causes_job_system_factors}</div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Actions Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {defect.corrective_action/*defect.corrective_action*/ && (
                                <div className="bg-green-50 border border-green-100 rounded-lg p-4">
                                    <div className="text-xs text-green-700 mb-2 font-medium uppercase tracking-wide">Corrective Action</div>
                                    <div className="text-sm text-gray-900">{defect.corrective_action}</div>
                                </div>
                            )}
                            {defect.preventive_action && (
                                <div className="bg-blue-50 border border-blue-100 rounded-lg p-4">
                                    <div className="text-xs text-blue-700 mb-2 font-medium uppercase tracking-wide">Preventive Action</div>
                                    <div className="text-sm text-gray-900">{defect.preventive_action}</div>
                                </div>
                            )}
                        </div>

                        {/* Cost Claims */}
                        {defect.cost_claims && Object.values(defect.cost_claims).some(claim => claim?.selected) && (
                            <div>
                                <div className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Cost Claims</div>
                                <div className="space-y-2">
                                    {Object.entries(defect.cost_claims).map(([key, value]) => (
                                        value?.selected && (
                                            <div key={key} className="bg-yellow-50 border border-yellow-100 rounded-lg p-4">
                                                <div className="text-sm font-medium text-gray-900 capitalize mb-1">
                                                    {key.replace(/_/g, " ")}
                                                </div>
                                                {value.details && (
                                                    <div className="text-sm text-gray-700 mt-1">{value.details}</div>
                                                )}
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Lessons Learnt */}
                        {defect.lessons_learnt && (
                            <div>
                                <div className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Lessons Learnt</div>
                                <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                                    <p className="text-sm text-gray-800 leading-relaxed">{defect.lessons_learnt}</p>
                                </div>
                            </div>
                        )}

                        {/* Analysis Photos */}
                        {defect.analysis_photos && defect.analysis_photos.length > 0 && (
                            <div>
                                <div className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4" />
                                    Analysis Photos ({defect.analysis_photos.length})
                                </div>
                                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                    {defect.analysis_photos.map((photo, idx) => (
                                        <a
                                            key={idx}
                                            href={photo}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="group relative aspect-square rounded-lg overflow-hidden border border-gray-200 hover:border-[#1F9EBD] transition-all hover:shadow-lg"
                                        >
                                            <img
                                                src={photo}
                                                alt={`Analysis photo ${idx + 1}`}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                            />
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                                <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 px-2 py-1 rounded">
                                                    View Full
                                                </span>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Supporting Documents */}
                        {defect.supporting_documents && defect.supporting_documents.length > 0 && (
                            <div>
                                <div className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide flex items-center gap-2">
                                    <FileText className="w-4 h-4" />
                                    Supporting Documents ({defect.supporting_documents.length})
                                </div>
                                <div className="space-y-2">
                                    {defect.supporting_documents.map((doc, idx) => (
                                        <a
                                            key={idx}
                                            href={doc.s3_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                                        >
                                            <FileText className="w-5 h-5 text-[#1B6486] flex-shrink-0" />
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">{doc.file_name}</div>
                                                <div className="text-xs text-gray-500">{doc.file_type}</div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Admin Comments Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
                <h2 className="text-base font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">
                    Admin Comments
                </h2>

                {/* Existing Comments */}
                {defect.admin_comments && defect.admin_comments.length > 0 ? (
                    <div className="space-y-4 mb-6">
                        {defect.admin_comments.map((comment, idx) => (
                            <div key={idx} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                                <User className="w-5 h-5 text-gray-400 mt-0.5" />
                                <div className="text-sm text-gray-700">{comment}</div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-gray-500 text-sm text-center py-8 mb-6">
                        No admin comments yet
                    </div>
                )}

                {/* Add Comment Form */}
                <div className="border-t border-gray-100 pt-6">
                    <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Add a Comment
                    </label>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Type your comment here..."
                            className="flex-1 px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD]"
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !submittingComment) {
                                    handleAddComment();
                                }
                            }}
                            disabled={submittingComment}
                        />
                        <button
                            onClick={handleAddComment}
                            disabled={submittingComment || !newComment.trim()}
                            className={`px-6 py-3 rounded-lg text-white text-sm font-medium shadow-sm transition-all flex items-center gap-2 ${submittingComment || !newComment.trim()
                                ? "bg-gray-300 cursor-not-allowed"
                                : "bg-[#1B6486] hover:bg-[#155270] cursor-pointer"
                                }`}
                        >
                            {submittingComment ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Sending...
                                </>
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Send
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Task Activities Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-[#1B6486] px-8 py-4">
                    <h2 className="text-white font-medium text-sm">Task Activities</h2>
                </div>
                <div className="p-8">
                    {defect.task_activities && defect.task_activities.length > 0 ? (
                        <div className="space-y-6">
                            {defect.task_activities.map((activity, idx) => (
                                <div key={idx} className="flex items-start justify-between">
                                    <div className="flex items-start gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full bg-[#1B6486] mt-1.5"></div>
                                        <div>
                                            <span className="text-sm text-gray-900 font-medium">
                                                {activity.action}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <Clock className="w-3 h-3" />
                                        {formatDateTime(activity.timestamp)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-gray-500 text-sm text-center py-8">
                            No activities recorded
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8">
                <Link href="/defects">
                    <button className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors cursor-pointer">
                        Back to Defects
                    </button>
                </Link>
                <button
                    onClick={handleApprove}
                    disabled={approving || closing || isActionDisabled()}
                    className={`px-6 py-2.5 rounded-lg text-white text-sm font-medium shadow-sm transition-all cursor-pointer flex items-center gap-2 ${isActionDisabled()
                        ? "bg-green-300 cursor-not-allowed"
                        : "bg-green-600 hover:bg-green-700"
                        }`}
                >
                    {approving ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Approving...
                        </>
                    ) : (
                        <>
                            <CheckCircle className="w-4 h-4" />
                            Approve
                        </>
                    )}
                </button>
                <button
                    onClick={handleClose}
                    disabled={approving || closing || isActionDisabled()}
                    className={`px-6 py-2.5 rounded-lg text-white text-sm font-medium shadow-sm transition-all cursor-pointer flex items-center gap-2 ${isActionDisabled()
                        ? "bg-gray-300 cursor-not-allowed"
                        : "bg-gray-600 hover:bg-gray-700"
                        }`}
                >
                    {closing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Closing...
                        </>
                    ) : (
                        <>
                            <XCircle className="w-4 h-4" />
                            Close
                        </>
                    )}
                </button>
            </div>
        </div>
    );
}
