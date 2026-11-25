import { useCallback, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import Icon from '../components/Icon';
import SubHeader from '../components/SubHeader';
import { getMonthTotal } from '../db/sales';

const P = { dark: '#4c1d95', main: '#6d28d9', mid: '#8b5cf6', light: '#ede9fe', soft: '#f5f3ff', border: '#ddd6fe' };
const PLOT_H = 190;
const TICKS = 5;

// 100000 -> ₹1,00,000
function inr(n: number) {
  const s = String(Math.round(Math.abs(n)));
  let out = s;
  if (s.length > 3) {
    const rest = s.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ',');
    out = `${rest},${s.slice(-3)}`;
  }
  return `${n < 0 ? '-' : ''}₹${out}`;
}

// A round top value for the chart axis
function niceMax(v: number) {
  if (v <= 0) return 100;
  const mag = Math.pow(10, Math.floor(Math.log10(v)));
  for (const m of [1, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10]) if (m * mag >= v) return m * mag;
  return 10 * mag;
}

const monthDate = (offset: number) => {
  const d = new Date();
  return new Date(d.getFullYear(), d.getMonth() - offset, 1);
};
const ym = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
const monthName = (d: Date) => d.toLocaleDateString('en-IN', { month: 'long' });
const monthShort = (d: Date) => d.toLocaleDateString('en-IN', { month: 'short', year: 'numeric' });
const monthFull = (d: Date) => d.toLocaleDateString('en-IN', { month: 'long', year: 'numeric' });

type Report = { cur: number; prev: number; curDate: Date; prevDate: Date };

