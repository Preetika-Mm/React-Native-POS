import React from 'react';
import { Slot } from 'expo-router';
import {
  SQLiteProvider,
  type SQLiteDatabase,
} from 'expo-sqlite';
const SAMPLE_PRODUCTS = [
  ['Apple', 120, 'Fruits'],
  ['Banana', 50, 'Fruits'],
  ['Orange', 80, 'Fruits'],
  ['Tomato', 30, 'Vegetables'],
  ['Onion', 40, 'Vegetables'],
  ['Potato', 35, 'Vegetables'],
  ['Bath Soap', 45, 'Soap'],
  ['Tooth Brush', 30, 'Brush'],
  ['Cloth Brush', 60, 'Brush'],
  ['Rice 1kg', 65, 'Grocery'],
  ['Sugar 1kg', 45, 'Grocery'],
] as const;
async function initDb(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price REAL NOT NULL,
      category TEXT DEFAULT 'Other'
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      total REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS sale_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      sale_id INTEGER NOT NULL,
      product_id INTEGER NOT NULL,
      qty INTEGER NOT NULL,
      price REAL NOT NULL
    );
  `);
  const columns = await db.getAllAsync<{ name: string }>(
    'PRAGMA table_info(products)'
  );
  let categoryExists = false;
  for (const column of columns) {
    if (column.name === 'category') {
      categoryExists = true;
    }
  }
  if (!categoryExists) {
    await db.execAsync(
      "ALTER TABLE products ADD COLUMN category TEXT DEFAULT 'Other'"
    );
  }
  const version = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  const currentVersion = version?.user_version ?? 0;
  if (currentVersion < 1) {

    for (const product of SAMPLE_PRODUCTS) {

      const name = product[0];
      const price = product[1];
      const category = product[2];
      const existingProduct = await db.getFirstAsync<{
        id: number;
        category: string | null;
      }>(
        'SELECT id, category FROM products WHERE LOWER(name) = LOWER(?)',
        [name]
      );

      if (existingProduct === null) {
        await db.runAsync(
          'INSERT INTO products (name, price, category) VALUES (?, ?, ?)',
          [name, price, category]
        );

      } else {
        if (
          !existingProduct.category ||
          existingProduct.category === 'Other'
        ) {

          await db.runAsync(
            'UPDATE products SET category = ? WHERE id = ?',
            [category, existingProduct.id]
          );

        }

      }

    }
    await db.execAsync('PRAGMA user_version = 1');
  }
}
export default function Layout() {
  return (
    <SQLiteProvider
      databaseName="pos.db"
      onInit={initDb}
    >
      <Slot />
    </SQLiteProvider>
  );
}
