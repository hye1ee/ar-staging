import { IDBPDatabase, openDB } from 'idb';



export default class IndexedDBManager {
  private static instance: IndexedDBManager;
  private DB_NAME = "ar-staging";
  private STORE_NAME = "scenes"
  private MAX_FILES = 3

  private db: IDBPDatabase | null = null;
  private files: number[] = [];

  private constructor() {
    this.initDB();
  }

  public getFileIds(): number[] {
    return this.files;
  }

  public static getInstance(): IndexedDBManager {
    if (!IndexedDBManager.instance) {
      IndexedDBManager.instance = new IndexedDBManager();
    }
    return IndexedDBManager.instance;
  }

  private async initDB() {
    const storeName = this.STORE_NAME
    this.db = await openDB(this.DB_NAME, 1, {
      upgrade(db) { // initialize DB
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName, { keyPath: 'id', autoIncrement: true });
        }
      },
    });
    this.updateFileList();
  }

  private async updateFileList() { // get all Ids from db and update property
    if (!this.db) return;
    const tx = this.db.transaction(this.STORE_NAME, 'readonly');
    const store = tx.objectStore(this.STORE_NAME);
    const allKeys = await store.getAllKeys();
    this.files = allKeys.map(key => key as number);
  }

  public async storeFile(file: Blob): Promise<void> {
    if (!this.db) {
      console.error("Database not initialized");
      return;
    }

    if (this.db) {
      if (this.files.length >= this.MAX_FILES) {
        const oldestId = this.files.shift(); // 배열의 첫 번째 ID 제거
        if (oldestId !== undefined) {
          await this.deleteFileById(oldestId);
        }
      }
      const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      const newId = await store.add({ file, createdAt: new Date().toISOString() }) as number;
      this.files.push(newId);
    }
  }

  public async getFile(id: number): Promise<Blob | null> {
    if (this.db) {
      const tx = this.db.transaction(this.STORE_NAME, 'readonly');
      const store = tx.objectStore(this.STORE_NAME);
      const record = await store.get(id);

      return record?.file as Blob ?? null
    }
    return null;
  }

  private async deleteFileById(id: number): Promise<void> {
    if (this.db) {
      const tx = this.db.transaction(this.STORE_NAME, 'readwrite');
      const store = tx.objectStore(this.STORE_NAME);
      await store.delete(id);
    }
  }
}
