"use client";

import { useState } from "react";
import EntryEditor from "@/app/components/EntryEditor";
import { useJournalEntries } from "@/app/JournalEntries";
import { generateEntryId } from "@/utils/db";

export default function NewEntryPage() {
  const [entryId] = useState(() => generateEntryId());
  const { entries, upsertEntry } = useJournalEntries();
  const [isSaving, setIsSaving] = useState(false);

  const entry = entries.find((e) => e.id === entryId);

  const saveContent = async (content: string) => {
    if (!content.trim() || isSaving) return;

    setIsSaving(true);
    try {
      await upsertEntry({
        ...entry,
        id: entryId,
        content,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <EntryEditor
      initialContent={entry?.content ?? ""}
      onContentChange={(content) => saveContent(content)}
      lastSaved={entry?.updatedAt ?? null}
    />
  );
}
