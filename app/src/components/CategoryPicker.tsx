import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { ALL_CATEGORIES } from '../constants/categories';
import { colors } from '../constants/colors';

type Props = { value: string; onChange: (c: string) => void };

export default function CategoryPicker({ value, onChange }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel="Filter by category" style={s.btn}
        onPress={() => setOpen(true)}>
        <Text style={s.btnText}>{value === 'All' ? 'Category' : value} ▾</Text>
      </Pressable>
      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <View style={s.sheet}>
            {ALL_CATEGORIES.map((c) => (
              <Pressable key={c} style={s.item} onPress={() => { onChange(c); setOpen(false); }}>
                <Text style={[s.itemText, c === value && { color: colors.primary }]}>{c}</Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const s = StyleSheet.create({
  btn: {
    height: 46, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.inputBorder,
    backgroundColor: colors.card, justifyContent: 'center',
  },
  btnText: { fontSize: 14, fontWeight: '600', color: colors.text },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'center', padding: 32 },
  sheet: { backgroundColor: colors.card, borderRadius: 14, paddingVertical: 8 },
  item: { height: 48, paddingHorizontal: 20, justifyContent: 'center' },
  itemText: { fontSize: 16, fontWeight: '600', color: colors.text },
});