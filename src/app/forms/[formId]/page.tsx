"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { ChevronLeft, Check, Loader2, Image, FileText, List } from "lucide-react";
import { formsApi, FormDetailData } from "@/lib/api";

// --- Modals ---

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText,
  cancelText,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText: string;
  cancelText: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] h-screen w-screen flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl p-8 w-full max-w-lg transform transition-all scale-100 opacity-100 flex flex-col items-center">
        <h3 className="text-lg font-medium text-gray-900 text-center mb-8">
          {title}
        </h3>
        <div className="flex gap-4 w-full justify-center">
          <button
            onClick={onClose}
            className="px-8 py-2.5 rounded-lg bg-[#d70000] text-white font-medium hover:bg-[#b00000] transition-colors shadow-sm cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-12 py-2.5 rounded-lg bg-[#207191] text-white font-medium hover:bg-[#1a5b75] transition-colors shadow-sm cursor-pointer"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

function SuccessModal({
  isOpen,
  onClose,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] h-screen w-screen flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-2xl shadow-xl p-12 w-full max-w-lg transform transition-all scale-100 opacity-100 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#207191] flex items-center justify-center mb-6">
          <Check className="w-8 h-8 text-white stroke-[3]" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 text-center">
          {message}
        </h3>
      </div>
    </div>
  );
}

