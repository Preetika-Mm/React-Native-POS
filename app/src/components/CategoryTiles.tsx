import { Pressable, StyleSheet, Text, View } from 'react-native';
import { CATEGORIES, CATEGORY_BADGE } from '../constants/categories';
import { colors } from '../constants/colors';

type Props = { value: string; onChange: (c: string) => void };

export default function CategoryTiles({ value, onChange }: Props) {
  return (
    <View style={s.wrap}>
      {CATEGORIES.map((c) => {
        const on = c === value;
        const b = CATEGORY_BADGE[c];
        return (
          <Pressable key={c} onPress={() => onChange(c)} accessibilityRole="button"
            accessibilityState={{ selected: on }} style={[s.tile, on && s.tileOn]}>
            <View style={[s.letter, { backgroundColor: b.bg }]}>
              <Text style={[s.letterText, { color: b.fg }]}>{b.letter}</Text>
            </View>
            <Text style={s.label}>{c}</Text>
            {on && (
              <View style={s.check}>
                <Text style={s.checkText}>✓</Text>
              </View>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  tile: {
    width: '31%', alignItems: 'center', gap: 6, paddingVertical: 12, paddingHorizontal: 6, borderRadius: 14,
    borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff',
  },
  tileOn: { borderColor: colors.primary, borderWidth: 1.5, backgroundColor: colors.blueSoft },
  letter: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  letterText: { fontSize: 13, fontWeight: '700' },
  label: { fontSize: 12, fontWeight: '500', color: colors.text },
  check: {
    position: 'absolute', top: 6, right: 6, width: 18, height: 18, borderRadius: 9,
    backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
  },
  checkText: { fontSize: 11, fontWeight: '700', color: '#fff' },
});