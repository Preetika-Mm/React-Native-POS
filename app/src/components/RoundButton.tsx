import { Pressable, StyleSheet, Text } from 'react-native';
import { colors } from '../constants/colors';

type Props = { label: string; onPress: () => void; accessibilityLabel: string; primary?: boolean };

export default function RoundButton({ label, onPress, accessibilityLabel, primary }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={[s.btn, primary ? s.primary : s.light]}
    >
      <Text style={[s.text, primary && { color: '#fff' }]}>{label}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  btn: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  light: { backgroundColor: colors.chip },
  primary: { backgroundColor: colors.primary },
  text: { fontSize: 22, fontWeight: '700', color: colors.text },
});