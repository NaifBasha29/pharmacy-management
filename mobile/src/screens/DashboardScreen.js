import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl,
  Alert,
  Platform,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { CustomLineChart } from '../components/CustomChart';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Constants from 'expo-constants';

// Derive socket URL from Expo debugger host (same approach as api.js)
const getSocketUrl = () => {
  try {
    const debuggerHost =
      Constants.expoGoConfig?.debuggerHost ??
      Constants.expoConfig?.hostUri ??
      Constants.manifest?.debuggerHost ??
      Constants.manifest?.hostUri;
    if (debuggerHost) return `http://${debuggerHost.split(':')[0]}:5005`;
  } catch { /* ignore */ }
  return Platform.OS === 'android' ? 'http://10.0.2.2:5005' : 'http://localhost:5005';
};

// ── Mock Data ──────────────────────────────────────────────────────────────────
const MOCK_RECENT_ORDERS = [
  { id: 'ORD-2024-0147', date: 'Mar 8, 2026', status: 'Delivered', total: '$42.50', items: 3, color: '#22c55e' },
  { id: 'ORD-2024-0146', date: 'Mar 6, 2026', status: 'In Transit', total: '$28.00', items: 2, color: '#3b82f6' },
  { id: 'ORD-2024-0145', date: 'Mar 4, 2026', status: 'Processing', total: '$65.75', items: 5, color: '#f59e0b' },
];

const MOCK_PRESCRIPTIONS = [
  { id: 'RX-1021', medicine: 'Amoxicillin 500mg', doctor: 'Dr. Sarah Ahmed', dosage: '1 capsule 3× daily', refillsLeft: 2, expiresIn: '18 days' },
  { id: 'RX-1019', medicine: 'Metformin 850mg', doctor: 'Dr. Khalid Noor', dosage: '1 tablet 2× daily', refillsLeft: 5, expiresIn: '45 days' },
  { id: 'RX-1015', medicine: 'Lisinopril 10mg', doctor: 'Dr. Sarah Ahmed', dosage: '1 tablet daily', refillsLeft: 3, expiresIn: '30 days' },
];

const MOCK_UPCOMING_REFILLS = [
  { medicine: 'Amoxicillin 500mg', dueDate: 'Mar 12, 2026', daysLeft: 4, urgency: 'high' },
  { medicine: 'Atorvastatin 20mg', dueDate: 'Mar 18, 2026', daysLeft: 10, urgency: 'medium' },
  { medicine: 'Omeprazole 20mg', dueDate: 'Mar 25, 2026', daysLeft: 17, urgency: 'low' },
];

const MOCK_HEALTH_TIPS = [
  { id: 1, title: 'Stay Hydrated', desc: 'Drink at least 8 glasses of water daily to help your medications absorb properly.', icon: 'water', color: '#0EA5E9' },
  { id: 2, title: 'Medicine Timing', desc: 'Take antibiotics at evenly spaced intervals for best effectiveness.', icon: 'clock-outline', color: '#8B5CF6' },
  { id: 3, title: 'Food Interactions', desc: 'Avoid grapefruit with statins — it can increase side-effect risk.', icon: 'food-apple-outline', color: '#F59E0B' },
];

const MOCK_SPENDING = {
  labels: ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar'],
  data: [120, 95, 150, 110, 135, 165],
};
// ────────────────────────────────────────────────────────────────────────────────

const StatCard = ({ title, value, icon, color, subtitle }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.statCard}>
      <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
        <Icon name={icon} size={24} color={color} />
      </View>
      <View>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
        {subtitle ? <Text style={styles.statSubtitle}>{subtitle}</Text> : null}
      </View>
    </View>
  );
};

const OrderCard = ({ order, onPress }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderId}>{order.id}</Text>
        <View style={[styles.statusBadge, { backgroundColor: `${order.color}20` }]}>
          <Text style={[styles.statusText, { color: order.color }]}>{order.status}</Text>
        </View>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.orderMeta}>{order.date} · {order.items} items</Text>
        <Text style={styles.orderTotal}>{order.total}</Text>
      </View>
    </TouchableOpacity>
  );
};

