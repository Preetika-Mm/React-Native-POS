import { useCallback, useMemo, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import CategoryTiles from '../components/CategoryTiles';
import FloatingField from '../components/FloatingField';
import IconButton from '../components/IconButton';
import PhotoPicker from '../components/PhotoPicker';
import { useSnackbar } from '../components/Snackbar';
import SubHeader from '../components/SubHeader';
import { CATALOG } from '../constants/catalog';
import { colors } from '../constants/colors';
import {
  archiveProduct, getProduct, getProducts, restoreProduct, saveProduct, setFavorite,
} from '../db/products';
import type { Product, Suggestion } from '../db/types';
import { useDebounce } from '../hooks/use-debounce';
import { dayLabel, money, parseSqlDate, timeLabel } from '../utils/format';
import { persistImage } from '../utils/images';

// Add product (id = "new") and Edit product (id = product id)
export default function ProductFormScreen() {
  const db = useSQLiteContext();
  const router = useRouter();
  const snackbar = useSnackbar();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const editId = id && id !== 'new' ? Number(id) : null;

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [starred, setStarred] = useState(false); // star: show in "Frequently purchased"
  const [photo, setPhoto] = useState<string | null>(null); // saved photo or a newly picked one
  const [picked, setPicked] = useState(false); // true when the photo was just picked and still has to be copied
  const [updatedAt, setUpdatedAt] = useState<string | null>(null);
  const [saved, setSaved] = useState<Product[]>([]);
  const debouncedName = useDebounce(name, 300).trim().toLowerCase();

  // Reset or load the fields every time this screen opens
  useFocusEffect(
    useCallback(() => {
      let active = true;
      (async () => {
        const list = await getProducts(db);
        if (!active) return;
        setSaved(list);
        setPicked(false);
        if (editId) {
          const p = await getProduct(db, editId);
          if (p && active) {
            setName(p.name); setPrice(String(p.price)); setCategory(p.category);
            setPhoto(p.image_uri); setUpdatedAt(p.updated_at); setStarred(p.is_favorite === 1);
          }
        } else {
          setName(''); setPrice(''); setCategory(''); setPhoto(null); setUpdatedAt(null); setStarred(false);
        }
      })();
      return () => { active = false; };
    }, [db, editId])
  );

  // Suggestions (add mode only): saved products first, then the built-in catalog
  const suggestions = useMemo<Suggestion[]>(() => {
    if (editId || !debouncedName || debouncedName !== name.trim().toLowerCase()) return [];
    const seen = new Set(saved.map((p) => p.name.toLowerCase()));
    const all: Suggestion[] = [...saved, ...CATALOG.filter((c) => !seen.has(c.name.toLowerCase()))];
    return all
      .filter((p) => p.name.toLowerCase().includes(debouncedName) || p.category.toLowerCase().includes(debouncedName))
      .filter((p) => p.name.toLowerCase() !== debouncedName)
      .sort((a, b) => Number(b.name.toLowerCase().startsWith(debouncedName)) - Number(a.name.toLowerCase().startsWith(debouncedName)))
      .slice(0, 5);
  }, [editId, debouncedName, name, saved]);

  const pickSuggestion = (p: Suggestion) => { setName(p.name); setPrice(String(p.price)); setCategory(p.category); };

  const choosePhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!res.canceled && res.assets[0]) {
      setPhoto(res.assets[0].uri);
      setPicked(true);
    }
  };

  // Editing: the star is saved immediately, so it stays after you leave the screen.
  // Adding: the star is saved together with the product when you tap Save product.
  const toggleStar = async () => {
    const next = !starred;
    setStarred(next);
    if (editId) {
      await setFavorite(db, editId, next);
      snackbar.show({ message: next ? 'Added to Frequently purchased' : 'Removed from Frequently purchased' });
    }
  };

  const onSave = async () => {
    const n = name.trim();
    const value = Number(price);
    if (!n) return Alert.alert('Product name needed', 'Enter the product name.');
    if (!price || Number.isNaN(value) || value <= 0) return Alert.alert('Price needed', 'Enter a price greater than 0.');
    const imageUri = photo && picked ? persistImage(photo) : photo;
    await saveProduct(db, { id: editId, name: n, price: value, category: category || 'Other', imageUri, favorite: starred });
    snackbar.show({ message: editId ? 'Changes saved' : `${n} added` });
    router.back();
  };

  // Delete = the product moves to Archived (it stays in the database). UNDO brings it back.
  const onDelete = async () => {
    if (!editId) return;
    await archiveProduct(db, editId);
    snackbar.show({
      message: `${name} deleted, moved to Archived`,
      actionLabel: 'Undo',
      onAction: async () => { await restoreProduct(db, editId); },
    });
    router.back();
  };

  const lastUpdated = (() => {
    if (!editId || !updatedAt) return null;
    const d = parseSqlDate(updatedAt);
    return `Last updated: ${dayLabel(d)}, ${timeLabel(d)}`;
  })();

  return (
    <View style={s.screen}>
      <SubHeader
        title={editId ? 'Edit product' : 'New product'}
        centered
        onBack={() => router.back()}
        right={
          <>
            <IconButton
              icon={starred ? 'star' : 'star-outline'}
              label={starred ? 'Remove from Frequently purchased' : 'Add to Frequently purchased'}
              color={starred ? colors.star : '#fff'}
              size={44}
              iconSize={30}
              onPress={toggleStar}
            />
            {editId && <IconButton icon="trash-outline" label="Delete product" color="#f87171" onPress={onDelete} />}
          </>
        }
      />

      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <View style={s.card}>
            <PhotoPicker uri={photo} name={name} edit={!!editId} onPress={choosePhoto} />

            <View>
              <FloatingField label="Product name">
                <TextInput value={name} onChangeText={setName} placeholder="e.g. Tomato"
                  placeholderTextColor={colors.placeholder} style={s.input} />
              </FloatingField>

              {suggestions.length > 0 && (
                <View style={s.suggestBox}>
                  {suggestions.map((p) => (
                    <Pressable key={`${p.category}-${p.name}`} style={s.suggestRow} onPress={() => pickSuggestion(p)}>
                      <View>
                        <Text style={s.suggestName}>{p.name}</Text>
                        <Text style={s.suggestSub}>{p.category}</Text>
                      </View>
                      <Text style={s.suggestPrice}>{money(p.price)}</Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>

            <View style={{ gap: 6 }}>
              <FloatingField label="Price" labelLeft={64}>
                <View style={s.priceRow}>
                  <View style={s.currency}><Text style={s.currencyText}>₹</Text></View>
                  <TextInput value={price} onChangeText={setPrice} placeholder="0" keyboardType="numeric"
                    placeholderTextColor="#94a3b8" style={[s.input, s.priceInput]} />
                </View>
              </FloatingField>
              {lastUpdated && <Text style={s.updated}>{lastUpdated}</Text>}
            </View>

            <View style={{ gap: 10 }}>
              <Text style={s.label}>Category</Text>
              <CategoryTiles value={category} onChange={setCategory} />
            </View>
          </View>
        </ScrollView>

        <View style={s.actions}>
          {editId && (
            <Pressable accessibilityRole="button" style={s.cancel} onPress={() => router.back()}>
              <Text style={s.cancelText}>Cancel</Text>
            </Pressable>
          )}
          <Pressable accessibilityRole="button" style={s.save} onPress={onSave}>
            <Text style={s.saveText}>{editId ? 'Save changes' : 'Save product'}</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.formBg },
  content: { padding: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20, gap: 18,
    elevation: 2, shadowColor: '#0f172a', shadowOpacity: 0.08, shadowRadius: 16, shadowOffset: { width: 0, height: 4 },
  },
  input: { fontSize: 16, fontWeight: '500', color: colors.text, paddingHorizontal: 16, paddingVertical: 14 },
  priceRow: { flexDirection: 'row', alignItems: 'center' },
  currency: {
    width: 52, alignSelf: 'stretch', backgroundColor: colors.border, alignItems: 'center', justifyContent: 'center',
    borderTopLeftRadius: 13, borderBottomLeftRadius: 13,
  },
  currencyText: { fontSize: 18, fontWeight: '600', color: colors.muted },
  priceInput: { flex: 1, fontSize: 20, fontWeight: '700' },
  updated: { fontSize: 11, color: colors.primary },
  label: { fontSize: 13, fontWeight: '600', color: colors.text },
  suggestBox: { marginTop: 6, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: '#fff' },
  suggestRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, paddingHorizontal: 12, minHeight: 48, borderBottomWidth: 1, borderBottomColor: '#f1f5f9',
  },
  suggestName: { fontSize: 16, fontWeight: '600', color: colors.text },
  suggestSub: { fontSize: 12, color: colors.muted },
  suggestPrice: { fontSize: 16, fontWeight: '700', color: colors.primary },
  actions: {
    flexDirection: 'row', gap: 12, padding: 14, paddingHorizontal: 16, backgroundColor: '#fff',
    borderTopWidth: 1, borderTopColor: colors.border,
  },
  cancel: {
    width: 104, height: 52, borderRadius: 14, borderWidth: 1, borderColor: colors.inputBorder,
    alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: colors.text },
  save: {
    flex: 1, height: 52, borderRadius: 14, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center',
    elevation: 4, shadowColor: colors.primary, shadowOpacity: 0.3, shadowRadius: 12, shadowOffset: { width: 0, height: 4 },
  },
  saveText: { fontSize: 15, fontWeight: '700', color: '#fff' },
});