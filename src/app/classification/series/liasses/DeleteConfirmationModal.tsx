"use client";

import React from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { CosIcon, Alert01Icon, Cancel02Icon } from "@hugeicons/core-free-icons";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  liasseName: string;
  isDeleting: boolean;
}

const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  liasseName,
  isDeleting,
}) => {
  if (!isOpen) return null;

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
                  className="text-red-600"
                />
              </div>
              <div className="ml-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Confirmer la suppression
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isDeleting}
              className="text-red-500 hover:text-red-900 dark:hover:text-gray-300 transition-colors"
            >
              <HugeiconsIcon icon={Cancel02Icon} size={24} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-4">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <p className="mb-4">
                Êtes-vous sûr de vouloir supprimer la liasse{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  "{liasseName}"
                </span>{" "}
                ?
              </p>
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  <strong>Attention :</strong> Cette action est irréversible. Si
                  cette liasse contient des documents, vous devrez d'abord les
                  supprimer.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 flex items-center"
            >
              {isDeleting ? (
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
                  Suppression...
                </>
              ) : (
                "Supprimer"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal;
