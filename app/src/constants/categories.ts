export const CATEGORIES = ['Fruits', 'Vegetables', 'Soap', 'Brush', 'Grocery', 'Other'];
export const ALL_CATEGORIES = ['All', ...CATEGORIES];

const CATEGORY_EMOJI: Record<string, string> = {
  Fruits: '🍎', Vegetables: '🥕', Soap: '🧼', Brush: '🪥', Grocery: '🛒', Other: '📦',
};

const CATEGORY_TINT: Record<string, string> = {
  Fruits: '#fde8e8', Vegetables: '#dcfce7', Soap: '#dbeafe',
  Brush: '#fef3c7', Grocery: '#ffedd5', Other: '#e2e8f0',
};

// Letter circle shown on the category tiles of the Add / Edit product screen
export const CATEGORY_BADGE: Record<string, { letter: string; bg: string; fg: string }> = {
  Fruits: { letter: 'F', bg: '#fde2e2', fg: '#b91c1c' },
  Vegetables: { letter: 'V', bg: '#dcfce7', fg: '#166534' },
  Soap: { letter: 'S', bg: '#dbeafe', fg: '#1e40af' },
  Brush: { letter: 'B', bg: '#ede9fe', fg: '#6d28d9' },
  Grocery: { letter: 'G', bg: '#fef3c7', fg: '#b45309' },
  Other: { letter: 'O', bg: '#e2e8f0', fg: '#475569' },
};

// First match wins. Add more words here to get more product pictures.
const PRODUCT_EMOJI: [string, string][] = [
  ['tomato', '🍅'], ['potato', '🥔'], ['apple', '🍎'], ['banana', '🍌'], ['orange', '🍊'],
  ['mango', '🥭'], ['grape', '🍇'], ['watermelon', '🍉'], ['pineapple', '🍍'], ['papaya', '🥭'],
  ['guava', '🍐'], ['pomegranate', '🍎'], ['carrot', '🥕'], ['onion', '🧅'], ['brinjal', '🍆'],
  ['cabbage', '🥬'], ['cucumber', '🥒'], ['cauliflower', '🥦'], ['beetroot', '🥕'],
  ['ladies finger', '🥒'], ['soap', '🧼'], ['hand wash', '🧴'], ['brush', '🪥'],
  ['rice', '🍚'], ['sugar', '🍬'], ['salt', '🧂'], ['oil', '🥫'], ['flour', '🌾'],
];

export function emojiFor(name: string, category: string) {
  const lower = name.toLowerCase();
  const hit = PRODUCT_EMOJI.find(([key]) => lower.includes(key));
  return hit ? hit[1] : CATEGORY_EMOJI[category] ?? '📦';
}

export function tintFor(category: string) {
  return CATEGORY_TINT[category] ?? '#e2e8f0';
}