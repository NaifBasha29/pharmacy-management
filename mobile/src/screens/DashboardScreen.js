import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  RefreshControl 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { CustomLineChart } from '../components/CustomChart';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { SERVER_URL } from '../config/api';
import { analyticsAPI } from '../services/mobileApi';
import io from 'socket.io-client';

const SOCKET_URL = SERVER_URL;


const StatCard = ({ title, value, icon, color }) => (
  <View style={styles.statCard}>
    <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statTitle}>{title}</Text>
    </View>
  </View>
);

export default function DashboardScreen({ navigation }) {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState({
    sales: '0',
    orders: '0',
    medicines: '0',
    alerts: '0'
  });

  const fetchStats = async () => {
    try {
      const dashboardRes = await analyticsAPI.getDashboard();
      if (dashboardRes.data.success) {
        setStats(dashboardRes.data.data);
      } else {
        // Fallback or specific error handling
         console.warn("Failed to fetch dashboard stats", dashboardRes.data.message);
      }
    } catch (error) {
      console.log("Error fetching stats:", error);
      // Optional: keep simulated data for dev/demo if API fails
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchStats().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchStats();

    // Socket connection
    const socket = io(SOCKET_URL);
    
    socket.on('connect_error', (err) => {
      console.log('Socket connection error:', err);
    });

    socket.on('connect', () => {
      console.log('Socket connected');
      if (user?.role) {
        socket.emit('join-role', user.role);
      }
    });

    socket.on('stock-notification', (data) => {
      Alert.alert('Low Stock Alert', `${data.medicineName} is running low! Current stock: ${data.currentStock}`);
      // Refresh stats if needed
      fetchStats();
    });

    socket.on('order-status', (data) => {
      Alert.alert('Order Update', `Order #${data.orderId} is now ${data.status}`);
      fetchStats();
    });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || 'User'}</Text>
          <Text style={styles.subGreeting}>Here's what's happening today</Text>
        </View>
        <TouchableOpacity 
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          {user?.avatar ? (
            <Image source={{ uri: user.avatar }} style={styles.avatar} />
          ) : (
            <Icon name="account-circle" size={40} color={colors.primary} />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.statsGrid}>
          <StatCard 
            title="Total Sales" 
            value={stats.sales} 
            icon="currency-usd" 
            color={colors.success} 
          />
          <StatCard 
            title="Active Orders" 
            value={stats.orders} 
            icon="cart-outline" 
            color={colors.info} 
          />
          <StatCard 
            title="Medicines" 
            value={stats.medicines} 
            icon="pill" 
            color={colors.primary} 
          />
          <StatCard 
            title="Low Stock" 
            value={stats.alerts} 
            icon="alert-circle-outline" 
            color={colors.warning} 
          />
        </View>

        <CustomLineChart 
          title="Sales Overview"
          labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
          data={[20, 45, 28, 80, 99, 43, 50]}
          yAxisSuffix="k"
        />

        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#E0F2FE' }]}>
              <Icon name="plus" size={24} color="#0284C7" />
            </View>
            <Text style={styles.actionText}>New Order</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#DCFCE7' }]}>
              <Icon name="medical-bag" size={24} color="#16A34A" />
            </View>
            <Text style={styles.actionText}>Add Details</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#FEF3C7' }]}>
              <Icon name="history" size={24} color="#D97706" />
            </View>
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={[styles.actionIcon, { backgroundColor: '#F3E8FF' }]}>
              <Icon name="file-document-outline" size={24} color="#9333EA" />
            </View>
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  subGreeting: {
    fontSize: 14,
    color: colors.textSecondary,
  },
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
    backgroundColor: colors.surface,
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  iconContainer: {
    padding: 8,
    borderRadius: 8,
    marginBottom: 12,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  statTitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginTop: 16,
    marginBottom: 16,
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 4,
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
    color: colors.textSecondary,
    textAlign: 'center',
  }
});
