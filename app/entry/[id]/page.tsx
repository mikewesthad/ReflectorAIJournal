"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import EntryEditor from "@/app/components/EntryEditor";
import { useJournalEntries } from "@/app/JournalEntries";

export default function EntryPage() {
  const { id } = useParams();

  const { entries, upsertEntry, isLoading } = useJournalEntries();
  const [isSaving, setIsSaving] = useState(false);

  if (typeof id !== "string") {
    return <p>Invalid entry ID</p>;
  }

  const entry = entries.find((e) => e.id === id);

  const saveContent = async (content: string) => {
    if (!content.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await upsertEntry({
        ...entry,
        content,
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!entry) {
    return <p>Entry not found: {id}</p>;
  }

  return (
    <EntryEditor
      initialContent={entry.content}
      onContentChange={(content) => saveContent(content)}
      lastSaved={entry.updatedAt}
    />
  );
}
