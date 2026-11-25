import { useCallback, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../constants/colors';
import { getTodayTotal } from '../db/sales';
import { money } from '../utils/format';
import IconButton from './IconButton';

// Top bar of the three main screens: shop name, today's total and the graph button
export default function AppHeader() {
  const db = useSQLiteContext();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [today, setToday] = useState(0);

  useFocusEffect(
    useCallback(() => {
      getTodayTotal(db).then(setToday);
    }, [db])
  );

  return (
    <View style={[s.bar, { paddingTop: insets.top + 12 }]}>
      <Text style={s.title}>My Shop POS</Text>
      <View style={s.right}>
        <Text style={s.today}>Today {money(today)}</Text>
        <IconButton
          icon="stats-chart"
          label="Sales graph"
          background="#334155"
          size={36}
          iconSize={18}
          onPress={() => router.push('/graph')}
        />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  bar: {
    backgroundColor: colors.header, paddingHorizontal: 16, paddingBottom: 12,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  title: { fontSize: 20, fontWeight: '600', color: '#fff' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  today: { fontSize: 15, fontWeight: '600', color: colors.todayText },
});