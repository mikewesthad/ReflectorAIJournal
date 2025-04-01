interface JournalEntry {
  id: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

const DB_NAME = "journal-db";
const STORE_NAME = "entries";
const DB_VERSION = 1;

export async function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("createdAt", "createdAt", { unique: false });
      }
    };
  });
}

export async function saveEntry(content: string): Promise<JournalEntry> {
  const db = await initDB();
  const entry: JournalEntry = {
    id: crypto.randomUUID(),
    content,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.add(entry);

    request.onsuccess = () => resolve(entry);
    request.onerror = () => reject(request.error);
  });
}

export async function getEntries(): Promise<JournalEntry[]> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readonly");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function updateEntry(id: string, content: string): Promise<JournalEntry> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(id);

    request.onsuccess = () => {
      const entry = request.result;
      if (entry) {
        entry.content = content;
        entry.updatedAt = new Date();
        const updateRequest = store.put(entry);
        updateRequest.onsuccess = () => resolve(entry);
        updateRequest.onerror = () => reject(updateRequest.error);
      } else {
        reject(new Error("Entry not found"));
      }
    };

    request.onerror = () => reject(request.error);
  });
}

export async function deleteEntry(id: string): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(id);

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}
