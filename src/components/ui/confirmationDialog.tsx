// components/ui/ConfirmationDialog.tsx

import React, { useState } from "react";

interface ConfirmationDialogProps {
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  title,
  message,
  onConfirm,

  onCancel,
}) => {
  const handleConfirm = () => {
    onConfirm();
  };

  const handleCancel = () => {
    onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50">
      <div className="rounded-lg bg-white p-6 shadow-xl">
        <h2 className="mb-2 text-xl font-bold">{title}</h2>
        <p className="mb-4 text-gray-700">{message}</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={handleCancel}
            className="rounded-md border border-gray-300 px-4 py-2 text-gray-800 transition-colors duration-200 hover:bg-gray-100"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            className="rounded-md bg-red-600 px-4 py-2 font-semibold text-white transition-colors duration-200 hover:bg-red-700"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog;
