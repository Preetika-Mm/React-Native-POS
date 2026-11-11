import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  SectionList,
  TouchableOpacity,
  Alert,
  StyleSheet,
  StatusBar,
  ScrollView,
} from 'react-native';

import { useSQLiteContext } from 'expo-sqlite';
const CATEGORIES = [
  'Fruits',
  'Vegetables',
  'Soap',
  'Brush',
  'Grocery',
  'Other',
];
type Product = {
  id: number;
  name: string;
  price: number;
  category: string;
};
type CartItem = Product & {
  qty: number;
};
type Sale = {
  id: number;
  total: number;
  created_at: string;
};
type Suggestion = {
  name: string;
  price: number;
  category: string;
};

type HistorySection = {
  title: string;
  total: number;
  data: Sale[];
};

const CATALOG: Suggestion[] = [
  { name: 'Apple', price: 120, category: 'Fruits' },
  { name: 'Banana', price: 50, category: 'Fruits' },
  { name: 'Orange', price: 80, category: 'Fruits' },
  { name: 'Mango', price: 100, category: 'Fruits' },
  { name: 'Grapes', price: 90, category: 'Fruits' },
  { name: 'Pomegranate', price: 150, category: 'Fruits' },
  { name: 'Papaya', price: 40, category: 'Fruits' },
  { name: 'Watermelon', price: 30, category: 'Fruits' },
  { name: 'Guava', price: 60, category: 'Fruits' },
  { name: 'Pineapple', price: 55, category: 'Fruits' },

  { name: 'Tomato', price: 30, category: 'Vegetables' },
  { name: 'Onion', price: 40, category: 'Vegetables' },
  { name: 'Potato', price: 35, category: 'Vegetables' },
  { name: 'Carrot', price: 50, category: 'Vegetables' },
  { name: 'Brinjal', price: 40, category: 'Vegetables' },
  { name: 'Beans', price: 60, category: 'Vegetables' },
  { name: 'Cabbage', price: 30, category: 'Vegetables' },
  { name: 'Cauliflower', price: 45, category: 'Vegetables' },
  { name: 'Beetroot', price: 40, category: 'Vegetables' },
  { name: 'Ladies Finger', price: 50, category: 'Vegetables' },
  { name: 'Cucumber', price: 25, category: 'Vegetables' },

  { name: 'Soap', price: 40, category: 'Soap' },
  { name: 'Bath Soap', price: 45, category: 'Soap' },
  { name: 'Washing Soap', price: 20, category: 'Soap' },
  { name: 'Hand Wash', price: 60, category: 'Soap' },
  { name: 'Detergent Soap', price: 25, category: 'Soap' },

  { name: 'Tooth Brush', price: 30, category: 'Brush' },
  { name: 'Cloth Brush', price: 60, category: 'Brush' },
  { name: 'Hair Brush', price: 80, category: 'Brush' },
  { name: 'Bathroom Brush', price: 70, category: 'Brush' },
  { name: 'Paint Brush', price: 40, category: 'Brush' },

  { name: 'Rice 1kg', price: 65, category: 'Grocery' },
  { name: 'Sugar 1kg', price: 45, category: 'Grocery' },
  { name: 'Salt 1kg', price: 20, category: 'Grocery' },
  { name: 'Oil 1L', price: 140, category: 'Grocery' },
  { name: 'Wheat Flour 1kg', price: 50, category: 'Grocery' },
];

