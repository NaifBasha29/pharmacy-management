import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TextInput, TouchableOpacity,
  StyleSheet, Image, ActivityIndicator, RefreshControl, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import api from '../config/api';

const { width } = Dimensions.get('window');
const CARD_W = (width - 48) / 2;

export default function CatalogScreen({ navigation }) {
  const { theme } = useTheme();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart, cartCount } = useCart();

  useEffect(() => { fetchCategories(); fetchMedicines(); }, []);

  useEffect(() => {
    const t = setTimeout(fetchMedicines, 500);
    return () => clearTimeout(t);
  }, [search, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data.categories || []);
    } catch (_) {}
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      const res = await api.get('/medicines', { params });
      setMedicines(res.data.data.medicines || []);
    } catch (_) {}
    finally { setLoading(false); }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMedicines().then(() => setRefreshing(false));
  }, [search, selectedCategory]);

  const renderMedicine = ({ item }) => (
    <TouchableOpacity
      style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('MedicineDetail', { medicineId: item._id })}
    >
      <View style={s.imgWrap}>
        <Image
          source={{ uri: item.image || 'https://placehold.co/150x120/e2e8f0/64748b?text=💊' }}
          style={s.img}
          resizeMode="cover"
        />
        <View style={[s.catBadge, { backgroundColor: 'rgba(59,130,246,0.18)' }]}>
          <Text style={s.catBadgeText}>{item.category?.name || 'General'}</Text>
        </View>
        {item.stock === 0 && (
          <View style={s.outBadge}>
            <Text style={s.outBadgeText}>Out of Stock</Text>
          </View>
        )}
        {item.stock > 0 && item.stock < 10 && (
          <View style={[s.outBadge, { backgroundColor: '#f59e0b' }]}>
            <Text style={s.outBadgeText}>Low Stock</Text>
          </View>
        )}
      </View>

      <View style={s.cardBody}>
        <Text style={[s.medName, { color: theme.textPrimary }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[s.medDesc, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.description || 'Pharmaceutical medicine'}
        </Text>
        <View style={s.cardFoot}>
          <Text style={[s.price, { color: theme.primary }]}>
            ${item.price?.toFixed(2) ?? '—'}
          </Text>
          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: item.stock === 0 ? theme.textTertiary : theme.primary }]}
            onPress={() => addToCart(item, 1)}
            disabled={item.stock === 0}
            activeOpacity={0.85}
          >
            <Icon name="plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <Text style={[s.title, { color: theme.textPrimary }]}>Medicine Catalog</Text>
        <TouchableOpacity
          style={[s.cartBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="cart-outline" size={22} color={theme.textPrimary} />
          {cartCount > 0 && (
            <View style={[s.cartBadge, { backgroundColor: theme.primary }]}>
              <Text style={s.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <View style={[s.searchBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <Icon name="magnify" size={20} color={theme.textTertiary} />
        <TextInput
          style={[s.searchInput, { color: theme.textPrimary }]}
          placeholder="Search medicines, symptoms..."
          placeholderTextColor={theme.placeholder}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Icon name="close-circle" size={18} color={theme.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {categories.length > 0 && (
        <FlatList
          horizontal
          data={[{ _id: '', name: 'All' }, ...categories]}
          keyExtractor={(item) => item._id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.catList}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                s.catChip,
                { backgroundColor: theme.card, borderColor: theme.border },
                selectedCategory === item._id && { backgroundColor: theme.primary, borderColor: theme.primary },
              ]}
              onPress={() => setSelectedCategory(item._id)}
              activeOpacity={0.8}
            >
              <Text style={[
                s.catChipText, { color: theme.textSecondary },
                selectedCategory === item._id && { color: '#fff' },
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {loading && medicines.length === 0 ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={[s.loadingText, { color: theme.textSecondary }]}>Loading medicines...</Text>
        </View>
      ) : (
        <FlatList
          data={medicines}
          renderItem={renderMedicine}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={s.list}
          columnWrapperStyle={s.row}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.primary} />}
          ListEmptyComponent={
            <View style={s.center}>
              <Icon name="pill-off" size={60} color={theme.textTertiary} />
              <Text style={[s.emptyText, { color: theme.textSecondary }]}>No medicines found</Text>
              {search.length > 0 && (
                <TouchableOpacity style={[s.clearBtn, { borderColor: theme.primary }]} onPress={() => setSearch('')}>
                  <Text style={[s.clearBtnText, { color: theme.primary }]}>Clear search</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  title: { fontSize: 20, fontWeight: '800', lineHeight: 26 },
  cartBtn: {
    width: 42, height: 42, borderRadius: 13, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, position: 'relative',
  },
  cartBadge: {
    position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18,
    borderRadius: 9, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 4,
  },
  cartBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    marginHorizontal: 16, marginVertical: 12, paddingHorizontal: 14,
    borderRadius: 14, borderWidth: 1, minHeight: 48,
  },
  searchInput: { flex: 1, fontSize: 15, lineHeight: 24, paddingVertical: 0 },
  catList: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  catChip: {
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1,
  },
  catChipText: { fontSize: 13, fontWeight: '600' },
  list: { padding: 16, paddingBottom: 120 },
  row: { justifyContent: 'space-between' },
  card: {
    width: CARD_W, borderRadius: 16, marginBottom: 12, borderWidth: 1, overflow: 'hidden',
  },
  imgWrap: { height: 120, position: 'relative' },
  img: { width: '100%', height: '100%' },
  catBadge: {
    position: 'absolute', top: 8, left: 8,
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
  },
  catBadgeText: { color: '#3b82f6', fontSize: 10, fontWeight: '700', letterSpacing: 0.3 },
  outBadge: {
    position: 'absolute', bottom: 8, right: 8, backgroundColor: '#ef4444',
    paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6,
  },
  outBadgeText: { color: '#fff', fontSize: 10, fontWeight: '700' },
  cardBody: { padding: 12 },
  medName: { fontSize: 14, fontWeight: '700', lineHeight: 20, marginBottom: 4 },
  medDesc: { fontSize: 12, lineHeight: 18, marginBottom: 8 },
  cardFoot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: '800' },
  addBtn: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60, gap: 12 },
  loadingText: { fontSize: 14, lineHeight: 20 },
  emptyText: { fontSize: 16, fontWeight: '500', lineHeight: 24 },
  clearBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, marginTop: 4 },
  clearBtnText: { fontSize: 14, fontWeight: '600' },
});
