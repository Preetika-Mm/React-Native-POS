import { useCallback, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import AppHeader from '../components/AppHeader';
import CatalogRow from '../components/CatalogRow';
import CategoryPicker from '../components/CategoryPicker';
import Icon from '../components/Icon';
import IconButton from '../components/IconButton';
import ProductImage from '../components/ProductImage';
import SearchBar from '../components/SearchBar';
import { useSnackbar } from '../components/Snackbar';
import { colors } from '../constants/colors';
import {
  archiveProduct, countArchivedProducts, getProducts, restoreProduct, saveProduct,
} from '../db/products';
import type { Product, Suggestion } from '../db/types';
import { useCatalogMatches } from '../hooks/use-catalog-matches';
import { useDebounce } from '../hooks/use-debounce';
import { money } from '../utils/format';

export default function ProductsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const snackbar = useSnackbar();
  const [products, setProducts] = useState<Product[]>([]);
  const [archivedCount, setArchivedCount] = useState(0);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const query = useDebounce(search, 300).trim().toLowerCase();

  const load = useCallback(async () => {
    setProducts(await getProducts(db));
    setArchivedCount(await countArchivedProducts(db));
  }, [db]);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const visible = useMemo(
    () =>
      products.filter(
        (p) => (category === 'All' || p.category === category) && p.name.toLowerCase().includes(query)
      ),
    [products, category, query]
  );

  const matches = useCatalogMatches(products, query, category);
  const addFromCatalog = async (c: Suggestion) => {
    await saveProduct(db, { name: c.name, price: c.price, category: c.category });
    await load();
    snackbar.show({ message: `${c.name} added` });
  };

  const remove = async (p: Product) => {
    await archiveProduct(db, p.id);
    await load();
    snackbar.show({
      message: `${p.name} deleted, moved to Archived`,
      actionLabel: 'Undo',
      onAction: async () => { await restoreProduct(db, p.id); load(); },
    });
  };

  return (
    <View style={s.screen}>
      <AppHeader />
      <View style={s.top}>
        <View style={s.titleRow}>
          <Text style={s.title}>Products</Text>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`Archived products, ${archivedCount}`}
            style={s.archivedBtn}
            onPress={() => router.push('/archived')}
          >
            <Icon name="archive-outline" size={22} color={colors.amberText} />
            {archivedCount > 0 && <Text style={s.archivedCount}>{archivedCount}</Text>}
          </Pressable>
        </View>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search products">
          <CategoryPicker value={category} onChange={setCategory} />
        </SearchBar>
        <View style={s.headingRow}>
          <Text style={s.heading}>All products ({products.length})</Text>
          <Pressable accessibilityRole="button" style={s.addBtn}
            onPress={() => router.push({ pathname: '/product-form', params: { id: 'new' } })}>
            <Text style={s.addText}>+ Add</Text>
          </Pressable>
        </View>
        {matches.length > 0 && (
          <View style={{ gap: 8 }}>
            <Text style={s.hint}>Not in your products yet</Text>
            {matches.map((m) => (
              <CatalogRow key={m.name} item={m} actionLabel="+ Add" onPress={() => addFromCatalog(m)} />
            ))}
          </View>
        )}
        {visible.length === 0 && matches.length === 0 && <Text style={s.empty}>No products found.</Text>}
      </View>

      <FlatList
        data={visible}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={s.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <View style={s.row}>
            <ProductImage name={item.name} category={item.category} uri={item.image_uri} />
            <View style={{ flex: 1 }}>
              <Text style={s.name} numberOfLines={1}>{item.name}</Text>
              <Text style={s.sub}>{item.category}</Text>
            </View>
            <Text style={s.price}>{money(item.price)}</Text>
            <IconButton icon="create-outline" label={`Edit ${item.name}`} color={colors.primary} size={40}
              onPress={() => router.push({ pathname: '/product-form', params: { id: String(item.id) } })} />
            <IconButton icon="trash-outline" label={`Delete ${item.name}`} color="#dc2626" size={40}
              onPress={() => remove(item)} />
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { padding: 16, paddingBottom: 8, gap: 12 },
  titleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 24, fontWeight: '600', color: colors.text },
  archivedBtn: {
    height: 44, minWidth: 44, paddingHorizontal: 12, borderRadius: 22, borderWidth: 1, borderColor: colors.amberBorder,
    backgroundColor: colors.amberBg, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  archivedCount: { fontSize: 14, fontWeight: '700', color: colors.amberText },
  headingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 },
  heading: { fontSize: 16, fontWeight: '600', color: colors.text },
  addBtn: { height: 44, paddingHorizontal: 18, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center' },
  addText: { fontSize: 15, fontWeight: '700', color: '#fff' },
  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  empty: { textAlign: 'center', color: colors.muted, padding: 24 },
  hint: { fontSize: 13, fontWeight: '600', color: colors.muted },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingLeft: 10, paddingRight: 6,
  },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  sub: { fontSize: 12, color: colors.muted },
  price: { fontSize: 16, fontWeight: '700', color: colors.text, marginRight: 2 },
});