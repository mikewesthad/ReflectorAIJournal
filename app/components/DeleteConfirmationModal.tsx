"use client";

import { useState } from "react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
}: DeleteConfirmationModalProps) {
  const [confirmationText, setConfirmationText] = useState("");
  const isConfirmed = confirmationText.toLowerCase() === "delete";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4">Delete All Entries</h2>
        <p className="text-gray-600 mb-4">
          This will permanently delete all your journal entries. This action cannot be undone.
        </p>
        <p className="text-gray-600 mb-4">
          To confirm, please type <span className="font-mono">delete</span> in the box below:
        </p>
        <input
          type="text"
          value={confirmationText}
          onChange={(e) => setConfirmationText(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Type 'delete' to confirm"
        />
        <div className="flex justify-end space-x-4">
          <button onClick={onClose} className="px-4 py-2 text-gray-600 hover:text-gray-800">
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={!isConfirmed}
            className={`px-4 py-2 rounded ${
              isConfirmed
                ? "bg-red-500 text-white hover:bg-red-600"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            Delete All Entries
          </button>
        </div>
      </div>
    </div>
  );
}
