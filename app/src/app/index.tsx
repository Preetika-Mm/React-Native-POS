import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, ScrollView, StyleSheet, Text, useWindowDimensions, View,Alert } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import AppHeader from '../components/AppHeader';
import CatalogRow from '../components/CatalogRow';
import CategoryPicker from '../components/CategoryPicker';
import ProductCard from '../components/ProductCard';
import SearchBar from '../components/SearchBar';
import { colors } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { useSnackbar } from '../components/Snackbar';
import { archiveProduct, getFavoriteProducts, getProducts, restoreProduct, saveProduct } from '../db/products';
import type { Product, Suggestion } from '../db/types';
import { useCatalogMatches } from '../hooks/use-catalog-matches';
import { useDebounce } from '../hooks/use-debounce';
import { money } from '../utils/format';

type Row =
  | 
  { key: string; kind: 'frequent' }
  | { key: string; kind: 'heading'; text: string }
  | { key: string; kind: 'cards'; items: Product[] }
  | { key: string; kind: 'hint' }
  | { key: string; kind: 'catalog'; item: Suggestion }
  | { key: string; kind: 'empty'; text: string };

function chunk<T>(list: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < list.length; i += size) out.push(list.slice(i, i + size));
  return out;
}

// Billing: starred (frequently purchased) products, all products, then the cart
export default function BillingScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const cart = useCart();
      const snackbar = useSnackbar();
  const { width } = useWindowDimensions();
  const [products, setProducts] = useState<Product[]>([]);
  const [frequent, setFrequent] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const query = useDebounce(search, 300).trim().toLowerCase();

  const reload = useCallback(async () => {
    setProducts(await getProducts(db));
    setFrequent(await getFavoriteProducts(db));
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      reload();
    }, [reload])
  );

  const filtering = query !== '' || category !== 'All';
  const cardW = Math.floor((width - 32 - 16) / 3); // 3 cards, 16px page padding, 8px gaps
  const freqW = Math.floor((width - 32 - 24 - 16) / 3); // inside the amber panel

  const visible = useMemo(
    () =>
      products.filter(
        (p) => (category === 'All' || p.category === category) && p.name.toLowerCase().includes(query)
      ),
    [products, category, query]
  );

  // Built-in products that match the search but are not saved yet: one tap saves and adds to the cart
  const matches = useCatalogMatches(products, query, category);
  const addFromCatalog = async (c: Suggestion) => {
    const saved = await saveProduct(db, { name: c.name, price: c.price, category: c.category });
    await reload();
    cart.add({
      id: saved.id, name: c.name, price: c.price, category: c.category,
      image_uri: null, updated_at: null, is_favorite: 0,
    });
  };

    // Delete = removed from the app, the row stays in the database. UNDO brings it back.
   // Delete: ask first (red DELETE button). The row stays in the database, old bills keep their data.
    // Delete = the product moves to Archived (it stays in the database). UNDO brings it back.
  const removeProduct = async (p: Product) => {
    await archiveProduct(db, p.id);
    await reload();
    snackbar.show({
      message: `${p.name} deleted, moved to Archived`,
      actionLabel: 'Undo',
      onAction: async () => { await restoreProduct(db, p.id); reload(); },
    });
  };
  const openProduct = (p: Product) =>
    router.push({ pathname: '/product-form', params: { id: String(p.id) } });

  const showFrequent = !filtering && frequent.length > 0;

  const rows = useMemo<Row[]>(() => {
    const list: Row[] = [];
    const base = filtering ? visible : products; // starred products show in "All products" too (with the star)
    if (showFrequent) list.push({ key: 'frequent', kind: 'frequent' });
    if (base.length > 0) {
      list.push({ key: 'heading', kind: 'heading', text: filtering ? 'Results' : 'All products' });
      chunk(base, 3).forEach((items, i) => list.push({ key: `cards-${i}`, kind: 'cards', items }));
    }
    if (matches.length > 0) {
      list.push({ key: 'hint', kind: 'hint' });
      matches.forEach((m) => list.push({ key: `catalog-${m.name}`, kind: 'catalog', item: m }));
    }
    if (list.length === 0) {
      list.push({
        key: 'empty',
        kind: 'empty',
        text: products.length === 0 ? 'No products yet. Add some in the Product tab.' : 'No products match your search.',
      });
    }
    return list;
  }, [products, visible, matches, filtering, showFrequent]);

  const card = (p: Product, w: number) => (
    <ProductCard
      key={p.id}
      product={p}
      qty={cart.qtyOf(p.id)}
      width={w}
      star={p.is_favorite === 1}
      onOpen={() => openProduct(p)}
      onAdd={() => cart.add(p)}
      onRemove={() => cart.changeQty(p.id, -1)}
      onDelete={() => removeProduct(p)}
    />
  );

  const renderRow = (row: Row) => {
    switch (row.kind) {
      case 'frequent':
        return (
          <View style={s.panel}>
            <View style={s.panelHead}>
              <View style={s.panelTitle}>
                <Text style={s.panelStar}>★</Text>
                <Text style={s.panelText}>Frequently purchased</Text>
              </View>
              <View style={s.countPill}>
                <Text style={s.countText}>{frequent.length} products</Text>
              </View>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.panelRow}
              keyboardShouldPersistTaps="handled">
              {frequent.map((p) => card(p, freqW))}
            </ScrollView>
          </View>
        );
      case 'heading':
        return <Text style={s.heading}>{row.text}</Text>;
      case 'cards':
        return <View style={s.cardsRow}>{row.items.map((p) => card(p, cardW))}</View>;
      case 'hint':
        return <Text style={s.hint}>Not in your products yet</Text>;
      case 'catalog':
        return <CatalogRow item={row.item} actionLabel="+ Cart" onPress={() => addFromCatalog(row.item)} />;
      default:
        return <Text style={s.empty}>{row.text}</Text>;
    }
  };

  return (
    <View style={s.screen}>
      <AppHeader />
      <View style={s.top}>
        <Text style={s.title}>Billing</Text>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products">
          <CategoryPicker value={category} onChange={setCategory} />
        </SearchBar>
      </View>

      <FlatList
        data={rows}
        keyExtractor={(r) => r.key}
        renderItem={({ item }) => renderRow(item)}
        contentContainerStyle={s.list}
        keyboardShouldPersistTaps="handled"
      />

      <View style={s.totalBar}>
        <View>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>{money(cart.total)}</Text>
        </View>
        <Pressable accessibilityRole="button" accessibilityLabel={`Open cart, ${cart.count} items`}
          style={s.cartBtn} onPress={() => router.push('/cart')}>
          <Text style={s.cartText}>Cart</Text>
          <View style={s.badge}>
            <Text style={s.badgeText}>{cart.count}</Text>
          </View>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { padding: 16, paddingBottom: 12, gap: 12 },
  title: { fontSize: 24, fontWeight: '600', color: colors.text },
  list: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  panel: {
    backgroundColor: colors.amberBg, borderRadius: 18, borderWidth: 1, borderColor: colors.amberBorder,
    padding: 12, gap: 10, marginBottom: 8,
  },
  panelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  panelTitle: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  panelStar: { fontSize: 18, color: colors.star },
  panelText: { fontSize: 15, fontWeight: '600', color: colors.text },
  countPill: { backgroundColor: colors.amberPill, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 3 },
  countText: { fontSize: 11, fontWeight: '600', color: colors.amberText },
  panelRow: { gap: 8 },
  heading: { fontSize: 15, fontWeight: '600', color: colors.text, marginTop: 4 },
  cardsRow: { flexDirection: 'row', gap: 8 },
  hint: { fontSize: 13, fontWeight: '600', color: colors.muted, marginTop: 8 },
  empty: { textAlign: 'center', color: colors.muted, padding: 24 },
  totalBar: {
    marginHorizontal: 12, marginTop: 8, marginBottom: 12, backgroundColor: colors.card, borderRadius: 16,
    paddingVertical: 10, paddingLeft: 16, paddingRight: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    elevation: 6, shadowColor: '#0f172a', shadowOpacity: 0.18, shadowRadius: 18, shadowOffset: { width: 0, height: 4 },
  },
  totalLabel: { fontSize: 12, color: colors.muted },
  totalValue: { fontSize: 24, fontWeight: '700', color: colors.text },
  cartBtn: {
    height: 48, paddingLeft: 18, paddingRight: 14, borderRadius: 12, backgroundColor: colors.success,
    flexDirection: 'row', alignItems: 'center', gap: 10,
  },
  cartText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  badge: { minWidth: 24, height: 24, borderRadius: 12, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center', paddingHorizontal: 6 },
  badgeText: { fontSize: 13, fontWeight: '700', color: colors.success },
});