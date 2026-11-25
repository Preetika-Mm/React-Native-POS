import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { StatusBar, View } from 'react-native';
import { AppTabBar } from '../components/BottomTabs';
import { ConfirmProvider } from '../components/ConfirmDialog';
import { SnackbarProvider } from '../components/Snackbar';
import { colors } from '../constants/colors';
import { CartProvider } from '../context/CartContext';
import { initDb } from '../db';

// One tab bar under every screen, one snackbar (messages with UNDO) and one delete confirm dialog.
export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="pos.db" onInit={initDb}>
      <CartProvider>
        <StatusBar barStyle="light-content" />
        <View style={{ flex: 1, backgroundColor: colors.bg }}>
          <SnackbarProvider>
            <ConfirmProvider>
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.bg } }}>
                <Stack.Screen name="index" options={{ animation: 'none' }} />
                <Stack.Screen name="products" options={{ animation: 'none' }} />
                <Stack.Screen name="history" options={{ animation: 'none' }} />
              </Stack>
              <AppTabBar />
            </ConfirmProvider>
          </SnackbarProvider>
        </View>
      </CartProvider>
    </SQLiteProvider>
  );
}