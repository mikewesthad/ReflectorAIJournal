"use client";

import { useState } from "react";
import { resetDatabase } from "@/utils/db";
import DeleteConfirmationModal from "@/app/components/DeleteConfirmationModal";
import { useJournalEntries } from "@/app/JournalEntries";

interface State {
  isLoading: boolean;
  message: string | null;
}

export default function DeleteSection() {
  const { reloadEntries } = useJournalEntries();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [{ isLoading, message }, setState] = useState<State>({
    isLoading: false,
    message: null,
  });

  const handleReset = async () => {
    setState({ isLoading: true, message: null });
    try {
      await resetDatabase();
      await reloadEntries();
      setState({ isLoading: false, message: "All entries have been deleted." });
    } catch (error) {
      console.error(error);
      setState({ isLoading: false, message: "Reset failed" });
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Delete Data</h2>
      <p className="text-gray-600 mb-4">
        Permanently delete all journal entries. This action cannot be undone.
      </p>
      <button
        onClick={() => setIsDeleteModalOpen(true)}
        disabled={isLoading}
        className={`px-4 py-2 rounded ${
          isLoading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-red-500 text-white hover:bg-red-600"
        }`}
      >
        {isLoading ? "Deleting..." : "Delete All Entries"}
      </button>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleReset}
      />

      {message ? <div className="mt-4 p-4 rounded bg-gray-100">{message}</div> : null}
    </section>
  );
}
