/**
 * Temporary IndexedDB implementation for storing journal entries. Replace with
 * backend.
 */

import { z } from "zod";

export interface JournalEntry {
  id: string;
  content: string;
  summary: string | null;
  reflectionQuestions: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

const DB_NAME = "journal-db";
const STORE_NAME = "entries";

const dbManager = {
  connection: null as IDBDatabase | null,
  connectionPromise: null as Promise<IDBDatabase> | null,

  async getConnection(): Promise<IDBDatabase> {
    if (this.connection) {
      return this.connection;
    }

    if (this.connectionPromise) {
      return await this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME);

      request.onerror = () => {
        this.connectionPromise = null;
        reject(request.error);
      };

      request.onsuccess = () => {
        this.connection = request.result;
        this.connectionPromise = null;
        resolve(this.connection);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create store with all fields if it doesn't exist
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
          store.createIndex("createdAt", "createdAt", { unique: false });
          store.createIndex("summary", "summary", { unique: false });
          store.createIndex("reflectionQuestions", "reflectionQuestions", { unique: false });
        }
      };
    });

    return this.connectionPromise;
  },

  closeConnection() {
    if (this.connection) {
      this.connection.close();
      this.connection = null;
    }
  },
};

export type UpsertEntryParams = Partial<JournalEntry> & Pick<JournalEntry, "content">;

export function generateEntryId(): string {
  return crypto.randomUUID();
}

export async function upsertEntry(entry: UpsertEntryParams): Promise<JournalEntry> {
  const db = await dbManager.getConnection();
  const now = new Date();
  const entryToUpsert: JournalEntry = {
    id: entry.id ?? generateEntryId(),
    content: entry.content,
    summary: entry.summary ?? null,
    reflectionQuestions: entry.reflectionQuestions ?? null,
    createdAt: entry.createdAt ?? now,
    updatedAt: now,
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(entryToUpsert);

    request.onsuccess = () => resolve(entryToUpsert);
    request.onerror = () => reject(request.error);
  });
}

export async function getEntries(): Promise<JournalEntry[]> {
  const db = await dbManager.getConnection();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await dbManager.getConnection();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export const SerializedJournalEntrySchema = z.object({
  id: z.string(),
  content: z.string(),
  summary: z.string().nullable(),
  reflectionQuestions: z.array(z.string()).nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ExportDataSchema = z.object({
  version: z.literal(1),
  entries: z.array(SerializedJournalEntrySchema),
});

export type SerializedJournalEntry = z.infer<typeof SerializedJournalEntrySchema>;
export type ExportData = z.infer<typeof ExportDataSchema>;

export function serializeEntry(entry: JournalEntry): SerializedJournalEntry {
  return {
    ...entry,
    createdAt: entry.createdAt.toISOString(),
    updatedAt: entry.updatedAt.toISOString(),
  };
}

export function deserializeEntry(entry: SerializedJournalEntry): JournalEntry {
  return {
    ...entry,
    createdAt: new Date(entry.createdAt),
    updatedAt: new Date(entry.updatedAt),
  };
}

export async function exportEntries(): Promise<ExportData> {
  const entries = await getEntries();
  return {
    version: 1,
    entries: entries.map(serializeEntry),
  };
}

export async function importEntries(entries: SerializedJournalEntry[]): Promise<JournalEntry[]> {
  const db = await dbManager.getConnection();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const importedEntries: JournalEntry[] = [];

    entries.forEach((entry) => {
      const deserializedEntry = deserializeEntry(entry);
      const request = store.put(deserializedEntry);
      request.onsuccess = () => importedEntries.push(deserializedEntry);
    });

    transaction.oncomplete = () => resolve(importedEntries);
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function importFromFile(data: unknown): Promise<JournalEntry[]> {
  const parsed = ExportDataSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error(`Invalid import data: ${parsed.error.message}`);
  }
  return importEntries(parsed.data.entries);
}

export async function resetDatabase(): Promise<void> {
  const db = await dbManager.getConnection();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
