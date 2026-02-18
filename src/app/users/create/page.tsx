"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Image as ImageIcon, ChevronDown, Check, Loader2, X } from "lucide-react";
import { usersApi } from "@/lib/api";

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

export default function CreateUserPage() {
    const router = useRouter();
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+?[0-9]{10,}$/;
    // minimum 10 digits, numbers only
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    // min 8 chars, upper, lower, number, special char
    const [fieldErrors, setFieldErrors] = useState<{
        email?: string;
        phoneNumber?: string;
        password?: string;
        }>({});


    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        phoneNumber: "",
        password: "",
        userType: "" as "" | "inspector" | "crew",
        role: "",
    });

    const [files, setFiles] = useState<{
        idProof: File | null;
        addressProof: File | null;
        additionalDocs: File | null;
    }>({
        idProof: null,
        addressProof: null,
        additionalDocs: null,
    });

    const handleFileChange = (field: "idProof" | "addressProof" | "additionalDocs", file: File | null) => {
        setFiles((prev) => ({ ...prev, [field]: file }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        if (
        fieldErrors.email ||
        fieldErrors.phoneNumber ||
        fieldErrors.password
        ) {
        setError("Please enter correct details");
        return;
        }

        // Validation
        if (!formData.firstName.trim()) {
            setError("First name is required");
            return;
        }
        if (!formData.lastName.trim()) {
            setError("Last name is required");
            return;
        }
        if (!formData.email.trim()) {
            setError("Email is required");
            return;
        }
        if (!formData.phoneNumber.trim()) {
            setError("Phone number is required");
            return;
        }
        if (!formData.password.trim()) {
            setError("Password is required");
            return;
        }
        if (!formData.userType) {
            setError("Please select user type (Inspector or Crew)");
            return;
        }

        setIsLoading(true);

        try {
            const payload = {
                first_name: formData.firstName.trim(),
                last_name: formData.lastName.trim(),
                email: formData.email.trim(),
                phone_number: formData.phoneNumber.trim(),
                password: formData.password,
                role: formData.role || formData.userType,
                id_proof: files.idProof || undefined,
                address_proof: files.addressProof || undefined,
                additional_docs: files.additionalDocs || undefined,
            };

            let response;
            if (formData.userType === "inspector") {
                response = await usersApi.createInspector(payload);
            } else {
                response = await usersApi.createCrew(payload);
            }

            if (response.success) {
                setShowSuccessModal(true);
                setTimeout(() => {
                    router.push("/users");
                }, 2000);
            } else {
                setError(response.error || "Failed to create user");
            }
        } catch (err: unknown) {
            console.error("Error creating user:", err);
            if (err && typeof err === "object" && "response" in err) {
                const axiosError = err as { response?: { data?: { message?: string; error?: string } } };
                setError(
                    axiosError.response?.data?.message ||
                    axiosError.response?.data?.error ||
                    "Failed to create user. Please try again."
                );
            } else {
                setError("Failed to create user. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-7xl mx-auto pb-10">
            <SuccessModal
                isOpen={showSuccessModal}
                onClose={() => setShowSuccessModal(false)}
                message="User Created Successfully!!"
            />

            {/* Header with Back Button */}
            <div className="flex items-center gap-2">
                <Link
                    href="/users"
                    className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                    <ChevronLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-lg font-medium text-gray-900">Create User</h1>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 min-h-[600px] relative">
                <div className="border-b border-gray-100 pb-4 mb-8">
                    <h2 className="text-base font-medium text-gray-700">User details</h2>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="flex flex-col items-center">
                        {/* Form Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 w-full max-w-5xl">
                            {/* First Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-[#F3F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-1 focus:ring-[#1F9EBD] focus:outline-none placeholder-gray-400"
                                    placeholder="Enter First Name"
                                    value={formData.firstName}
                                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                />
                            </div>

                            {/* Last Name */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-[#F3F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-1 focus:ring-[#1F9EBD] focus:outline-none placeholder-gray-400"
                                    placeholder="Enter Last Name"
                                    value={formData.lastName}
                                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                />
                            </div>

                            {/* Email */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    className="w-full bg-[#F3F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-1 focus:ring-[#1F9EBD] focus:outline-none placeholder-gray-400"
                                    placeholder="Enter Email Address"
                                    value={formData.email}
                                    onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, email: value });

                                    setFieldErrors((prev) => ({...prev,
                                    email: value && !emailRegex.test(value)
                                        ? "Enter a valid email address"
                                        : undefined,
                                    }));
                                }}
                                />
                                {fieldErrors.email && (<p className="text-xs text-red-500">{fieldErrors.email}</p>)}

                            </div>

                            {/* Phone Number */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Phone Number <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="tel"
                                    className="w-full bg-[#F3F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-1 focus:ring-[#1F9EBD] focus:outline-none placeholder-gray-400"
                                    placeholder="Enter Phone Number (e.g., +919876543210)"
                                    value={formData.phoneNumber}
                                    onChange={(e) => {
                                        //const value = e.target.value.replace(/\D/g, ""); // numbers only
                                        let value = e.target.value;
                                        // Allow only digits and one + at start
                                        if (value.startsWith("+")) {
                                            value = "+" + value.slice(1).replace(/[^0-9]/g, "");
                                        } else {
                                            value = value.replace(/[^0-9]/g, "");
                                        }
                                        setFormData({ ...formData, phoneNumber: value });

                                        setFieldErrors((prev) => ({
                                        ...prev,
                                        phoneNumber:
                                            value && !phoneRegex.test(value)
                                            ? "Phone number must be at least 10 digits"
                                            : undefined,
                                        }));
                                    }}
                                />
                                {fieldErrors.phoneNumber && (<p className="text-xs text-red-500">{fieldErrors.phoneNumber}</p>)}

                            </div>

                            {/* Password */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    id="password"
                                    className="w-full bg-[#F3F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-1 focus:ring-[#1F9EBD] focus:outline-none placeholder-gray-400"
                                    placeholder="Enter Password"
                                    value={formData.password}
                                    onChange={(e) => {
                                    const value = e.target.value;
                                    setFormData({ ...formData, password: value });

                                    setFieldErrors((prev) => ({
                                    ...prev,
                                    password:
                                        value && !passwordRegex.test(value)
                                        ? "Password must 8 characters contain upper, lower, number & special character"
                                        : undefined,
                                    }));
                                }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <Eye size={20} /> : <EyeOff size={20} />}
                                </button>
                            </div>
                            {fieldErrors.password && (<p className="text-xs text-red-500">{fieldErrors.password}</p>)}

                            </div>

                            {/* User Type */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    User Type <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full appearance-none bg-[#F3F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-1 focus:ring-[#1F9EBD] focus:outline-none cursor-pointer"
                                        value={formData.userType}
                                        onChange={(e) => setFormData({ ...formData, userType: e.target.value as "" | "inspector" | "crew" })}
                                    >
                                        <option value="" disabled className="text-gray-400">
                                            Choose User Type
                                        </option>
                                        <option value="inspector">Inspector</option>
                                        <option value="crew">Crew</option>
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                        <ChevronDown className="w-4 h-4 text-gray-500" />
                                    </div>
                                </div>
                            </div>

                            {/* Role */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Role (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="w-full bg-[#F3F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:ring-1 focus:ring-[#1F9EBD] focus:outline-none placeholder-gray-400"
                                    placeholder="Enter Role (e.g., Captain, Engineer)"
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>

                            {/* Upload ID Proof */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Upload ID Proof
                                </label>
                                <div className="relative group cursor-pointer">
                                    <div className="w-full bg-[#F3F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD] flex items-center justify-between">
                                        <span className={files.idProof ? "text-gray-900" : "text-gray-400"}>
                                            {files.idProof ? files.idProof.name : "Upload ID Proof"}
                                        </span>
                                        {files.idProof ? (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFileChange("idProof", null);
                                                }}
                                                className="text-gray-500 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <ImageIcon className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileChange("idProof", e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>

                            {/* Upload Address Proof */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Upload Address Proof
                                </label>
                                <div className="relative group cursor-pointer">
                                    <div className="w-full bg-[#F3F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD] flex items-center justify-between">
                                        <span className={files.addressProof ? "text-gray-900" : "text-gray-400"}>
                                            {files.addressProof ? files.addressProof.name : "Upload Address Proof"}
                                        </span>
                                        {files.addressProof ? (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFileChange("addressProof", null);
                                                }}
                                                className="text-gray-500 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <ImageIcon className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileChange("addressProof", e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>

                            {/* Additional Docs */}
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Additional Docs
                                </label>
                                <div className="relative group cursor-pointer">
                                    <div className="w-full bg-[#F3F9FA] border-none rounded-lg px-4 py-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD] flex items-center justify-between">
                                        <span className={files.additionalDocs ? "text-gray-900" : "text-gray-400"}>
                                            {files.additionalDocs ? files.additionalDocs.name : "Upload Additional Docs"}
                                        </span>
                                        {files.additionalDocs ? (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleFileChange("additionalDocs", null);
                                                }}
                                                className="text-gray-500 hover:text-red-500"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        ) : (
                                            <ImageIcon className="w-5 h-5 text-gray-500" />
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={(e) => handleFileChange("additionalDocs", e.target.files?.[0] || null)}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Buttons Footer */}
                        <div className="flex justify-end gap-4 mt-12 w-full max-w-5xl">
                            <Link href="/users">
                                <button
                                    type="button"
                                    className="px-10 py-2.5 rounded-lg border border-[#1b6486] text-[#1b6486] text-sm font-medium hover:bg-cyan-50 transition-colors cursor-pointer"
                                >
                                    Cancel
                                </button>
                            </Link>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="px-10 py-2.5 rounded-lg text-white text-sm font-medium shadow-md transition-shadow hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                                style={{
                                    background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                                }}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create"
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
