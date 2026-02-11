import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { useCart } from '../context/CartContext';
import api from '../config/api';

export default function CartScreen({ navigation }) {
  const { cart, updateQuantity, removeFromCart, clearCart, cartTotal } = useCart();
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    Alert.alert(
      'Confirm Order',
      `Total: $${cartTotal.toFixed(2)}\n\nProceed with checkout?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: async () => {
            try {
              setLoading(true);
              const orderItems = cart.map(item => ({
                medicine: item._id,
                quantity: item.quantity,
                price: item.price
              }));

              await api.post('/orders', {
                items: orderItems,
                totalAmount: cartTotal
              });

              clearCart();
              Alert.alert('Success', 'Order placed successfully!', [
                { text: 'OK', onPress: () => navigation.navigate('Orders') }
              ]);
            } catch (error) {
              console.log('Checkout error:', error);
              Alert.alert('Error', 'Failed to place order. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleRemove = (item) => {
    Alert.alert(
      'Remove Item',
      `Remove ${item.name} from cart?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove', style: 'destructive', onPress: () => removeFromCart(item._id) }
      ]
    );
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <Image
        source={{ uri: item.image || 'https://via.placeholder.com/80?text=Medicine' }}
        style={styles.itemImage}
      />
      <View style={styles.itemDetails}>
        <Text style={styles.itemName} numberOfLines={2}>{item.name}</Text>
        <Text style={styles.itemPrice}>${item.price?.toFixed(2)} each</Text>
        
        <View style={styles.quantityRow}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item._id, item.quantity - 1)}
            >
              <Icon name="minus" size={18} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              style={styles.quantityButton}
              onPress={() => updateQuantity(item._id, item.quantity + 1)}
            >
              <Icon name="plus" size={18} color={colors.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.itemTotal}>
            ${(item.price * item.quantity).toFixed(2)}
          </Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => handleRemove(item)}
      >
        <Icon name="trash-can-outline" size={20} color={colors.error || '#ef4444'} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Cart</Text>
        {cart.length > 0 ? (
          <TouchableOpacity onPress={() => {
            Alert.alert('Clear Cart', 'Remove all items?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: clearCart }
            ]);
          }}>
            <Icon name="delete-sweep-outline" size={24} color={colors.error || '#ef4444'} />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 24 }} />
        )}
      </View>

      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Icon name="cart-off" size={80} color={colors.textLight} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>Add medicines to get started</Text>
          <TouchableOpacity
            style={styles.shopButton}
            onPress={() => navigation.navigate('Catalog')}
          >
            <Text style={styles.shopButtonText}>Browse Medicines</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <FlatList
            data={cart}
            renderItem={renderCartItem}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.cartList}
            showsVerticalScrollIndicator={false}
          />

          {/* Checkout Footer */}
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalAmount}>${cartTotal.toFixed(2)}</Text>
            </View>
            <TouchableOpacity
              style={[styles.checkoutButton, loading && styles.checkoutButtonDisabled]}
              onPress={handleCheckout}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="cart-check" size={20} color="#fff" />
                  <Text style={styles.checkoutButtonText}>Checkout</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border || '#e5e7eb',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  cartList: {
    padding: 16,
    paddingBottom: 200,
  },
  cartItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    backgroundColor: '#f3f4f6',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  itemPrice: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    backgroundColor: colors.surface,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginHorizontal: 12,
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.primary,
  },
  removeButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 8,
  },
  shopButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
    backgroundColor: colors.primary,
    borderRadius: 12,
  },
  shopButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surface,
    padding: 16,
    paddingBottom: 32,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 16,
    color: colors.textSecondary,
  },
  totalAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.primary,
  },
  checkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 8,
  },
  checkoutButtonDisabled: {
    opacity: 0.7,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
