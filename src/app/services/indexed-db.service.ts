import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class IndexedDBService {
  private dbName = 'connectivity_ping_db';
  private storeName = 'pingResults';

  private measurementDbName = 'connectivity_measurements_db';
  private measurementStoreName = 'measurements';


  constructor() { }

  private openDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.storeName)) {
          db.createObjectStore(this.storeName, { keyPath: 'timestamp' });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e);
    });
  }

  async savePingResult(result: any): Promise<void> {
    const db = await this.openDatabase();
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);
    store.put({ ...result, createdAt: Date.now(), isSynced: false });
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (e) => reject(e);
    });
  }

  async getPingResults(): Promise<any[]> {
    const db = await this.openDatabase();
    const transaction = db.transaction(this.storeName, 'readonly');
    const store = transaction.objectStore(this.storeName);
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e);
    });
  }

  async markAsSynced(syncedRecords: any[]): Promise<void> {
    const db = await this.openDatabase();
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);
    syncedRecords.forEach((synced) => {
      store.put({ ...synced, isSynced: true });
    });
    return new Promise((resolve, reject) => {
      transaction.oncomplete = () => resolve();
      transaction.onerror = (e) => reject(e);
    });
  }

  async cleanupOldRecords(): Promise<void> {
    const db = await this.openDatabase();
    const transaction = db.transaction(this.storeName, 'readwrite');
    const store = transaction.objectStore(this.storeName);
    const now = Date.now();
    const retentionPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

    return new Promise((resolve, reject) => {
      const request = store.getAll(); // Get all records from IndexedDB

      request.onsuccess = () => {
        const records = request.result;
        const deletePromises: Promise<void>[] = [];

        records.forEach((record) => {
          if (record.isSynced || now - record.createdAt >= retentionPeriod) {
            const deleteRequest = store.delete(record.timestamp); // Delete based on primary key

            // Wrap each delete operation in a promise
            const deletePromise = new Promise<void>((res, rej) => {
              deleteRequest.onsuccess = () => res();
              deleteRequest.onerror = () => rej(deleteRequest.error);
            });

            deletePromises.push(deletePromise);
          }
        });

        // Wait for all delete operations to complete before resolving
        Promise.all(deletePromises)
          .then(() => resolve())
          .catch(reject);
      };

      request.onerror = () => reject(request.error);
    });
  }


  async getUnsyncedRecords(): Promise<any[]> {
    const records = await this.getPingResults();
    return records.filter((record) => !record.isSynced);
  }

  private openMeasurementDatabase(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.measurementDbName, 1);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(this.measurementStoreName)) {
          const store = db.createObjectStore(this.measurementStoreName, {
            keyPath: 'id',
            autoIncrement: true,
          });
          store.createIndex('status', 'status', { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = (e) => reject(e);
    });
  }

  async saveMeasurement(record: any): Promise<void> {
    const db = await this.openMeasurementDatabase();
    const tx = db.transaction(this.measurementStoreName, 'readwrite');
    const store = tx.objectStore(this.measurementStoreName);
    store.add({ ...record, status: 'pending', createdAt: Date.now() });

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async getPendingMeasurements(): Promise<any[]> {
    const db = await this.openMeasurementDatabase();
    const tx = db.transaction(this.measurementStoreName, 'readonly');
    const store = tx.objectStore(this.measurementStoreName);
    const index = store.index('status');
    const request = index.getAll('pending');

    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async markMeasurementSynced(id: number): Promise<void> {
    const db = await this.openMeasurementDatabase();
    const tx = db.transaction(this.measurementStoreName, 'readwrite');
    const store = tx.objectStore(this.measurementStoreName);
    const getRequest = store.get(id);

    return new Promise((resolve, reject) => {
      getRequest.onsuccess = () => {
        const record = getRequest.result;
        if (record) {
          record.status = 'synced';
          store.put(record);
        }
      };
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async cleanupOldMeasurements(): Promise<void> {
  const db = await this.openMeasurementDatabase();
  const tx = db.transaction('measurements', 'readwrite');
  const store = tx.objectStore('measurements');
  const now = Date.now();
  const retentionPeriod = 30 * 24 * 60 * 60 * 1000; // 30 days

  return new Promise((resolve, reject) => {
    const request = store.getAll();

    request.onsuccess = () => {
      const records = request.result;
      const deletePromises: Promise<void>[] = [];

      records.forEach((record) => {
        if (record.status === 'synced' || now - record.createdAt >= retentionPeriod) {
          const deleteRequest = store.delete(record.id);

          const deletePromise = new Promise<void>((res, rej) => {
            deleteRequest.onsuccess = () => res();
            deleteRequest.onerror = () => rej(deleteRequest.error);
          });

          deletePromises.push(deletePromise);
        }
      });

      Promise.all(deletePromises)
        .then(() => resolve())
        .catch(reject);
    };

    request.onerror = () => reject(request.error);
  });
}


}
