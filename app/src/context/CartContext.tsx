import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import type { Product } from '../db/types';

export type CartItem = Product & { qty: number };

type CartValue = {
  items: CartItem[];
  count: number;
  total: number;
  qtyOf: (id: number) => number;
  add: (p: Product) => void;
  changeQty: (id: number, delta: number) => void;
  clear: () => void;
};

const CartContext = createContext<CartValue | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const add = useCallback((p: Product) => {
    setItems((prev) =>
      prev.some((i) => i.id === p.id)
        ? prev.map((i) => (i.id === p.id ? { ...i, qty: i.qty + 1 } : i))
        : [...prev, { ...p, qty: 1 }]
    );
  }, []);

  const changeQty = useCallback((id: number, delta: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, qty: i.qty + delta } : i)).filter((i) => i.qty > 0)
    );
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartValue>(
    () => ({
      items,
      count: items.reduce((s, i) => s + i.qty, 0),
      total: items.reduce((s, i) => s + i.price * i.qty, 0),
      qtyOf: (id) => items.find((i) => i.id === id)?.qty ?? 0,
      add,
      changeQty,
      clear,
    }),
    [items, add, changeQty, clear]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}