import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, StatusBar, Alert, Animated,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { ordersAPI } from '../services/mobileApi';
import Toast from 'react-native-toast-message';

const TABS = [
  { key: 'all',       label: 'All' },
  { key: 'active',    label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

const STATUS_CONFIG = {
  pending:    { label: 'Pending',    bg: '#f59e0b20', text: '#f59e0b', border: '#f59e0b30', icon: 'schedule' },
  confirmed:  { label: 'Confirmed',  bg: '#3b82f620', text: '#3b82f6', border: '#3b82f630', icon: 'check-circle' },
  processing: { label: 'Processing', bg: '#3b82f620', text: '#3b82f6', border: '#3b82f630', icon: 'autorenew' },
  dispatched: { label: 'Shipped',    bg: '#f9741520', text: '#f97415', border: '#f9741530', icon: 'local-shipping' },
  delivered:  { label: 'Delivered',  bg: '#10b98120', text: '#10b981', border: '#10b98130', icon: 'check-circle' },
  cancelled:  { label: 'Cancelled',  bg: '#ef444420', text: '#ef4444', border: '#ef444430', icon: 'cancel' },
};

function OrderCard({ order, onCancel }) {
  const [expanded, setExpanded] = useState(false);
  const sc = STATUS_CONFIG[order.status] || { label: order.status, bg: '#1a1a1a', text: '#9ca3af', border: '#333', icon: 'inventory' };

  return (
    <View style={styles.orderCard}>
      {/* Card image-style header */}
      <View style={[styles.cardBanner, { backgroundColor: '#1e140d' }]}>
        {/* Status badge */}
        <View style={[styles.statusPill, { backgroundColor: sc.bg, borderColor: sc.border }]}>
          <MaterialIcons name={sc.icon} size={13} color={sc.text} />
          <Text style={[styles.statusPillText, { color: sc.text }]}>{sc.label}</Text>
        </View>

        <View style={styles.bannerFooter}>
          <View>
            <Text style={styles.orderNum}>Order #{order.orderNumber}</Text>
            <Text style={styles.orderTotal}>₹{order.total?.toLocaleString()}</Text>
          </View>
          <Text style={styles.orderDate}>
            {new Date(order.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
          </Text>
        </View>
      </View>

      {/* Body */}
      <View style={styles.cardBody}>
        {/* Expand items */}
        <TouchableOpacity style={styles.expandRow} onPress={() => setExpanded(prev => !prev)}>
          <Text style={styles.expandLabel}>View {order.items?.length || 0} Items</Text>
          <MaterialIcons name={expanded ? 'expand-less' : 'expand-more'} size={20} color="#cca88e" />
        </TouchableOpacity>

        {expanded && (
          <View style={styles.itemsList}>
            {order.items?.map((item, idx) => (
              <View key={idx} style={[styles.itemRow, idx === order.items.length - 1 && { borderBottomWidth: 0 }]}>
                <View style={styles.itemIconWrap}>
                  <MaterialIcons name="medication" size={18} color="#f97415" />
                </View>
                <View style={{ flex: 1 }}>
                  <View style={styles.itemTopRow}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.medicine?.name}</Text>
                    <Text style={styles.itemPrice}>₹{item.price}</Text>
                  </View>
                  <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Action buttons */}
        <View style={styles.actionsRow}>
          {order.status === 'pending' && (
            <TouchableOpacity style={styles.cancelBtn} onPress={() => onCancel(order._id)}>
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
          {order.status === 'delivered' && (
            <TouchableOpacity style={styles.reorderBtn}>
              <Text style={styles.reorderBtnText}>Reorder</Text>
            </TouchableOpacity>
          )}
          {['pending','confirmed','processing','dispatched'].includes(order.status) && (
            <TouchableOpacity style={styles.trackBtn}>
              <Text style={styles.trackBtnText}>Track Order</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
}

export default function OrdersScreen({ navigation }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  const fetchOrders = useCallback(async () => {
    try {
      const res = await ordersAPI.getAll();
      setOrders(res.data?.data?.orders || []);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to load orders' });
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders().finally(() => setRefreshing(false));
  }, [fetchOrders]);

  useEffect(() => { fetchOrders(); }, []);

  const handleCancel = (orderId) => {
    Alert.alert('Cancel Order', 'Are you sure you want to cancel this order?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel', style: 'destructive', onPress: async () => {
          try {
            await ordersAPI.cancel(orderId);
            Toast.show({ type: 'success', text1: 'Order cancelled' });
            fetchOrders();
          } catch {
            Toast.show({ type: 'error', text1: 'Failed to cancel order' });
          }
        }
      }
    ]);
  };

  const filtered = orders.filter(o => {
    if (activeTab === 'all')       return true;
    if (activeTab === 'active')    return ['pending','confirmed','processing','dispatched'].includes(o.status);
    if (activeTab === 'completed') return o.status === 'delivered';
    if (activeTab === 'cancelled') return o.status === 'cancelled';
    return true;
  });

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#23170f" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <MaterialIcons name="arrow-back" size={22} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.pageTitle}>My Orders</Text>
          <View style={{ width: 36 }} />
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map(t => (
            <TouchableOpacity key={t.key} onPress={() => setActiveTab(t.key)} style={[styles.tab, activeTab === t.key && styles.tabActive]}>
              <Text style={[styles.tabText, activeTab === t.key && styles.tabTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ── Orders List ── */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97415" />}
      >
        {loading ? (
          <View style={styles.emptyState}>
            <Text style={{ color: '#9ca3af', fontSize: 14 }}>Loading orders...</Text>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={{ fontSize: 48, marginBottom: 12 }}>📦</Text>
            <Text style={styles.emptyTitle}>No orders found</Text>
            <Text style={styles.emptySubtitle}>
              {activeTab !== 'all' ? `You have no ${activeTab} orders` : "You haven't placed any orders yet"}
            </Text>
          </View>
        ) : (
          filtered.map(order => (
            <OrderCard key={order._id} order={order} onCancel={handleCancel} />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23170f' },

  // Header
  header: { backgroundColor: '#23170f95', borderBottomWidth: 1, borderBottomColor: '#4a3221' },
  headerTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: '#352418' },
  pageTitle: { flex: 1, color: '#fff', fontWeight: '800', fontSize: 17, textAlign: 'center' },
  tabsRow: { paddingHorizontal: 16, gap: 4, paddingBottom: 0 },
  tab: { flex: 1, minWidth: 80, paddingVertical: 12, paddingHorizontal: 4, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#f97415' },
  tabText: { color: '#cca88e', fontWeight: '600', fontSize: 13 },
  tabTextActive: { color: '#f97415', fontWeight: '800' },

  // List
  listContent: { padding: 16, gap: 16, paddingBottom: 100 },

  // Order Card
  orderCard: { backgroundColor: '#352418', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#4a3221' },
  cardBanner: { padding: 16, paddingBottom: 12, position: 'relative' },
  statusPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99, borderWidth: 1, alignSelf: 'flex-start', marginBottom: 12 },
  statusPillText: { fontSize: 11, fontWeight: '800' },
  bannerFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  orderNum: { color: '#cca88e', fontSize: 11, marginBottom: 2 },
  orderTotal: { color: '#fff', fontWeight: '800', fontSize: 20 },
  orderDate: { color: '#ffffff80', fontSize: 11, backgroundColor: '#00000030', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6 },

  // Card Body
  cardBody: { padding: 16, paddingTop: 8 },
  expandRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderTopWidth: 1, borderTopColor: '#4a322150' },
  expandLabel: { color: '#cca88e', fontSize: 13, fontWeight: '600' },

  // Items
  itemsList: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#4a322150', paddingTop: 8, gap: 12 },
  itemRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#4a322150' },
  itemIconWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#352418', borderWidth: 1, borderColor: '#4a3221', justifyContent: 'center', alignItems: 'center' },
  itemTopRow: { flexDirection: 'row', justifyContent: 'space-between' },
  itemName: { flex: 1, color: '#fff', fontWeight: '600', fontSize: 13 },
  itemPrice: { color: '#fff', fontWeight: '700', fontSize: 13 },
  itemQty: { color: '#cca88e', fontSize: 11, marginTop: 2 },

  // Actions
  actionsRow: { flexDirection: 'row', gap: 10, marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#4a3221' },
  cancelBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#ef444480', alignItems: 'center' },
  cancelBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 13 },
  trackBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f97415', alignItems: 'center', elevation: 4, shadowColor: '#f97415', shadowOpacity: 0.3, shadowRadius: 6 },
  trackBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  reorderBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: '#f9741580', alignItems: 'center' },
  reorderBtnText: { color: '#f97415', fontWeight: '700', fontSize: 13 },

  // Empty
  emptyState: { padding: 48, alignItems: 'center' },
  emptyTitle: { color: '#fff', fontSize: 16, fontWeight: '700', marginBottom: 6 },
  emptySubtitle: { color: '#9ca3af', fontSize: 13, textAlign: 'center' },
});
