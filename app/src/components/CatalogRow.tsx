import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import type { Suggestion } from '../db/types';
import { money } from '../utils/format';
import ProductImage from './ProductImage';

type Props = { item: Suggestion; actionLabel: string; onPress: () => void };

export default function CatalogRow({ item, actionLabel, onPress }: Props) {
  return (
    <View style={s.row}>
      <ProductImage name={item.name} category={item.category} />
      <View style={{ flex: 1 }}>
        <Text style={s.name} numberOfLines={1}>{item.name}</Text>
        <Text style={s.sub}>{item.category}</Text>
      </View>
      <Text style={s.price}>{money(item.price)}</Text>
      <Pressable accessibilityRole="button" accessibilityLabel={`${actionLabel} ${item.name}`} style={s.btn} onPress={onPress}>
        <Text style={s.btnText}>{actionLabel}</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.card, borderRadius: 14,
    borderWidth: 1, borderStyle: 'dashed', borderColor: colors.primary, paddingVertical: 8, paddingLeft: 10, paddingRight: 8,
  },
  name: { fontSize: 16, fontWeight: '600', color: colors.text },
  sub: { fontSize: 12, color: colors.muted },
  price: { fontSize: 16, fontWeight: '700', color: colors.text },
  btn: { height: 44, paddingHorizontal: 14, borderRadius: 10, backgroundColor: colors.primary, justifyContent: 'center' },
  btnText: { fontSize: 14, fontWeight: '700', color: '#fff' },
}); 