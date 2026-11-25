import { useMemo } from 'react';
import { CATALOG } from '../constants/catalog';
import type { Product, Suggestion } from '../db/types';

// Built-in products that match the search text and are not saved yet
export function useCatalogMatches(products: Product[], query: string, category: string): Suggestion[] {
  return useMemo(() => {
    if (!query) return [];
    const saved = new Set(products.map((p) => p.name.toLowerCase()));
    return CATALOG.filter(
      (c) =>
        !saved.has(c.name.toLowerCase()) &&
        (category === 'All' || c.category === category) &&
        c.name.toLowerCase().includes(query)
    ).slice(0, 4);
  }, [products, query, category]);
}