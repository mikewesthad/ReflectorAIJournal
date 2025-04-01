"use client";

import { useState, useEffect } from "react";
import { getEntries, saveEntry, updateEntry, deleteEntry } from "../utils/db";

interface JournalEntry {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function Home() {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isFullPage, setIsFullPage] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadEntries();
  }, []);

  // Auto-save effect
  useEffect(() => {
    if (isFullPage && content.trim() && !isSaving) {
      const saveTimeout = setTimeout(async () => {
        await saveContent();
      }, 1000); // Auto-save after 1 second of no changes

      return () => clearTimeout(saveTimeout);
    }
  }, [content, isFullPage, editingId, isSaving]);

  // Word count effect
  useEffect(() => {
    const words = content
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    setWordCount(words.length);
  }, [content]);

  const loadEntries = async () => {
    const loadedEntries = await getEntries();
    setEntries(loadedEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };

  const saveContent = async () => {
    if (!content.trim() || isSaving) return;

    setIsSaving(true);
    try {
      if (editingId) {
        await updateEntry(editingId, content);
      } else {
        await saveEntry(content);
      }
      setLastSaved(new Date());
      loadEntries();
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (entry: JournalEntry) => {
    setContent(entry.content);
    setEditingId(entry.id);
    setIsFullPage(true);
  };

  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    loadEntries();
  };

  const startNewEntry = () => {
    setContent("");
    setEditingId(null);
    setIsFullPage(true);
  };

  const cancelEditing = async () => {
    await saveContent();
    setContent("");
    setEditingId(null);
    setIsFullPage(false);
  };

  if (isFullPage) {
    return (
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={cancelEditing}
                className="flex items-center text-gray-600 hover:text-gray-800"
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back
              </button>
              <h1 className="text-2xl font-semibold text-gray-800">
                {editingId ? "Edit Entry" : "New Journal Entry"}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-500">
                {wordCount} {wordCount === 1 ? "word" : "words"}
              </span>
              {lastSaved && (
                <span className="text-sm text-gray-500">
                  Saved {lastSaved.toLocaleTimeString()}
                </span>
              )}
            </div>
          </div>
          <textarea
            className="w-full h-[calc(100vh-8rem)] p-4 text-lg leading-relaxed bg-white rounded-lg shadow-sm focus:outline-none resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Start writing your thoughts..."
            autoFocus
          />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold text-gray-800">Journal Entries</h1>
          <button
            onClick={startNewEntry}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            New Entry
          </button>
        </div>

        <div className="space-y-4">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="bg-white p-4 rounded-lg shadow-sm border border-gray-200"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-sm text-gray-500">
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
                <div className="space-x-2">
                  <button
                    onClick={() => handleEdit(entry)}
                    className="text-sm text-blue-500 hover:text-blue-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(entry.id)}
                    className="text-sm text-red-500 hover:text-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="whitespace-pre-wrap">{entry.content}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
