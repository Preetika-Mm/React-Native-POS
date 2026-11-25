import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES } from '../constants/categories';
import { colors } from '../constants/colors';

type Props = { value: string; onChange: (c: string) => void };

export default function CategoryChips({ value, onChange }: Props) {
  return (
    <View style={s.wrap}>
      {CATEGORIES.map((c) => {
        const on = c === value;
        return (
          <Pressable key={c} onPress={() => onChange(c)} accessibilityRole="button"
            accessibilityState={{ selected: on }} style={[s.chip, on && s.chipOn]}>
            <Text style={[s.text, on && { color: '#fff' }]}>{c}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { height: 44, paddingHorizontal: 18, borderRadius: 22, backgroundColor: colors.chip, justifyContent: 'center' },
  chipOn: { backgroundColor: colors.primary },
  text: { fontSize: 14, fontWeight: '600', color: colors.chipText },
});
