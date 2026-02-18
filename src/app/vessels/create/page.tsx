"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronDown, Check, Loader2 } from "lucide-react";
import { vesselsApi } from "@/lib/api";

// Combined user type for dropdown


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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
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

export default function CreateVesselPage() {
  const router = useRouter();
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    vesselName: "",
    vesselType: "",
    imoNumber: "",
    message: "",
  });



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.vesselName.trim()) {
      setError("Vessel name is required");
      return;
    }
    if (!formData.vesselType) {
      setError("Vessel type is required");
      return;
    }
    if (!formData.imoNumber.trim()) {
      setError("IMO number is required");
      return;
    }

    setIsLoading(true);

    try {
      const response = await vesselsApi.create({
        name: formData.vesselName.trim(),
        vessel_type: formData.vesselType,
        imo_number: formData.imoNumber.trim(),
        message:formData.message.trim()
      });

      if (response.success) {
        setShowSuccessModal(true);
        // Redirect to vessels list after showing success modal
        setTimeout(() => {
          router.push("/vessels");
        }, 2000);
      } else {
        setError(response.error || "Failed to create vessel");
      }
    } catch (err: unknown) {
      console.error("Error creating vessel:", err);
      if (err && typeof err === "object" && "response" in err) {
        const axiosError = err as { response?: { data?: { message?: string; error?: string } } };
        setError(
          axiosError.response?.data?.message ||
          axiosError.response?.data?.error ||
          "Failed to create vessel. Please try again."
        );
      } else {
        setError("Failed to create vessel. Please try again.");
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
        message="Vessel Created Successfully!!"
      />

      {/* Header */}
      <Link
        href="/vessels"
        className="flex items-center gap-2 text-black font-medium hover:underline w-fit cursor-pointer"
      >
        <ChevronLeft className="w-5 h-5" />
        Create New Vessel
      </Link>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8">
        <h2 className="text-sm font-medium text-gray-700 mb-6 pb-4 border-b border-gray-100">
          Vessel Details
        </h2>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
            {/* Vessel Name */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Vessel Name
              </label>
              <input
                type="text"
                placeholder="Short heading (max 50 chars)"
                className="w-full px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD]"
                value={formData.vesselName}
                onChange={(e) =>
                  setFormData({ ...formData, vesselName: e.target.value })
                }
              />
            </div>

            {/* Vessel Type */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Vessel Type
              </label>
              <div className="relative">
                <select
                  className="w-full px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black focus:outline-none focus:ring-1 focus:ring-[#1F9EBD] appearance-none cursor-pointer"
                  value={formData.vesselType}
                  onChange={(e) =>
                    setFormData({ ...formData, vesselType: e.target.value })
                  }
                >
                  <option value="" disabled>
                    Enter type of Vessel
                  </option>
                  <option value="Bulk Carrier">Bulk Carrier</option>
                  <option value="Oil Tanker">Oil Tanker</option>
                  <option value="Container Ship">Container Ship</option>
                  <option value="Passenger Ship">Passenger Ship</option>
                  <option value="Cargo Ship">Cargo Ship</option>
                  <option value="Chemical Tanker">Chemical Tanker</option>
                  <option value="LNG Carrier">LNG Carrier</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>
            </div>

            {/* IMO Number */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                IMO Number
              </label>
              <input
                type="text"
                placeholder="Enter IMO Number"
                className="w-full px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD]"
                value={formData.imoNumber}
                onChange={(e) =>
                  setFormData({ ...formData, imoNumber: e.target.value })
                }
              />
            </div>


          </div>

          {/* Message (content) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              placeholder="Main content 200-250 Characters"
              rows={6}
              className="w-full px-4 py-3 rounded-lg bg-[#F3F9FA] border-none text-sm text-black placeholder:text-gray-400 focus:outline-none focus:ring-1 focus:ring-[#1F9EBD] resize-none"
              value={formData.message}
              onChange={(e) =>
                setFormData({ ...formData, message: e.target.value })
              }
            />
          </div>
        </form>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <Link href="/vessels">
          <button className="px-10 py-2.5 rounded-lg border border-[#1b6486] text-[#1b6486] text-sm font-medium hover:bg-cyan-50 cursor-pointer">
            Cancel
          </button>
        </Link>
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="px-10 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
  );
}
