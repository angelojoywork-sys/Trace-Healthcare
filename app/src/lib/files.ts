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

/** How many files each entry has, without loading the photos themselves. */
export function fileCounts(): Promise<Record<string, number>> {
  return open().then((db) => new Promise<Record<string, number>>((resolve) => {
    const counts: Record<string, number> = {};
    const req = db.transaction(STORE, "readonly").objectStore(STORE).index("entryId").openKeyCursor();
    req.onsuccess = () => {
      const c = req.result;
      if (!c) return resolve(counts);
      counts[c.key as string] = (counts[c.key as string] ?? 0) + 1;
      c.continue();
    };
    req.onerror = () => resolve(counts);
  })).catch(() => ({}));
}

/** Delete every file attached to an entry. */
export function removeFilesFor(entryId: string): Promise<void> {
  return open().then((db) => new Promise<void>((resolve) => {
    const tx = db.transaction(STORE, "readwrite");
    const store = tx.objectStore(STORE);
    const keys = store.index("entryId").getAllKeys(entryId);
    keys.onsuccess = () => (keys.result as string[]).forEach((k) => store.delete(k));
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
  })).catch(() => undefined);
}

/** Remove files whose entry no longer exists, for example after a deletion that was never undone. */
export async function purgeOrphans(validIds: string[]): Promise<void> {
  const valid = new Set(validIds);
  const counts = await fileCounts();
  await Promise.all(Object.keys(counts).filter((id) => !valid.has(id)).map(removeFilesFor));
}
