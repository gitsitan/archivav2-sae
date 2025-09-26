"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { Alert01Icon, Cancel02Icon } from "@hugeicons/core-free-icons";

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isProcessing?: boolean;
  variant?: "danger" | "warning" | "info";
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  isProcessing = false,
  variant = "danger",
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case "danger":
        return {
          iconColor: "text-red-600",
          buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          warningBg: "bg-yellow-50 dark:bg-yellow-900/20",
          warningBorder: "border-yellow-200 dark:border-yellow-800",
          warningText: "text-yellow-800 dark:text-yellow-200",
        };
      case "warning":
        return {
          iconColor: "text-yellow-600",
          buttonColor: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
          warningBg: "bg-yellow-50 dark:bg-yellow-900/20",
          warningBorder: "border-yellow-200 dark:border-yellow-800",
          warningText: "text-yellow-800 dark:text-yellow-200",
        };
      case "info":
        return {
          iconColor: "text-blue-600",
          buttonColor: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
          warningBg: "bg-blue-50 dark:bg-blue-900/20",
          warningBorder: "border-blue-200 dark:border-blue-800",
          warningText: "text-blue-800 dark:text-blue-200",
        };
      default:
        return {
          iconColor: "text-red-600",
          buttonColor: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
          warningBg: "bg-yellow-50 dark:bg-yellow-900/20",
          warningBorder: "border-yellow-200 dark:border-yellow-800",
          warningText: "text-yellow-800 dark:text-yellow-200",
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md transform rounded-lg bg-white dark:bg-gray-800 shadow-xl transition-all">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <HugeiconsIcon
                  icon={Alert01Icon}
                  size={24}
                  className={styles.iconColor}
                />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {title}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isProcessing}
              className="text-red-500 hover:text-red-900 dark:hover:text-gray-300 transition-colors"
            >
              <HugeiconsIcon icon={Cancel02Icon} size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-4">{message}</p>
              {variant === "danger" && (
                <div className={`${styles.warningBg} ${styles.warningBorder} border rounded-lg p-3`}>
                  <p className={`text-sm ${styles.warningText}`}>
                    <strong>Attention :</strong> Cette action est irréversible.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {cancelText}
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isProcessing}
              className={`px-4 py-2 text-sm font-medium text-white ${styles.buttonColor} rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 flex items-center`}
            >
              {isProcessing ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 8l3-3.709z"
                    />
                  </svg>
                  Traitement...
                </>
              ) : (
                confirmText
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
