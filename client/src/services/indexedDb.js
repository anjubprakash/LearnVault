// Native IndexedDB helper for local file storage in LearnVault (zero backend required)
const DB_NAME = 'LearnVaultFilesDB';
const DB_VERSION = 1;
const STORE_NAME = 'files';

let dbPromise = null;

function getDB() {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      console.error('IndexedDB open error:', event.target.error);
      reject(event.target.error);
    };
  });

  return dbPromise;
}

export const fileStorage = {
  async saveFile(id, blobOrBuffer) {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.put({ id, data: blobOrBuffer, updatedAt: Date.now() });

        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      console.warn('fileStorage.saveFile error:', err);
      return false;
    }
  },

  async getFile(id) {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const req = store.get(id);

        req.onsuccess = () => {
          resolve(req.result ? req.result.data : null);
        };
        tx.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      console.warn('fileStorage.getFile error:', err);
      return null;
    }
  },

  async deleteFile(id) {
    try {
      const db = await getDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        store.delete(id);

        tx.oncomplete = () => resolve(true);
        tx.onerror = (e) => reject(e.target.error);
      });
    } catch (err) {
      console.warn('fileStorage.deleteFile error:', err);
      return false;
    }
  },
};