const PrescriptionCard = ({ rx }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.rxCard}>
      <View style={styles.rxHeader}>
        <Icon name="prescription" size={20} color={theme.primary} />
        <Text style={styles.rxId}>{rx.id}</Text>
      </View>
      <Text style={styles.rxMedicine}>{rx.medicine}</Text>
      <Text style={styles.rxDoctor}>{rx.doctor}</Text>
      <View style={styles.rxDetails}>
        <View style={styles.rxDetailItem}>
          <Icon name="clock-outline" size={14} color={theme.textSecondary} />
          <Text style={styles.rxDetailText}>{rx.dosage}</Text>
        </View>
        <View style={styles.rxDetailItem}>
          <Icon name="refresh" size={14} color={theme.textSecondary} />
          <Text style={styles.rxDetailText}>{rx.refillsLeft} refills left</Text>
        </View>
      </View>
      <View style={styles.rxExpiry}>
        <Icon name="calendar-clock" size={14} color={theme.warning} />
        <Text style={styles.rxExpiryText}>Expires in {rx.expiresIn}</Text>
      </View>
    </View>
  );
};

const RefillCard = ({ refill }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const urgencyColor = refill.urgency === 'high' ? theme.error : refill.urgency === 'medium' ? theme.warning : theme.success;
  return (
    <View style={styles.refillCard}>
      <View style={[styles.refillUrgencyBar, { backgroundColor: urgencyColor }]} />
      <View style={styles.refillContent}>
        <Text style={styles.refillMedicine}>{refill.medicine}</Text>
        <Text style={styles.refillDate}>Due: {refill.dueDate}</Text>
      </View>
      <View style={[styles.refillBadge, { backgroundColor: `${urgencyColor}20` }]}>
        <Text style={[styles.refillDays, { color: urgencyColor }]}>{refill.daysLeft}d</Text>
      </View>
    </View>
  );
};

