import { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import IconButton from './IconButton';

type Props = {
  title: string;
  onBack: () => void;
  kind?: 'back' | 'close';
  centered?: boolean; // title in the middle (Add / Edit product)
  right?: ReactNode; // icon buttons on the right
};

// Top bar of Cart, Add/Edit product, Archived and Bill details
export default function SubHeader({ title, onBack, kind = 'back', centered, right }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingTop: insets.top + 8 }]}>
      <IconButton
        icon={kind === 'back' ? 'arrow-back' : 'close'}
        label={kind === 'back' ? 'Back' : 'Close'}
        onPress={onBack}
        background="#334155"
        size={40}
        iconSize={22}
      />
      {centered ? (
        <>
          <View style={s.centerWrap} pointerEvents="none">
            <Text style={s.centered} numberOfLines={1}>{title}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <View style={s.right}>{right}</View>
        </>
      ) : (
        <Text style={s.title} numberOfLines={1}>{title}</Text>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { backgroundColor: colors.header, paddingHorizontal: 12, paddingBottom: 10, flexDirection: 'row', alignItems: 'center', gap: 10 },
  title: { flex: 1, fontSize: 20, fontWeight: '600', color: '#fff' },
  centerWrap: { position: 'absolute', left: 110, right: 110, bottom: 10, height: 40, alignItems: 'center', justifyContent: 'center' },
  centered: { fontSize: 17, fontWeight: '600', color: '#fff' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 4 },
});