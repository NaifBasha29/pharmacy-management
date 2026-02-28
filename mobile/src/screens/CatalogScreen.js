import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity, TextInput,
  Image, FlatList, RefreshControl, StatusBar,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { medicinesAPI, categoriesAPI } from '../services/mobileApi';
import Toast from 'react-native-toast-message';

const CATEGORY_SCROLL_DATA = [{ _id: '', name: 'All' }];

export default function CatalogScreen({ navigation }) {
  const { addToCart } = useCart();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState(CATEGORY_SCROLL_DATA);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [cartCount, setCartCount] = useState(0);
  const LIMIT = 12;

  const fetchCategories = useCallback(async () => {
    try {
      const res = await medicinesAPI.getAll({ limit: 1 }); // placeholder — use categoriesAPI if exported
      // Try to get categories separately
    } catch {}
  }, []);

  const fetchMedicines = useCallback(async (pg = 1, reset = false) => {
    try {
      setLoading(true);
      const params = { page: pg, limit: LIMIT };
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      const res = await medicinesAPI.getAll(params);
      const data = res.data?.data;
      const list = data?.medicines || [];
      setMedicines(reset ? list : prev => pg === 1 ? list : [...prev, ...list]);
      setTotalPages(data?.pagination?.pages || 1);
    } catch (err) {
      console.log('Catalog fetch error:', err?.message);
    } finally {
      setLoading(false);
    }
  }, [search, selectedCategory]);

  useEffect(() => { fetchMedicines(1, true); setPage(1); }, [search, selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMedicines(1, true).finally(() => setRefreshing(false));
  }, [fetchMedicines]);

  const handleAddToCart = (med) => {
    if (med.stock === 0) return;
    addToCart(med, 1);
    Toast.show({ type: 'success', text1: 'Added to cart', text2: med.name });
  };

  const renderMedCard = ({ item: med }) => {
    const outOfStock = med.stock === 0;
    const lowStock   = med.stock > 0 && med.stock <= 10;
    return (
      <View style={[styles.medCard, outOfStock && styles.medCardDisabled]}>
        {/* Image */}
        <View style={[styles.medImgWrap, outOfStock && { opacity: 0.5 }]}>
          {med.image
            ? <Image source={{ uri: med.image }} style={styles.medImg} resizeMode="cover" />
            : <Text style={{ fontSize: 42, opacity: 0.5 }}>💊</Text>}

          {/* Category badge */}
          <View style={styles.catBadge}>
            <Text style={styles.catBadgeText}>{med.category?.name || 'General'}</Text>
          </View>

          {/* Stock badges */}
          {lowStock && !outOfStock && (
            <View style={[styles.stockBadge, { backgroundColor: '#ef4444ee' }]}>
              <Text style={styles.stockBadgeText}>Low Stock</Text>
            </View>
          )}
          {outOfStock && (
            <View style={styles.outOfStockOverlay}>
              <View style={styles.outOfStockPill}>
                <Text style={styles.stockBadgeText}>Out of Stock</Text>
              </View>
            </View>
          )}
        </View>

        {/* Body */}
        <View style={styles.medBody}>
          <Text style={[styles.medName, outOfStock && { color: '#6b7280' }]} numberOfLines={1}>{med.name}</Text>
          <Text style={styles.medDesc} numberOfLines={2}>{med.description || 'No description available'}</Text>
          <View style={styles.medFooter}>
            <Text style={[styles.medPrice, outOfStock && { color: '#6b7280' }]}>₹{med.price}</Text>
            <TouchableOpacity
              onPress={() => handleAddToCart(med)}
              disabled={outOfStock}
              style={[styles.addBtn, outOfStock && styles.addBtnDisabled]}
            >
              {outOfStock
                ? <MaterialIcons name="block" size={16} color="#9ca3af" />
                : <MaterialIcons name="add" size={16} color="#fff" />}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── Sticky Header ── */}
      <View style={styles.stickyHead}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>Medicine Catalog</Text>
          <TouchableOpacity style={styles.cartBtn} onPress={() => navigation.navigate('Cart')}>
            <MaterialIcons name="shopping-cart" size={22} color="#fff" />
            <View style={styles.cartDot} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrap}>
          <MaterialIcons name="search" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search medicines, symptoms..."
            placeholderTextColor="#6b7280"
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {/* Filter Pills */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
          <View style={styles.filterPill}>
            <MaterialIcons name="filter-list" size={14} color="#f97415" />
            <Text style={styles.filterPillText}>Filters</Text>
          </View>
          <TouchableOpacity style={[styles.filterPill, !selectedCategory && styles.filterPillActive]} onPress={() => setSelectedCategory('')}>
            <Text style={[styles.filterPillText, !selectedCategory && { color: '#f97415' }]}>All</Text>
          </TouchableOpacity>
          {categories.slice(1).map(c => (
            <TouchableOpacity key={c._id} style={[styles.filterPill, selectedCategory === c._id && styles.filterPillActive]} onPress={() => setSelectedCategory(c._id)}>
              <Text style={[styles.filterPillText, selectedCategory === c._id && { color: '#f97415' }]}>{c.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Medicine Grid ── */}
      {medicines.length === 0 && !loading ? (
        <View style={styles.emptyState}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
          <Text style={styles.emptyTitle}>No medicines found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search or filters</Text>
        </View>
      ) : (
        <FlatList
          data={medicines}
          keyExtractor={i => i._id}
          renderItem={renderMedCard}
          numColumns={2}
          columnWrapperStyle={{ gap: 12 }}
          contentContainerStyle={styles.gridContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97415" />}
          onEndReached={() => { if (page < totalPages) { const next = page + 1; setPage(next); fetchMedicines(next, false); } }}
          onEndReachedThreshold={0.4}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#1a1614' },

  // Header
  stickyHead: { backgroundColor: '#1a1614', borderBottomWidth: 1, borderBottomColor: '#ffffff15' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2a221d' },
  pageTitle: { flex: 1, color: '#fff', fontSize: 17, fontWeight: '800', textAlign: 'center' },
  cartBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2a221d', position: 'relative' },
  cartDot: { position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: 4, backgroundColor: '#f97415', borderWidth: 1.5, borderColor: '#1a1614' },

  // Search
  searchWrap: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 16, marginBottom: 12, backgroundColor: '#2a221d', borderRadius: 14 },
  searchIcon: { marginLeft: 12 },
  searchInput: { flex: 1, color: '#fff', paddig: 0, paddingHorizontal: 10, paddingVertical: 12, fontSize: 14 },

  // Filter pills
  filterRow: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  filterPill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, backgroundColor: '#2a221d', borderWidth: 1, borderColor: '#ffffff15' },
  filterPillActive: { borderColor: '#f9741560' },
  filterPillText: { color: '#e5e5e5', fontSize: 13, fontWeight: '500' },

  // Grid
  gridContent: { padding: 16, gap: 12 },
  medCard: { flex: 1, backgroundColor: '#2a221d', borderRadius: 20, overflow: 'hidden', borderWidth: 1, borderColor: '#ffffff08' },
  medCardDisabled: { opacity: 0.75 },
  medImgWrap: { height: 130, backgroundColor: '#1a1614', justifyContent: 'center', alignItems: 'center', position: 'relative' },
  medImg: { width: '100%', height: '100%' },
  catBadge: { position: 'absolute', top: 8, left: 8, backgroundColor: '#3b82f630', borderWidth: 1, borderColor: '#3b82f650', borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  catBadgeText: { color: '#93c5fd', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  stockBadge: { position: 'absolute', bottom: 8, right: 8, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2 },
  stockBadgeText: { color: '#fff', fontSize: 9, fontWeight: '700', textTransform: 'uppercase' },
  outOfStockOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000060', justifyContent: 'center', alignItems: 'center' },
  outOfStockPill: { backgroundColor: '#4b5563dd', paddingHorizontal: 14, paddingVertical: 5, borderRadius: 99, borderWidth: 1, borderColor: '#ffffff20' },

  // Card body
  medBody: { padding: 12, flex: 1 },
  medName: { color: '#fff', fontWeight: '700', fontSize: 14, letterSpacing: -0.2 },
  medDesc: { color: '#9ca3af', fontSize: 11, marginTop: 4, lineHeight: 16 },
  medFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  medPrice: { fontSize: 17, fontWeight: '800', color: '#fff' },
  addBtn: { width: 34, height: 34, borderRadius: 17, backgroundColor: '#f97415', justifyContent: 'center', alignItems: 'center', elevation: 4, shadowColor: '#f97415', shadowOpacity: 0.4, shadowRadius: 6 },
  addBtnDisabled: { backgroundColor: '#2a221d' },

  // Empty
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emptyTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { color: '#9ca3af', fontSize: 13, textAlign: 'center' },
});
