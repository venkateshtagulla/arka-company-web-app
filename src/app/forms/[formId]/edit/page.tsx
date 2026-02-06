"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronDown,
    Circle,
    X,
    Plus,
    Loader2,
    Check,
    Upload,
    Image as ImageIcon,
} from "lucide-react";
import {
    formsApi,
    vesselsApi,
    VesselData,
    FormDetailData,
} from "@/lib/api";

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

// --- Types ---

type QuestionType = "multiple_choice" | "text_box" | "image" | "";

interface Question {
    id: number;
    text: string;
    type: QuestionType;
    options: string[];
    image?: File;
}

// --- Main Component ---

export default function EditFormPage({
    params,
}: {
    params: Promise<{ formId: string }>;
}) {
    const resolvedParams = use(params);
    const router = useRouter();

    // Modal and loading state
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Vessels State
    const [vessels, setVessels] = useState<VesselData[]>([]);
    const [loadingVessels, setLoadingVessels] = useState(false);

    // Original form data
    const [originalForm, setOriginalForm] = useState<FormDetailData | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        formTitle: "",
        message: "",
        dueDate: "",
        vesselId: "",
    });

    // Questions State
    const [questions, setQuestions] = useState<Question[]>([
        {
            id: 1,
            text: "",
            type: "" as QuestionType,
            options: [""],
        },
    ]);

    // Fetch form data and vessels on mount
    useEffect(() => {
        const fetchData = async () => {
            setIsFetching(true);
            setLoadingVessels(true);
            setError(null);

            try {
                const [formRes, vesselsRes] = await Promise.all([
                    formsApi.getById(resolvedParams.formId),
                    vesselsApi.getAll(1, 100),
                ]);

                if (formRes.success) {
                    const form = formRes.data;
                    setOriginalForm(form);

                    // Populate form data
                    setFormData({
                        formTitle: form.title || "",
                        message: form.description || "",
                        dueDate: form.due_date ? new Date(form.due_date).toISOString().slice(0, 16) : "",
                        vesselId: form.vessel_id || "",
                    });

                    // Populate questions
                    if (form.questions && form.questions.length > 0) {
                        const mappedQuestions = form.questions.map((q, idx) => {
                            let localType: QuestionType = "";
                            if (q.type === "mcq") localType = "multiple_choice";
                            else if (q.type === "text") localType = "text_box";
                            else if (q.type === "image") localType = "image";

                            return {
                                id: idx + 1,
                                text: q.prompt || "",
                                type: localType,
                                options: q.options || [""],
                            };
                        });
                        setQuestions(mappedQuestions);
                    }
                } else {
                    setError(formRes.error || "Failed to fetch form details");
                }

                if (vesselsRes.success) {
                    setVessels(vesselsRes.data.items);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to fetch form details. Please try again.");
            } finally {
                setIsFetching(false);
                setLoadingVessels(false);
            }
        };

        fetchData();
    }, [resolvedParams.formId]);

    // --- Handlers ---

    const updateQuestionText = (id: number, text: string) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, text } : q))
        );
    };

    const updateQuestionType = (id: number, type: QuestionType) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === id ? { ...q, type } : q))
        );
    };

    const updateOption = (questionId: number, optIndex: number, value: string) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === questionId
                    ? {
                        ...q,
                        options: q.options.map((opt, i) =>
                            i === optIndex ? value : opt
                        ),
                    }
                    : q
            )
        );
    };

    const addOption = (questionId: number) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === questionId ? { ...q, options: [...q.options, ""] } : q
            )
        );
    };

    const removeOption = (questionId: number, optIndex: number) => {
        setQuestions((prev) =>
            prev.map((q) =>
                q.id === questionId
                    ? { ...q, options: q.options.filter((_, i) => i !== optIndex) }
                    : q
            )
        );
    };

    const addQuestion = () => {
        const newId = Math.max(...questions.map((q) => q.id)) + 1;
        setQuestions((prev) => [
            ...prev,
            { id: newId, text: "", type: "" as QuestionType, options: [""] },
        ]);
    };

    const removeQuestion = (questionId: number) => {
        if (questions.length > 1) {
            setQuestions((prev) => prev.filter((q) => q.id !== questionId));
        }
    };

    const updateQuestionImage = (questionId: number, file: File | undefined) => {
        setQuestions((prev) =>
            prev.map((q) => (q.id === questionId ? { ...q, image: file } : q))
        );
    };

    const handleUpdateClick = () => {
        // Validate before showing confirmation
        setError(null);

        if (!formData.formTitle.trim()) {
            setError("Form title is required");
            return;
        }
        if (!formData.vesselId) {
            setError("Please select a vessel");
            return;
        }
        if (questions.length === 0 || !questions.some(q => q.text.trim())) {
            setError("At least one question with text is required");
            return;
        }

        setShowConfirmModal(true);
    };

    const confirmUpdate = async () => {
        setShowConfirmModal(false);
        setIsLoading(true);
        setError(null);

        try {
            // Transform questions to API format
            const apiQuestions = questions
                .filter(q => q.text.trim())
                .map((q, index) => {
                    let apiType: "mcq" | "text" | "image";
                    if (q.type === "multiple_choice") {
                        apiType = "mcq";
                    } else if (q.type === "image") {
                        apiType = "image";
                    } else {
                        apiType = "text";
                    }

                    const question: { order: number; prompt: string; type: "mcq" | "text" | "image"; options?: string[] } = {
                        order: index + 1,
                        prompt: q.text,
                        type: apiType,
                    };

                    if (apiType === "mcq" && q.options.length > 0) {
                        question.options = q.options.filter(opt => opt.trim());
                    }

                    return question;
                });

            // Collect question images
            const questionImages: { [key: number]: File } = {};
            const filteredQuestions = questions.filter(q => q.text.trim());
            filteredQuestions.forEach((q, index) => {
                if (q.image) {
                    questionImages[index + 1] = q.image;
                }
            });

            const payload = {
                title: formData.formTitle.trim(),
                description: formData.message.trim() || formData.formTitle.trim(),
                vessel_id: formData.vesselId,
                questions: apiQuestions,
                due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
                questionImages: Object.keys(questionImages).length > 0 ? questionImages : undefined,
            };

            const response = await formsApi.update(resolvedParams.formId, payload);

            if (response.success) {
                setShowSuccessModal(true);
                setTimeout(() => {
                    router.push(`/forms/${resolvedParams.formId}`);
                }, 2000);
            } else {
                setError(response.error || "Failed to update form");
            }
        } catch (err: unknown) {
            console.error("Error updating form:", err);
            if (err && typeof err === "object" && "response" in err) {
                const axiosError = err as { response?: { data?: { message?: string; error?: string } } };
                setError(
                    axiosError.response?.data?.message ||
                    axiosError.response?.data?.error ||
                    "Failed to update form. Please try again."
                );
            } else {
                setError("Failed to update form. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Loading state
    if (isFetching) {
        return (
            <div className="space-y-6 max-w-7xl mx-auto pb-10">
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[#1B6486]" />
                    <span className="ml-3 text-gray-600">Loading form data...</span>
                </div>
            </div>
        );
    }

    // Error state (fetch error)
    if (!originalForm && error) {
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

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <ConfirmationModal
                isOpen={showConfirmModal}
                onClose={() => setShowConfirmModal(false)}
                onConfirm={confirmUpdate}
                title="Are you sure you want to Update this Form?"
                confirmText="Yes"
                cancelText="Cancel"
            />

            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                message="Form Updated Successfully!!"
            />

            {/* Header */}
            <div className="flex items-center gap-2">
                <Link
                    href={`/forms/${resolvedParams.formId}`}
                    className="flex items-center gap-2 text-black font-medium hover:underline w-fit cursor-pointer"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <span className="text-black font-medium">
                    Edit Form: {originalForm?.title}
                </span>
            </div>

            {/* Error Message */}
            {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                    {error}
                </div>
            )}

            {/* Form Details Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-sm font-medium text-gray-700 mb-6 pb-4 border-b border-gray-100">
                    Form details
                </h2>

                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Form Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                placeholder="Short heading (max 50 chars)"
                                className="w-full px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD]"
                                value={formData.formTitle}
                                onChange={(e) =>
                                    setFormData({ ...formData, formTitle: e.target.value })
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Vessel <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <select
                                    className="w-full px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#1F9EBD] appearance-none cursor-pointer pr-10"
                                    value={formData.vesselId}
                                    onChange={(e) =>
                                        setFormData({ ...formData, vesselId: e.target.value })
                                    }
                                    disabled={loadingVessels}
                                >
                                    <option value="">
                                        {loadingVessels ? "Loading vessels..." : "Select a vessel"}
                                    </option>
                                    {vessels.map((vessel) => (
                                        <option key={vessel.vessel_id} value={vessel.vessel_id}>
                                            {vessel.name} ({vessel.imo_number})
                                        </option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">
                                Due Date
                            </label>
                            <input
                                type="datetime-local"
                                className="w-full px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD]"
                                value={formData.dueDate}
                                onChange={(e) =>
                                    setFormData({ ...formData, dueDate: e.target.value })
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700">
                            Description
                        </label>
                        <textarea
                            placeholder="Main content 200-250 Characters"
                            rows={4}
                            className="w-full px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD] resize-none"
                            value={formData.message}
                            onChange={(e) =>
                                setFormData({ ...formData, message: e.target.value })
                            }
                        />
                    </div>
                </div>
            </div>

            {/* Questions Section */}
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
                <h2 className="text-sm font-medium text-gray-700 mb-6">Edit Questions</h2>
                <div className="pb-4 border-b border-gray-100 mb-6"></div>

                <div className="space-y-8">
                    {questions.map((question, index) => (
                        <div
                            key={question.id}
                            className="bg-[#F8F9FA] p-6 rounded-lg space-y-4 relative"
                        >
                            {/* Delete Question Button */}
                            {questions.length > 1 && (
                                <button
                                    onClick={() => removeQuestion(question.id)}
                                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                                    title="Delete question"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}

                            {/* Question Text */}
                            <input
                                type="text"
                                placeholder={`${index + 1}. Type your question here`}
                                className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#1F9EBD]"
                                value={question.text}
                                onChange={(e) => updateQuestionText(question.id, e.target.value)}
                            />

                            {/* Optional Question Image Upload */}
                            <div className="space-y-2">
                                <label className="text-xs text-gray-500 block">Question Image (Optional)</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id={`question-image-${question.id}`}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        updateQuestionImage(question.id, file);
                                    }}
                                />
                                {question.image ? (
                                    <div className="relative w-full md:w-1/2">
                                        <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                                            <img
                                                src={URL.createObjectURL(question.image)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <button
                                            onClick={() => updateQuestionImage(question.id, undefined)}
                                            className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-gray-400 hover:text-red-500 transition-colors"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <p className="text-xs text-gray-500 mt-1 truncate">{question.image.name}</p>
                                    </div>
                                ) : (
                                    <label
                                        htmlFor={`question-image-${question.id}`}
                                        className="flex flex-col items-center justify-center gap-2 w-full md:w-1/2 h-32 bg-white rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-400 cursor-pointer hover:border-[#207191] hover:text-[#207191] transition-colors"
                                    >
                                        <Upload className="w-6 h-6" />
                                        <span>Click to upload image</span>
                                    </label>
                                )}
                            </div>

                            {/* Question Type */}
                            <div className="w-full md:w-1/3">
                                <label className="text-xs text-gray-500 mb-1 block">Question Type</label>
                                <div className="relative">
                                    <select
                                        className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200 text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#1F9EBD] appearance-none cursor-pointer pr-10"
                                        value={question.type}
                                        onChange={(e) =>
                                            updateQuestionType(
                                                question.id,
                                                e.target.value as QuestionType
                                            )
                                        }
                                    >
                                        <option value="" disabled>
                                            Choose Type
                                        </option>
                                        <option value="multiple_choice">
                                            Multiple Choice
                                        </option>
                                        <option value="text_box">Text Box</option>
                                        <option value="image">Image Upload</option>
                                    </select>
                                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                                </div>
                            </div>

                            {/* Options for Multiple Choice */}
                            {question.type === "multiple_choice" && (
                                <div className="space-y-3 pl-4">
                                    {question.options.map((option, optIndex) => (
                                        <div key={optIndex} className="flex items-center gap-3">
                                            <Circle className="w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                placeholder={`Option ${optIndex + 1}`}
                                                className="w-full md:w-1/2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#1F9EBD]"
                                                value={option}
                                                onChange={(e) =>
                                                    updateOption(question.id, optIndex, e.target.value)
                                                }
                                            />
                                            {question.options.length > 1 && (
                                                <button
                                                    onClick={() => removeOption(question.id, optIndex)}
                                                    className="text-gray-400 hover:text-red-500"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                    <button
                                        onClick={() => addOption(question.id)}
                                        className="flex items-center gap-2 text-sm text-[#207191] hover:underline pl-7"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Option
                                    </button>
                                </div>
                            )}

                            {/* Text Box Placeholder */}
                            {question.type === "text_box" && (
                                <div className="pl-4">
                                    <div className="w-full md:w-1/2 px-4 py-6 bg-gray-100 rounded-lg border border-dashed border-gray-300 text-sm text-gray-400">
                                        User will enter text here...
                                    </div>
                                </div>
                            )}

                            {/* Image Upload Placeholder */}
                            {question.type === "image" && (
                                <div className="pl-4">
                                    <div className="w-full md:w-1/2 px-4 py-8 bg-gray-100 rounded-lg border border-dashed border-gray-300 text-sm text-gray-400 flex flex-col items-center justify-center gap-2">
                                        <ImageIcon className="w-8 h-8" />
                                        <span>User will upload image here</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                <div className="flex justify-end mt-6">
                    <button
                        onClick={addQuestion}
                        className="px-6 py-2.5 rounded-lg bg-[#207191] text-white text-sm font-medium hover:bg-[#1a5b75] transition-colors"
                    >
                        + Add Another Question
                    </button>
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 mt-8">
                <Link href={`/forms/${resolvedParams.formId}`}>
                    <button className="px-8 py-2.5 rounded-lg border border-[#1F9EBD] text-[#1F9EBD] text-sm font-medium hover:bg-sky-50 transition-colors cursor-pointer">
                        Cancel
                    </button>
                </Link>
                <button
                    onClick={handleUpdateClick}
                    disabled={isLoading}
                    className="px-8 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    style={{
                        background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                    }}
                >
                    {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {isLoading ? "Updating..." : "Update Form"}
                </button>
            </div>
        </div>
    );
}
