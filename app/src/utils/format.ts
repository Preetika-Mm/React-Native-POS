export const money = (n: number) => '₹' + (Number.isInteger(n) ? String(n) : n.toFixed(2));

export const parseSqlDate = (s: string) => new Date(s.replace(' ', 'T') + 'Z');

export function dayLabel(d: Date) {
  const now = new Date();
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  if (d.toDateString() === now.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export const timeLabel = (d: Date) =>
  d.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true });

export const dateTimeLabel = (d: Date) =>
  d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }) + ', ' + timeLabel(d);