export default function GraphScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const [offset, setOffset] = useState(0); // 0 = this month
  const [open, setOpen] = useState(false);
  const [report, setReport] = useState<Report | null>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        const curDate = monthDate(offset);
        const prevDate = monthDate(offset + 1);
        const [cur, prev] = await Promise.all([getMonthTotal(db, ym(curDate)), getMonthTotal(db, ym(prevDate))]);
        setReport({ cur, prev, curDate, prevDate });
      })();
    }, [db, offset])
  );

  if (!report) {
    return (
      <View style={s.screen}>
        <SubHeader title="Sales graph" onBack={() => router.back()} />
      </View>
    );
  }

  const { cur, prev, curDate, prevDate } = report;
  const diff = cur - prev;
  const tone: 'up' | 'down' | 'same' = diff > 0 ? 'up' : diff < 0 ? 'down' : 'same';
  const hasPrev = prev > 0;
  const pct = hasPrev ? (diff / prev) * 100 : 0;
  const when = offset === 0 ? 'this month' : `in ${monthName(curDate)}`;
  const sign = diff > 0 ? '+' : diff < 0 ? '-' : '';
  // rounded percent for the small badge: +4%, -3% (at least 1% when there is a change)
  const pctRounded = Math.max(Math.round(Math.abs(pct)), diff !== 0 ? 1 : 0);

  let message = 'Sales are the same as last month.';
  if (cur === 0 && prev === 0) message = 'No sales yet to compare.';
  else if (!hasPrev) message = `No sales in ${monthName(prevDate)} to compare.`;
  else if (tone === 'up') message = `Great! Your sales have grown ${when}!`;
  else if (tone === 'down') message = `Sales are lower ${when}. Keep going!`;

  const c = tone === 'down'
    ? { bg: '#fef2f2', border: '#fca5a5', text: '#dc2626', circle: '#fee2e2', box: '#fee2e2' }
    : tone === 'up'
      ? { bg: '#f0fdf4', border: '#86efac', text: '#15803d', circle: '#dcfce7', box: '#dcfce7' }
      : { bg: P.soft, border: P.border, text: P.main, circle: P.light, box: P.light };

  const max = niceMax(Math.max(cur, prev));
  const barH = (v: number) => Math.max(v > 0 ? 4 : 0, (v / max) * PLOT_H);
  const prevH = barH(prev);
  const curH = barH(cur);

  return (
    <View style={s.screen}>
      <SubHeader title="Sales graph" onBack={() => router.back()} />
      <ScrollView contentContainerStyle={s.content}>
        <View style={s.head}>
          <View style={s.headIcon}><Icon name="stats-chart" size={26} color="#fff" /></View>
          <View style={{ flex: 1 }}>
            <Text style={s.title}>Monthly Amount Report</Text>
            <Text style={s.subtitle}>{monthFull(curDate)} vs {monthFull(prevDate)}</Text>
          </View>
        </View>

        <Pressable accessibilityRole="button" accessibilityLabel="Choose month" style={s.pill} onPress={() => setOpen(true)}>
          <Icon name="calendar-outline" size={18} color={P.dark} />
          <Text style={s.pillText}>{offset === 0 ? 'This Month' : monthFull(curDate)}</Text>
          <Icon name="chevron-down" size={16} color={P.dark} />
        </Pressable>

        <View style={s.statRow}>
          <View style={s.stat}>
            {/* This Month  [arrow] +4%   (red arrow down and -3% when sales are lower) */}
            <View style={s.statHead}>
              <Text style={s.thisLabel}>{offset === 0 ? 'This Month' : monthName(curDate)}</Text>
              {hasPrev && (
                <View style={[s.pctBadge, { backgroundColor: c.circle }]}>
                  {tone !== 'same' && (
                    <Icon name={tone === 'down' ? 'trending-down' : 'trending-up'} size={16} color={c.text} />
                  )}
                  <Text style={[s.pctText, { color: c.text }]}>{sign}{pctRounded}%</Text>
                </View>
              )}
            </View>
            <Text style={s.statAmount} numberOfLines={1} adjustsFontSizeToFit>{inr(cur)}</Text>
            <View style={s.chip}>
              <Icon name="calendar-outline" size={14} color={P.dark} />
              <Text style={s.chipText}>{monthShort(curDate)}</Text>
            </View>
          </View>

          <View style={s.stat}>
            <View style={s.statTop}>
              <Text style={s.statLabel} numberOfLines={1}>
                Previous – {prevDate.toLocaleDateString('en-IN', { month: 'short' })}
              </Text>
              <View style={[s.statCircle, { backgroundColor: P.light }]}>
                <Icon name="calendar-outline" size={18} color={P.main} />
              </View>
            </View>
            <Text style={s.statAmount} numberOfLines={1} adjustsFontSizeToFit>{inr(prev)}</Text>
            <View style={s.chip}>
              <Icon name="calendar-outline" size={14} color={P.dark} />
              <Text style={s.chipText}>{monthShort(prevDate)}</Text>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <View style={s.cardHead}>
            <Icon name="stats-chart" size={20} color={P.main} />
            <Text style={s.cardTitle}>Monthly Comparison</Text>
          </View>

          <View style={s.chart}>
            <View style={s.yAxis}>
              {Array.from({ length: TICKS + 1 }, (_, i) => (
                <Text key={i} style={[s.yLabel, { bottom: (i / TICKS) * PLOT_H - 7 }]}>
                  {inr((max / TICKS) * i)}
                </Text>
              ))}
            </View>

            <View style={s.plot}>
              {Array.from({ length: TICKS + 1 }, (_, i) => (
                <View key={i} style={[s.grid, { bottom: (i / TICKS) * PLOT_H }, i === 0 && s.gridBase]} />
              ))}
              <View style={s.bars}>
                <View style={s.barCol}>
                  <Text style={s.barValue}>{inr(prev)}</Text>
                  <View style={[s.bar, { height: prevH, backgroundColor: '#5b21b6' }]} />
                </View>
                <View style={s.barCol}>
                  <Text style={s.barValue}>{inr(cur)}</Text>
                  <View style={[s.bar, { height: curH, backgroundColor: P.mid }]} />
                </View>
              </View>
            </View>
          </View>

          <View style={s.xRow}>
            <View style={{ width: 62 }} />
            <Text style={s.xLabel}>{monthName(prevDate)}</Text>
            <Text style={s.xLabel}>{monthName(curDate)}</Text>
          </View>
        </View>

        <View style={[s.result, { backgroundColor: c.bg, borderColor: c.border }]}>
          <View style={s.resultRow}>
            <View style={[s.resultIcon, { backgroundColor: c.circle }]}>
              <Icon name={tone === 'down' ? 'trending-down' : 'trending-up'} size={26} color={c.text} />
            </View>
            <View style={s.resultBlock}>
              <Text style={[s.resultBig, { color: c.text }]} numberOfLines={1} adjustsFontSizeToFit>
                {hasPrev ? `${sign}${Math.abs(pct).toFixed(2)}%` : '—'}
              </Text>
              <Text style={s.resultSub}>{tone === 'down' ? 'Decrease' : tone === 'up' ? 'Increase' : 'Change'}</Text>
            </View>
            <View style={[s.divider, { backgroundColor: c.border }]} />
            <View style={s.resultBlock}>
              <Text style={[s.resultBig, { color: c.text }]} numberOfLines={1} adjustsFontSizeToFit>
                {sign}{inr(Math.abs(diff))}
              </Text>
              <Text style={s.resultSub}>{tone === 'down' ? 'Amount Decreased' : 'Amount Increased'}</Text>
            </View>
          </View>
          <View style={[s.message, { backgroundColor: c.box }]}>
            <View style={[s.check, { backgroundColor: c.text }]}>
              <Icon name={tone === 'down' ? 'arrow-down' : 'checkmark'} size={16} color="#fff" />
            </View>
            <Text style={[s.messageText, { color: c.text }]}>{message}</Text>
          </View>
        </View>
      </ScrollView>

      <Modal transparent animationType="fade" visible={open} onRequestClose={() => setOpen(false)}>
        <Pressable style={s.backdrop} onPress={() => setOpen(false)}>
          <View style={s.sheet}>
            {Array.from({ length: 6 }, (_, i) => (
              <Pressable key={i} style={s.item} onPress={() => { setOffset(i); setOpen(false); }}>
                <Text style={[s.itemText, i === offset && { color: P.main }]}>
                  {i === 0 ? `This Month (${monthFull(monthDate(0))})` : monthFull(monthDate(i))}
                </Text>
              </Pressable>
            ))}
          </View>
        </Pressable>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: P.soft },
  content: { padding: 16, gap: 14, paddingBottom: 24 },
  head: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  headIcon: { width: 52, height: 52, borderRadius: 14, backgroundColor: P.main, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 21, fontWeight: '700', color: '#1e1b4b' },
  subtitle: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  pill: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, height: 40, paddingHorizontal: 14,
    borderRadius: 20, borderWidth: 1, borderColor: P.border, backgroundColor: '#fff',
  },
  pillText: { fontSize: 14, fontWeight: '600', color: P.dark },
  statRow: { flexDirection: 'row', gap: 12 },
  stat: { flex: 1, backgroundColor: P.light, borderRadius: 16, borderWidth: 1, borderColor: P.border, padding: 12, gap: 8 },
  statHead: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', columnGap: 8, rowGap: 4 },
  thisLabel: { fontSize: 13, fontWeight: '700', color: P.main },
  pctBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderRadius: 12, paddingHorizontal: 8, paddingVertical: 3 },
  pctText: { fontSize: 13, fontWeight: '800' },
  statTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 6 },
  statLabel: { flex: 1, fontSize: 12.5, fontWeight: '600', color: P.main },
  statCircle: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  statAmount: { fontSize: 24, fontWeight: '800', color: '#1e1b4b' },
  chip: {
    alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#ddd6fe',
    borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5,
  },
  chipText: { fontSize: 12, fontWeight: '600', color: P.dark },
  card: { backgroundColor: '#fff', borderRadius: 16, borderWidth: 1, borderColor: P.border, padding: 16, gap: 8 },
  cardHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardTitle: { fontSize: 17, fontWeight: '700', color: '#1e1b4b' },
  chart: { flexDirection: 'row' },
  yAxis: { width: 62, height: PLOT_H + 26 },
  yLabel: { position: 'absolute', left: 0, width: 56, textAlign: 'right', fontSize: 10.5, color: '#6b7280' },
  plot: { flex: 1, height: PLOT_H + 26 },
  grid: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: '#ede9fe' },
  gridBase: { backgroundColor: '#4b5563', height: 1.5 },
  bars: { position: 'absolute', left: 0, right: 0, bottom: 0, top: 0, flexDirection: 'row' },
  barCol: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  barValue: { fontSize: 13, fontWeight: '700', color: '#111827', marginBottom: 4 },
  bar: { width: '55%', borderTopLeftRadius: 6, borderTopRightRadius: 6 },
  xRow: { flexDirection: 'row' },
  xLabel: { flex: 1, textAlign: 'center', fontSize: 13, fontWeight: '500', color: '#111827' },
  result: { borderRadius: 16, borderWidth: 1.5, padding: 14, gap: 12 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  resultIcon: { width: 52, height: 52, borderRadius: 26, alignItems: 'center', justifyContent: 'center' },
  resultBlock: { flex: 1 },
  resultBig: { fontSize: 24, fontWeight: '800' },
  resultSub: { fontSize: 13, color: '#4b5563' },
  divider: { width: 2, alignSelf: 'stretch', borderRadius: 1 },
  message: { flexDirection: 'row', alignItems: 'center', gap: 10, borderRadius: 14, padding: 12 },
  check: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  messageText: { flex: 1, fontSize: 14, fontWeight: '600' },
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.4)', justifyContent: 'center', padding: 32 },
  sheet: { backgroundColor: '#fff', borderRadius: 14, paddingVertical: 8 },
  item: { height: 48, paddingHorizontal: 20, justifyContent: 'center' },
  itemText: { fontSize: 16, fontWeight: '600', color: '#111827' },
});