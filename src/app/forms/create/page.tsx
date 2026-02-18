"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, Plus, Check, X, Circle, Loader2, Image as ImageIcon, Upload } from "lucide-react";
import { formsApi, FormQuestion } from "@/lib/api";

// --- Types ---
type QuestionType = "multiple_choice" | "text_box" | "";

interface SectionHeader {
  id: number;
  itemType: 'section';
  title: string;
}

interface Question {
  id: number;
  itemType: 'question';
  text: string;
  type: QuestionType;
  options: string[];
  image?: File; // Question image (for display)
  allowImageUpload: boolean; // Whether user can upload image as answer
}

type FormItem = Question | SectionHeader;

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

// --- Main Page Component ---

export default function CreateFormPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2 | 3>(1); // 1: Details, 2: Creation, 3: Preview
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);



  // Step 1 State
  const [formData, setFormData] = useState({
    formTitle: "",
    message: "",
    dueDate: "",
    // Recurrence fields
    recurrenceStartDate: "",
    recurrenceIntervalValue: "1",
    recurrenceIntervalUnit: "month" as "day" | "week" | "month" | "year",
    reminderBeforeValue: "1",
  });

  // Step 2 State
  const [formItems, setFormItems] = useState<FormItem[]>([
    {
      id: 1,
      itemType: 'question',
      text: "",
      type: "" as QuestionType,
      options: [""],
      allowImageUpload: false,
    },
  ]);

  // Bulk Edit State
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<number>>(new Set());
  const [bulkTypeFeedback, setBulkTypeFeedback] = useState<string | null>(null);
  const [bulkImageFeedback, setBulkImageFeedback] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string>("Form uploaded successfully!");

  // Title validation state
  const [titleExists, setTitleExists] = useState(false);
  const [checkingTitle, setCheckingTitle] = useState(false);
  const [titleError, setTitleError] = useState<string | null>(null);

  // Debounced title validation
  useEffect(() => {
    const title = formData.formTitle.trim();

    // Reset validation state if title is empty
    if (!title) {
      setTitleExists(false);
      setTitleError(null);
      setCheckingTitle(false);
      return;
    }

    // Debounce the API call
    setCheckingTitle(true);
    const timeoutId = setTimeout(async () => {
      try {
        const response = await formsApi.checkTitle(title);
        if (response.success && response.data.exists) {
          setTitleExists(true);
          setTitleError(response.data.message || "This form title already exists");
        } else {
          setTitleExists(false);
          setTitleError(null);
        }
      } catch (err) {
        console.error("Error checking title:", err);
        // Don't block the user if the check fails
        setTitleExists(false);
        setTitleError(null);
      } finally {
        setCheckingTitle(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [formData.formTitle]);

  // Fetch vessels on mount


  // --- Handlers ---

  const handleNextStep = () => {
    setStep((prev) => (prev + 1) as 1 | 2 | 3);
  };

  const handleBackStep = () => {
    if (step > 1) {
      setStep((prev) => (prev - 1) as 1 | 2 | 3);
    }
  };

  // Question Handlers
  const handleJsonUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);

        // Validate JSON structure - support both old format (questions only) and new format (items array)
        const items = json.items || json.questions;

        if (!items || !Array.isArray(items)) {
          setError("Invalid JSON format. Expected an 'items' or 'questions' array.");
          return;
        }

        // Transform JSON items to form items (questions and sections)
        const newFormItems: FormItem[] = items.map((item: any, index: number) => {
          // Check if it's a section
          if (item.type === "section" || item.itemType === "section") {
            return {
              id: Date.now() + index,
              itemType: 'section' as const,
              title: item.title || item.name || "",
            };
          }

          // Otherwise, it's a question
          let questionType: QuestionType = "";

          if (item.type === "mcq") {
            questionType = "multiple_choice";
          } else if (item.type === "text") {
            questionType = "text_box";
          } else if (item.type === "image") {
            questionType = "";
          }

          return {
            id: Date.now() + index,
            itemType: 'question' as const,
            text: item.prompt || item.text || "",
            type: questionType,
            options: item.options || [""],
            allowImageUpload: item.type === "image" || item.allow_image_upload || false,
          };
        });

        // Replace existing form items with imported ones
        setFormItems(newFormItems);
        setError(null);

        // Count questions and sections
        const questionCount = newFormItems.filter(item => item.itemType === 'question').length;
        const sectionCount = newFormItems.filter(item => item.itemType === 'section').length;

        // Show success message
        setSuccessMessage(`Form uploaded successfully!`);
        setShowSuccessModal(true);
      } catch (err) {
        console.error("Error parsing JSON:", err);
        setError("Failed to parse JSON file. Please check the file format.");
      }
    };

    reader.onerror = () => {
      setError("Failed to read file. Please try again.");
    };

    reader.readAsText(file);

    // Reset file input
    event.target.value = "";
  };

  const addQuestion = () => {
    setFormItems([
      ...formItems,
      {
        id: Date.now(),
        itemType: 'question',
        text: "",
        type: "" as QuestionType,
        options: [""],
        allowImageUpload: false,
      },
    ]);
  };

  const addSection = () => {
    setFormItems([
      ...formItems,
      {
        id: Date.now(),
        itemType: 'section',
        title: "",
      },
    ]);
  };

  const updateSectionTitle = (id: number, title: string) => {
    setFormItems(formItems.map((item) =>
      item.id === id && item.itemType === 'section' ? { ...item, title } : item
    ));
  };

  const updateQuestionText = (id: number, text: string) => {
    setFormItems(formItems.map((item) =>
      item.id === id && item.itemType === 'question' ? { ...item, text } : item
    ));
  };

  const updateQuestionType = (id: number, type: QuestionType) => {
    setFormItems(formItems.map((item) =>
      item.id === id && item.itemType === 'question' ? { ...item, type } : item
    ));
  };

  const addOption = (questionId: number) => {
    setFormItems(
      formItems.map((item) =>
        item.id === questionId && item.itemType === 'question'
          ? { ...item, options: [...item.options, ""] }
          : item
      )
    );
  };

  const updateOption = (
    questionId: number,
    optionIndex: number,
    text: string
  ) => {
    setFormItems(
      formItems.map((item) =>
        item.id === questionId && item.itemType === 'question'
          ? {
            ...item,
            options: item.options.map((opt, idx) =>
              idx === optionIndex ? text : opt
            ),
          }
          : item
      )
    );
  };

  const removeOption = (questionId: number, optionIndex: number) => {
    setFormItems(
      formItems.map((item) =>
        item.id === questionId && item.itemType === 'question'
          ? {
            ...item,
            options: item.options.filter((_, idx) => idx !== optionIndex),
          }
          : item
      )
    );
  };

  const updateQuestionImage = (questionId: number, file: File | undefined) => {
    setFormItems(
      formItems.map((item) =>
        item.id === questionId && item.itemType === 'question'
          ? { ...item, image: file }
          : item
      )
    );
  };

  const removeItem = (itemId: number) => {
    if (formItems.length > 1) {
      setFormItems(formItems.filter((item) => item.id !== itemId));
    }
  };

  const toggleImageUpload = (questionId: number) => {
    setFormItems(
      formItems.map((item) =>
        item.id === questionId && item.itemType === 'question'
          ? { ...item, allowImageUpload: !item.allowImageUpload }
          : item
      )
    );
  };

  const insertSectionBefore = (itemId: number) => {
    const itemIndex = formItems.findIndex(item => item.id === itemId);
    if (itemIndex === -1) return;

    const newSection: SectionHeader = {
      id: Date.now(),
      itemType: 'section',
      title: "",
    };

    const newItems = [...formItems];
    newItems.splice(itemIndex, 0, newSection);
    setFormItems(newItems);
  };

  // Bulk Edit Handlers
  const toggleQuestionSelection = (questionId: number) => {
    const newSelection = new Set(selectedQuestions);
    if (newSelection.has(questionId)) {
      newSelection.delete(questionId);
    } else {
      newSelection.add(questionId);
    }
    setSelectedQuestions(newSelection);
  };

  const selectAllQuestions = () => {
    const allQuestionIds = formItems
      .filter((item): item is Question => item.itemType === 'question')
      .map(q => q.id);
    setSelectedQuestions(new Set(allQuestionIds));
  };

  const deselectAllQuestions = () => {
    setSelectedQuestions(new Set());
  };

  const applyBulkQuestionType = (type: QuestionType) => {
    setFormItems(formItems.map(item => {
      if (item.itemType === 'question' && selectedQuestions.has(item.id)) {
        return { ...item, type };
      }
      return item;
    }));
  };

  const applyBulkImageUpload = (enabled: boolean) => {
    setFormItems(formItems.map(item => {
      if (item.itemType === 'question' && selectedQuestions.has(item.id)) {
        return { ...item, allowImageUpload: enabled };
      }
      return item;
    }));
  };

  const applyBulkAddOptions = () => {
    setFormItems(formItems.map(item => {
      if (item.itemType === 'question' && selectedQuestions.has(item.id)) {
        // Only add options if it's MCQ type and doesn't have options yet
        if (item.type === 'multiple_choice' && item.options.length === 1 && item.options[0] === "") {
          return { ...item, options: ["", "", ""] }; // Add 3 empty options
        }
      }
      return item;
    }));
  };

  const handlePublishClick = () => {
    // Validate before showing confirmation
    setError(null);

    if (!formData.formTitle.trim()) {
      setError("Form title is required");
      return;
    }
    const questions = formItems.filter((item): item is Question => item.itemType === 'question');
    if (questions.length === 0 || !questions.some(q => q.text.trim())) {
      setError("At least one question with text is required");
      return;
    }

    setShowConfirmModal(true);
  };

  const confirmPublish = async () => {
    setShowConfirmModal(false);
    setIsLoading(true);
    setError(null);

    try {
      // Transform ALL form items (questions AND sections) to API format
      let orderCounter = 0;
      const apiItems: FormQuestion[] = formItems
        .filter(item => {
          // Include sections and questions with text
          if (item.itemType === 'section') return true;
          if (item.itemType === 'question') return item.text.trim() !== '';
          return false;
        })
        .map((item): FormQuestion => {
          orderCounter++;
          
          // Handle sections
          if (item.itemType === 'section') {
            return {
              order: orderCounter,
              type: 'section',
              title: item.title,
            };
          }
          
          // Handle questions
          const q = item as Question;
          
          // Determine API type based on question configuration
          let apiType: "mcq" | "text" | "image";

          if (q.type === "multiple_choice") {
            apiType = "mcq";
          } else if (q.type === "text_box") {
            apiType = "text";
          } else if (q.type === "" && q.allowImageUpload) {
            // Only image upload, no other type
            apiType = "image";
          } else {
            // Default to text if no type specified
            apiType = "text";
          }

          const question: FormQuestion = {
            order: orderCounter,
            prompt: q.text,
            type: apiType,
          };

          // Add allow_image_upload flag if enabled (for MCQ/text questions)
          if (q.allowImageUpload && q.type !== "") {
            question.allow_image_upload = true;
          }

          // Only add options for MCQ type
          if (apiType === "mcq" && q.options.length > 0) {
            question.options = q.options.filter(opt => opt.trim());
          }

          return question;
        });

      // Collect question images into a map (order -> file)
      const questionImages: { [key: number]: File } = {};
      const questions = formItems.filter((item): item is Question => item.itemType === 'question');
      const filteredQuestions = questions.filter(q => q.text.trim());
      
      // Map images to their correct order in the final items array
      filteredQuestions.forEach((q) => {
        if (q.image) {
          // Find the order of this question in apiItems
          const itemIndex = apiItems.findIndex(
            item => item.type !== 'section' && (item as any).prompt === q.text
          );
          if (itemIndex !== -1) {
            questionImages[apiItems[itemIndex].order] = q.image;
          }
        }
      });

      const payload = {
        title: formData.formTitle.trim(),
        description: formData.message.trim() || formData.formTitle.trim(),
        // vessel_id: removed, backend defaults to unassigned
        questions: apiItems, // Now includes both questions AND sections
        due_date: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        questionImages: Object.keys(questionImages).length > 0 ? questionImages : undefined,
        // Recurrence fields
        recurrence_start_date: formData.recurrenceStartDate ? new Date(formData.recurrenceStartDate).toISOString() : undefined,
        recurrence_interval_value: formData.recurrenceIntervalValue ? parseInt(formData.recurrenceIntervalValue) : undefined,
        recurrence_interval_unit: formData.recurrenceIntervalUnit || undefined,
        reminder_before_value: formData.reminderBeforeValue ? parseInt(formData.reminderBeforeValue) : undefined,
      };

      // Debug logging
      console.log('🚀 Creating form with payload:', JSON.stringify(payload, null, 2));
      console.log('📋 Total items (questions + sections):', apiItems.length);
      console.log('📋 Sections:', apiItems.filter(item => item.type === 'section').length);
      console.log('📋 Questions:', apiItems.filter(item => item.type !== 'section').length);
      
      // Debug: Log each section with its title
      const sections = apiItems.filter(item => item.type === 'section');
      sections.forEach((section, idx) => {
        console.log(`📌 Section ${idx + 1}:`, {
          order: section.order,
          type: section.type,
          title: (section as any).title,
          hasTitle: !!(section as any).title,
          titleLength: ((section as any).title || '').length
        });
      });

      const response = await formsApi.create(payload);

      if (response.success) {
        setShowSuccessModal(true);
        // Redirect to forms list after showing success modal
        setTimeout(() => {
          router.push("/forms");
        }, 2000);
      } else {
        setError(response.error || "Failed to create form");
      }
    } catch (err: unknown) {
      console.error("Error creating form:", err);
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string; error?: string } } };
        setError(
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Failed to create form. Please try again."
        );
      } else {
        setError("Failed to create form. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Renders ---

  const renderStep1 = () => (
    <div className="space-y-6">
      {/* Form Details Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-sm font-medium text-gray-700 mb-6 pb-4 border-b border-gray-100">
          Form details
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Form Title
              </label>
              <input
                type="text"
                placeholder="Short heading (max 50 chars)"
                className={`w-full px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 ${titleExists ? 'focus:ring-red-500' : 'focus:ring-[#1F9EBD]'
                  }`}
                value={formData.formTitle}
                onChange={(e) =>
                  setFormData({ ...formData, formTitle: e.target.value })
                }
              />
              {/* Title validation feedback */}
              {checkingTitle && formData.formTitle.trim() && (
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Checking availability...
                </p>
              )}
              {titleError && !checkingTitle && (
                <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                  <X className="w-3 h-3" />
                  {titleError}
                </p>
              )}
              {!titleExists && !checkingTitle && formData.formTitle.trim() && !titleError && (
                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  Title is available
                </p>
              )}
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

      {/* Options to Reoccurrence Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-sm font-medium text-gray-700 mb-6 pb-4 border-b border-gray-100">
          Options to reoccurence
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
          {/* Start Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              placeholder="Enter Start Date"
              className="w-full px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD]"
              value={formData.recurrenceStartDate}
              onChange={(e) =>
                setFormData({ ...formData, recurrenceStartDate: e.target.value })
              }
            />
          </div>

          {/* Reoccur Every */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Reoccur every
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                placeholder="01"
                className="w-20 px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black text-center placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD]"
                value={formData.recurrenceIntervalValue}
                onChange={(e) =>
                  setFormData({ ...formData, recurrenceIntervalValue: e.target.value })
                }
              />
              <div className="relative flex-1">
                <select
                  className="w-full px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#1F9EBD] appearance-none cursor-pointer pr-10"
                  value={formData.recurrenceIntervalUnit}
                  onChange={(e) =>
                    setFormData({ ...formData, recurrenceIntervalUnit: e.target.value as "day" | "week" | "month" | "year" })
                  }
                >
                  <option value="day">Days</option>
                  <option value="week">Weeks</option>
                  <option value="month">Month</option>
                  <option value="year">Year</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Reminder Before */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Reminder Before
            </label>
            <div className="flex gap-3">
              <input
                type="number"
                min="1"
                placeholder="01"
                className="w-20 px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black text-center placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD]"
                value={formData.reminderBeforeValue}
                onChange={(e) =>
                  setFormData({ ...formData, reminderBeforeValue: e.target.value })
                }
              />
              <div className="relative flex-1">
                <select
                  className="w-full px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#1F9EBD] appearance-none cursor-pointer pr-10"
                >
                  <option value="day">Day Before</option>
                  <option value="week">Week Before</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 ">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-medium text-gray-700">Add Questions</h2>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setBulkEditMode(!bulkEditMode);
              if (bulkEditMode) {
                deselectAllQuestions();
              }
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${bulkEditMode
              ? 'bg-[#207191] text-white'
              : 'border-2 border-[#207191] text-[#207191] hover:bg-[#207191] hover:text-white'
              }`}
          >
            {bulkEditMode ? 'Exit Bulk Edit' : 'Bulk Edit Mode'}
          </button>
          <input
            type="file"
            accept=".json,application/json"
            onChange={handleJsonUpload}
            className="hidden"
            id="json-upload-input"
          />
          <label
            htmlFor="json-upload-input"
            className="px-4 py-2 rounded-lg border-2 border-[#207191] text-[#207191] text-sm font-medium hover:bg-[#207191] hover:text-white transition-colors cursor-pointer flex items-center gap-2"
          >
            <Upload className="w-4 h-4" />
            Import from JSON
          </label>
        </div>
      </div>

      {/* Bulk Action Toolbar */}
      {bulkEditMode && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium text-gray-700">
                {selectedQuestions.size} question(s) selected
              </span>
              <button
                onClick={selectAllQuestions}
                className="text-xs text-[#207191] hover:underline font-medium"
              >
                Select All
              </button>
              <button
                onClick={deselectAllQuestions}
                className="text-xs text-gray-600 hover:underline font-medium"
              >
                Deselect All
              </button>
            </div>
          </div>

          {/* Question Number Grid Selector */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <h3 className="text-xs font-medium text-gray-700 mb-3">Select Questions by Number</h3>
            <div className="flex flex-wrap gap-2 max-h-64 overflow-y-auto p-2">
              {formItems
                .map((item, index) => ({ item, originalIndex: index }))
                .filter(({ item }) => item.itemType === 'question')
                .map(({ item, originalIndex }, questionIndex) => {
                  const questionNumber = questionIndex + 1;
                  const isSelected = selectedQuestions.has(item.id);

                  return (
                    <label
                      key={item.id}
                      className={`flex items-center justify-center w-10 h-10 rounded-md border-2 cursor-pointer transition-all ${isSelected
                        ? 'bg-[#207191] border-[#207191] text-white'
                        : 'bg-white border-gray-300 text-gray-700 hover:border-[#207191]'
                        }`}
                      title={`Question ${questionNumber}: ${(item as Question).text || 'Untitled'}`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleQuestionSelection(item.id)}
                        className="sr-only"
                      />
                      <span className="text-xs font-medium">{questionNumber}</span>
                    </label>
                  );
                })}
            </div>
          </div>

          {selectedQuestions.size > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Bulk Question Type */}
              {/* Bulk Question Type */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Set Question Type</label>
                <div className="relative">
                  <select
                    onChange={(e) => {
                      applyBulkQuestionType(e.target.value as QuestionType);
                      e.target.value = "";
                      setBulkTypeFeedback(`Updated type for ${selectedQuestions.size} questions`);
                      setTimeout(() => setBulkTypeFeedback(null), 3000);
                    }}
                    className="w-full px-3 py-2 bg-white rounded-lg border border-gray-300 text-sm text-black font-medium focus:outline-none focus:ring-1 focus:ring-[#1F9EBD] appearance-none cursor-pointer pr-8"
                  >
                    <option value="">Choose type...</option>
                    <option value="multiple_choice">Multiple Choice</option>
                    <option value="text_box">Text Box</option>
                    <option value="">None (Image Only)</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
                {bulkTypeFeedback && (
                  <p className="mt-1 text-xs text-green-600 italic animate-fade-in">{bulkTypeFeedback}</p>
                )}
              </div>

              {/* Bulk Image Upload */}
              <div>
                <label className="text-xs text-gray-600 mb-1 block">Image Upload</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      applyBulkImageUpload(true);
                      setBulkImageFeedback(`Enabled images for ${selectedQuestions.size} questions`);
                      setTimeout(() => setBulkImageFeedback(null), 3000);
                    }}
                    className="flex-1 px-3 py-2 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 active:scale-95 transition-all shadow-sm"
                  >
                    Enable
                  </button>
                  <button
                    onClick={() => {
                      applyBulkImageUpload(false);
                      setBulkImageFeedback(`Disabled images for ${selectedQuestions.size} questions`);
                      setTimeout(() => setBulkImageFeedback(null), 3000);
                    }}
                    className="flex-1 px-3 py-2 bg-gray-600 text-white text-xs font-medium rounded-lg hover:bg-gray-700 active:scale-95 transition-all shadow-sm"
                  >
                    Disable
                  </button>
                </div>
                {bulkImageFeedback && (
                  <p className="mt-1 text-xs text-green-600 italic animate-fade-in">{bulkImageFeedback}</p>
                )}
              </div>

              {/* Clear Selection */}
              <div className="flex items-end">
                <button
                  onClick={deselectAllQuestions}
                  className="w-full px-3 py-2 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700 transition-colors"
                >
                  Clear Selection
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pb-4 border-b border-gray-100 mb-6"></div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      <div className="space-y-8">
        {formItems.map((item, itemIndex) => {
          // SECTION RENDERING
          if (item.itemType === 'section') {
            // Calculate question range for this section
            const nextSectionIndex = formItems.findIndex((i, idx) => idx > itemIndex && i.itemType === 'section');
            const endIndex = nextSectionIndex === -1 ? formItems.length : nextSectionIndex;
            const questionsInSection = formItems.slice(itemIndex + 1, endIndex).filter(i => i.itemType === 'question');

            const questionsBeforeSection = formItems.slice(0, itemIndex).filter(i => i.itemType === 'question').length;
            const startQ = questionsBeforeSection + 1;
            const endQ = questionsBeforeSection + questionsInSection.length;
            const questionRange = questionsInSection.length > 0 ? `${startQ}-${endQ}Q` : 'No questions';
            return (
              <div
                key={item.id}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 p-6 rounded-lg border-l-4 border-[#1B6486] relative"
              >
                {formItems.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove section"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}

                <div className="flex items-center justify-between">
                  <input
                    type="text"
                    placeholder="Enter section title (e.g., Section A - ENGINE)"
                    className="flex-1 px-4 py-3 bg-white rounded-lg border border-gray-200 text-base font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1F9EBD]"
                    value={item.title}
                    onChange={(e) => updateSectionTitle(item.id, e.target.value)}
                  />
                  <span className="ml-4 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm font-medium text-gray-700">
                    {questionRange}
                  </span>
                </div>
              </div>
            );
          }

          // QUESTION RENDERING
          const questionNumber = formItems.slice(0, itemIndex).filter(i => i.itemType === 'question').length + 1;

          return (
            <div key={item.id} className="space-y-2">
              {/* Insert Section Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => insertSectionBefore(item.id)}
                  className="text-xs text-[#207191] hover:text-[#1a5b75] font-medium flex items-center gap-1 px-3 py-1 rounded hover:bg-blue-50 transition-colors"
                  title="Insert section header above this question"
                >
                  <Plus className="w-3 h-3" />
                  Insert Section Above
                </button>
              </div>

              <div
                className={`bg-[#F8F9FA] p-6 rounded-lg space-y-4 relative ${bulkEditMode && selectedQuestions.has(item.id) ? 'ring-2 ring-[#207191] bg-blue-50' : ''
                  }`}
              >
                {/* Bulk Edit Checkbox */}
                {bulkEditMode && (
                  <div className="absolute top-4 left-4">
                    <input
                      type="checkbox"
                      checked={selectedQuestions.has(item.id)}
                      onChange={() => toggleQuestionSelection(item.id)}
                      className="w-5 h-5 text-[#207191] border-gray-300 rounded focus:ring-[#207191] cursor-pointer"
                    />
                  </div>
                )}

                {formItems.length > 1 && (
                  <button
                    onClick={() => removeItem(item.id)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors"
                    title="Remove question"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
                <input
                  type="text"
                  placeholder={`${questionNumber}. Type your question here`}
                  className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#1F9EBD]"
                  value={item.text}
                  onChange={(e) => updateQuestionText(item.id, e.target.value)}
                />
                <div className="space-y-2">
                  <label className="text-xs text-gray-500 block">Question Image (Optional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id={`question-image-${item.id}`}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      updateQuestionImage(item.id, file);
                    }}
                  />
                  {item.image ? (
                    <div className="relative w-full md:w-1/2">
                      <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                        <img
                          src={URL.createObjectURL(item.image)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => updateQuestionImage(item.id, undefined)}
                        className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md text-gray-400 hover:text-red-500 transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <p className="text-xs text-gray-500 mt-1 truncate">{item.image.name}</p>
                    </div>
                  ) : (
                    <label
                      htmlFor={`question-image-${item.id}`}
                      className="flex flex-col items-center justify-center gap-2 w-full md:w-1/2 h-32 bg-white rounded-lg border-2 border-dashed border-gray-300 text-sm text-gray-400 cursor-pointer hover:border-[#207191] hover:text-[#207191] transition-colors"
                    >
                      <Upload className="w-6 h-6" />
                      <span>Click to upload image</span>
                    </label>
                  )}
                </div>
                <div className="w-full md:w-1/3">
                  <label className="text-xs text-gray-500 mb-1 block">Question Type (Optional)</label>
                  <div className="relative">
                    <select
                      className="w-full px-4 py-2.5 bg-white rounded-lg border border-gray-200 text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#1F9EBD] appearance-none cursor-pointer pr-10"
                      value={item.type}
                      onChange={(e) =>
                        updateQuestionType(
                          item.id,
                          e.target.value as QuestionType
                        )
                      }
                    >
                      <option value="">None</option>
                      <option value="multiple_choice">Multiple Choice</option>
                      <option value="text_box">Text Box</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>
                </div>
                <div className="flex items-center gap-2 pl-4">
                  <input
                    type="checkbox"
                    id={`allow-image-${item.id}`}
                    checked={item.allowImageUpload}
                    onChange={() => toggleImageUpload(item.id)}
                    className="w-4 h-4 text-[#207191] border-gray-300 rounded focus:ring-[#207191] cursor-pointer"
                  />
                  <label
                    htmlFor={`allow-image-${item.id}`}
                    className="text-sm text-gray-700 cursor-pointer select-none"
                  >
                    Allow image upload for this question
                  </label>
                </div>
                {item.type === "multiple_choice" && (
                  <div className="space-y-3 pl-4">
                    {item.options.map((option, optIndex) => (
                      <div key={optIndex} className="flex items-center gap-3">
                        <Circle className="w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder={`Option ${optIndex + 1}`}
                          className="w-full md:w-1/2 px-4 py-2 bg-white rounded-lg border border-gray-200 text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#1F9EBD]"
                          value={option}
                          onChange={(e) =>
                            updateOption(item.id, optIndex, e.target.value)
                          }
                        />
                        {item.options.length > 1 && (
                          <button
                            onClick={() => removeOption(item.id, optIndex)}
                            className="text-gray-400 hover:text-red-500"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={() => addOption(item.id)}
                      className="px-4 py-2 rounded-lg bg-[#207191] text-white text-xs font-medium hover:bg-[#1a5b75] transition-colors mt-2"
                    >
                      + Add Another Option
                    </button>
                  </div>
                )}
                {item.type === "text_box" && (
                  <div className="pl-4">
                    <div className="w-full md:w-1/2 px-4 py-2 bg-gray-100 rounded-lg border border-gray-200 text-sm text-gray-400 flex items-center gap-2">
                      = Text Box
                    </div>
                  </div>
                )}
                {item.allowImageUpload && (
                  <div className="pl-4">
                    <div className="w-full md:w-1/2 px-4 py-3 bg-blue-50 rounded-lg border border-blue-200 text-sm text-blue-700 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" />
                      <span>Image upload enabled for this question</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={addSection}
          className="px-6 py-2.5 rounded-lg border-2 border-[#207191] text-[#207191] text-sm font-medium hover:bg-[#207191] hover:text-white transition-colors"
        >
          + Add Section Title
        </button>
        <button
          onClick={addQuestion}
          className="px-6 py-2.5 rounded-lg bg-[#207191] text-white text-sm font-medium hover:bg-[#1a5b75] transition-colors"
        >
          + Add Another Question
        </button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 ">
      <h2 className="text-sm font-medium text-gray-700 mb-6">
        Check the preview for your questions
      </h2>
      <div className="pb-4 border-b border-gray-100 mb-6"></div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 text-sm flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Creating form...
        </div>
      )}

      <div className="space-y-8">
        {formItems.map((item, itemIndex) => {
          if (item.itemType === 'section') {
            const nextSectionIndex = formItems.findIndex((i, idx) => idx > itemIndex && i.itemType === 'section');
            const endIndex = nextSectionIndex === -1 ? formItems.length : nextSectionIndex;
            const questionsInSection = formItems.slice(itemIndex + 1, endIndex).filter(i => i.itemType === 'question');
            const questionsBeforeSection = formItems.slice(0, itemIndex).filter(i => i.itemType === 'question').length;
            const startQ = questionsBeforeSection + 1;
            const endQ = questionsBeforeSection + questionsInSection.length;
            const questionRange = questionsInSection.length > 0 ? `${startQ}-${endQ}Q` : '';
            return (
              <div
                key={item.id}
                className="bg-gradient-to-r from-blue-50 to-cyan-50 p-4 rounded-lg border-l-4 border-[#1B6486]"
              >
                <h3 className="text-base font-bold text-gray-900">
                  {item.title || "Untitled Section"}: {questionRange}
                </h3>
              </div>
            );
          }
          const questionNumber = formItems.slice(0, itemIndex).filter(i => i.itemType === 'question').length + 1;
          return (
            <div
              key={item.id}
              className="bg-[#F8F9FA] p-6 rounded-lg space-y-4"
            >
              <div className="flex items-start gap-4">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {questionNumber}. {item.text || "Untitled Question"}
                    {item.type && ` (${item.type === "multiple_choice" ? "Multiple Choice" : "Text Box"})`}
                    {!item.type && item.allowImageUpload && " (Image Upload Only)"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {item.image && (
                    <div className="flex items-center gap-2 text-xs text-[#207191] bg-[#207191]/10 px-3 py-1 rounded-full">
                      <ImageIcon className="w-3 h-3" />
                      Has Question Image
                    </div>
                  )}
                  {item.allowImageUpload && (
                    <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
                      <Upload className="w-3 h-3" />
                      Allows Upload
                    </div>
                  )}
                </div>
              </div>
              {item.type === "multiple_choice" && (
                <div className="space-y-3">
                  {item.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-700"
                    >
                      {option || `Option ${optIndex + 1}`}
                    </div>
                  ))}
                </div>
              )}
              {item.type === "text_box" && (
                <div className="space-y-3">
                  <div className="w-full px-4 py-3 bg-white rounded-lg border border-gray-200 text-sm text-gray-400 min-h-[80px]">
                    User will enter text here...
                  </div>
                </div>
              )}
              {item.allowImageUpload && (
                <div className="space-y-3">
                  <div className="w-full px-4 py-8 bg-white rounded-lg border border-dashed border-gray-200 text-sm text-gray-400 flex flex-col items-center justify-center gap-2">
                    <ImageIcon className="w-8 h-8" />
                    <span>User will upload image here</span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmPublish}
        title="Are you sure you want to Publish the Form?"
        confirmText="Yes"
        cancelText="Cancel"
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message="Form Uploaded Successfully!"
      />

      {/* Header */}
      <div className="flex items-center gap-2">
        <Link
          href="/forms"
          className="flex items-center gap-2 text-black font-medium hover:underline w-fit cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
        </Link>
        <span className="text-black font-medium">
          {step === 1 && "Create New Form"}
          {step === 2 && "Form Creation"}
          {step === 3 && "Form Preview"}
        </span>
      </div>

      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        {step === 1 ? (
          <Link href="/forms">
            <button className="px-10 py-2.5 rounded-lg border border-[#1b6486] text-[#1b6486] text-sm font-medium hover:bg-cyan-50 cursor-pointer">
              Cancel
            </button>
          </Link>
        ) : (
          <button
            onClick={handleBackStep}
            className="px-10 py-2.5 rounded-lg border border-[#1b6486] text-[#1b6486] text-sm font-medium hover:bg-cyan-50 cursor-pointer"
          >
            Cancel
          </button>
        )}

        {step === 1 && (
          <button
            onClick={handleNextStep}
            disabled={titleExists || checkingTitle || !formData.formTitle.trim()}
            className={`px-10 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 transition-opacity ${titleExists || checkingTitle || !formData.formTitle.trim()
                ? 'opacity-50 cursor-not-allowed'
                : 'cursor-pointer'
              }`}
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            {checkingTitle ? (
              <span className="flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                Checking...
              </span>
            ) : (
              'Next'
            )}
          </button>
        )}
        {step === 2 && (
          <button
            onClick={handleNextStep}
            className="px-10 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            Publish
          </button>
        )}
        {step === 3 && (
          <button
            onClick={handlePublishClick}
            disabled={isLoading}
            className="px-10 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Publishing...
              </>
            ) : (
              "Publish"
            )}
          </button>
        )}
      </div>
    </div>
  );
}
