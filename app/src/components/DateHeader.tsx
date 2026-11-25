import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import { money } from '../utils/format';

type Props = { title: string; count: number; total: number };

export default function DateHeader({ title, count, total }: Props) {
  return (
    <View style={s.bar}>
      <View>
        <Text style={s.title}>{title}</Text>
        <Text style={s.sub}>{count} {count === 1 ? 'bill' : 'bills'}</Text>
      </View>
      <Text style={s.total}>{money(total)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    backgroundColor: colors.border, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 16, fontWeight: '700', color: colors.text },
  sub: { fontSize: 12, color: colors.chipText },
  total: { fontSize: 18, fontWeight: '700', color: colors.success },
});