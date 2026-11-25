import { useEffect, useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { usePathname, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/colors';

type TabKey = 'index' | 'products' | 'history';

const TABS = [
  { key: 'index', label: 'Billing', href: '/', icon: 'receipt-outline', iconOn: 'receipt' },
  { key: 'products', label: 'Product', href: '/products', icon: 'cube-outline', iconOn: 'cube' },
  { key: 'history', label: 'History', href: '/history', icon: 'time-outline', iconOn: 'time' },
] as const;

const MAIN_SCREENS = ['/', '/products', '/history'];

function activeFor(path: string): TabKey {
  if (path.startsWith('/products') || path.startsWith('/product-form') || path.startsWith('/archived')) return 'products';
  if (path.startsWith('/history') || path.startsWith('/bill')) return 'history';
  return 'index';
}

export function AppTabBar() {
  const path = usePathname();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const show = Keyboard.addListener('keyboardDidShow', () => setKeyboardOpen(true));
    const hide = Keyboard.addListener('keyboardDidHide', () => setKeyboardOpen(false));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const active = activeFor(path);
  const onMainScreen = MAIN_SCREENS.includes(path);

  const go = (href: (typeof TABS)[number]['href'], isActive: boolean) => {
    if (isActive && onMainScreen) return;
    if (router.canDismiss()) router.dismissAll();
    router.replace(href);
  };

  if (keyboardOpen) return null;

  return (
    <View style={[s.bar, { paddingBottom: insets.bottom }]}>
      {TABS.map((t) => {
        const on = t.key === active;
        const color = on ? colors.primary : colors.muted;
        return (
          <Pressable
            key={t.key}
            accessibilityRole="tab"
            accessibilityLabel={t.label}
            accessibilityState={{ selected: on }}
            onPress={() => go(t.href, on)}
            style={[s.tab, on && s.tabOn]}
          >
            <Ionicons name={on ? t.iconOn : t.icon} size={24} color={color} />
            <Text style={[s.text, { color }]}>{t.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  bar: { flexDirection: 'row', backgroundColor: colors.card, borderTopWidth: 1, borderTopColor: colors.border },
  tab: { flex: 1, height: 64, alignItems: 'center', justifyContent: 'center', gap: 2, borderTopWidth: 3, borderTopColor: 'transparent', marginTop: -1 },
  tabOn: { borderTopColor: colors.primary },
  text: { fontSize: 12, fontWeight: '600' },
});