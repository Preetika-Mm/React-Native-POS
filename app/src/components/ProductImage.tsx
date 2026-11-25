import { Image, StyleSheet, Text, View } from 'react-native';
import { emojiFor, tintFor } from '../constants/categories';

type Props = { name: string; category: string; uri?: string | null; height?: number; width?: number | '100%' };

export default function ProductImage({ name, category, uri, height = 44, width = height }: Props) {
  if (uri) {
    return <Image source={{ uri }} style={[s.tile, { height, width }]} resizeMode="cover" accessibilityLabel={name} />;
  }
  return (
    <View style={[s.tile, { height, width, backgroundColor: tintFor(category) }]}>
      <Text style={{ fontSize: height * 0.55 }}>{emojiFor(name, category)}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  tile: { borderRadius: 10, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
});