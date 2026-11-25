import { useCallback, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import AppHeader from '../components/AppHeader';
import HistoryGroup from '../components/HistoryGroup';
import SearchBar from '../components/SearchBar';
import { colors } from '../constants/colors';
import { getSales } from '../db/sales';
import type { Sale } from '../db/types';
import { useDebounce } from '../hooks/use-debounce';
import { dayLabel, parseSqlDate } from '../utils/format';

type Group = { key: string; title: string; total: number; bills: Sale[] };

export default function HistoryScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const query = useDebounce(search, 300).trim().toLowerCase();

  useFocusEffect(
    useCallback(() => {
      getSales(db).then(setSales);
    }, [db])
  );

  const groups = useMemo<Group[]>(() => {
    const map = new Map<string, Group>();
    const q = query.replace(/^(bill)?\s*#?\s*/, '');
    for (const sale of sales) {
      const d = parseSqlDate(sale.created_at);
      const title = dayLabel(d);
      if (q && !String(sale.id).includes(q) && !title.toLowerCase().includes(q)) continue;
      const key = d.toDateString();
      const g = map.get(key) ?? { key, title, total: 0, bills: [] };
      g.total += sale.total;
      g.bills.push(sale);
      map.set(key, g);
    }
    return [...map.values()];
  }, [sales, query]);

  return (
    <View style={s.screen}>
      <AppHeader />
      <View style={s.top}>
        <Text style={s.title}>History</Text>
        <SearchBar value={search} onChangeText={setSearch} placeholder="Search bills (e.g. Bill 1)" />
        {groups.length === 0 && (
          <Text style={s.empty}>{sales.length === 0 ? 'No bills yet.' : 'No bills match your search.'}</Text>
        )}
      </View>

      <FlatList
        data={groups}
        keyExtractor={(g) => g.key}
        contentContainerStyle={s.list}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <HistoryGroup
            title={item.title}
            total={item.total}
            bills={item.bills}
            onOpen={(id) => router.push({ pathname: '/bill/[id]', params: { id: String(id) } })}
          />
        )}
      />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  top: { padding: 16, gap: 12 },
  title: { fontSize: 24, fontWeight: '600', color: colors.text },
  list: { paddingHorizontal: 16, paddingBottom: 24 },
  empty: { textAlign: 'center', color: colors.muted, padding: 24 },
});