function parseSaleDate(created_at: string) {
  return new Date(created_at.replace(' ', 'T') + 'Z');
}
function dateLabel(date: Date) {
  const today = new Date();

  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (date.toDateString() === today.toDateString()) {
    return 'Today';
  }

  if (date.toDateString() === yesterday.toDateString()) {
    return 'Yesterday';
  }

  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function timeLabel(date: Date) {
  return date.toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function CategoryChips({
  options,
  selected,
  onSelect,
}: {
  options: string[];
  selected: string;
  onSelect: (category: string) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((category) => (
        <TouchableOpacity
          key={category}
          style={[
            styles.chip,
            selected === category && styles.chipActive,
          ]}
          onPress={() => onSelect(category)}
        >
          <Text
            style={[
              styles.chipText,
              selected === category && styles.chipTextActive,
            ]}
          >
            {category}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default function Index() {
  const db = useSQLiteContext();
  const [tab, setTab] = useState<'bill' | 'products' | 'history'>('bill');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);

  const [todayTotal, setTodayTotal] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [filter, setFilter] = useState('All');

  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('Other');
  const [debouncedName, setDebouncedName] = useState('');
  async function loadAll() {

    const productData = await db.getAllAsync<Product>(
      'SELECT * FROM products ORDER BY name'
    );

    setProducts(productData);

    const salesData = await db.getAllAsync<Sale>(
      'SELECT * FROM sales ORDER BY id DESC'
    );

    setSales(salesData);
    const result = await db.getFirstAsync<{ t: number }>(
      "SELECT IFNULL(SUM(total),0) AS t FROM sales WHERE date(created_at,'localtime') = date('now','localtime')"
    );

    setTodayTotal(result?.t ?? 0);
  }
  useEffect(() => {

    async function startApp() {

      try {

        for (const item of CATALOG) {

          await db.runAsync(
            "UPDATE products SET category = ? WHERE LOWER(name) = LOWER(?) AND IFNULL(category,'') <> ?",
            [item.category, item.name, item.category]
          );

        }

      } catch (error) {
        console.log('Category update error:', error);
      }

      loadAll();
    }

    startApp();

  }, [db]);

  useEffect(() => {

    const timer = setTimeout(() => {
      setDebouncedName(name.trim());
    }, 300);

    return () => clearTimeout(timer);

  }, [name]);
  const suggestions: Suggestion[] = [];

  if (debouncedName.trim() !== '') {

    const searchText = debouncedName.toLowerCase();

   
    const savedProducts: Suggestion[] = products.map((product) => {

      const catalogItem = CATALOG.find(
        (item) => item.name.toLowerCase() === product.name.toLowerCase()
      );

      return {
        name: product.name,
        price: product.price,
        category: catalogItem?.category ?? product.category ?? 'Other',
      };

    });
    const savedNames = savedProducts.map(
      (product) => product.name.toLowerCase()
    );
    const allProducts = [
      ...savedProducts,
      ...CATALOG.filter(
        (item) => !savedNames.includes(item.name.toLowerCase())
      ),
    ];
    const matchingProducts = allProducts.filter((product) => {

      const productName = product.name.toLowerCase();
      const productCategory = product.category.toLowerCase();

      return (
        productName.includes(searchText) ||
        productCategory.includes(searchText)
      );

    });
    matchingProducts.sort((a, b) => {

      const aStarts = a.name.toLowerCase().startsWith(searchText);
      const bStarts = b.name.toLowerCase().startsWith(searchText);

      return Number(bStarts) - Number(aStarts);

    });
    suggestions.push(...matchingProducts.slice(0, 5));
  }

  const showSuggestions =
    name.trim() !== '' &&
    suggestions.length > 0 &&
    !suggestions.some(
      (item) => item.name.toLowerCase() === name.trim().toLowerCase()
    );
  function pickSuggestion(product: Suggestion) {

    setName(product.name);
    setDebouncedName(product.name);
    setPrice(String(product.price));
    setCategory(product.category);

  }
  const historySections: HistorySection[] = [];

  sales.forEach((sale) => {

    const date = parseSaleDate(sale.created_at);
    const dateKey = date.toDateString();
    let section = historySections.find(
      (item) => item.data.length > 0 &&
        parseSaleDate(item.data[0].created_at).toDateString() === dateKey
    );
    if (!section) {

      section = {
        title: dateLabel(date),
        total: 0,
        data: [],
      };

      historySections.push(section);
    }
    section.data.push(sale);
    section.total += sale.total;

  });
  function addToCart(product: Product) {

    setCart((oldCart) => {

      const existingItem = oldCart.find(
        (item) => item.id === product.id
      );
      if (existingItem) {

        return oldCart.map((item) => {

          if (item.id === product.id) {
            return {
              ...item,
              name: product.name,
              price: product.price,
              category: product.category,
              qty: item.qty + 1,
            };
          }

          return item;
        });

      }
      return [
        ...oldCart,
        {
          ...product,
          qty: 1,
        },
      ];

    });
  }
  function changeQty(id: number, change: number) {

    setCart((oldCart) => {

      const updatedCart = oldCart.map((item) => {

        if (item.id === id) {
          return {
            ...item,
            qty: item.qty + change,
          };
        }

        return item;
      });
      return updatedCart.filter((item) => item.qty > 0);

    });
  }
  async function addProduct() {

    const productName = name.trim();
    if (!productName || !price) {

      Alert.alert(
        'Missing details',
        'Please enter product name and price.'
      );

      return;
    }

    const newPrice = Number(price);

    if (Number.isNaN(newPrice) || newPrice <= 0) {

    Alert.alert(
      'Invalid price',
      'Price must be greater than 0.'
    );

    return;
  }
    const catalogItem = CATALOG.find(
      (item) => item.name.toLowerCase() === productName.toLowerCase()
    );

    const finalCategory = catalogItem?.category ?? category;
    const existingProduct = await db.getFirstAsync<Product>(
      'SELECT * FROM products WHERE LOWER(name) = LOWER(?)',
      [productName]
    );

    let product: Product;

    if (existingProduct) {
      await db.runAsync(
        'UPDATE products SET price = ?, category = ? WHERE id = ?',
        [newPrice, finalCategory, existingProduct.id]
      );

      product = {
        ...existingProduct,
        price: newPrice,
        category: finalCategory,
      };

    } else {
      const result = await db.runAsync(
        'INSERT INTO products (name, price, category) VALUES (?, ?, ?)',
        [productName, newPrice, finalCategory]
      );

      product = {
        id: result.lastInsertRowId,
        name: productName,
        price: newPrice,
        category: finalCategory,
      };

    }
    addToCart(product);
    setName('');
    setDebouncedName('');
    setPrice('');
    setCategory('Other');
    await loadAll();
  }
  function deleteProduct(product: Product) {
    Alert.alert(
      'Delete product',
      `Are you sure you want to delete ${product.name}?`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',

          onPress: async () => {

            await db.runAsync(
              'DELETE FROM products WHERE id = ?',
              [product.id]
            );

            loadAll();
          },
        },
      ]
    );
  }

  let total = 0;

  cart.forEach((item) => {
    total = total + item.price * item.qty;
  });

  let itemCount = 0;

  cart.forEach((item) => {
    itemCount = itemCount + item.qty;
  });

  async function saveBill() {

    if (cart.length === 0) {
      return;
    }

    await db.withTransactionAsync(async () => {

      const result = await db.runAsync(
        'INSERT INTO sales (total) VALUES (?)',
        [total]
      );

      const saleId = result.lastInsertRowId;

      for (const item of cart) {

        await db.runAsync(
          'INSERT INTO sale_items (sale_id, product_id, qty, price) VALUES (?, ?, ?, ?)',
          [saleId, item.id, item.qty, item.price]
        );

      }

    });

   
    setCart([]);

    await loadAll();

    Alert.alert(
      'Bill saved ✅',
      `Total: ₹${total}`
    );
  }

  let visibleProducts = products;

  if (filter !== 'All') {

    visibleProducts = products.filter(
      (product) => product.category === filter
    );

  }

  const billingHeader = (

    <View>

      <View style={styles.formBox}>

        <TextInput
          placeholder="Product name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />

        {showSuggestions && (

          <View style={styles.suggestBox}>

            {suggestions.map((product) => (

              <TouchableOpacity
                key={`${product.category}-${product.name}`}
                style={styles.suggestRow}
                onPress={() => pickSuggestion(product)}
              >

                <View>
                  <Text style={styles.cartName}>
                    {product.name}
                  </Text>

                  <Text style={styles.cartSub}>
                    {product.category}
                  </Text>
                </View>

                <Text style={styles.suggestPrice}>
                  ₹{product.price}
                </Text>

              </TouchableOpacity>

            ))}

          </View>

        )}

        <TextInput
          placeholder="Price"
          value={price}
          onChangeText={setPrice}
          keyboardType="numeric"
          style={[styles.input, { marginTop: 12 }]}
        />

        
        <View style={{ marginTop: 10 }}>

          <CategoryChips
            options={CATEGORIES}
            selected={category}
            onSelect={setCategory}
          />

        </View>

        <TouchableOpacity
          style={styles.addBtn}
          onPress={addProduct}
        >
          <Text style={styles.payText}>
            + Add / Update Product
          </Text>
        </TouchableOpacity>

      </View>

      {/* Product category filter */}
      <View style={{ paddingHorizontal: 10, marginTop: 6 }}>

        <CategoryChips
          options={['All', ...CATEGORIES]}
          selected={filter}
          onSelect={setFilter}
        />

      </View>

      {/* Product list */}
      <ScrollView
        nestedScrollEnabled
        keyboardShouldPersistTaps="handled"
        style={styles.productList}
      >

        {visibleProducts.length === 0 ? (

          <Text style={styles.empty}>
            No products in this category
          </Text>

        ) : (

          visibleProducts.map((product) => (

            <TouchableOpacity
              key={product.id}
              style={styles.productRow}
              onPress={() => addToCart(product)}
            >

              <View style={{ flex: 1 }}>

                <Text style={styles.cartName}>
                  {product.name}
                </Text>

                <Text style={styles.cartSub}>
                  {product.category}
                </Text>

              </View>

              <Text style={styles.suggestPrice}>
                ₹{product.price}
              </Text>

            </TouchableOpacity>

          ))

        )}

      </ScrollView>

      <Text style={styles.section}>
        Cart ({itemCount})
      </Text>

    </View>
  );


  return (

    <View style={styles.container}>

   
      <View style={styles.header}>

        <Text style={styles.shop}>
          My Shop POS
        </Text>

        <Text style={styles.today}>
          Today: ₹{todayTotal}
        </Text>

      </View>

      <View style={styles.tabs}>

        <TouchableOpacity
          style={[
            styles.tab,
            tab === 'bill' && styles.tabActive,
          ]}
          onPress={() => setTab('bill')}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'bill' && styles.tabTextActive,
            ]}
          >
            Billing
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            tab === 'products' && styles.tabActive,
          ]}
          onPress={() => setTab('products')}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'products' && styles.tabTextActive,
            ]}
          >
            Products
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tab,
            tab === 'history' && styles.tabActive,
          ]}
          onPress={() => setTab('history')}
        >
          <Text
            style={[
              styles.tabText,
              tab === 'history' && styles.tabTextActive,
            ]}
          >
            History
          </Text>
        </TouchableOpacity>

      </View>

      {tab === 'bill' && (

        <View style={{ flex: 1 }}>

          <FlatList
            data={cart}
            keyExtractor={(item) => String(item.id)}
            keyboardShouldPersistTaps="handled"
            style={{ flex: 1 }}
            ListHeaderComponent={billingHeader}
            ListEmptyComponent={
              <Text style={styles.empty}>
                Cart is empty
              </Text>
            }
            renderItem={({ item }) => (

              <View style={styles.cartRow}>

                <View style={{ flex: 1 }}>

                  <Text style={styles.cartName}>
                    {item.name}
                  </Text>

                  <Text style={styles.cartSub}>
                    ₹{item.price} each
                  </Text>

                </View>

               
                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => changeQty(item.id, -1)}
                >
                  <Text style={styles.qtyText}>
                    −
                  </Text>
                </TouchableOpacity>

                <Text style={styles.qty}>
                  {item.qty}
                </Text>

                <TouchableOpacity
                  style={styles.qtyBtn}
                  onPress={() => changeQty(item.id, 1)}
                >
                  <Text style={styles.qtyText}>
                    +
                  </Text>
                </TouchableOpacity>

          
                <Text style={styles.lineTotal}>
                  ₹{item.price * item.qty}
                </Text>

              </View>

            )}
          />

          <View style={styles.footer}>

            <View>
              <Text style={styles.footerLabel}>
                Total
              </Text>

              <Text style={styles.footerTotal}>
                ₹{total}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.payBtn,
                cart.length === 0 && { opacity: 0.4 },
              ]}
              onPress={saveBill}
              disabled={cart.length === 0}
            >
              <Text style={styles.payText}>
                Save Bill
              </Text>
            </TouchableOpacity>

          </View>

        </View>

      )}

      {tab === 'products' && (

        <FlatList
          data={products}
          keyExtractor={(item) => String(item.id)}
          contentContainerStyle={{ padding: 12 }}

          ListHeaderComponent={
            <Text style={[styles.section, { paddingHorizontal: 0 }]}>
              All Products ({products.length})
            </Text>
          }

          ListEmptyComponent={
            <Text style={styles.empty}>
              No products yet. Add them from the Billing tab.
            </Text>
          }

          renderItem={({ item }) => (

            <View style={[styles.cartRow, { marginHorizontal: 0 }]}>

              <View style={{ flex: 1 }}>

                <Text style={styles.cartName}>
                  {item.name}
                </Text>

                <Text style={styles.cartSub}>
                  {item.category}
                </Text>

              </View>

              <Text style={styles.lineTotal}>
                ₹{item.price}
              </Text>

              <TouchableOpacity
                onPress={() => deleteProduct(item)}
              >
                <Text style={styles.deleteText}>
                  Delete
                </Text>
              </TouchableOpacity>

            </View>

          )}

        />

      )}

      {tab === 'history' && (

        <SectionList
          sections={historySections}
          keyExtractor={(item) => String(item.id)}
          stickySectionHeadersEnabled={false}
          contentContainerStyle={{ paddingBottom: 20 }}

          ListEmptyComponent={
            <Text style={styles.empty}>
              No bills yet
            </Text>
          }

          
          renderSectionHeader={({ section }) => (

            <View style={styles.dateHeader}>

              <View>

                <Text style={styles.dateTitle}>
                  {section.title}
                </Text>

                <Text style={styles.dateSub}>
                  {section.data.length}{' '}
                  {section.data.length === 1 ? 'bill' : 'bills'}
                </Text>

              </View>

              <Text style={styles.dateTotal}>
                ₹{section.total}
              </Text>

            </View>

          )}

          renderItem={({ item }) => (

            <View style={styles.cartRow}>

              <View style={{ flex: 1 }}>

                <Text style={styles.cartName}>
                  Bill #{item.id}
                </Text>

                <Text style={styles.cartSub}>
                  {timeLabel(parseSaleDate(item.created_at))}
                </Text>

              </View>

              <Text style={styles.lineTotal}>
                ₹{item.total}
              </Text>

            </View>

          )}

        />

      )}

    </View>

  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#f4f6f8',
    paddingTop: StatusBar.currentHeight ?? 44,
  },

  header: {
    backgroundColor: '#1e293b',
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  shop: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },

  today: {
    color: '#4ade80',
    fontSize: 16,
    fontWeight: '600',
  },

  tabs: {
    flexDirection: 'row',
    backgroundColor: '#fff',
  },

  tab: {
    flex: 1,
    padding: 12,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },

  tabActive: {
    borderBottomColor: '#2563eb',
  },

  tabText: {
    color: '#64748b',
    fontWeight: '600',
  },

  tabTextActive: {
    color: '#2563eb',
  },

  formBox: {
    backgroundColor: '#fff',
    margin: 10,
    marginBottom: 4,
    padding: 14,
    borderRadius: 10,
  },

  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#e2e8f0',
    marginRight: 8,
    marginVertical: 6,
  },

  chipActive: {
    backgroundColor: '#2563eb',
  },

  chipText: {
    color: '#334155',
    fontWeight: '600',
  },

  chipTextActive: {
    color: '#fff',
  },

  productList: {
    maxHeight: 210,
    marginHorizontal: 10,
    marginTop: 4,
  },

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 10,
    marginBottom: 6,
  },

  section: {
    fontSize: 16,
    fontWeight: 'bold',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },

  cartRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 10,
    marginBottom: 6,
    padding: 12,
    borderRadius: 10,
  },

  cartName: {
    fontSize: 16,
    fontWeight: '600',
  },

  cartSub: {
    color: '#64748b',
    fontSize: 12,
  },

  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  qtyText: {
    fontSize: 18,
    fontWeight: 'bold',
  },

  qty: {
    width: 32,
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },

  lineTotal: {
    width: 70,
    textAlign: 'right',
    fontWeight: 'bold',
    fontSize: 16,
  },

  deleteText: {
    color: 'red',
    marginLeft: 16,
  },

  dateHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    marginHorizontal: 10,
    marginTop: 14,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },

  dateTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
  },

  dateSub: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },

  dateTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#16a34a',
  },

  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },

  footerLabel: {
    color: '#64748b',
  },

  footerTotal: {
    fontSize: 28,
    fontWeight: 'bold',
  },

  payBtn: {
    backgroundColor: '#16a34a',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
  },

  addBtn: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },

  payText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },

  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },

  empty: {
    textAlign: 'center',
    color: '#94a3b8',
    padding: 20,
  },

  suggestBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    marginTop: 6,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },

  suggestRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },

  suggestPrice: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
  },

});
