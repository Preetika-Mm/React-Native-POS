import { useCallback, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import Icon from '../components/Icon';
import ProductImage from '../components/ProductImage';
import { useSnackbar } from '../components/Snackbar';
import SubHeader from '../components/SubHeader';
import { colors } from '../constants/colors';
import { archiveProduct, getArchivedProducts, restoreProduct } from '../db/products';
import type { Product } from '../db/types';
import { money } from '../utils/format';
export default function ArchivedScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const snackbar = useSnackbar();
  const [items, setItems] = useState<Product[]>([]);
  const load = useCallback(() => getArchivedProducts(db).then(setItems), [db]);
  useFocusEffect(useCallback(() => { load(); }, [load]));
  const restore = async (p: Product) => {
    await restoreProduct(db, p.id);
    await load();
    snackbar.show({
      message: `${p.name} restored`,
      actionLabel: 'Undo',
      onAction: async () => { await archiveProduct(db, p.id); load(); },
    });
  };
  return (
    <View style={s.screen}>
      <SubHeader title="Archived products" onBack={() => router.back()} />
      <View style={s.info}>
        <Icon name="archive-outline" size={20} color={colors.amberText} />
        <Text style={s.infoText}>
          Archived products are hidden from Billing and the Product list. Restore them any time.
        </Text>
      </View>
      {items.length === 0 && <Text style={s.empty}>Nothing archived yet.</Text>}
      <FlatList
        data={items}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={s.list}
        renderItem={({ item }) => (
          <View style={s.row}>
            <ProductImage name={item.name} category={item.category} uri={item.image_uri} />
            <View style={{ flex: 1 }}>
              <Text style={s.name} numberOfLines={1}>{item.name}</Text>
              <Text style={s.sub}>{item.category} · {money(item.price)}</Text>
            </View>
            <Pressable accessibilityRole="button" accessibilityLabel={`Restore ${item.name}`} style={s.restore}
              onPress={() => restore(item)}>
              <Icon name="arrow-undo-outline" size={18} color={colors.primary} />
              <Text style={s.restoreText}>Restore</Text>
            </Pressable>
          </View>
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  info: {
    flexDirection: 'row', gap: 10, alignItems: 'center', margin: 16, marginBottom: 8, padding: 12, borderRadius: 12,
    backgroundColor: colors.amberBg, borderWidth: 1, borderColor: colors.amberBorder,
  },
  infoText: { flex: 1, fontSize: 13, color: colors.chipText },
  empty: { textAlign: 'center', color: colors.muted, padding: 24 },
  list: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingLeft: 10, paddingRight: 8,
  },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  sub: { fontSize: 12, color: colors.muted },
  restore: {
    height: 40, paddingHorizontal: 12, borderRadius: 10, borderWidth: 1, borderColor: colors.primary,
    flexDirection: 'row', alignItems: 'center', gap: 6,
  },
  restoreText: { fontSize: 14, fontWeight: '600', color: colors.primary },
});