import initSqlJs, { type Database } from 'sql.js';

// This is a singleton promise that will resolve to the DB instance
let dbPromise: Promise<DBManager> | null = null;

const DB_NAME = 'hopital-juvenat-pwa-db';
const STORE_NAME = 'sqlite-store';
const DB_FILE_KEY = 'db-file';

/**
 * A wrapper around IndexedDB to make it easier to use.
 */
const idb = {
  get: <T>(key: IDBValidKey): Promise<T | undefined> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 2);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const getRequest = store.get(key);
        getRequest.onsuccess = () => resolve(getRequest.result);
        getRequest.onerror = (e) => reject(e);
        tx.oncomplete = () => db.close();
      };
      request.onerror = (e) => reject(e);
    });
  },
  set: <T>(key: IDBValidKey, value: T): Promise<void> => {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, 2);
      request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME);
      request.onsuccess = () => {
        const db = request.result;
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const setRequest = store.put(value, key);
        setRequest.onsuccess = () => resolve();
        setRequest.onerror = (e) => reject(e);
        tx.oncomplete = () => db.close();
      };
      request.onerror = (e) => reject(e);
    });
  },
};

/**
 * Manages the sql.js database instance and its persistence to IndexedDB.
 */
class DBManager {
  private db: Database;
  private static SQL: initSqlJs.SqlJsStatic;

  private constructor(database: Database) {
    this.db = database;
  }

  /**
   * Creates and initializes the DBManager.
   * It loads the database from IndexedDB or creates a new one from the SQL file.
   */
  static async create(): Promise<DBManager> {
    if (!DBManager.SQL) {
      DBManager.SQL = await initSqlJs({ locateFile: (file: string) => `https://sql.js.org/dist/${file}` });
    }

    const savedDb = await idb.get<Uint8Array>(DB_FILE_KEY);
    let db: Database;

    if (savedDb) {
      console.log("Loading database from IndexedDB...");
      db = new DBManager.SQL.Database(savedDb);
    } else {
      console.log("No saved database found. Creating a new one from .sql file...");
      const sqlFilePath = `${import.meta.env.BASE_URL}hopital_juvenat_sql.sql`;
      const response = await fetch(sqlFilePath);
      const sql = await response.text();
      db = new DBManager.SQL.Database();
      db.run(sql);
    }

    // Ensure personnel table exists
    db.run(`
      CREATE TABLE IF NOT EXISTS personnel (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nom TEXT NOT NULL UNIQUE
      );
    `);

    // Add some default personnel if the table is empty
    const personnelCount = db.exec("SELECT COUNT(*) FROM personnel");
    if (personnelCount[0].values[0][0] === 0) {
      db.run("INSERT INTO personnel (nom) VALUES (?), (?), (?), (?)", ['Azor', 'Naika', 'Tamara', 'Voltaire']);
    }

    return new DBManager(db);
  }

  /**
   * Persists the current state of the database to IndexedDB.
   */
  private async save() {
    const data = this.db.export();
    await idb.set(DB_FILE_KEY, data);
    console.log("Database saved successfully.");
  }

  /**
   * Executes a query that does not return results (e.g., INSERT, UPDATE, DELETE)
   * and then persists the database.
   */
  async run(sql: string, params?: initSqlJs.BindParams) {
    try {
      this.db.run(sql, params);
      console.log("SQL executed successfully:", sql, params);
    } catch (error) {
      console.error("Error executing SQL:", sql, params, error);
      throw error; // Re-throw the error to be caught by the component
    }
    await this.save();
  }

  /**
   * Executes a query that returns results (e.g., SELECT) and does not save.
   */
  exec(sql: string, params?: initSqlJs.BindParams) {
    return this.db.exec(sql, params);
  }
  
  /**
   * Prepares a SQL statement.
   */
  prepare(sql: string) {
      return this.db.prepare(sql);
  }

  /**
   * Executes a transaction and saves the database upon completion.
   */
  async transaction(callback: (db: Database) => void) {
    this.db.exec("BEGIN TRANSACTION;");
    try {
      callback(this.db);
      this.db.exec("COMMIT;");
      await this.save();
    } catch (err) {
      console.error("Transaction failed. Rolling back.", err);
      this.db.exec("ROLLBACK;");
    }
  }
}

/**
 * Gets the singleton instance of the DBManager.
 */
export const getDB = (): Promise<DBManager> => {
  if (!dbPromise) {
    dbPromise = DBManager.create();
  }
  return dbPromise;
};

// Function to get the total stock for a given article_id
export const getStockTotal = async (articleId: number): Promise<number> => {
    const db = await getDB();
    const result = db.exec(
        "SELECT SUM(quantite) as total FROM stock WHERE article_id = ?",
        [articleId]
    );

    if (result.length > 0 && result[0].values.length > 0 && result[0].values[0][0] !== null) {
        return result[0].values[0][0] as number;
    }

    return 0;
};

// Function to get the total quantity for a given article_id from the sorties table
export const getSortieTotal = async (articleId: number): Promise<number> => {
    const db = await getDB();
    const result = db.exec(
        "SELECT SUM(quantite) as total FROM sorties_details WHERE article_id = ?",
        [articleId]
    );

    if (result.length > 0 && result[0].values.length > 0 && result[0].values[0][0] !== null) {
        return result[0].values[0][0] as number;
    }

    return 0;
};

// Function to get the total quantity for a given article_id from the retours table
export const getRetourTotal = async (articleId: number): Promise<number> => {
    const db = await getDB();
    const result = db.exec(
        "SELECT SUM(quantite) as total FROM retours WHERE article_id = ?",
        [articleId]
    );

    if (result.length > 0 && result[0].values.length > 0 && result[0].values[0][0] !== null) {
        return result[0].values[0][0] as number;
    }

    return 0;
};

// Function to get the total adjusted quantity for a given article_id from the stock_adjustments table
export const getStockAdjustmentTotal = async (articleId: number): Promise<number> => {
    const db = await getDB();
    const result = db.exec(
        "SELECT SUM(quantite_ajustee) as total FROM stock_adjustments WHERE article_id = ?",
        [articleId]
    );

    if (result.length > 0 && result[0].values.length > 0 && result[0].values[0][0] !== null) {
        return result[0].values[0][0] as number;
    }

    return 0;
};

// Function to calculate the current stock for a given article_id
export const calculateCurrentStock = async (articleId: number): Promise<number> => {
    const stockTotal = await getStockTotal(articleId);
    const sortieTotal = await getSortieTotal(articleId);
    const retourTotal = await getRetourTotal(articleId);
    const stockAdjustmentTotal = await getStockAdjustmentTotal(articleId);

    return stockTotal - sortieTotal + retourTotal + stockAdjustmentTotal;
};