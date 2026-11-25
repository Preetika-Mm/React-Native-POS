import { Pressable, StyleSheet } from 'react-native';
import Icon, { IconName } from './Icon';

type Props = {
  icon: IconName;
  label: string;
  onPress: () => void;
  color?: string;
  background?: string; 
  size?: number;
  iconSize?: number;
};

export default function IconButton({ icon, label, onPress, color = '#fff', background, size = 40, iconSize = 20 }: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={[s.btn, { width: size, height: size, borderRadius: size / 2 }, background ? { backgroundColor: background } : null]}
    >
      <Icon name={icon} size={iconSize} color={color} />
    </Pressable>
  );
}

const s = StyleSheet.create({ btn: { alignItems: 'center', justifyContent: 'center' } });