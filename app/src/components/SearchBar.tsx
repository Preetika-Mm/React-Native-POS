import { ReactNode } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { colors } from '../constants/colors';
import Icon from './Icon';

type Props = { value: string; onChangeText: (t: string) => void; placeholder: string; children?: ReactNode };

export default function SearchBar({ value, onChangeText, placeholder, children }: Props) {
  return (
    <View style={s.row}>
      <View style={s.box}>
        <Icon name="search" size={18} color="#64748b" />
        <TextInput
          accessibilityLabel={placeholder}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={colors.placeholder}
          style={s.input}
        />
      </View>
      {children}
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  box: {
    flex: 1, height: 46, borderRadius: 12, borderWidth: 1, borderColor: colors.inputBorder, backgroundColor: colors.card,
    flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, gap: 8,
  },
  input: { flex: 1, fontSize: 15, color: colors.text, padding: 0 },
});