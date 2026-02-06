"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight, Loader2, Search, Trash2 } from "lucide-react";
import { formsApi, FormListItem } from "@/lib/api";

export default function FormsPage() {
  const [forms, setForms] = useState<FormListItem[]>([]);
  const [filteredForms, setFilteredForms] = useState<FormListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasNext, setHasNext] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showClosed, setShowClosed] = useState(false);
  const limit = 10;

  const fetchForms = async (page: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await formsApi.getAll(page, limit);

      if (response.success) {
        // Sort forms by created_at in descending order (latest first)
        const sortedForms = [...response.data.items].sort((a, b) => {
          const dateA = new Date(a.created_at || 0).getTime();
          const dateB = new Date(b.created_at || 0).getTime();
          return dateB - dateA; // Descending order
        });

        setForms(sortedForms);
        setFilteredForms(sortedForms);
        setHasNext(response.data.has_next);
        setCurrentPage(response.data.page);
      } else {
        setError(response.error || "Failed to fetch forms");
      }
    } catch (err: unknown) {
      console.error("Error fetching forms:", err);
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string; error?: string } } };
        setError(
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Failed to fetch forms. Please try again."
        );
      } else {
        setError("Failed to fetch forms. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchForms(currentPage);
  }, []);

  // Filter forms based on search query and showClosed state
  useEffect(() => {
    let result = forms;

    // Filter by closed status
    if (!showClosed) {
      result = result.filter(form => form.status.toLowerCase() !== 'closed');
    }

    // Filter by search query
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter((form) => {
        return (
          form.title.toLowerCase().includes(query) ||
          (form.description && form.description.toLowerCase().includes(query)) ||
          form.status.toLowerCase().includes(query)
        );
      });
    }

    setFilteredForms(result);
  }, [searchQuery, forms, showClosed]);

  const handleDeleteForm = async (formId: string, formTitle: string) => {
    if (confirm(`Are you sure you want to delete form "${formTitle}"? This will move it to the closed forms history.`)) {
      try {
        const response = await formsApi.delete(formId);
        if (response.success) {
          // Update local state to mark as closed
          setForms(forms.map(f =>
            f.form_id === formId ? { ...f, status: 'Closed' } : f
          ));
        } else {
          alert("Failed to delete form: " + response.error);
        }
      } catch (error) {
        console.error("Error deleting form:", error);
        alert("An error occurred while deleting the form");
      }
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      fetchForms(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (hasNext) {
      fetchForms(currentPage + 1);
    }
  };

  // Helper function to format status
  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, " ");
  };

  // Helper function to get status color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
      case "unassigned":
        return "text-yellow-600";
      case "in_progress":
      case "in progress":
        return "text-blue-600";
      case "completed":
      case "closed":
        return "text-green-600";
      case "cancelled":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  // Helper function to format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Forms</h1>
          <p className="text-gray-500 mt-1">
            View all forms and manage assignments for vessels and inspectors.
          </p>
        </div>
        <Link href="/forms/create">
          <button
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-white font-medium shadow-md transition-shadow hover:shadow-lg cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            <Plus className="w-5 h-5" />
            Create Form
          </button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Forms</h2>

          <div className="flex items-center gap-6">
            {/* Show Closed Toggle */}
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <div className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={showClosed}
                  onChange={(e) => setShowClosed(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B6486]"></div>
              </div>
              <span className="text-sm font-medium text-gray-600">Show Closed Forms</span>
            </label>

            {/* Search Bar */}
            <div className="relative w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search forms by name, description, or status..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-10 pl-10 pr-4 bg-gray-50 rounded-lg text-sm text-gray-900 border border-gray-200 focus:ring-2 focus:ring-[#1B6486] focus:border-transparent outline-none"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
            <button
              onClick={() => fetchForms(currentPage)}
              className="ml-4 underline hover:no-underline"
            >
              Retry
            </button>
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#1B6486]" />
            <span className="ml-3 text-gray-600">Loading forms...</span>
          </div>
        ) : filteredForms.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>
              {searchQuery
                ? `No forms match "${searchQuery}". Try a different search term.`
                : "No forms found."}
            </p>
            {!searchQuery && (
              <Link href="/forms/create">
                <button className="mt-4 text-[#1B6486] underline hover:no-underline">
                  Create your first form
                </button>
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-100 text-left">
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 rounded-l-lg">
                      Form Name
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                      Description
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                      Questions
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                      Created Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                      Due Date
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                      Status
                    </th>
                    <th className="px-6 py-4 text-xs font-semibold text-gray-600 rounded-r-lg text-center">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredForms.map((form) => (
                    <tr key={form.form_id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-6 text-sm text-gray-900 font-medium max-w-[200px] truncate" title={form.title}>
                        {form.title}
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600 max-w-xs truncate">
                        {form.description || "-"}
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600">
                        {form.questions?.length || 0}
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600">
                        {formatDate(form.created_at)}
                      </td>
                      <td className="px-6 py-6 text-sm text-gray-600">
                        {formatDate(form.due_date)}
                      </td>
                      <td className={`px-6 py-6 text-sm font-medium ${getStatusColor(form.status)}`}>
                        {formatStatus(form.status)}
                      </td>
                      <td className="px-6 py-6">
                        <div className="flex items-center justify-center gap-3">
                          <Link href={`/forms/${form.form_id}`}>
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

                          {form.status.toLowerCase() !== 'closed' && (
                            <button
                              onClick={() => handleDeleteForm(form.form_id, form.title)}
                              className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                              title="Delete Form"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-8 pt-4">
              <span className="text-sm text-gray-500 font-medium">
                {searchQuery
                  ? `Found ${filteredForms.length} form${filteredForms.length !== 1 ? "s" : ""} matching "${searchQuery}"`
                  : `Page ${currentPage} • Showing ${filteredForms.length} form${filteredForms.length !== 1 ? "s" : ""}`
                }
              </span>
              <div className="flex">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-l-lg bg-[#1B6486] text-white hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNextPage}
                  disabled={!hasNext}
                  className="px-4 py-2 rounded-r-lg bg-[#1B6486] text-white hover:opacity-90 transition-opacity border-l border-[#2aaacc] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
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
