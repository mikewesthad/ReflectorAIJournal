"use client";

import { useState } from "react";
import { exportEntries } from "@/utils/db";

interface State {
  isLoading: boolean;
  message: string | null;
}

export default function ExportSection() {
  const [{ isLoading, message }, setState] = useState<State>({
    isLoading: false,
    message: null,
  });

  const handleExport = async () => {
    setState({ isLoading: true, message: null });
    try {
      const data = await exportEntries();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "journal-export.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setState({ isLoading: false, message: "Export successful!" });
    } catch (error) {
      setState({ isLoading: false, message: "Export failed: " + (error as Error).message });
    }
  };

  return (
    <section>
      <h2 className="text-xl font-semibold mb-4">Export Data</h2>
      <p className="text-gray-600 mb-4">Download all your journal entries as a JSON file.</p>
      <button
        onClick={handleExport}
        disabled={isLoading}
        className={`px-4 py-2 rounded ${
          isLoading
            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
            : "bg-blue-500 text-white hover:bg-blue-600"
        }`}
      >
        {isLoading ? "Exporting..." : "Export Entries"}
      </button>
      {message ? <div className="mt-4 p-4 rounded bg-gray-100">{message}</div> : null}
    </section>
  );
}
