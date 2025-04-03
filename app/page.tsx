"use client";

import EntryList from "@/app/components/EntryList";
import { useJournalEntries } from "@/app/JournalEntries";
import { generateEntrySummary, generateReflectionQuestions } from "@/utils/aiApi";
import Link from "next/link";

interface JournalEntry {
  id: string;
  content: string;
  summary: string | null;
  reflectionQuestions: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function Home() {
  const { entries, deleteEntry, reloadEntries, upsertEntry, isLoading } = useJournalEntries();

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
  };

  const handleRegenerateSummary = async (entry: JournalEntry) => {
    const newSummary = await generateEntrySummary(entry.content);
    await upsertEntry({
      ...entry,
      summary: newSummary,
    });
  };

  const handleGenerateReflections = async (entry: JournalEntry) => {
    const questions = await generateReflectionQuestions(entry.content);
    if (questions) {
      await upsertEntry({
        ...entry,
        reflectionQuestions: questions,
      });
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Journal Entries</h1>
          <Link
            href="/entry/new"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            New Entry
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <EntryList
            entries={entries}
            onDelete={handleDelete}
            onRegenerateSummary={handleRegenerateSummary}
            onGenerateReflections={handleGenerateReflections}
          />
        )}
      </div>
    </main>
  );
}
