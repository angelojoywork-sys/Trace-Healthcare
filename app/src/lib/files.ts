// Prescription and receipt photos live in IndexedDB on the phone. They are never uploaded.
export type FileRec = { id: string; entryId: string; name: string; type: string; blob: Blob; addedAt: string };

const DB = "trace-files";
const STORE = "files";

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore(STORE, { keyPath: "id" });
      store.createIndex("entryId", "entryId");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

const run = <T,>(mode: IDBTransactionMode, fn: (s: IDBObjectStore) => IDBRequest<T>): Promise<T> =>
  open().then((db) => new Promise<T>((resolve, reject) => {
    const req = fn(db.transaction(STORE, mode).objectStore(STORE));
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  }));

export async function addFile(entryId: string, file: File): Promise<FileRec> {
  const rec: FileRec = { id: crypto.randomUUID(), entryId, name: file.name || "photo", type: file.type, blob: file, addedAt: new Date().toISOString() };
  await run("readwrite", (s) => s.put(rec));
  return rec;
}

export async function listFiles(entryId: string): Promise<FileRec[]> {
  try {
    const all = await run("readonly", (s) => s.index("entryId").getAll(entryId));
    return (all as FileRec[]).sort((a, b) => a.addedAt.localeCompare(b.addedAt));
  } catch {
    return [];
  }
}

export const removeFile = (id: string): Promise<undefined> => run("readwrite", (s) => s.delete(id));
