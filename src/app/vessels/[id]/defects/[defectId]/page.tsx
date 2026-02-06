"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Check } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  confirmText: string;
  cancelText: string;
}

function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  confirmText,
  cancelText,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] h-screen w-screen flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Content */}
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

const activities = [
  { text: "Defect assigned to Inspector John", date: "12 Nov , 2025" },
  { text: "Defect Resolved", date: "11 Oct 2025" },
  { text: "Defect created during inspection", date: "10 Nov , 2025" },
  { text: "Defect marked Deactivate", date: "09 Nov , 2025" },
];

const defectImages = [
  "/defect-1.png",
  "/defect-2.png",
  "/defect-3.png",
  "/defect-4.png",
];

export default function DefectDetailsPage({
  params,
}: {
  params: { id: string; defectId: string };
}) {
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showCloseDefectModal, setShowCloseDefectModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleDeactivate = () => {
    setShowDeactivateModal(true);
  };

  const handleCloseDefect = () => {
    setShowCloseDefectModal(true);
  };

  const confirmDeactivate = () => {
    setShowDeactivateModal(false);
    setSuccessMessage("Defect Deactivated Successfully!!");
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const confirmCloseDefect = () => {
    setShowCloseDefectModal(false);
    setSuccessMessage("Defect Closed Successfully!!");
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      <ConfirmationModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={confirmDeactivate}
        title="Are you sure you want to deactivate the defect?"
        confirmText="Yes"
        cancelText="Cancel"
      />

      <ConfirmationModal
        isOpen={showCloseDefectModal}
        onClose={() => setShowCloseDefectModal(false)}
        onConfirm={confirmCloseDefect}
        title="Are you sure you want to Close the defect?"
        confirmText="Yes"
        cancelText="Cancel"
      />

      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        message={successMessage}
      />

      {/* Header */}
      <div className="space-y-4">
        <Link
          href={`/vessels/${params.id}`}
          className="flex items-center gap-2 text-black font-medium hover:underline w-fit cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          Engine Room Overheat-DEF-0086
        </Link>
        <div className="flex items-center gap-6 text-sm text-gray-900 pl-7">
          <p>
            <span className="font-semibold">Vessel:</span> ARKA 1
          </p>
          <p>
            <span className="font-semibold">DEF:</span> 0086
          </p>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Severity Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-40">
          <div>
            <p className="text-xs text-gray-500 mb-1">Severity</p>
            <p className="text-2xl text-green-500 uppercase">MINOR</p>
          </div>
          <button
            className="w-full py-2 rounded-lg text-white text-sm font-medium transition-shadow hover:shadow-md cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            Change
          </button>
        </div>

        {/* Assigned Crew Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-40">
          <div>
            <p className="text-xs text-gray-500 mb-1">Assigned Crew</p>
            <p className="text-2xl text-gray-900">John</p>
          </div>
          <button
            className="w-full py-2 rounded-lg text-white text-sm font-medium transition-shadow hover:shadow-md cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            Reassign
          </button>
        </div>

        {/* Deadline Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-40">
          <div>
            <p className="text-xs text-gray-500 mb-1">Deadline</p>
            <p className="text-2xl text-gray-900">12 Oct 2025</p>
          </div>
          <button
            className="w-full py-2 rounded-lg text-white text-sm font-medium transition-shadow hover:shadow-md cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            Edit Deadline
          </button>
        </div>

        {/* Status Card */}
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col justify-between h-40">
          <div>
            <p className="text-xs text-gray-500 mb-1">Status</p>
            <p className="text-2xl text-gray-900">In Progress</p>
          </div>
          <button
            className="w-full py-2 rounded-lg text-white text-sm font-medium transition-shadow hover:shadow-md cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            Reject Resolution
          </button>
        </div>
      </div>

      {/* Defect Description */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base text-black mb-4 pb-3 border-b border-gray-200">
          Defect Description:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Short Title:</p>
            <p className="text-sm font-medium text-gray-900">
              Engine Room Overheat
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Summary text:</p>
            <p className="text-sm font-medium text-gray-900">
              Temperature exc...
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Location:</p>
            <p className="text-sm font-medium text-gray-900">Engine Room</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Category:</p>
            <p className="text-sm font-medium text-gray-900">Machinery</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Assign To:</p>
            <p className="text-sm font-medium text-gray-900">John</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Status:</p>
            <p className="text-sm font-medium text-gray-900">In Progress</p>
          </div>
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-base text-gray-900 font-medium">Images:</h3>
          <button
            className="px-6 py-2 rounded-lg text-white text-sm font-medium hover:opacity-90 cursor-pointer"
            style={{
              background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
            }}
          >
            View All
          </button>
        </div>
        <p className="text-xs text-gray-400 mb-3">Photos:</p>
        <div className="flex gap-4">
          {/* Placeholder images - using simple colored divs for now or generic placeholders if images missing */}
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
            <Image
              src="/defect-1.png"
              alt="Defect"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
            <Image
              src="/defect-2.png"
              alt="Defect"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
            <Image
              src="/defect-3.png"
              alt="Defect"
              fill
              className="object-cover"
            />
          </div>
          <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
            <Image
              src="/defect-4.png"
              alt="Defect"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>

      {/* Notes & Comments */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base text-black mb-4 pb-3 border-b border-gray-200">
          Notes & Comments:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Inspector comments:</p>
            <p className="text-sm text-gray-900 italic">
              Temperature exceeded Threshold
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Crew comments:</p>
            <p className="text-sm text-gray-900 italic">Cooling Fan replaced</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Admin comments:</p>
            <p className="text-sm text-gray-900 italic">Testing Completed</p>
          </div>
        </div>
      </div>

      {/* Task Activities */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 text-white bg-[#207191]">
          <h3 className="font-semibold text-sm">Task activities</h3>
        </div>
        <div className="divide-y divide-gray-100 p-2">
          {activities.map((activity, i) => (
            <div
              key={i}
              className="px-6 py-4 flex items-center justify-between hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#1B6486]"></div>
                <span className="text-sm font-medium text-gray-700">
                  {activity.text}
                </span>
              </div>
              <span className="text-xs text-gray-400">{activity.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Buttons */}
      <div className="flex justify-end gap-3 mt-8">
        <button
          onClick={handleCloseDefect}
          className="px-8 py-2.5 rounded-lg bg-[#d70000] text-white text-sm font-medium hover:bg-[#b00000] cursor-pointer"
        >
          Close Defect
        </button>
        <button
          onClick={handleDeactivate}
          className="px-8 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 cursor-pointer"
          style={{
            background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
          }}
        >
          Deactivate Defect
        </button>
      </div>
    </div>
  );
}
