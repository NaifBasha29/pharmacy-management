import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import api from '../config/api';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2;

export default function CatalogScreen({ navigation }) {
  const { theme } = useTheme();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart, cartCount } = useCart();
  const styles = createStyles(theme);

  useEffect(() => {
    fetchCategories();
    fetchMedicines();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchMedicines();
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [search, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data.data.categories || []);
    } catch (error) {
      console.log('Error fetching categories:', error);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;
      
      const res = await api.get('/medicines', { params });
      setMedicines(res.data.data.medicines || []);
    } catch (error) {
      console.log('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMedicines().then(() => setRefreshing(false));
  }, [search, selectedCategory]);

  const handleAddToCart = (medicine) => {
    addToCart(medicine, 1);
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item._id && styles.categoryChipActive
      ]}
      onPress={() => setSelectedCategory(selectedCategory === item._id ? '' : item._id)}
    >
      <Text style={[
        styles.categoryText,
        selectedCategory === item._id && styles.categoryTextActive
      ]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMedicine = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: theme.card }]}
      activeOpacity={0.9}
      onPress={() => navigation.navigate('MedicineDetail', { medicineId: item._id })}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image || 'https://via.placeholder.com/150?text=Medicine' }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{item.category?.name || 'General'}</Text>
        </View>
        {item.stock < 10 && item.stock > 0 && (
          <View style={styles.lowStockBadge}>
            <Text style={styles.lowStockText}>Low Stock</Text>
          </View>
        )}
        {item.stock === 0 && (
          <View style={styles.outOfStockBadge}>
            <Text style={styles.outOfStockText}>Out of Stock</Text>
          </View>
        )}
      </View>
      <View style={styles.cardContent}>
        <Text style={[styles.medicineName, { color: theme.textPrimary }]} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={[styles.medicineDesc, { color: theme.textSecondary }]} numberOfLines={2}>
          {item.description || 'Medicine description'}
        </Text>
        <View style={styles.cardFooter}>
          <Text style={[styles.price, { color: theme.primary }]}>₹{item.price?.toFixed(2)}</Text>
          <TouchableOpacity
            style={[styles.addButton, item.stock === 0 && styles.addButtonDisabled]}
            onPress={() => handleAddToCart(item)}
            disabled={item.stock === 0}
          >
            <Icon name="add" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Medicine Catalog</Text>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate('Cart')}
        >
          <Icon name="cart-outline" size={24} color={theme.textPrimary} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={theme.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines, symptoms..."
          placeholderTextColor={theme.placeholder}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filtersContainer}>
        <TouchableOpacity style={styles.filterBtn}>
          <Icon name="filter-list" size={16} color={theme.primary} />
          <Text style={styles.filterText}>Filters</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Category</Text>
          <Icon name="chevron-down" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Min Price</Text>
          <Icon name="chevron-down" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={styles.filterText}>Max Price</Text>
          <Icon name="chevron-down" size={16} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>

      {/* Medicines Grid */}
      {loading && medicines.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading medicines...</Text>
        </View>
      ) : (
        <FlatList
          data={medicines}
          renderItem={renderMedicine}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.medicinesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="pill-off" size={64} color={theme.textTertiary} />
              <Text style={styles.emptyText}>No medicines found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: theme.background,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  cartButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: theme.primary,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cartBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    fontSize: 16,
    color: theme.textPrimary,
  },
  filtersContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: theme.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  filterText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  categoriesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: theme.surface,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  categoryChipActive: {
    backgroundColor: theme.primary,
    borderColor: theme.primary,
  },
  categoryText: {
    fontSize: 14,
    fontWeight: '500',
    color: theme.textSecondary,
  },
  categoryTextActive: {
    color: '#fff',
  },
  medicinesList: {
    padding: 8,
    paddingBottom: 100,
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: theme.surface,
    borderRadius: 16,
    margin: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.border,
  },
  imageContainer: {
    height: 120,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.surfaceHighlight,
    opacity: 0.9,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 123, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 123, 255, 0.3)',
  },
  categoryBadgeText: {
    color: '#007bff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lowStockBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lowStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  outOfStockBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  outOfStockText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  cardContent: {
    padding: 12,
    flex: 1,
  },
  medicineName: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  medicineDesc: {
    fontSize: 12,
    marginBottom: 8,
    lineHeight: 16,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: theme.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonDisabled: {
    backgroundColor: theme.textTertiary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: theme.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary,
  },
});
