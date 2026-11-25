import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import type { Product } from '../db/types';
import { money } from '../utils/format';
import Icon from './Icon';
import ProductImage from './ProductImage';

type Props = {
  product: Product;
  qty: number;
  width: number;
  star?: boolean; 
  onOpen: () => void; 
  onAdd: () => void;
  onRemove: () => void;
  onDelete: () => void;
};

export default function ProductCard({ product, qty, width, star, onOpen, onAdd, onRemove, onDelete }: Props) {
  return (
    <View style={[s.card, { width }]}>
      <Pressable accessibilityRole="button" accessibilityLabel={`Edit ${product.name}`} onPress={onOpen} style={s.open}>
        <View>
          <ProductImage name={product.name} category={product.category} uri={product.image_uri} height={56} width="100%" />
          {star && (
            <View style={s.star} accessibilityLabel="Frequently purchased">
              <Text style={s.starText}>★</Text>
            </View>
          )}
        </View>
        <View>
          <Text style={s.name} numberOfLines={1}>{product.name}</Text>
          <Text style={s.price}>{money(product.price)}</Text>
        </View>
      </Pressable>

      <View style={s.pill}>
        {qty > 0 ? (
          <Pressable accessibilityRole="button" accessibilityLabel={`Remove one ${product.name}`} hitSlop={8}
            onPress={onRemove} style={[s.btn, s.minus]}>
            <Text style={s.minusText}>−</Text>
          </Pressable>
        ) : (
          <Pressable accessibilityRole="button" accessibilityLabel={`Delete ${product.name}`} hitSlop={8}
            onPress={onDelete} style={s.btn}>
            <Icon name="trash-outline" size={17} color={colors.trash} />
          </Pressable>
        )}
        <Text style={[s.qty, qty === 0 && { color: '#94a3b8' }]}>{qty}</Text>
        <Pressable accessibilityRole="button" accessibilityLabel={`Add one ${product.name}`} hitSlop={8}
          onPress={onAdd} style={[s.btn, s.plus]}>
          <Text style={s.plusText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: colors.card, borderRadius: 14, borderWidth: 1, borderColor: colors.border, padding: 8, gap: 6 },
  open: { gap: 6 },
  star: {
    position: 'absolute', top: 4, right: 4, width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center', elevation: 2,
  },
  starText: { fontSize: 13, color: colors.star },
  name: { fontSize: 13, fontWeight: '600', color: colors.text },
  price: { fontSize: 13, fontWeight: '700', color: colors.primary },
  pill: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.pill, borderRadius: 18, padding: 3,
  },
  btn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  minus: { backgroundColor: '#fff' },
  minusText: { fontSize: 16, fontWeight: '700', color: colors.text },
  plus: { backgroundColor: colors.primary },
  plusText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  qty: { fontSize: 14, fontWeight: '600', color: colors.text },
});