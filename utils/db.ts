/**
 * Temporary IndexedDB implementation for storing journal entries. Replace with
 * backend.
 */

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
