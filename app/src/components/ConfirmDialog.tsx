import { createContext, ReactNode, useCallback, useContext, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { colors } from '../constants/colors';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string; // default "Delete"
  destructive?: boolean; // red confirm button (default true)
  onConfirm: () => void | Promise<void>;
};
type ConfirmValue = { confirm: (options: ConfirmOptions) => void };

const ConfirmContext = createContext<ConfirmValue | null>(null);

// Dialog with CANCEL and a red DELETE button
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const confirm = useCallback((o: ConfirmOptions) => setOptions(o), []);
  const close = () => setOptions(null);
  const value = useMemo(() => ({ confirm }), [confirm]);
  const destructive = options?.destructive ?? true;

  return (
    <ConfirmContext.Provider value={value}>
      {children}
      <Modal transparent animationType="fade" visible={options !== null} onRequestClose={close}>
        <Pressable style={s.backdrop} onPress={close}>
          <Pressable style={s.dialog} onPress={() => {}}>
            <Text style={s.title}>{options?.title}</Text>
            <Text style={s.message}>{options?.message}</Text>
            <View style={s.buttons}>
              <Pressable accessibilityRole="button" style={s.btn} onPress={close}>
                <Text style={s.cancel}>CANCEL</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                style={s.btn}
                onPress={() => {
                  const run = options?.onConfirm;
                  close();
                  run?.();
                }}
              >
                <Text style={[s.confirm, destructive ? s.danger : s.primary]}>
                  {(options?.confirmLabel ?? 'Delete').toUpperCase()}
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside ConfirmProvider');
  return ctx;
}

const s = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.45)', justifyContent: 'center', padding: 24 },
  dialog: { backgroundColor: '#fff', borderRadius: 8, paddingTop: 24, paddingHorizontal: 24, paddingBottom: 12, elevation: 8 },
  title: { fontSize: 22, fontWeight: '600', color: colors.text },
  message: { fontSize: 16, color: colors.chipText, marginTop: 16, lineHeight: 22 },
  buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginTop: 24 },
  btn: { paddingVertical: 12, paddingHorizontal: 14 },
  cancel: { fontSize: 15, fontWeight: '700', letterSpacing: 1, color: colors.primary },
  confirm: { fontSize: 15, fontWeight: '700', letterSpacing: 1 },
  danger: { color: '#dc2626' },
  primary: { color: colors.primary },
});