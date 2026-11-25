import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';
import Icon from './Icon';

type Props = { uri: string | null; name: string; edit: boolean; onPress: () => void };

export default function PhotoPicker({ uri, name, edit, onPress }: Props) {
  const hasPhoto = !!uri || edit;
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={hasPhoto ? 'Change photo' : 'Add photo'}
      onPress={onPress} style={s.wrap}>
      {hasPhoto ? (
        <View style={s.photo}>
          {uri ? (
            <Image source={{ uri }} style={s.image} resizeMode="cover" />
          ) : (
            <Text style={s.letter}>{(name.trim()[0] ?? '?').toUpperCase()}</Text>
          )}
          <View style={s.pill}><Text style={s.pillText}>Change</Text></View>
        </View>
      ) : (
        <View style={s.add}>
          <Icon name="camera-outline" size={26} color={colors.header} />
          <Text style={s.addText}>Add photo</Text>
        </View>
      )}
    </Pressable>
  );
}

const s = StyleSheet.create({
  wrap: { alignSelf: 'center' },
  add: {
    width: 92, height: 92, borderRadius: 16, borderWidth: 1.5, borderStyle: 'dashed', borderColor: colors.dashed,
    backgroundColor: colors.blueSoft, alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  addText: { fontSize: 11, fontWeight: '500', color: colors.muted },
  photo: { width: 92, height: 92, borderRadius: 18, backgroundColor: '#fed7aa', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  letter: { fontSize: 44, fontWeight: '700', color: colors.amberText },
  pill: { position: 'absolute', bottom: 4, alignSelf: 'center', backgroundColor: colors.header, borderRadius: 10, paddingHorizontal: 9, paddingVertical: 3 },
  pillText: { fontSize: 10, fontWeight: '600', color: '#fff' },
});