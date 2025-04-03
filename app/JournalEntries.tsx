"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { getEntries, upsertEntry, UpsertEntryParams, deleteEntry } from "@/utils/db";
import { JournalEntry } from "@/utils/db";

interface JournalEntriesContextType {
  entries: JournalEntry[];
  isLoading: boolean;
  reloadEntries: () => Promise<void>;
  upsertEntry: (entry: UpsertEntryParams) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
}

const JournalEntriesContext = createContext<JournalEntriesContextType | undefined>(undefined);

export function JournalEntriesProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const doInitialLoad = async () => {
      setIsLoading(true);
      try {
        await _loadEntries();
      } finally {
        setIsLoading(false);
      }
    };

    doInitialLoad();
  }, []);

  const _loadEntries = async () => {
    const loadedEntries = await getEntries();
    setEntries(loadedEntries.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));
  };

  const _upsertEntry = async (entry: UpsertEntryParams) => {
    await upsertEntry(entry);
    await _loadEntries();
  };

  const _deleteEntry = async (id: string) => {
    await deleteEntry(id);
    await _loadEntries();
  };

  return (
    <JournalEntriesContext.Provider
      value={{
        entries,
        isLoading,
        reloadEntries: _loadEntries,
        upsertEntry: _upsertEntry,
        deleteEntry: _deleteEntry,
      }}
    >
      {children}
    </JournalEntriesContext.Provider>
  );
}

export function useJournalEntries() {
  const context = useContext(JournalEntriesContext);
  if (context === undefined) {
    throw new Error("useJournalEntries must be used within a JournalEntriesProvider");
  }
  return context;
}
