"use client";

import React, { useState } from "react";
import Link from "next/link";
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
  { text: "Form assigned to Inspector Ravi", date: "12 Nov , 2025" },
  { text: "Inspector opened the form", date: "11 Oct 2025" },
  { text: "Form submitted", date: "10 Nov , 2025" },
  { text: "Admin updated recurrence", date: "09 Nov , 2025" },
];

const submissionHistory = [
  { date: "14 Oct 2025", inspector: "Ravi", status: "Submitted", defects: 2 },
  { date: "14 Oct 2025", inspector: "Ravi", status: "Submitted", defects: 2 },
  { date: "14 Oct 2025", inspector: "Ravi", status: "Submitted", defects: 2 },
];

const linkedDefects = [
  {
    id: "DEF-0086",
    summary: "Engine Overheat",
    severity: "Critical",
    status: "In Progress",
  },
  {
    id: "DEF-0086",
    summary: "Engine Overheat",
    severity: "Critical",
    status: "In Progress",
  },
];

export default function FormDetailsPage({
  params,
}: {
  params: { id: string; formId: string };
}) {
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [showCloseFormModal, setShowCloseFormModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleDeactivate = () => {
    setShowDeactivateModal(true);
  };

  const handleCloseForm = () => {
    setShowCloseFormModal(true);
  };

  const confirmDeactivate = () => {
    setShowDeactivateModal(false);
    setSuccessMessage("Form Deactivated Successfully!!");
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  const confirmCloseForm = () => {
    setShowCloseFormModal(false);
    setSuccessMessage("Form Closed Successfully!!");
    setShowSuccessModal(true);
    setTimeout(() => setShowSuccessModal(false), 2000);
  };

  return (
    <div className="space-y-8 pb-10 max-w-7xl mx-auto">
      <ConfirmationModal
        isOpen={showDeactivateModal}
        onClose={() => setShowDeactivateModal(false)}
        onConfirm={confirmDeactivate}
        title="Are you sure you want to deactivate the form?"
        confirmText="Yes"
        cancelText="Cancel"
      />

      <ConfirmationModal
        isOpen={showCloseFormModal}
        onClose={() => setShowCloseFormModal(false)}
        onConfirm={confirmCloseForm}
        title="Are you sure you want to Close the form?"
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
          Engine Safety Audit – v2
        </Link>
        <div className="flex items-center gap-6 text-sm text-gray-900 pl-7">
          <p>
            <span className="font-semibold">Vessel:</span> ARKA 1
          </p>
          <p>
            <span className="font-semibold">Assigned on:</span> 10 Oct 2025
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

      {/* Form Information Block */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-base text-black mb-4 pb-3 border-b border-gray-200">
          Form Information Block:
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div>
            <p className="text-xs text-gray-400 mb-1">Version:</p>
            <p className="text-sm font-medium text-gray-900">v2</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Category:</p>
            <p className="text-sm font-medium text-gray-900">
              Engine Inspection
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Created By:</p>
            <p className="text-sm font-medium text-gray-900">Admin</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Total Questions:</p>
            <p className="text-sm font-medium text-gray-900">32</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Updated on:</p>
            <p className="text-sm font-medium text-gray-900">10 Oct 2025</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Status:</p>
            <p className="text-sm font-medium text-green-500">Active</p>
          </div>
        </div>
      </div>

      {/* Submission History Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-black mb-4">
          Submission History Section
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 rounded-l-lg">
                  Submission Date
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                  Inspector
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                  Defects Created
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 rounded-r-lg text-center">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {submissionHistory.map((history, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-6 text-sm text-gray-900">
                    {history.date}
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-600">
                    {history.inspector}
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-600">
                    {history.status}
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-600">
                    {history.defects}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <button
                      className="px-6 py-2 rounded-lg text-white text-xs font-medium transition-shadow hover:shadow-md cursor-pointer"
                      style={{
                        background:
                          "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Linked Defects Section */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-black mb-4">
          Linked Defects Section
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 rounded-l-lg">
                  Defect ID
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                  Summary
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                  Severity
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600">
                  Status
                </th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-600 rounded-r-lg text-center">
                  View
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {linkedDefects.map((defect, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="px-6 py-6 text-sm text-gray-900">
                    {defect.id}
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-600">
                    {defect.summary}
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-600">
                    {defect.severity}
                  </td>
                  <td className="px-6 py-6 text-sm text-gray-600">
                    {defect.status}
                  </td>
                  <td className="px-6 py-6 text-center">
                    <button
                      className="px-6 py-2 rounded-lg text-white text-xs font-medium transition-shadow hover:shadow-md cursor-pointer"
                      style={{
                        background:
                          "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
                      }}
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
          onClick={handleCloseForm}
          className="px-8 py-2.5 rounded-lg bg-[#d70000] text-white text-sm font-medium hover:bg-[#b00000] cursor-pointer"
        >
          Close Form
        </button>
        <button
          onClick={handleDeactivate}
          className="px-8 py-2.5 rounded-lg text-white text-sm font-medium hover:opacity-90 cursor-pointer"
          style={{
            background: "linear-gradient(90deg, #1B6486 0%, #1F9EBD 100%)",
          }}
        >
          Deactivate Form
        </button>
      </div>
    </div>
  );
}
