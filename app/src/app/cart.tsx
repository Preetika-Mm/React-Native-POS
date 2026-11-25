import { useState } from 'react';
import { Alert, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import CartRow from '../components/CartRow';
import SubHeader from '../components/SubHeader';
import { colors } from '../constants/colors';
import { useCart } from '../context/CartContext';
import { saveBill } from '../db/sales';
import { useSnackbar } from '../components/Snackbar';
import { money } from '../utils/format';

export default function CartScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const cart = useCart();
    const snackbar = useSnackbar();
  const [saving, setSaving] = useState(false);

  const onSave = async () => {
    if (cart.items.length === 0 || saving) return;
    setSaving(true);
    try {
      const bill = await saveBill(db, cart.items);
      cart.clear();
            cart.clear();
      snackbar.show({ message: `Bill #${bill.id} saved · ${money(bill.total)}` });
      router.back();
      Alert.alert('Bill saved', `Bill #${bill.id}, total ${money(bill.total)}`, [
        { text: 'OK', onPress: () => router.back() },
      ]);
    } catch {
      Alert.alert('Could not save the bill', 'Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={s.screen}>
      <SubHeader title={`Cart (${cart.count})`} onBack={() => router.back()} />
      <FlatList
        data={cart.items}
        keyExtractor={(i) => String(i.id)}
        contentContainerStyle={s.list}
        ListEmptyComponent={<Text style={s.empty}>Your cart is empty. Go back and add products.</Text>}
        renderItem={({ item }) => (
          <CartRow item={item} onMinus={() => cart.changeQty(item.id, -1)} onPlus={() => cart.changeQty(item.id, 1)} />
        )}
      />
      <View style={s.footer}>
        <View style={s.totalRow}>
          <Text style={s.totalLabel}>Total</Text>
          <Text style={s.totalValue}>{money(cart.total)}</Text>
        </View>
        <Pressable
          accessibilityRole="button"
          onPress={onSave}
          disabled={cart.items.length === 0 || saving}
          style={[s.save, (cart.items.length === 0 || saving) && { opacity: 0.4 }]}
        >
          <Text style={s.saveText}>Save Bill</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  list: { padding: 16, gap: 8 },
  empty: { textAlign: 'center', color: colors.muted, padding: 24 },
  footer: { backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border, padding: 16, gap: 12 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  totalLabel: { fontSize: 16, color: colors.muted },
  totalValue: { fontSize: 28, fontWeight: '700', color: colors.text },
  save: { height: 52, borderRadius: 12, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  saveText: { fontSize: 16, fontWeight: '700', color: '#fff' },
});