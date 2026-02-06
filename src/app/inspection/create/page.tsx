"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, Calendar, Loader2, AlertCircle } from "lucide-react";
import { inspectionApi, vesselsApi, formsApi, usersApi, CrewData, InspectorData } from "@/lib/api";

export default function AssignInspectionPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Form data
    const [formData, setFormData] = useState({
        inspection_name: "",
        vessel_id: "",
        form_id: "",
        assignee_id: "",
        assignee_type: "crew" as "inspector" | "crew",
        role: "",
        priority: "" as "High" | "Medium" | "Low" | "",
        due_date: "",
    });

    // Dropdown options
    const [vessels, setVessels] = useState<any[]>([]);
    const [forms, setForms] = useState<any[]>([]);
    const [crew, setCrew] = useState<CrewData[]>([]);
    const [inspectors, setInspectors] = useState<InspectorData[]>([]);
    const [loadingData, setLoadingData] = useState(true);

    // Fetch vessels, forms, and users on mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [vesselsRes, formsRes, crewRes, inspectorsRes] = await Promise.all([
                    vesselsApi.getAll(1, 100),
                    formsApi.getAll(1, 100),
                    usersApi.getCrew(1, 100),
                    usersApi.getInspectors(1, 100),
                ]);

                if (vesselsRes.success) {
                    setVessels(vesselsRes.data.items);
                }
                if (formsRes.success) {
                    setForms(formsRes.data.items);
                }
                if (crewRes.success) {
                    setCrew(crewRes.data.crew);
                }
                if (inspectorsRes.success) {
                    setInspectors(inspectorsRes.data.inspectors);
                }
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setLoadingData(false);
            }
        };

        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        // Validation
        if (!formData.inspection_name || !formData.vessel_id || !formData.form_id || !formData.assignee_id ||
            !formData.role || !formData.priority || !formData.due_date) {
            setError("Please fill in all required fields");
            setLoading(false);
            return;
        }

        try {
            // Convert date to ISO 8601 format
            const dueDate = new Date(formData.due_date);
            dueDate.setHours(0, 0, 0, 0);

            const payload = {
                inspection_name: formData.inspection_name,
                form_id: formData.form_id,
                vessel_id: formData.vessel_id,
                assignee_id: formData.assignee_id,
                assignee_type: formData.assignee_type,
                role: formData.role,
                priority: formData.priority as "High" | "Medium" | "Low",
                due_date: dueDate.toISOString(),
            };

            const response = await inspectionApi.create(payload);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    router.push("/inspection");
                }, 1500);
            } else {
                setError(response.message || "Failed to create inspection assignment");
            }
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to create inspection assignment");
            console.error("Error creating inspection:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header with Back Button */}
            <div className="flex items-center gap-2">
                <Link
                    href="/inspection"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-medium text-gray-900">Assign Inspection</h1>
            </div>

            {/* Success Message */}
            {success && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                        <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="text-green-800 font-medium">Inspection assigned successfully! Redirecting...</p>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <p className="text-red-800">{error}</p>
                </div>
            )}

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[600px] relative">
                <div className="border-b border-gray-100 pb-4 mb-8">
                    <h2 className="text-base font-medium text-gray-700">
                        Assign Inspection
                    </h2>
                </div>

                {loadingData ? (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 text-[#1B6486] animate-spin" />
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 max-w-5xl">
                            {/* Inspection Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Inspection Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-[#F5F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#1B6486] focus:outline-none"
                                    placeholder="e.g., Monthly Safety Inspection"
                                    value={formData.inspection_name}
                                    onChange={(e) => setFormData({ ...formData, inspection_name: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Select Vessel */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select Vessel <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-[#F5F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#1B6486] focus:outline-none cursor-pointer"
                                        value={formData.vessel_id}
                                        onChange={(e) => setFormData({ ...formData, vessel_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select the Vessel</option>
                                        {vessels.map((vessel) => (
                                            <option key={vessel.vessel_id} value={vessel.vessel_id}>
                                                {vessel.name}
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Select Form */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select Form <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-[#F5F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#1B6486] focus:outline-none cursor-pointer"
                                        value={formData.form_id}
                                        onChange={(e) => setFormData({ ...formData, form_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select the Form</option>
                                        {forms
                                            .filter((form) => form.status?.toLowerCase() !== "closed")
                                            .map((form) => (
                                                <option key={form.form_id} value={form.form_id}>
                                                    {form.title}
                                                </option>
                                            ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Assignee Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Assignee Type <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-[#F5F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#1B6486] focus:outline-none cursor-pointer"
                                        value={formData.assignee_type}
                                        onChange={(e) => setFormData({
                                            ...formData,
                                            assignee_type: e.target.value as "inspector" | "crew",
                                            assignee_id: "" // Reset assignee when type changes
                                        })}
                                        required
                                    >
                                        <option value="crew">Crew</option>
                                        <option value="inspector">Inspector</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Select Assignee */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Select {formData.assignee_type === "crew" ? "Crew Member" : "Inspector"} <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-[#F5F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#1B6486] focus:outline-none cursor-pointer"
                                        value={formData.assignee_id}
                                        onChange={(e) => setFormData({ ...formData, assignee_id: e.target.value })}
                                        required
                                    >
                                        <option value="">Select {formData.assignee_type === "crew" ? "Crew Member" : "Inspector"}</option>
                                        {formData.assignee_type === "crew" ? (
                                            crew.map((member) => (
                                                <option key={member.crew_id} value={member.crew_id}>
                                                    {member.first_name} {member.last_name} ({member.email})
                                                </option>
                                            ))
                                        ) : (
                                            inspectors.map((inspector) => (
                                                <option key={inspector.inspector_id} value={inspector.inspector_id}>
                                                    {inspector.first_name} {inspector.last_name} ({inspector.email})
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-[#F5F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#1B6486] focus:outline-none"
                                    placeholder="e.g., Lead Inspector"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    required
                                />
                            </div>

                            {/* Due Date */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Due Date <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        className="w-full bg-[#F5F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#1B6486] focus:outline-none cursor-pointer"
                                        value={formData.due_date}
                                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                                        required
                                    />
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <Calendar className="w-4 h-4 text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Priority */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Priority <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-[#F5F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-2 focus:ring-[#1B6486] focus:outline-none cursor-pointer"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as "High" | "Medium" | "Low" })}
                                        required
                                    >
                                        <option value="">Select the Priority</option>
                                        <option value="High">High</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Low">Low</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Buttons Footer */}
                        <div className="flex justify-end gap-4 mt-20 md:mt-40">
                            <Link href="/inspection">
                                <button
                                    type="button"
                                    className="px-8 py-2.5 rounded-lg border border-[#1F9EBD] text-[#1F9EBD] text-sm font-medium hover:bg-sky-50 transition-colors"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </Link>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-8 py-2.5 rounded-lg text-white text-sm font-medium shadow-md transition-shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                style={{
                                    background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                                }}
                            >
                                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                                {loading ? "Assigning..." : "Assign Inspection"}
                            </button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
