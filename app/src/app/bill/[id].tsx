import { useCallback, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import SubHeader from '../../components/SubHeader';
import { colors } from '../../constants/colors';
import { getBill } from '../../db/sales';
import type { BillItem, Sale } from '../../db/types';
import { dateTimeLabel, money, parseSqlDate } from '../../utils/format';

export default function BillDetailsScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [sale, setSale] = useState<Sale | null>(null);
  const [items, setItems] = useState<BillItem[]>([]);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getBill(db, Number(id)).then((res) => {
        if (!active) return;
        setSale(res.sale ?? null);
        setItems(res.items);
      });
      return () => { active = false; };
    }, [db, id])
  );

  return (
    <View style={s.screen}>
      <SubHeader title={`Bill #${id}`} onBack={() => router.back()} />
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.card}>
          {sale && <Text style={s.date}>{dateTimeLabel(parseSqlDate(sale.created_at))}</Text>}

          <View style={[s.row, s.headRow]}>
            <Text style={[s.head, { flex: 1 }]}>Product name</Text>
            <Text style={[s.head, s.qtyCol]}>Qty</Text>
            <Text style={[s.head, s.priceCol]}>Price</Text>
          </View>

          {items.map((it, i) => (
            <View key={`${it.name}-${i}`} style={s.row}>
              <Text style={[s.cellName, { flex: 1 }]}>{it.name}</Text>
              <Text style={[s.cell, s.qtyCol]}>{it.qty}</Text>
              <Text style={[s.cell, s.priceCol]}>{money(it.price)}</Text>
            </View>
          ))}

          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Total</Text>
            <Text style={s.totalValue}>{money(sale?.total ?? 0)}</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  content: { padding: 16 },
  card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 16 },
  date: { fontSize: 13, color: colors.muted, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12 },
  headRow: { paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: colors.border },
  head: { fontSize: 13, color: colors.muted },
  cellName: { fontSize: 15, fontWeight: '600', color: colors.text },
  cell: { fontSize: 15, color: colors.text },
  qtyCol: { width: 48, textAlign: 'center' },
  priceCol: { width: 72, textAlign: 'right' },
  totalRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    backgroundColor: colors.successTint, borderRadius: 10, marginTop: 8, paddingVertical: 12, paddingHorizontal: 14,
  },
  totalLabel: { fontSize: 16, fontWeight: '600', color: colors.text },
  totalValue: { fontSize: 20, fontWeight: '700', color: colors.success },
});