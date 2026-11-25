import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import type { Sale } from '../db/types';
import { money, parseSqlDate, timeLabel } from '../utils/format';

type Props = { title: string; total: number; bills: Sale[]; onOpen: (id: number) => void };

export default function HistoryGroup({ title, total, bills, onOpen }: Props) {
  return (
    <View style={s.card}>
      <View style={s.header}>
        <Text style={s.title}>{title}</Text>
        <View style={s.badge} accessibilityLabel={`${bills.length} bills`}>
          <Text style={s.badgeText}>{bills.length}</Text>
        </View>
      </View>

      {bills.map((b) => (
        <Pressable
          key={b.id}
          accessibilityRole="button"
          accessibilityLabel={`Open bill ${b.id}`}
          android_ripple={{ color: colors.border }}
          style={s.row}
          onPress={() => onOpen(b.id)}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.billName}>Bill #{b.id}</Text>
            <Text style={s.billTime}>{timeLabel(parseSqlDate(b.created_at))}</Text>
          </View>
          <Text style={s.amount}>{money(b.total)}</Text>
        </Pressable>
      ))}

      <View style={s.footer}>
        <Text style={s.footerLabel}>Total sales</Text>
        <Text style={s.footerTotal}>{money(total)}</Text>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border,
    overflow: 'hidden', marginBottom: 16,
  },
   header: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card,
    paddingVertical: 12, paddingHorizontal: 14,
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  badge: {
    width: 26, height: 26, borderRadius: 13, borderWidth: 1.5, borderColor: colors.chipText,
    backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center',
  },
  badgeText: { fontSize: 13, fontWeight: '700', color: colors.chipText },
  row: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14,
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  billName: { fontSize: 16, fontWeight: '600', color: colors.text },
  billTime: { fontSize: 12, color: colors.muted },
  amount: { fontSize: 16, fontWeight: '700', color: colors.text },
  footer: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 14, borderTopWidth: 1, borderTopColor: colors.border, backgroundColor: '#f8fafc',
  },
  footerLabel: { fontSize: 15, fontWeight: '600', color: colors.text },
  footerTotal: { fontSize: 18, fontWeight: '700', color: colors.success },
});