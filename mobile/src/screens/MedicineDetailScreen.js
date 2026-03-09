import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { medicinesAPI, favoritesAPI } from '../services/mobileApi';

export default function MedicineDetailScreen({ route, navigation }) {
  const { medicineId } = route.params;
  const [medicine, setMedicine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    fetchMedicine();
    checkFavorite();
  }, [medicineId]);

  const fetchMedicine = async () => {
    try {
      const res = await medicinesAPI.getById(medicineId);
      if (res.data.success) {
        setMedicine(res.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to load medicine details');
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    try {
      const res = await favoritesAPI.check(medicineId);
      if (res.data.success) {
        setIsFavorite(res.data.data.isFavorite);
      }
    } catch (error) {
      // Ignore
    }
  };

  const toggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoritesAPI.remove(medicineId);
      } else {
        await favoritesAPI.add(medicineId);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.log('Favorite error:', error);
    }
  };

  const handleAddToCart = () => {
    if (!medicine || medicine.stock <= 0) return;
    addToCart(medicine, quantity);
    Alert.alert('Added to Cart', `${medicine.name} x${quantity} added to your cart`, [
      { text: 'Continue Shopping', style: 'cancel' },
      { text: 'View Cart', onPress: () => navigation.navigate('Cart') }
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (!medicine) return null;

  const discountedPrice = medicine.discount
    ? (medicine.price || 0) - ((medicine.price || 0) * medicine.discount / 100)
    : (medicine.price || 0);
  const outOfStock = medicine.stock <= 0;
  const lowStock = medicine.stock > 0 && medicine.stock <= (medicine.minStockLevel || 10);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <TouchableOpacity onPress={toggleFavorite}>
          <Icon
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={26}
            color={isFavorite ? theme.error : theme.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Image */}
        <Image
          source={{ uri: medicine.image || 'https://via.placeholder.com/300?text=Medicine' }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Stock Warnings */}
        {outOfStock && (
          <View style={styles.stockAlert}>
            <Icon name="alert-circle" size={18} color={theme.error} />
            <Text style={styles.stockAlertText}>Out of Stock</Text>
          </View>
        )}
        {lowStock && !outOfStock && (
          <View style={[styles.stockAlert, { backgroundColor: theme.warningMuted }]}>
            <Icon name="alert" size={18} color={theme.warning} />
            <Text style={[styles.stockAlertText, { color: theme.warning }]}>
              Low Stock - Only {medicine.stock} left!
            </Text>
          </View>
        )}

        {/* Basic Info */}
        <View style={styles.infoSection}>
          <Text style={styles.name}>{medicine.name}</Text>
          {medicine.genericName && (
            <Text style={styles.generic}>({medicine.genericName})</Text>
          )}

          <View style={styles.metaRow}>
            {medicine.dosageForm && (
              <View style={styles.metaTag}>
                <Text style={styles.metaText}>{medicine.dosageForm}</Text>
              </View>
            )}
            {medicine.strength && (
              <View style={styles.metaTag}>
                <Text style={styles.metaText}>{medicine.strength}</Text>
              </View>
            )}
            {medicine.prescription_required && (
              <View style={[styles.metaTag, { backgroundColor: theme.warningMuted, borderColor: theme.warning }]}>
                <Icon name="prescription" size={12} color={theme.warning} />
                <Text style={[styles.metaText, { color: theme.warning }]}>Rx Required</Text>
              </View>
            )}
          </View>

          {/* Price */}
          <View style={styles.priceSection}>
            <Text style={styles.price}>${discountedPrice.toFixed(2)}</Text>
            {medicine.discount > 0 && (
              <>
                <Text style={styles.oldPrice}>${medicine.price.toFixed(2)}</Text>
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{medicine.discount}% OFF</Text>
                </View>
              </>
            )}
          </View>

          {medicine.manufacturer && (
            <Text style={styles.manufacturer}>By {medicine.manufacturer}</Text>
          )}
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.sectionText}>
            {medicine.description || 
             `${medicine.name} is a ${medicine.dosageForm || 'medication'} used to treat various medical conditions. 
             This medication should only be used as directed by a healthcare professional.
             Always read the patient information leaflet before taking this medication and follow 
             the dosage instructions provided by your doctor or pharmacist.`}
          </Text>
        </View>

        {/* Uses */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Uses</Text>
          {medicine.uses && medicine.uses.length > 0 ? (
            medicine.uses.map((use, i) => (
              <View key={i} style={styles.listItem}>
                <Icon name="check-circle" size={16} color={theme.success} />
                <Text style={styles.listText}>{use}</Text>
              </View>
            ))
          ) : (
            <View style={styles.listItem}>
              <Icon name="check-circle" size={16} color={theme.success} />
              <Text style={styles.listText}>Treats various medical conditions as prescribed by healthcare professionals</Text>
            </View>
          )}
        </View>

        {/* Side Effects */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Side Effects</Text>
          {medicine.sideEffects && medicine.sideEffects.length > 0 ? (
            medicine.sideEffects.map((effect, i) => (
              <View key={i} style={styles.listItem}>
                <Icon name="alert-circle-outline" size={16} color={theme.warning} />
                <Text style={styles.listText}>{effect}</Text>
              </View>
            ))
          ) : (
            <>
              <View style={styles.listItem}>
                <Icon name="alert-circle-outline" size={16} color={theme.warning} />
                <Text style={styles.listText}>May cause drowsiness or dizziness</Text>
              </View>
              <View style={styles.listItem}>
                <Icon name="alert-circle-outline" size={16} color={theme.warning} />
                <Text style={styles.listText}>Nausea or stomach upset may occur</Text>
              </View>
              <View style={styles.listItem}>
                <Icon name="alert-circle-outline" size={16} color={theme.warning} />
                <Text style={styles.listText}>Headache or dry mouth</Text>
              </View>
            </>
          )}
        </View>

        {/* Storage */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Storage</Text>
          <Text style={styles.sectionText}>
            {medicine.storage || 
             'Store at room temperature between 20-25°C (68-77°F). Keep away from moisture and direct sunlight. 
             Keep out of reach of children and pets. Do not use after the expiration date.'}
          </Text>
        </View>

        {/* Additional Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Information</Text>
          <View style={styles.listItem}>
            <Icon name="information" size={16} color={theme.primary} />
            <Text style={styles.listText}>Take exactly as prescribed by your healthcare provider</Text>
          </View>
          <View style={styles.listItem}>
            <Icon name="information" size={16} color={theme.primary} />
            <Text style={styles.listText}>Do not share this medication with others</Text>
          </View>
          <View style={styles.listItem}>
            <Icon name="information" size={16} color={theme.primary} />
            <Text style={styles.listText}>Inform your doctor about all medications you are taking</Text>
          </View>
          <View style={styles.listItem}>
            <Icon name="information" size={16} color={theme.primary} />
            <Text style={styles.listText}>Seek immediate medical attention if overdose occurs</Text>
          </View>
        </View>

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View style={styles.quantityControls}>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(q => Math.max(1, q - 1))}
          >
            <Icon name="minus" size={18} color={theme.primary} />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{quantity}</Text>
          <TouchableOpacity
            style={styles.qtyBtn}
            onPress={() => setQuantity(q => Math.min(medicine.stock, q + 1))}
            disabled={outOfStock}
          >
            <Icon name="plus" size={18} color={theme.primary} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[styles.addToCartBtn, outOfStock && styles.disabledBtn]}
          onPress={handleAddToCart}
          disabled={outOfStock}
        >
          <Icon name="cart-plus" size={20} color="#fff" />
          <Text style={styles.addToCartText}>
            {outOfStock ? 'Out of Stock' : `Add - $${(discountedPrice * quantity).toFixed(2)}`}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 12,
  },
  scroll: { flex: 1 },
  image: {
    width: '100%', height: 220, backgroundColor: theme.surface,
  },
  stockAlert: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    margin: 16, marginBottom: 0, padding: 12, borderRadius: 8,
    backgroundColor: theme.errorMuted,
  },
  stockAlertText: { fontSize: 14, fontWeight: '600', color: theme.error },
  infoSection: { padding: 16 },
  name: { fontSize: 22, fontWeight: 'bold', color: theme.textPrimary },
  generic: { fontSize: 14, color: theme.textSecondary, marginTop: 2 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 10 },
  metaTag: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12,
    backgroundColor: theme.surfaceHighlight, borderWidth: 1, borderColor: theme.border,
  },
  metaText: { fontSize: 12, color: theme.textSecondary },
  priceSection: { flexDirection: 'row', alignItems: 'center', marginTop: 12, gap: 8 },
  price: { fontSize: 26, fontWeight: 'bold', color: theme.primary },
  oldPrice: { fontSize: 16, color: theme.textTertiary, textDecorationLine: 'line-through' },
  discountBadge: { backgroundColor: theme.successMuted, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  discountText: { fontSize: 12, color: theme.success, fontWeight: '700' },
  manufacturer: { fontSize: 13, color: theme.textSecondary, marginTop: 6 },
  section: {
    paddingHorizontal: 16, paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: theme.border,
  },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginBottom: 8 },
  sectionText: { fontSize: 14, color: theme.textSecondary, lineHeight: 22 },
  listItem: { flexDirection: 'row', alignItems: 'flex-start', gap: 8, marginBottom: 6 },
  listText: { flex: 1, fontSize: 14, color: theme.textSecondary, lineHeight: 20 },
  bottomBar: {
    flexDirection: 'row', padding: 16, gap: 12,
    borderTopWidth: 1, borderTopColor: theme.border, backgroundColor: theme.surface,
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.inputBackground, borderRadius: 10,
    borderWidth: 1, borderColor: theme.border,
  },
  qtyBtn: { padding: 10 },
  qtyText: { fontSize: 16, fontWeight: '600', color: theme.textPrimary, minWidth: 30, textAlign: 'center' },
  addToCartBtn: {
    flex: 1, flexDirection: 'row', backgroundColor: theme.primary,
    borderRadius: 12, paddingVertical: 14, justifyContent: 'center',
    alignItems: 'center', gap: 8,
  },
  addToCartText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabledBtn: { opacity: 0.4 },
});
