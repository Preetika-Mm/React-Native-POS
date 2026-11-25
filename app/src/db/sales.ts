import type { SQLiteDatabase } from 'expo-sqlite';
import type { BillItem, Sale } from './types';

type CartLine = { id: number; name: string; price: number; qty: number };

export const getSales = (db: SQLiteDatabase) =>
  db.getAllAsync<Sale>('SELECT id, total, created_at FROM sales ORDER BY id DESC');

export async function getTodayTotal(db: SQLiteDatabase) {
  const row = await db.getFirstAsync<{ t: number }>(
    `SELECT IFNULL(SUM(total), 0) AS t FROM sales
     WHERE date(created_at, 'localtime') = date('now', 'localtime')`
  );
  return row?.t ?? 0;
}

export async function saveBill(db: SQLiteDatabase, lines: CartLine[]) {
  const total = lines.reduce((sum, l) => sum + l.price * l.qty, 0);
  let billId = 0;
  await db.withTransactionAsync(async () => {
    const res = await db.runAsync('INSERT INTO sales (total) VALUES (?)', [total]);
    billId = res.lastInsertRowId;
    for (const l of lines) {
      await db.runAsync(
        'INSERT INTO sale_items (sale_id, product_id, qty, price, name) VALUES (?, ?, ?, ?, ?)',
        [billId, l.id, l.qty, l.price, l.name]
      );
    }
  });
  return { id: billId, total };
}

export async function getBill(db: SQLiteDatabase, id: number) {
  const sale = await db.getFirstAsync<Sale>('SELECT id, total, created_at FROM sales WHERE id = ?', [id]);
  const items = await db.getAllAsync<BillItem>(
    `SELECT COALESCE(si.name, p.name, 'Deleted item') AS name, si.qty AS qty, si.price AS price
     FROM sale_items si LEFT JOIN products p ON p.id = si.product_id
     WHERE si.sale_id = ? ORDER BY si.id`,
    [id]
  );
  return { sale, items };
}
// Sales total for every day of one month. ym = "2026-11". Returns an array, index 0 = day 1.
export async function getDailySales(db: SQLiteDatabase, ym: string, daysInMonth: number) {
  const rows = await db.getAllAsync<{ day: number; total: number }>(
    `SELECT CAST(strftime('%d', created_at, 'localtime') AS INTEGER) AS day, SUM(total) AS total
     FROM sales WHERE strftime('%Y-%m', created_at, 'localtime') = ? GROUP BY day`,
    [ym]
  );
  const out = new Array<number>(daysInMonth).fill(0);
  rows.forEach((r) => {
    if (r.day >= 1 && r.day <= daysInMonth) out[r.day - 1] = r.total;
  });
  return out;
}
// Total sales of one month. ym = "2026-11"
export async function getMonthTotal(db: SQLiteDatabase, ym: string) {
  const row = await db.getFirstAsync<{ t: number }>(
    `SELECT IFNULL(SUM(total), 0) AS t FROM sales
     WHERE strftime('%Y-%m', created_at, 'localtime') = ?`,
    [ym]
  );
  return row?.t ?? 0;
}