import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = { name: IconName; size?: number; color?: string };

export default function Icon({ name, size = 22, color = '#fff' }: Props) {
  return <Ionicons name={name} size={size} color={color} />;
}