export default function FormDetailsPage({
  params,
}: {
  params: Promise<{ formId: string }>;
}) {
  const resolvedParams = use(params);
  const [form, setForm] = useState<FormDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    const fetchFormDetails = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await formsApi.getById(resolvedParams.formId);

        if (response.success) {
          setForm(response.data);
        } else {
          setError(response.error || "Failed to fetch form details");
        }
      } catch (err: unknown) {
        console.error("Error fetching form details:", err);
        if (err && typeof err === "object" && "response" in err) {
          const axiosError = err as { response?: { data?: { message?: string; error?: string } } };
          setError(
            axiosError.response?.data?.message ||
            axiosError.response?.data?.error ||
            "Failed to fetch form details. Please try again."
          );
        } else {
          setError("Failed to fetch form details. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormDetails();
  }, [resolvedParams.formId]);

  const handleCloseForm = () => {
    setShowCloseModal(true);
  };

  const confirmClose = () => {
    setShowCloseModal(false);
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  // Safe version of formatStatus
const formatStatus = (status?: string | null) => {
  if(status===null || status===undefined) return ""
  if(status.length===0) return "";
  const safeStatus = status || ""; // fallback if null/undefined
  return safeStatus.charAt(0).toUpperCase() + safeStatus.slice(1).replace(/_/g, " ");
};

  // Helper function to get status color
  const getStatusColor = (status?: string | null) => {
    const safeStatus = (status || "").toLowerCase();
    switch (safeStatus) {
      case "pending":
        return "text-yellow-600";
      case "in_progress":
      case "in progress":
        return "text-blue-600";
      case "completed":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-900";
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Helper function to get question type display name
  const getQuestionTypeDisplay = (type: string) => {
    switch (type) {
      case "mcq":
        return "Multiple choice";
      case "text":
        return "Text";
      case "image":
        return "Image upload";
      case "section":
        return "Section";
      default:
        return type;
    }
  };

  // Helper function to get question type icon
  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case "mcq":
        return <List className="w-4 h-4" />;
      case "text":
        return <FileText className="w-4 h-4" />;
      case "image":
        return <Image className="w-4 h-4" />;
      default:
        return null;
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-[#1B6486]" />
          <span className="ml-3 text-gray-600">Loading form details...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <Link
          href="/forms"
          className="flex items-center gap-2 text-black font-medium hover:underline w-fit cursor-pointer mb-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Forms
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-4 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No form found
  if (!form) {
    return (
      <div className="space-y-6 max-w-7xl mx-auto pb-10">
        <Link
          href="/forms"
          className="flex items-center gap-2 text-black font-medium hover:underline w-fit cursor-pointer mb-2"
        >
          <ChevronLeft className="w-5 h-5" />
          Back to Forms
        </Link>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 text-center text-gray-500">
          Form not found.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ConfirmationModal
        isOpen={showCloseModal}
        onClose={() => setShowCloseModal(false)}
        onConfirm={confirmClose}
        title="Are you sure you want to Close this Form?"
        confirmText="Yes"
        cancelText="Cancel"
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Form Closed Successfully!!"
      />

      {/* Header */}
      <div>
        <Link
          href="/forms"
          className="flex items-center gap-2 text-black font-medium hover:underline w-fit cursor-pointer mb-2"
        >
          <ChevronLeft className="w-5 h-5" />
          {form.title}
        </Link>
        <p className="text-gray-500 text-sm ml-7">
          {form.description || "View all details about the form here"}
        </p>
      </div>

      {/* Form Information Block */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h3 className="text-base font-semibold text-gray-900 mb-6">
          Form Information:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-y-8 gap-x-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Form ID:</p>
            <p className="text-sm font-medium text-gray-900 truncate" title={form.form_id}>
              {form.form_id.substring(0, 8)}...
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Vessel ID:</p>
            <p className="text-sm font-medium text-gray-900 truncate" title={form.vessel_id}>
              {form.vessel_id.substring(0, 8)}...
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Questions:</p>
            <p className="text-sm font-medium text-gray-900">{form.questions?.length || 0}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Status:</p>
            <p className={`text-sm font-medium ${getStatusColor(form.status)}`}>
              {formatStatus(form.status)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Due Date:</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(form.due_date)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Created At:</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(form.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Last Updated:</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(form.updated_at)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Last Synced:</p>
            <p className="text-sm font-medium text-gray-900">{formatDate(form.last_synced_at)}</p>
          </div>
        </div>
      </div>

      {/* Questions Overview */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h3 className="text-base font-semibold text-gray-900 mb-6">
          Questions Overview ({form.questions?.length || 0} questions):
        </h3>

        <div className="space-y-6">
          {form.questions && form.questions.length > 0 ? (
            form.questions
              .sort((a, b) => a.order - b.order)
              .map((question, index) => (
                <div
                  key={index}
                  className="bg-[#F8F9FA] p-6 rounded-lg space-y-4"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-[#207191] text-white text-xs font-medium rounded-full flex-shrink-0">
                      {question.order}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {question.type === 'section' ? (question as any).title || 'Section' : question.prompt}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        {getQuestionTypeIcon(question.type)}
                        <span>{getQuestionTypeDisplay(question.type)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Show options for MCQ */}
                  {question.type === "mcq" && question.options && question.options.length > 0 && (
                    <div className="space-y-2 ml-9">
                      {question.options.map((option, optIndex) => (
                        <div
                          key={optIndex}
                          className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-700"
                        >
                          {option}
                        </div>
                      ))}
                    </div>
                  )}



                  {/* Show placeholder for image questions or the image itself */}
                  {question.type === "image" && (
                    <div className="ml-9">
                      {question.answer ? (
                        <div className="w-full">
                          <img
                            src={question.answer}
                            alt={`Answer for question ${question.order}`}
                            className="max-w-full h-auto max-h-96 rounded-lg border border-gray-200 object-contain bg-gray-50"
                          />
                        </div>
                      ) : (
                        <div className="w-full px-4 py-6 bg-white rounded-lg border border-gray-200 border-dashed text-sm text-gray-400 text-center flex flex-col items-center gap-2">
                          <Image className="w-8 h-8" />
                          <span>Image upload will be available here</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show answer for text questions */}
                  {question.type === "text" && (
                    <div className="ml-9">
                      {question.answer ? (
                        <div className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-700">
                          {question.answer}
                        </div>
                      ) : (
                        <div className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-400 italic">
                          Text response will be collected here...
                        </div>
                      )}
                    </div>
                  )}

                  {/* Show answer for MCQ questions */}
                  {question.type === "mcq" && question.answer && (
                    <div className="ml-9 mt-2">
                      <p className="text-xs text-gray-500 mb-1">Selected Answer:</p>
                      <div className="w-full px-4 py-3 bg-green-50 rounded-lg border border-green-200 text-sm text-green-700 font-medium">
                        {question.answer}
                      </div>
                    </div>
                  )}
                </div>
              ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No questions added to this form.
            </div>
          )}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={handleCloseForm}
          className="px-8 py-2.5 rounded-lg bg-[#d70000] text-white text-sm font-medium hover:bg-[#b00000] cursor-pointer"
        >
          Close Form
        </button>
        <Link href={`/forms/${form.form_id}/edit`}>
          <button
            className="px-8 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            Edit Form
          </button>
        </Link>
      </div>
    </div>
  );
}
