import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  StatusBar, Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';
import PharmacyLogo from '../components/PharmacyLogo';
import MedicineIcon from '../components/MedicineIcon';
import OrderIcon from '../components/OrderIcon';
import UserIcon from '../components/UserIcon';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();

  const firstName = (user?.name || 'U').charAt(0).toUpperCase();

  const [stats, setStats] = useState([
    { label: 'Orders', value: '0', icon: 'order' },
    { label: 'Active', value: '0', icon: 'shopping' },
    { label: 'Completed', value: '0', icon: 'check-circle' },
    { label: 'Prescriptions', value: '0', icon: 'prescription' },
  ]);

  const [recentActivity, setRecentActivity] = useState([]);

  const quickActions = [
    { label: 'Catalog', icon: 'medicine', screen: 'Catalog' },
    { label: 'Orders', icon: 'order', screen: 'Orders' },
    { label: 'Prescriptions', icon: 'prescription', screen: 'Prescriptions' },
    { label: 'Profile', icon: 'user', screen: 'Profile' },
  ];

  const fetchDashboardData = async () => {
    try {
      // Fetch orders stats
      const ordersRes = await api.get('/orders/stats');
      const ordersData = ordersRes.data.data;
      
      // Fetch prescriptions stats
      const prescriptionsRes = await api.get('/prescriptions/stats');
      const prescriptionsData = prescriptionsRes.data.data;
      
      // Update stats
      setStats([
        { label: 'Orders', value: ordersData.total?.toString() || '0', icon: 'order' },
        { label: 'Active', value: ordersData.active?.toString() || '0', icon: 'shopping' },
        { label: 'Completed', value: ordersData.completed?.toString() || '0', icon: 'check-circle' },
        { label: 'Prescriptions', value: prescriptionsData.total?.toString() || '0', icon: 'prescription' },
      ]);
      
      // Fetch recent activity
      const activityRes = await api.get('/orders/recent?limit=2');
      setRecentActivity(activityRes.data.data.orders || []);
      
    } catch (error) {
      console.log('Error fetching dashboard data:', error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar style="light" backgroundColor="#000000" />

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{firstName}</Text>
            </View>
            <View style={styles.onlineDot} />
            <View style={styles.headerText}>
              <PharmacyLogo size={24} color={theme.primary} />
              <Text style={styles.subTitle}>RxHub</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationBtn}>
            <Icon name="notifications" size={24} color="#fff" />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.welcomeRow}>
            <View style={[styles.avatarSmall, { backgroundColor: theme.primary }]}>
              <Text style={styles.avatarTextSmall}>{firstName}</Text>
            </View>
            <View style={styles.welcomeTextContainer}>
              <Text style={[styles.welcomeText, { color: theme.textPrimary }]}>Welcome back,</Text>
              <Text style={[styles.userName, { color: theme.textPrimary }]}>{user?.name?.split(' ')[0] || 'Alex'}</Text>
            </View>
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsGrid}>
          {stats.map((stat, index) => {
            const renderIcon = (iconName) => {
              switch(iconName) {
                case 'order': return <OrderIcon size={20} color={theme.primary} />;
                case 'shopping': return <Icon name="shopping-outline" size={20} color={theme.primary} />;
                case 'check-circle': return <Icon name="check-circle-outline" size={20} color={theme.primary} />;
                case 'prescription': return <PrescriptionIcon size={20} color={theme.primary} />;
                default: return <Icon name="help-circle-outline" size={20} color={theme.primary} />;
              }
            };
            return (
              <View key={index} style={[styles.statCardMinimal, { backgroundColor: theme.card, borderColor: theme.border }]}>
                {renderIcon(stat.icon)}
                <Text style={[styles.statValue, { color: theme.textPrimary }]}>{stat.value}</Text>
                <Text style={[styles.statLabel, { color: theme.textSecondary }]}>{stat.label}</Text>
              </View>
            );
          })}
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Quick Actions</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map((action, index) => {
              const renderIcon = (iconName) => {
                switch(iconName) {
                  case 'medicine': return <MedicineIcon size={24} color={theme.primary} />;
                  case 'order': return <OrderIcon size={24} color={theme.primary} />;
                  case 'prescription': return <PrescriptionIcon size={24} color={theme.primary} />;
                  case 'user': return <UserIcon size={24} color={theme.primary} />;
                  default: return <Icon name="help-circle-outline" size={24} color={theme.primary} />;
                }
              };
              return (
                <TouchableOpacity
                  key={index}
                  style={[styles.quickActionMinimal, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => navigation.navigate(action.screen)}
                >
                  {renderIcon(action.icon)}
                  <Text style={[styles.quickActionText, { color: theme.textSecondary }]}>{action.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Recent Activity */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Activity</Text>
          <View style={[styles.activityCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <View key={activity._id} style={[
                  styles.activityItem, 
                  index < recentActivity.length - 1 && { borderBottomWidth: 1, borderBottomColor: theme.border }
                ]}>
                  <MedicineIcon size={16} color={theme.primary} />
                  <Text style={[styles.activityText, { color: theme.textPrimary }]}>
                    {activity.medicineName || activity.items?.[0]?.name || 'Order'}
                  </Text>
                  <Text style={[styles.activityStatus, { color: theme.textSecondary }]}>
                    {activity.status || 'Processing'}
                  </Text>
                </View>
              ))
            ) : (
              <View style={styles.emptyActivity}>
                <Text style={[styles.emptyActivityText, { color: theme.textSecondary }]}>No recent activity</Text>
              </View>
            )}
          </View>
        </View>


      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#000000',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f97415',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 12,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    borderWidth: 2,
    borderColor: '#000000',
  },
  headerText: { marginLeft: 8 },
  appTitle: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  subTitle: { color: '#888', fontSize: 12 },
  notificationBtn: { position: 'relative', padding: 8 },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#f97415',
  },
  // Welcome Section
  welcomeSection: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
  welcomeRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatarSmall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarTextSmall: { color: '#fff', fontSize: 16, fontWeight: '600' },
  welcomeTextContainer: { flex: 1 },
  welcomeText: { fontSize: 14, color: '#9ca3af', marginBottom: 2 },
  userName: { fontSize: 20, fontWeight: 'bold' },
  // Stats Cards
  statsGrid: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statCardMinimal: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  statValue: { fontSize: 20, fontWeight: 'bold' },
  statLabel: { fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold' },
  viewAllText: { fontSize: 14, fontWeight: 'semibold' },
  quickActionsGrid: { 
    flexDirection: 'row', 
    paddingHorizontal: 20, 
    gap: 12,
    marginBottom: 24,
  },
  quickActionMinimal: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
    gap: 8,
  },
  quickActionText: { fontSize: 12, textAlign: 'center', fontWeight: '500' },
  // Recent Activity
  activityCard: {
    borderRadius: 12,
    borderWidth: 1,
  },
  activityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    gap: 12,
  },
  activityText: { flex: 1, fontSize: 14, fontWeight: '500' },
  activityStatus: { fontSize: 12, fontWeight: '500' },
  emptyActivity: {
    padding: 32,
    alignItems: 'center',
  },
  emptyActivityText: {
    fontSize: 14,
    fontStyle: 'italic',
  },
});
