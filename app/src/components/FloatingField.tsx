import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type Props = { label: string; children: ReactNode; labelLeft?: number };

export default function FloatingField({ label, children, labelLeft = 14 }: Props) {
  return (
    <View style={s.field}>
      {children}
      <Text style={[s.label, { left: labelLeft }]}>{label}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  field: {
    minHeight: 52, borderRadius: 14, borderWidth: 1, borderColor: colors.inputBorder,
    backgroundColor: '#fff', justifyContent: 'center',
  },
  label: {
    position: 'absolute', top: -8, backgroundColor: '#fff', paddingHorizontal: 4,
    fontSize: 11, fontWeight: '500', color: '#475569',
  },
});