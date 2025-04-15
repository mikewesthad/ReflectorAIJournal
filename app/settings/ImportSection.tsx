"use client";

import { useState } from "react";
import { importFromFile } from "@/utils/db";
import { useJournalEntries } from "../JournalEntries";

interface State {
  isLoading: boolean;
  message: string | null;
}

export default function ImportSection() {
  const [{ isLoading, message }, setState] = useState<State>({
    isLoading: false,
    message: null,
  });
  const { reloadEntries } = useJournalEntries();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setState({ isLoading: true, message: null });
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const entries = await importFromFile(data);
      setState({
        isLoading: false,
        message: `Successfully imported ${entries.length} ${
          entries.length === 1 ? "entry" : "entries"
        }.`,
      });
      await reloadEntries();
      e.target.value = "";
    } catch (error) {
      console.error(error);
      setState({
        isLoading: false,
        message: "Import failed",
      });
    }
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Import Data</h2>
      <p className="text-gray-600 mb-4">
        Import entries from a JSON file. This will add new entries without removing existing ones.
      </p>
      <div className="space-y-4">
        <input
          type="file"
          accept=".json"
          onChange={handleFileChange}
          disabled={isLoading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-full file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50"
        />
        {message ? <div className="mt-4 p-4 rounded bg-gray-100">{message}</div> : null}
      </div>
    </section>
  );
}
