"use client";

import ExportSection from "./ExportSection";
import ImportSection from "./ImportSection";
import DeleteSection from "./DeleteSection";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      <div className="space-y-8">
        <ExportSection />
        <ImportSection />
        <DeleteSection />
      </div>
    </div>
  );
}
