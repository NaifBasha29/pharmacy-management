import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  RefreshControl, StatusBar, Image, FlatList, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { ordersAPI, medicinesAPI, prescriptionsAPI } from '../services/mobileApi';
import { SERVER_URL } from '../config/api';
import io from 'socket.io-client';

const STAT_CARDS = [
  { key: 'totalOrders',        label: 'Total Orders',  icon: 'shopping-bag',    bg: '#3b82f620', color: '#3b82f6' },
  { key: 'pendingOrders',      label: 'In Progress',   icon: 'local-shipping',  bg: '#f9741520', color: '#f97415' },
  { key: 'completedOrders',    label: 'Delivered',     icon: 'check-circle',    bg: '#10b98120', color: '#10b981' },
  { key: 'activePrescriptions',label: 'Active Rx',     icon: 'description',     bg: '#a855f720', color: '#a855f7' },
];

const QUICK_ACTIONS = [
  { label: 'Browse Medicines', icon: 'medication',    screen: 'Catalog' },
  { label: 'My Orders',        icon: 'receipt-long',  screen: 'Orders' },
  { label: 'Upload Rx',        icon: 'upload-file',   screen: 'Prescriptions' },
  { label: 'My Profile',       icon: 'person',        screen: 'Profile' },
];

const STATUS_BADGE = {
  pending:    { bg: '#fef3c7', text: '#d97706' },
  confirmed:  { bg: '#dbeafe', text: '#3b82f6' },
  processing: { bg: '#e0e7ff', text: '#4f46e5' },
  dispatched: { bg: '#fae8ff', text: '#a855f7' },
  delivered:  { bg: '#dcfce7', text: '#16a34a' },
  cancelled:  { bg: '#fee2e2', text: '#dc2626' },
};

