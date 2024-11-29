import { IDBPDatabase, openDB } from 'idb';



export default class IndexedDBManager {
  private static instance: IndexedDBManager;
  private DB_NAME = "ar-staging";
  private STORE_NAME = "scenes"
  private db: IDBPDatabase | null = null;

  private constructor() {
    this.initDB();
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

  }

  public storeFile(file: Blob) {
    console.log("file store requested", file, this.db)
    return;
  }


}
