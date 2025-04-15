"use client";

import EntryList from "@/app/components/EntryList";
import { useJournalEntries } from "@/app/JournalEntries";
import { generateEntrySummary, generateReflectionQuestions } from "@/utils/aiApi";
import Link from "next/link";
import { useState } from "react";

interface JournalEntry {
  id: string;
  content: string;
  summary: string | null;
  reflectionQuestions: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

export default function Home() {
  const { entries, deleteEntry, upsertEntry, isLoading } = useJournalEntries();
  const [trendsSummary, setTrendsSummary] = useState<string | null>(null);
  const [isGeneratingTrends, setIsGeneratingTrends] = useState(false);

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

  const handleGenerateTrends = async () => {
    if (entries.length === 0) return;

    setIsGeneratingTrends(true);
    try {
      const response = await fetch("/api/trends", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          entries: entries.map((entry) => entry.content),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate trends");
      }

      const data = await response.json();
      setTrendsSummary(data.summary);
    } catch (error) {
      console.error("Error generating trends:", error);
    } finally {
      setIsGeneratingTrends(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Journal Entries</h1>
          <div className="flex gap-4">
            <button
              onClick={handleGenerateTrends}
              disabled={isGeneratingTrends || entries.length === 0}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGeneratingTrends ? "Generating..." : "Generate Insights"}
            </button>
            <Link
              href="/entry/new"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              New Entry
            </Link>
          </div>
        </div>

        {trendsSummary ? (
          <div className="mb-8 p-4 bg-white rounded-lg shadow">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Trends & Insights</h2>
            <p className="text-gray-600">{trendsSummary}</p>
          </div>
        ) : null}

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
