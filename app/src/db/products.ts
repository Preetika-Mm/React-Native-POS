import type { SQLiteDatabase } from 'expo-sqlite';
import type { Product } from './types';

const COLUMNS = `id, name, price, IFNULL(category, 'Other') AS category, image_uri, updated_at,
  IFNULL(is_favorite, 0) AS is_favorite`;
const ACTIVE = `IFNULL(status, 'active') = 'active'`;

export const getProducts = (db: SQLiteDatabase) =>
  db.getAllAsync<Product>(`SELECT ${COLUMNS} FROM products WHERE ${ACTIVE} ORDER BY name COLLATE NOCASE`);

// Any status, so Edit and Undo can always find the product
export const getProduct = (db: SQLiteDatabase, id: number) =>
  db.getFirstAsync<Product>(`SELECT ${COLUMNS} FROM products WHERE id = ?`, [id]);

// Starred products: shown in "Frequently purchased" on the Billing screen
export const getFavoriteProducts = (db: SQLiteDatabase) =>
  db.getAllAsync<Product>(
    `SELECT ${COLUMNS} FROM products WHERE ${ACTIVE} AND IFNULL(is_favorite, 0) = 1 ORDER BY name COLLATE NOCASE`
  );

export const getArchivedProducts = (db: SQLiteDatabase) =>
  db.getAllAsync<Product>(
    `SELECT ${COLUMNS} FROM products WHERE status = 'archived' ORDER BY name COLLATE NOCASE`
  );

export async function countArchivedProducts(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ n: number }>(`SELECT COUNT(*) AS n FROM products WHERE status = 'archived'`);
  return row?.n ?? 0;
}

type SaveInput = {
  id?: number | null;
  name: string;
  price: number;
  category: string;
  imageUri?: string | null;
  favorite?: boolean;
};

// Edit when id is given. When adding, an active product with the same name is updated instead of duplicated.
export async function saveProduct(db: SQLiteDatabase, p: SaveInput): Promise<{ id: number; created: boolean }> {
  const image = p.imageUri ?? null;
  const fav = p.favorite ? 1 : 0;
  if (p.id) {
    await db.runAsync(
      `UPDATE products SET name = ?, price = ?, category = ?, image_uri = ?, is_favorite = ?,
       updated_at = datetime('now') WHERE id = ?`,
      [p.name, p.price, p.category, image, fav, p.id]
    );
    return { id: p.id, created: false };
  }
  const existing = await db.getFirstAsync<{ id: number }>(
    `SELECT id FROM products WHERE ${ACTIVE} AND LOWER(name) = LOWER(?)`, [p.name]);
  if (existing) {
    await db.runAsync(
      `UPDATE products SET price = ?, category = ?, image_uri = COALESCE(?, image_uri),
       is_favorite = MAX(IFNULL(is_favorite, 0), ?), updated_at = datetime('now') WHERE id = ?`,
      [p.price, p.category, image, fav, existing.id]
    );
    return { id: existing.id, created: false };
  }
  const res = await db.runAsync(
    `INSERT INTO products (name, price, category, image_uri, is_favorite, updated_at, status)
     VALUES (?, ?, ?, ?, ?, datetime('now'), 'active')`,
    [p.name, p.price, p.category, image, fav]
  );
  return { id: res.lastInsertRowId, created: true };
}

// Star / unstar a product right away (Frequently purchased on the Billing screen)
export const setFavorite = (db: SQLiteDatabase, id: number, favorite: boolean) =>
  db.runAsync('UPDATE products SET is_favorite = ? WHERE id = ?', [favorite ? 1 : 0, id]);

const setStatus = (db: SQLiteDatabase, id: number, status: 'active' | 'archived' | 'deleted') =>
  db.runAsync('UPDATE products SET status = ? WHERE id = ?', [status, id]);

// Archive: hidden from Billing and Product list, can be restored from the Archived screen
export const archiveProduct = (db: SQLiteDatabase, id: number) => setStatus(db, id, 'archived');

// Delete: gone from the app, but the row stays in the database (old bills keep their data)
export const deleteProduct = (db: SQLiteDatabase, id: number) => setStatus(db, id, 'deleted');

// Used by Undo and by Restore
export const restoreProduct = (db: SQLiteDatabase, id: number) => setStatus(db, id, 'active');