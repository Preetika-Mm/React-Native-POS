import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import type { CartItem } from '../context/CartContext';
import { money } from '../utils/format';
import ProductImage from './ProductImage';
import RoundButton from './RoundButton';
type Props = { item: CartItem; onMinus: () => void; onPlus: () => void };
export default function CartRow({ item, onMinus, onPlus }: Props) {
  return (
    <View style={s.row}>
      <ProductImage name={item.name} category={item.category} uri={item.image_uri} />
      <View style={{ flex: 1 }}>
        <Text style={s.name} numberOfLines={1}>{item.name}</Text>
        <Text style={s.sub}>{money(item.price)} each</Text>
      </View>
      <RoundButton label="−" accessibilityLabel={`Remove one ${item.name}`} onPress={onMinus} />
      <Text style={s.qty}>{item.qty}</Text>
      <RoundButton label="+" accessibilityLabel={`Add one ${item.name}`} onPress={onPlus} primary />
      <Text style={s.amount}>{money(item.price * item.qty)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.card,
    borderRadius: 14, borderWidth: 1, borderColor: colors.border, paddingVertical: 8, paddingHorizontal: 10,
  },
  name: { fontSize: 15, fontWeight: '600', color: colors.text },
  sub: { fontSize: 12, color: colors.muted },
  qty: { minWidth: 16, textAlign: 'center', fontSize: 16, fontWeight: '600', color: colors.text },
  amount: { width: 56, textAlign: 'right', fontSize: 15, fontWeight: '700', color: colors.text },
});

