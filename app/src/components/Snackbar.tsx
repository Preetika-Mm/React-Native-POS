import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type SnackOptions = { message: string; actionLabel?: string; onAction?: () => void; duration?: number };
type SnackbarValue = { show: (options: SnackOptions) => void };

const SnackbarContext = createContext<SnackbarValue | null>(null);
const TAB_BAR_HEIGHT = 64;

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const insets = useSafeAreaInsets();
  const [snack, setSnack] = useState<SnackOptions | null>(null);
  const opacity = useRef(new Animated.Value(0)).current;
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hide = useCallback(() => {
    if (timer.current) clearTimeout(timer.current);
    Animated.timing(opacity, { toValue: 0, duration: 150, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setSnack(null);
    });
  }, [opacity]);

  const show = useCallback(
    (options: SnackOptions) => {
      if (timer.current) clearTimeout(timer.current);
      setSnack(options);
      opacity.setValue(0);
      Animated.timing(opacity, { toValue: 1, duration: 180, useNativeDriver: true }).start();
      timer.current = setTimeout(hide, options.duration ?? 4000);
    },
    [hide, opacity]
  );

  useEffect(() => () => { if (timer.current) clearTimeout(timer.current); }, []);

  const value = useMemo(() => ({ show }), [show]);

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      {snack && (
        <Animated.View
          pointerEvents="box-none"
          style={[s.wrap, { bottom: TAB_BAR_HEIGHT + insets.bottom + 12, opacity }]}
        >
          <View style={s.bar} accessibilityLiveRegion="polite">
            <Text style={s.message} numberOfLines={2}>{snack.message}</Text>
            {snack.actionLabel && (
              <Pressable accessibilityRole="button" hitSlop={10}
                onPress={() => { snack.onAction?.(); hide(); }}>
                <Text style={s.action}>{snack.actionLabel}</Text>
              </Pressable>
            )}
          </View>
        </Animated.View>
      )}
    </SnackbarContext.Provider>
  );
}

export function useSnackbar() {
  const ctx = useContext(SnackbarContext);
  if (!ctx) throw new Error('useSnackbar must be used inside SnackbarProvider');
  return ctx;
}

const s = StyleSheet.create({
  wrap: { position: 'absolute', left: 16, right: 16 },
  bar: {
    flexDirection: 'row', alignItems: 'center', gap: 16, backgroundColor: '#1e293b', borderRadius: 12,
    paddingVertical: 14, paddingHorizontal: 16,
    elevation: 8, shadowColor: '#000', shadowOpacity: 0.25, shadowRadius: 10, shadowOffset: { width: 0, height: 4 },
  },
  message: { flex: 1, fontSize: 14, color: '#fff' },
  action: { fontSize: 14, fontWeight: '700', color: '#93c5fd', letterSpacing: 0.5 },
});