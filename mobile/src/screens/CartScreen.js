import React, { useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  Image, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';

export default function CartScreen({ navigation }) {
  const { theme } = useTheme();
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    navigation.navigate('Checkout');
  };

  const handleRemove = (item) => {
    Alert.alert('Remove Item', `Remove ${item.name} from cart?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(item._id) },
    ]);
  };

  const renderCartItem = ({ item }) => (
    <View style={[s.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Image
        source={{ uri: item.image || 'https://placehold.co/80x80/e2e8f0/64748b?text=💊' }}
        style={s.img}
      />
      <View style={s.details}>
        <Text style={[s.itemName, { color: theme.textPrimary }]} numberOfLines={2}>{item.name}</Text>
        <Text style={[s.unitPrice, { color: theme.textSecondary }]}>
          ${item.price?.toFixed(2)} each
        </Text>

        <View style={s.qtyRow}>
          <View style={[s.qtyControls, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <TouchableOpacity
              style={s.qtyBtn}
              onPress={() => updateQuantity(item._id, item.quantity - 1)}
              activeOpacity={0.7}
            >
              <Icon name="minus" size={16} color={theme.primary} />
            </TouchableOpacity>
            <Text style={[s.qty, { color: theme.textPrimary }]}>{item.quantity}</Text>
            <TouchableOpacity
              style={s.qtyBtn}
              onPress={() => updateQuantity(item._id, item.quantity + 1)}
              activeOpacity={0.7}
            >
              <Icon name="plus" size={16} color={theme.primary} />
            </TouchableOpacity>
          </View>
          <Text style={[s.itemTotal, { color: theme.primary }]}>
            ${((item.price || 0) * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={s.removeBtn} onPress={() => handleRemove(item)} activeOpacity={0.7}>
        <Icon name="trash-can-outline" size={20} color={theme.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[s.backBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.title, { color: theme.textPrimary }]}>My Cart</Text>
        {cart.length > 0 ? (
          <TouchableOpacity
            style={[s.clearBtn, { backgroundColor: '#ef444418', borderColor: '#ef444440' }]}
            onPress={() => {
              Alert.alert('Clear Cart', 'Remove all items?', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear', style: 'destructive', onPress: clearCart },
              ]);
            }}
            activeOpacity={0.8}
          >
            <Icon name="delete-sweep-outline" size={18} color="#ef4444" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 40 }} />
        )}
      </View>

      {cart.length === 0 ? (
        <View style={s.emptyContainer}>
          <Icon name="cart-off" size={80} color={theme.textTertiary} />
          <Text style={[s.emptyTitle, { color: theme.textPrimary }]}>Your cart is empty</Text>
          <Text style={[s.emptySub, { color: theme.textSecondary }]}>Add medicines to get started</Text>
          <TouchableOpacity
            style={[s.shopBtn, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Catalog')}
            activeOpacity={0.85}
          >
            <Icon name="pill" size={18} color="#fff" />
            <Text style={s.shopBtnText}>Browse Medicines</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={s.list}
            showsVerticalScrollIndicator={false}
          />

          <View style={[s.footer, { backgroundColor: theme.card, borderTopColor: theme.border }]}>
            <View style={s.summaryRow}>
              <View>
                <Text style={[s.totalLabel, { color: theme.textSecondary }]}>
                  {cart.length} item{cart.length !== 1 ? 's' : ''} in cart
                </Text>
                <Text style={[s.totalAmount, { color: theme.primary }]}>
                  ${(cartTotal || 0).toFixed(2)}
                </Text>
              </View>
              <TouchableOpacity
                style={[s.checkoutBtn, { backgroundColor: theme.primary }, loading && s.disabled]}
                onPress={handleCheckout}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <>
                    <Icon name="cart-check" size={20} color="#fff" />
                    <Text style={s.checkoutBtnText}>Checkout</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </>
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
  backBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  title: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  clearBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  list: { padding: 16, paddingBottom: 140 },
  card: {
    flexDirection: 'row', borderRadius: 16, padding: 12, marginBottom: 10,
    borderWidth: 1, alignItems: 'center', gap: 12,
  },
  img: { width: 78, height: 78, borderRadius: 12 },
  details: { flex: 1, gap: 4 },
  itemName: { fontSize: 14, fontWeight: '600', lineHeight: 20 },
  unitPrice: { fontSize: 12, lineHeight: 16 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  qtyControls: {
    flexDirection: 'row', alignItems: 'center', borderRadius: 10, borderWidth: 1, overflow: 'hidden',
  },
  qtyBtn: { width: 32, height: 32, justifyContent: 'center', alignItems: 'center' },
  qty: { fontSize: 15, fontWeight: '700', lineHeight: 20, paddingHorizontal: 12 },
  itemTotal: { fontSize: 16, fontWeight: '800' },
  removeBtn: { padding: 6 },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12, padding: 32 },
  emptyTitle: { fontSize: 20, fontWeight: '800', lineHeight: 26 },
  emptySub: { fontSize: 14, lineHeight: 20 },
  shopBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14, marginTop: 8 },
  shopBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  footer: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    padding: 16, paddingBottom: 32, borderTopWidth: 1,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  totalLabel: { fontSize: 13, lineHeight: 18, marginBottom: 2 },
  totalAmount: { fontSize: 26, fontWeight: '800', lineHeight: 32 },
  checkoutBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 24, paddingVertical: 14, borderRadius: 14,
  },
  checkoutBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