export default function DashboardScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalOrders: 0, pendingOrders: 0, completedOrders: 0, activePrescriptions: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [featuredMedicines, setFeaturedMedicines] = useState([]);

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' });

  const firstName = user?.name?.split(' ')[0] || 'there';

  const fetchData = useCallback(async () => {
    try {
      const [ordersRes, medsRes, rxRes] = await Promise.all([
        ordersAPI.getAll({ limit: 5 }),
        medicinesAPI.getAll({ limit: 8, inStock: true }),
        prescriptionsAPI.getAll(),
      ]);
      const orders = ordersRes.data?.data?.orders || [];
      const prescriptions = rxRes.data?.data?.prescriptions || [];
      setRecentOrders(orders.slice(0, 4));
      setFeaturedMedicines(medsRes.data?.data?.medicines || []);
      setStats({
        totalOrders:          ordersRes.data?.data?.pagination?.total || orders.length,
        pendingOrders:        orders.filter(o => ['pending','confirmed','processing'].includes(o.status)).length,
        completedOrders:      orders.filter(o => o.status === 'delivered').length,
        activePrescriptions:  prescriptions.filter(p => p.status === 'approved').length,
      });
    } catch (err) {
      console.log('Dashboard fetch error:', err?.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData().finally(() => setRefreshing(false));
  }, [fetchData]);

  useEffect(() => {
    fetchData();

    const socket = io(SERVER_URL, { transports: ['websocket'] });
    socket.on('connect', () => { if (user?.role) socket.emit('join-role', user.role); });
    socket.on('order-status', d => { Alert.alert('Order Update', `Order #${d.orderId} is now ${d.status}`); fetchData(); });
    socket.on('stock-notification', d => { Alert.alert('Low Stock Alert', `${d.medicineName} is running low!`); });
    socket.on('connect_error', () => {});
    return () => socket.disconnect();
  }, [user]);

  const renderStatCard = ({ item }) => (
    <View style={[styles.statCard, { borderColor: item.color + '30' }]}>
      <View style={[styles.statIconBox, { backgroundColor: item.bg }]}>
        <MaterialIcons name={item.icon} size={22} color={item.color} />
      </View>
      <Text style={styles.statValue}>{stats[item.key]}</Text>
      <Text style={styles.statLabel}>{item.label}</Text>
    </View>
  );

  const renderMedCard = (med) => (
    <View key={med._id} style={styles.medCard}>
      <TouchableOpacity style={styles.favBtn}>
        <MaterialIcons name="favorite-border" size={14} color="#9ca3af" />
      </TouchableOpacity>
      <View style={styles.medImgBox}>
        {med.image
          ? <Image source={{ uri: med.image }} style={styles.medImg} resizeMode="cover" />
          : <Text style={{ fontSize: 28 }}>💊</Text>}
      </View>
      <Text style={styles.medName} numberOfLines={1}>{med.name}</Text>
      <Text style={styles.medPrice}>₹{med.price}</Text>
      <TouchableOpacity style={styles.addMedBtn}>
        <Text style={styles.addMedBtnText}>Add</Text>
      </TouchableOpacity>
    </View>
  );

  const renderOrderRow = (order, index) => {
    const badge = STATUS_BADGE[order.status] || { bg: '#f1f5f9', text: '#9ca3af' };
    return (
      <View key={order._id} style={[styles.orderRow, index === recentOrders.length - 1 && { borderBottomWidth: 0 }]}>
        <Text style={styles.orderNum}>#{order.orderNumber}</Text>
        <Text style={styles.orderItems}>{order.items?.length || 0} items</Text>
        <Text style={styles.orderTotal}>₹{order.total?.toLocaleString()}</Text>
        <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.statusText, { color: badge.text }]}>{order.status}</Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarWrap}>
            {user?.avatar
              ? <Image source={{ uri: user.avatar }} style={styles.avatar} />
              : <View style={styles.avatarFallback}><Text style={styles.avatarLetter}>{firstName[0]}</Text></View>}
            <View style={styles.onlineDot} />
          </View>
          <View>
            <Text style={styles.brandName}>RxHub</Text>
            <Text style={styles.headerSub}>Patient Dashboard</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.notifBtn}>
          <MaterialIcons name="notifications" size={22} color="#e5e5e5" />
          <View style={styles.notifDot} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#f97415" />}
        contentContainerStyle={{ paddingBottom: 24 }}
      >
        {/* ── Welcome ── */}
        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeLabel}>Welcome back</Text>
          <Text style={styles.welcomeName}>{firstName}! 👋</Text>
          <View style={styles.dateBadge}>
            <MaterialIcons name="calendar-today" size={13} color="#f97415" />
            <Text style={styles.dateBadgeText}>{today}</Text>
          </View>
        </View>

        {/* ── Stats ── */}
        <FlatList
          data={STAT_CARDS}
          keyExtractor={i => i.key}
          renderItem={renderStatCard}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statsList}
        />

        {/* ── Quick Actions ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsRow}>
            {QUICK_ACTIONS.map(a => (
              <TouchableOpacity key={a.screen} style={styles.actionItem} onPress={() => navigation.navigate(a.screen)}>
                <View style={styles.actionCircle}>
                  <MaterialIcons name={a.icon} size={24} color="#e5e5e5" />
                </View>
                <Text style={styles.actionLabel}>{a.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ── Health Summary ── */}
        <View style={styles.section}>
          <View style={styles.healthCard}>
            <View style={styles.healthGlow} />
            <View style={styles.healthHeader}>
              <Text style={styles.healthTitle}>Health Summary</Text>
              <TouchableOpacity>
                <Text style={styles.editBtn}>Edit</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.healthGrid}>
              <View style={styles.healthItem}>
                <View style={styles.healthItemHeader}>
                  <MaterialIcons name="bloodtype" size={18} color="#ef4444" />
                  <Text style={styles.healthItemLabel}>BLOOD GROUP</Text>
                </View>
                <Text style={styles.healthItemValue}>{user?.bloodGroup || 'O+'}</Text>
              </View>
              <View style={styles.healthItem}>
                <View style={styles.healthItemHeader}>
                  <MaterialIcons name="warning" size={18} color="#f59e0b" />
                  <Text style={styles.healthItemLabel}>ALLERGIES</Text>
                </View>
                <Text style={styles.healthItemValue} numberOfLines={1}>
                  {user?.allergies?.join(', ') || 'None'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* ── Buy Again ── */}
        {featuredMedicines.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Buy Again</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Catalog')}>
                <Text style={styles.viewAllLink}>View All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingRight: 4 }}>
              {featuredMedicines.slice(0, 5).map(renderMedCard)}
            </ScrollView>
          </View>
        )}

        {/* ── Recent Orders ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Orders</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
              <Text style={styles.viewAllLink}>View All</Text>
            </TouchableOpacity>
          </View>

          {recentOrders.length > 0 ? (
            <View style={styles.ordersCard}>
              {/* Table Head */}
              <View style={[styles.orderRow, styles.orderHead]}>
                <Text style={styles.orderHeadText}>Order #</Text>
                <Text style={styles.orderHeadText}>Items</Text>
                <Text style={styles.orderHeadText}>Total</Text>
                <Text style={styles.orderHeadText}>Status</Text>
              </View>
              {recentOrders.map(renderOrderRow)}
              <TouchableOpacity style={styles.viewAllOrdersBtn} onPress={() => navigation.navigate('Orders')}>
                <Text style={styles.viewAllOrdersBtnText}>View All Orders</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40, marginBottom: 8 }}>📦</Text>
              <Text style={styles.emptyTitle}>No orders yet</Text>
              <Text style={styles.emptySubtitle}>Start shopping to see your orders here</Text>
              <TouchableOpacity style={styles.emptyBtn} onPress={() => navigation.navigate('Catalog')}>
                <Text style={styles.emptyBtnText}>Browse Catalog</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },

  // Header
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f9741520', backgroundColor: '#00000095' },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatarWrap: { position: 'relative' },
  avatar: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: '#f9741540' },
  avatarFallback: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#f97415', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#fff', fontWeight: '800', fontSize: 16 },
  onlineDot: { position: 'absolute', bottom: 0, right: 0, width: 11, height: 11, borderRadius: 6, backgroundColor: '#10b981', borderWidth: 2, borderColor: '#000' },
  brandName: { color: '#f1f1f1', fontWeight: '800', fontSize: 16 },
  headerSub: { color: '#9ca3af', fontSize: 11, fontWeight: '500' },
  notifBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' },
  notifDot: { position: 'absolute', top: 8, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: '#f97415' },

  // Welcome
  welcomeSection: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8 },
  welcomeLabel: { color: '#9ca3af', fontSize: 12, fontWeight: '600', letterSpacing: 1, textTransform: 'uppercase' },
  welcomeName: { fontSize: 28, fontWeight: '800', color: '#f97415', marginTop: 2 },
  dateBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 5, marginTop: 10, backgroundColor: '#f9741515', borderWidth: 1, borderColor: '#f9741530', borderRadius: 99, alignSelf: 'flex-start' },
  dateBadgeText: { color: '#f97415', fontSize: 12, fontWeight: '700' },

  // Stats
  statsList: { paddingHorizontal: 20, paddingVertical: 16, gap: 12 },
  statCard: { width: 140, padding: 14, backgroundColor: '#0a0a0a', borderRadius: 16, borderWidth: 1, marginRight: 2 },
  statIconBox: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  statValue: { fontSize: 26, fontWeight: '800', color: '#fff' },
  statLabel: { fontSize: 12, color: '#9ca3af', marginTop: 2 },

  // Common Section
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#fff', marginBottom: 12 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  viewAllLink: { color: '#f97415', fontWeight: '600', fontSize: 13 },

  // Quick Actions
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between' },
  actionItem: { alignItems: 'center', flex: 1 },
  actionCircle: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#333', justifyContent: 'center', alignItems: 'center', marginBottom: 6 },
  actionLabel: { fontSize: 11, color: '#9ca3af', textAlign: 'center', fontWeight: '500' },

  // Health
  healthCard: { backgroundColor: '#0a0a0a', borderRadius: 16, padding: 18, borderWidth: 1, borderColor: '#f9741515', overflow: 'hidden', position: 'relative' },
  healthGlow: { position: 'absolute', top: -20, right: -20, width: 100, height: 100, borderRadius: 50, backgroundColor: '#f9741520' },
  healthHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  healthTitle: { color: '#fff', fontWeight: '800', fontSize: 16 },
  editBtn: { color: '#f97415', fontWeight: '700', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5 },
  healthGrid: { flexDirection: 'row', gap: 12 },
  healthItem: { flex: 1, backgroundColor: '#00000030', padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#ffffff10' },
  healthItemHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 6 },
  healthItemLabel: { color: '#9ca3af', fontSize: 10, fontWeight: '600', textTransform: 'uppercase' },
  healthItemValue: { color: '#fff', fontWeight: '800', fontSize: 18 },

  // Buy Again
  medCard: { width: 140, backgroundColor: '#0a0a0a', borderRadius: 16, padding: 12, borderWidth: 1, borderColor: '#1f1f1f', alignItems: 'center', position: 'relative' },
  favBtn: { position: 'absolute', top: 8, right: 8, width: 24, height: 24, borderRadius: 12, backgroundColor: '#1a1a1a', justifyContent: 'center', alignItems: 'center' },
  medImgBox: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center', marginBottom: 8, overflow: 'hidden' },
  medImg: { width: 60, height: 60, borderRadius: 30 },
  medName: { color: '#fff', fontWeight: '700', fontSize: 13, textAlign: 'center', marginBottom: 4, width: '100%' },
  medPrice: { color: '#f97415', fontWeight: '700', fontSize: 13, marginBottom: 10 },
  addMedBtn: { width: '100%', paddingVertical: 6, borderRadius: 10, backgroundColor: '#f9741520', borderWidth: 1, borderColor: '#f9741530' },
  addMedBtnText: { color: '#f97415', fontWeight: '700', fontSize: 12, textAlign: 'center' },

  // Recent Orders
  ordersCard: { backgroundColor: '#0a0a0a', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#1f1f1f' },
  orderRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: 1, borderBottomColor: '#1a1a1a' },
  orderHead: { backgroundColor: '#111', paddingVertical: 10 },
  orderHeadText: { flex: 1, color: '#6b7280', fontSize: 11, fontWeight: '600', textTransform: 'uppercase' },
  orderNum: { flex: 1, color: '#e5e5e5', fontWeight: '700', fontSize: 13 },
  orderItems: { flex: 1, color: '#9ca3af', fontSize: 12 },
  orderTotal: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 13 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  statusText: { fontSize: 10, fontWeight: '700', textTransform: 'uppercase' },
  viewAllOrdersBtn: { padding: 12, alignItems: 'center', backgroundColor: '#111' },
  viewAllOrdersBtnText: { color: '#9ca3af', fontSize: 12, fontWeight: '700' },

  // Empty
  emptyState: { backgroundColor: '#0a0a0a', borderRadius: 16, padding: 32, alignItems: 'center', borderWidth: 1, borderColor: '#1a1a1a' },
  emptyTitle: { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  emptySubtitle: { color: '#9ca3af', fontSize: 13, marginBottom: 16, textAlign: 'center' },
  emptyBtn: { backgroundColor: '#f97415', paddingHorizontal: 24, paddingVertical: 10, borderRadius: 12 },
  emptyBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
});
