import type { SQLiteDatabase } from 'expo-sqlite';

async function addColumnIfMissing(db: SQLiteDatabase, table: string, column: string, definition: string) {
  const cols = await db.getAllAsync<{ name: string }>(`PRAGMA table_info(${table})`);
  if (!cols.some((c) => c.name === column)) {
    await db.execAsync(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`);
  }
}

// Called once by SQLiteProvider: creates tables and upgrades old databases
export async function initDb(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT DEFAULT 'Other',
      image_uri TEXT,
      updated_at TEXT
    );
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      price REAL NOT NULL
    );
  `);
  // upgrades for databases created by the older version of the app
  await addColumnIfMissing(db, 'products', 'category', "TEXT DEFAULT 'Other'");
  await addColumnIfMissing(db, 'products', 'image_uri', 'TEXT');
  await addColumnIfMissing(db, 'products', 'updated_at', 'TEXT');
  await addColumnIfMissing(db, 'sale_items', 'name', 'TEXT'); // keeps the name even if the product is deleted later
  await addColumnIfMissing(db, 'products', 'is_favorite', 'INTEGER DEFAULT 0'); // star = Frequently purchased
  await addColumnIfMissing(db, 'products', 'status', "TEXT DEFAULT 'active'"); // active | archived | deleted
}