const HealthTipCard = ({ tip }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.tipCard}>
      <View style={[styles.tipIcon, { backgroundColor: `${tip.color}15` }]}>
        <Icon name={tip.icon} size={22} color={tip.color} />
      </View>
      <View style={styles.tipContent}>
        <Text style={styles.tipTitle}>{tip.title}</Text>
        <Text style={styles.tipDesc}>{tip.desc}</Text>
      </View>
    </View>
  );
};

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    totalSpent: '$0',
    activeOrders: '0',
    prescriptions: '0',
    refillsDue: '0'
  });
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const fetchStats = async () => {
    try {
      // Simulated for demo — replace with real API calls
      setTimeout(() => {
        setStats({
          totalSpent: '$775',
          activeOrders: '2',
          prescriptions: '3',
          refillsDue: '3'
        });
      }, 600);
    } catch (error) {
      console.log(error);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStats().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchStats();

    let socket;
    try {
      const io = require('socket.io-client').default || require('socket.io-client');
      socket = io(getSocketUrl());

      socket.on('connect', () => {
        console.log('Socket connected');
        if (user?.role) socket.emit('join-role', user.role);
      });

      socket.on('order-status', (data) => {
        Alert.alert('Order Update', `Order #${data.orderId} is now ${data.status}`);
        fetchStats();
      });
    } catch (e) {
      console.log('Socket init skipped', e.message);
    }

    return () => { socket?.disconnect?.(); };
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'} 👋</Text>
          <Text style={styles.subGreeting}>Here's your health summary</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <Icon name="account-circle" size={40} color={theme.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* ── Stat Cards ── */}
        <View style={styles.statsGrid}>
          <StatCard title="Total Spent" value={stats.totalSpent} icon="wallet-outline" color={theme.success} subtitle="Last 6 months" />
          <StatCard title="Active Orders" value={stats.activeOrders} icon="truck-delivery-outline" color={theme.info} />
          <StatCard title="Prescriptions" value={stats.prescriptions} icon="prescription" color={theme.primary} />
          <StatCard title="Refills Due" value={stats.refillsDue} icon="bell-ring-outline" color={theme.warning} />
        </View>

        {/* ── Spending Chart ── */}
        <CustomLineChart 
          title="Monthly Spending ($)"
          labels={MOCK_SPENDING.labels}
          data={MOCK_SPENDING.data}
          yAxisSuffix=""
        />

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Catalog')}>
            <View style={[styles.actionIcon, { backgroundColor: '#E0F2FE' }]}>
              <Icon name="plus" size={24} color="#0284C7" />
            </View>
            <Text style={styles.actionText}>New Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('HomeMedicine')}>
            <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="medical-bag" size={24} color="#16A34A" />
            </View>
            <Text style={styles.actionText}>Cabinet</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Orders')}>
            <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="history" size={24} color="#D97706" />
            </View>
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('SymptomChecker')}>
            <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
              <Icon name="stethoscope" size={24} color="#9333EA" />
            </View>
            <Text style={styles.actionText}>Symptoms</Text>
          </TouchableOpacity>
        </View>

        {/* ── Recent Orders ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Orders')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        {MOCK_RECENT_ORDERS.map((order) => (
          <OrderCard key={order.id} order={order} onPress={() => navigation.navigate('Orders')} />
        ))}

        {/* ── Active Prescriptions ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Prescriptions</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Prescriptions')}>
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
          {MOCK_PRESCRIPTIONS.map((rx) => (
            <PrescriptionCard key={rx.id} rx={rx} />
          ))}
        </ScrollView>

        {/* ── Upcoming Refills ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Refills</Text>
        </View>
        {MOCK_UPCOMING_REFILLS.map((refill, idx) => (
          <RefillCard key={idx} refill={refill} />
        ))}

        {/* ── Health Tips ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Tips</Text>
        </View>
        {MOCK_HEALTH_TIPS.map((tip) => (
          <HealthTipCard key={tip.id} tip={tip} />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: theme.surface,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  subGreeting: {
    fontSize: 14,
    color: theme.textSecondary,
    marginTop: 2,
  },
  profileButton: {},
  avatar: { width: 40, height: 40, borderRadius: 20 },
  content: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
    alignSelf: 'flex-start',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  statTitle: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  statSubtitle: {
    fontSize: 10,
    color: theme.textTertiary,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  seeAll: {
    fontSize: 14,
    color: theme.primary,
    fontWeight: '600',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  actionButton: {
    alignItems: 'center',
    width: '22%',
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionText: {
    fontSize: 12,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  orderCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderMeta: {
    fontSize: 13,
    color: theme.textSecondary,
  },
  orderTotal: {
    fontSize: 15,
    fontWeight: '700',
    color: theme.textPrimary,
  },
  horizontalScroll: {
    marginBottom: 4,
  },
  rxCard: {
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 16,
    marginRight: 14,
    width: 260,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  rxHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  rxId: {
    fontSize: 12,
    color: theme.textSecondary,
    marginLeft: 6,
    fontWeight: '600',
  },
  rxMedicine: {
    fontSize: 16,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  rxDoctor: {
    fontSize: 13,
    color: theme.textSecondary,
    marginBottom: 10,
  },
  rxDetails: {
    marginBottom: 8,
  },
  rxDetailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  rxDetailText: {
    fontSize: 12,
    color: theme.textSecondary,
    marginLeft: 6,
  },
  rxExpiry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: theme.border,
  },
  rxExpiryText: {
    fontSize: 12,
    color: theme.warning,
    marginLeft: 6,
    fontWeight: '600',
  },
  refillCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderRadius: 12,
    marginBottom: 10,
    overflow: 'hidden',
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  refillUrgencyBar: {
    width: 4,
    alignSelf: 'stretch',
  },
  refillContent: {
    flex: 1,
    padding: 14,
  },
  refillMedicine: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.textPrimary,
  },
  refillDate: {
    fontSize: 12,
    color: theme.textSecondary,
    marginTop: 2,
  },
  refillBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginRight: 14,
  },
  refillDays: {
    fontSize: 14,
    fontWeight: '700',
  },
  tipCard: {
    flexDirection: 'row',
    backgroundColor: theme.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
  },
  tipIcon: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: theme.textPrimary,
    marginBottom: 4,
  },
  tipDesc: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 18,
  },
});
