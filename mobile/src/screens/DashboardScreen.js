import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Platform,
<<<<<<< HEAD
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as SecureStore from "../utils/storage";
import {
  ordersAPI,
  prescriptionsAPI,
  homeMedicinesAPI,
} from "../services/mobileApi";
=======
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { ordersAPI, prescriptionsAPI, homeMedicinesAPI } from '../services/mobileApi';
import * as SecureStore from '../utils/storage';
>>>>>>> 8a0117a (Rebase and fixes functionality)

// Derive socket URL from Expo debugger host (same approach as api.js)
const getSocketUrl = () => {
  try {
    const debuggerHost =
      Constants.expoGoConfig?.debuggerHost ??
      Constants.expoConfig?.hostUri ??
      Constants.manifest?.debuggerHost ??
      Constants.manifest?.hostUri;
    if (debuggerHost) return `http://${debuggerHost.split(":")[0]}:5005`;
  } catch {
    /* ignore */
  }
  return Platform.OS === "android"
    ? "http://10.0.2.2:5005"
    : "http://localhost:5005";
};

<<<<<<< HEAD
const HEALTH_TIPS = [
  {
    id: 1,
    title: "Stay Hydrated",
    desc: "Drink at least 8 glasses of water daily to help your medications absorb properly.",
    icon: "water",
    color: "#0EA5E9",
  },
  {
    id: 2,
    title: "Medicine Timing",
    desc: "Take antibiotics at evenly spaced intervals for best effectiveness.",
    icon: "clock-outline",
    color: "#8B5CF6",
  },
  {
    id: 3,
    title: "Food Interactions",
    desc: "Avoid grapefruit with statins — it can increase side-effect risk.",
    icon: "food-apple-outline",
    color: "#F59E0B",
  },
=======
// ── Static Health Tips (generic advice, not API data) ───────────────────────
const HEALTH_TIPS = [
  { id: 1, title: 'Stay Hydrated', desc: 'Drink at least 8 glasses of water daily to help your medications absorb properly.', icon: 'water', color: '#0EA5E9' },
  { id: 2, title: 'Medicine Timing', desc: 'Take antibiotics at evenly spaced intervals for best effectiveness.', icon: 'clock-outline', color: '#8B5CF6' },
  { id: 3, title: 'Food Interactions', desc: 'Avoid grapefruit with statins — it can increase side-effect risk.', icon: 'food-apple-outline', color: '#F59E0B' },
>>>>>>> 8a0117a (Rebase and fixes functionality)
];
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
        <View
          style={[styles.statusBadge, { backgroundColor: `${order.color}20` }]}
        >
          <Text style={[styles.statusText, { color: order.color }]}>
            {order.status}
          </Text>
        </View>
      </View>
      <View style={styles.orderFooter}>
        <Text style={styles.orderMeta}>
          {order.date} · {order.items} items
        </Text>
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
      <Text style={styles.rxMedicine}>{rx.status}</Text>
      {rx.note ? <Text style={styles.rxDoctor}>{rx.note}</Text> : null}
      <View style={styles.rxExpiry}>
        <Icon name="calendar-clock" size={14} color={theme.textSecondary} />
        <Text style={styles.rxExpiryText}>Uploaded: {rx.uploadDate}</Text>
      </View>
    </View>
  );
};

const RefillCard = ({ refill }) => {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const urgencyColor =
    refill.urgency === "high"
      ? theme.error
      : refill.urgency === "medium"
        ? theme.warning
        : theme.success;
  return (
    <View style={styles.refillCard}>
      <View
        style={[styles.refillUrgencyBar, { backgroundColor: urgencyColor }]}
      />
      <View style={styles.refillContent}>
        <Text style={styles.refillMedicine}>{refill.medicine}</Text>
        <Text style={styles.refillDate}>Expires: {refill.dueDate}</Text>
      </View>
      <View
        style={[styles.refillBadge, { backgroundColor: `${urgencyColor}20` }]}
      >
        <Text style={[styles.refillDays, { color: urgencyColor }]}>
          {refill.daysLeft}d
        </Text>
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
<<<<<<< HEAD
    totalSpent: "₹0",
    activeOrders: "0",
    prescriptions: "0",
    refillsDue: "0",
=======
    totalSpent: '₹0',
    activeOrders: '0',
    prescriptions: '0',
    refillsDue: '0'
>>>>>>> 8a0117a (Rebase and fixes functionality)
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [activePrescriptions, setActivePrescriptions] = useState([]);
  const [expiringMedicines, setExpiringMedicines] = useState([]);
  const { theme } = useTheme();
  const styles = createStyles(theme);

<<<<<<< HEAD
  const fetchDashboardData = useCallback(async () => {
=======
  const fetchDashboardData = async () => {
>>>>>>> 8a0117a (Rebase and fixes functionality)
    try {
      const [ordersRes, rxRes, homeMedRes] = await Promise.all([
        ordersAPI.getAll({ limit: 50 }),
        prescriptionsAPI.getAll(),
<<<<<<< HEAD
        homeMedicinesAPI.getAll(),
=======
        homeMedicinesAPI.getAll().catch(() => ({ data: { data: { medicines: [] } } }))
>>>>>>> 8a0117a (Rebase and fixes functionality)
      ]);

      const orders = ordersRes.data.data?.orders || [];
      const prescriptions = rxRes.data.data?.prescriptions || [];
      const homeMeds = homeMedRes.data.data?.medicines || [];

<<<<<<< HEAD
      const totalSpent = orders.reduce(
        (sum, o) => sum + (o.total || o.totalAmount || 0),
        0,
      );
      const activeOrders = orders.filter((o) =>
        ["pending", "confirmed", "processing", "dispatched"].includes(o.status),
      );
      const expiringMeds = homeMeds.filter(
        (m) => m.daysUntilExpiry <= 30 && m.daysUntilExpiry > 0,
      );

      setStats({
        totalSpent: "₹" + totalSpent.toLocaleString("en-IN"),
        activeOrders: String(activeOrders.length),
        prescriptions: String(prescriptions.length),
        refillsDue: String(expiringMeds.length),
      });

      setRecentOrders(
        orders.slice(0, 3).map((o) => ({
          id: o.orderNumber || (o._id ? o._id.slice(-8).toUpperCase() : ""),
          date: o.createdAt
            ? new Date(o.createdAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "",
          status: o.status
            ? o.status.charAt(0).toUpperCase() + o.status.slice(1)
            : "Pending",
          total: "₹" + (o.total || o.totalAmount || 0).toLocaleString("en-IN"),
          items: o.items?.length || 0,
          color:
            o.status === "delivered"
              ? "#22c55e"
              : o.status === "dispatched"
                ? "#3b82f6"
                : "#f59e0b",
        })),
      );

      setActivePrescriptions(
        prescriptions
          .filter((p) => p.status === "approved")
          .slice(0, 3)
          .map((p) => {
            const daysToExpiry = p.validUntil
              ? Math.ceil(
                  (new Date(p.validUntil).getTime() - Date.now()) / 86400000,
                )
              : null;
            return {
              id:
                p.prescriptionNumber ||
                (p._id ? p._id.slice(-6).toUpperCase() : ""),
              uploadDate: p.createdAt
                ? new Date(p.createdAt).toLocaleDateString("en-IN")
                : "",
              status: p.status,
              note: p.pharmacistNote || p.notes || "",
              medicine: p.medicines?.[0]?.name || "Prescription",
              doctor: p.doctorName || "Doctor",
              dosage:
                p.medicines?.[0]?.dosage ||
                p.medicines?.[0]?.instructions ||
                "",
              refillsLeft: p.refillsLeft ?? p.refills ?? 0,
              expiresIn:
                daysToExpiry != null ? `${daysToExpiry} days` : "No expiry",
            };
          }),
      );

      setExpiringMedicines(
        expiringMeds.slice(0, 3).map((m) => ({
          medicine: m.name,
          dueDate: m.expiryDate
            ? new Date(m.expiryDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : "Soon",
          daysLeft: m.daysUntilExpiry,
          urgency:
            m.daysUntilExpiry <= 7
              ? "high"
              : m.daysUntilExpiry <= 15
                ? "medium"
                : "low",
        })),
      );
    } catch (error) {
      console.error(
        "Dashboard fetch failed:",
        error?.response?.data?.message || error.message,
      );
=======
      // Stats
      const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
      const activeOrders = orders.filter(o => ['pending', 'confirmed', 'processing', 'dispatched'].includes(o.status));
      const pendingRx = prescriptions.filter(p => p.status === 'pending');
      const expiringMeds = homeMeds.filter(m => m.daysUntilExpiry <= 30 && m.daysUntilExpiry > 0);

      setStats({
        totalSpent: '₹' + totalSpent.toLocaleString('en-IN'),
        activeOrders: String(activeOrders.length),
        prescriptions: String(prescriptions.length),
        refillsDue: String(expiringMeds.length)
      });

      setRecentOrders(orders.slice(0, 3).map(o => ({
        id: o.orderNumber || o._id?.slice(-8),
        date: new Date(o.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        status: o.status.charAt(0).toUpperCase() + o.status.slice(1),
        total: '₹' + (o.total || 0).toLocaleString('en-IN'),
        items: o.items?.length || 0,
        color: o.status === 'delivered' ? '#22c55e' : o.status === 'dispatched' ? '#3b82f6' : '#f59e0b'
      })));

      setActivePrescriptions(prescriptions.filter(p => p.status === 'approved').slice(0, 3).map(p => ({
        id: p.prescriptionNumber || p._id.slice(-6).toUpperCase(),
        uploadDate: new Date(p.createdAt).toLocaleDateString(),
        status: p.status,
        note: p.pharmacistNote || ''
      })));

      setExpiringMedicines(expiringMeds.slice(0, 3).map(m => ({
        medicine: m.name,
        dueDate: new Date(m.expiryDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        daysLeft: m.daysUntilExpiry,
        urgency: m.daysUntilExpiry <= 7 ? 'high' : m.daysUntilExpiry <= 15 ? 'medium' : 'low'
      })));
    } catch (error) {
      if (__DEV__) console.error('Dashboard fetch failed:', error?.response?.data?.message || error.message);
>>>>>>> 8a0117a (Rebase and fixes functionality)
    }
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
<<<<<<< HEAD
    fetchDashboardData().finally(() => setRefreshing(false));
  }, [fetchDashboardData]);

  useEffect(() => {
    let socket;

    const init = async () => {
      await fetchDashboardData();

      try {
        const io =
          require("socket.io-client").default || require("socket.io-client");
        const token = await SecureStore.getItemAsync("userToken");
        socket = io(getSocketUrl(), { auth: { token } });
=======
    fetchDashboardData().then(() => setRefreshing(false));
  }, []);

  useEffect(() => {
    fetchDashboardData();

    let socket;
    (async () => {
      try {
        const io = require('socket.io-client').default || require('socket.io-client');
        const token = await SecureStore.getItemAsync('userToken');
        socket = io(getSocketUrl(), { auth: { token } });

        socket.on('connect', () => {
          if (__DEV__) console.log('Socket connected');
          if (user?.role) socket.emit('join-role', user.role);
        });

        socket.on('order-status', (data) => {
          Alert.alert('Order Update', `Order #${data.orderId} is now ${data.status}`);
          fetchDashboardData();
        });
      } catch (e) {
        if (__DEV__) console.log('Socket init skipped', e.message);
      }
    })();
>>>>>>> 8a0117a (Rebase and fixes functionality)

        socket.on("connect", () => {
          if (user?.role) socket.emit("join-role", user.role);
        });

        socket.on("order-status", (data) => {
          Alert.alert(
            "Order Update",
            `Order #${data.orderId} is now ${data.status}`,
          );
          fetchDashboardData();
        });
      } catch (e) {
        console.log("Socket init skipped", e.message);
      }
    };

    init();

    return () => {
      socket?.disconnect?.();
    };
  }, [fetchDashboardData, user]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.name || "User"} 👋</Text>
          <Text style={styles.subGreeting}>Here's your health summary</Text>
        </View>
        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate("Profile")}
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
<<<<<<< HEAD
          <StatCard
            title="Total Spent"
            value={stats.totalSpent}
            icon="wallet-outline"
            color={theme.success}
            subtitle="Last 6 months"
          />
          <StatCard
            title="Active Orders"
            value={stats.activeOrders}
            icon="truck-delivery-outline"
            color={theme.info}
          />
          <StatCard
            title="Prescriptions"
            value={stats.prescriptions}
            icon="prescription"
            color={theme.primary}
          />
          <StatCard
            title="Refills Due"
            value={stats.refillsDue}
            icon="bell-ring-outline"
            color={theme.warning}
          />
=======
          <StatCard title="Total Spent" value={stats.totalSpent} icon="wallet-outline" color={theme.success} subtitle="All orders" />
          <StatCard title="Active Orders" value={stats.activeOrders} icon="truck-delivery-outline" color={theme.info} />
          <StatCard title="Prescriptions" value={stats.prescriptions} icon="prescription" color={theme.primary} />
          <StatCard title="Expiring Meds" value={stats.refillsDue} icon="bell-ring-outline" color={theme.warning} />
>>>>>>> 8a0117a (Rebase and fixes functionality)
        </View>

        {/* ── Quick Actions ── */}
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Main", { screen: "Catalog" })}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#E0F2FE" }]}>
              <Icon name="plus" size={24} color="#0284C7" />
            </View>
            <Text style={styles.actionText}>New Order</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("HomeMedicine")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#DCFCE7" }]}>
              <Icon name="medical-bag" size={24} color="#16A34A" />
            </View>
            <Text style={styles.actionText}>Cabinet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("Main", { screen: "Orders" })}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#FEF3C7" }]}>
              <Icon name="history" size={24} color="#D97706" />
            </View>
            <Text style={styles.actionText}>History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate("SymptomChecker")}
          >
            <View style={[styles.actionIcon, { backgroundColor: "#F3E8FF" }]}>
              <Icon name="stethoscope" size={24} color="#9333EA" />
            </View>
            <Text style={styles.actionText}>Symptoms</Text>
          </TouchableOpacity>
        </View>

        {/* ── Recent Orders ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          <TouchableOpacity
            onPress={() => navigation.navigate("Main", { screen: "Orders" })}
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
<<<<<<< HEAD
        {recentOrders.map((order) => (
          <OrderCard
            key={order.id}
            order={order}
            onPress={() => navigation.navigate("Main", { screen: "Orders" })}
          />
        ))}
        {recentOrders.length === 0 && (
          <Text style={{ color: theme.textSecondary }}>
            No recent orders yet.
          </Text>
=======
        {recentOrders.length > 0 ? recentOrders.map((order) => (
          <OrderCard key={order.id} order={order} onPress={() => navigation.navigate('Orders')} />
        )) : (
          <View style={styles.emptyCard}>
            <Icon name="package-variant" size={32} color={theme.textSecondary} />
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
>>>>>>> 8a0117a (Rebase and fixes functionality)
        )}

        {/* ── Active Prescriptions ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Active Prescriptions</Text>
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Main", { screen: "Prescriptions" })
            }
          >
            <Text style={styles.seeAll}>See All</Text>
          </TouchableOpacity>
        </View>
<<<<<<< HEAD
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.horizontalScroll}
        >
          {activePrescriptions.map((rx) => (
            <PrescriptionCard key={rx.id} rx={rx} />
          ))}
        </ScrollView>
        {activePrescriptions.length === 0 && (
          <Text style={{ color: theme.textSecondary, marginTop: 4 }}>
            No active prescriptions.
          </Text>
        )}

        {/* ── Upcoming Refills ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Upcoming Refills</Text>
        </View>
        {expiringMedicines.map((refill, idx) => (
          <RefillCard key={idx} refill={refill} />
        ))}
        {expiringMedicines.length === 0 && (
          <Text style={{ color: theme.textSecondary }}>
            No upcoming refills.
          </Text>
=======
        {activePrescriptions.length > 0 ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
            {activePrescriptions.map((rx) => (
              <PrescriptionCard key={rx.id} rx={rx} />
            ))}
          </ScrollView>
        ) : (
          <View style={styles.emptyCard}>
            <Icon name="prescription" size={32} color={theme.textSecondary} />
            <Text style={styles.emptyText}>No active prescriptions</Text>
          </View>
        )}

        {/* ── Expiring Medicines ── */}
        {expiringMedicines.length > 0 && (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Expiring Soon</Text>
            </View>
            {expiringMedicines.map((refill, idx) => (
              <RefillCard key={idx} refill={refill} />
            ))}
          </>
>>>>>>> 8a0117a (Rebase and fixes functionality)
        )}

        {/* ── Health Tips ── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Health Tips</Text>
        </View>
        {HEALTH_TIPS.map((tip) => (
          <HealthTipCard key={tip.id} tip={tip} />
        ))}

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

<<<<<<< HEAD
const createStyles = (theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: theme.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    greeting: {
      fontSize: 20,
      fontWeight: "bold",
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
      flexDirection: "row",
      flexWrap: "wrap",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    statCard: {
      width: "48%",
      backgroundColor: theme.surface,
      padding: 16,
      borderRadius: 16,
      marginBottom: 12,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    iconContainer: {
      padding: 8,
      borderRadius: 8,
      marginBottom: 10,
      alignSelf: "flex-start",
    },
    statValue: {
      fontSize: 20,
      fontWeight: "bold",
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
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 20,
      marginBottom: 12,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.textPrimary,
    },
    seeAll: {
      fontSize: 14,
      color: theme.primary,
      fontWeight: "600",
    },
    actionsContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    actionButton: {
      alignItems: "center",
      width: "22%",
    },
    actionIcon: {
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 8,
    },
    actionText: {
      fontSize: 12,
      color: theme.textSecondary,
      textAlign: "center",
    },
    orderCard: {
      backgroundColor: theme.surface,
      borderRadius: 14,
      padding: 16,
      marginBottom: 10,
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    orderId: {
      fontSize: 15,
      fontWeight: "700",
      color: theme.textPrimary,
    },
    statusBadge: {
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 12,
      fontWeight: "600",
    },
    orderFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    orderMeta: {
      fontSize: 13,
      color: theme.textSecondary,
    },
    orderTotal: {
      fontSize: 15,
      fontWeight: "700",
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
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    rxHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 8,
    },
    rxId: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 6,
      fontWeight: "600",
    },
    rxMedicine: {
      fontSize: 16,
      fontWeight: "700",
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
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 4,
    },
    rxDetailText: {
      fontSize: 12,
      color: theme.textSecondary,
      marginLeft: 6,
    },
    rxExpiry: {
      flexDirection: "row",
      alignItems: "center",
      paddingTop: 8,
      borderTopWidth: 1,
      borderTopColor: theme.border,
    },
    rxExpiryText: {
      fontSize: 12,
      color: theme.warning,
      marginLeft: 6,
      fontWeight: "600",
    },
    refillCard: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.surface,
      borderRadius: 12,
      marginBottom: 10,
      overflow: "hidden",
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    refillUrgencyBar: {
      width: 4,
      alignSelf: "stretch",
    },
    refillContent: {
      flex: 1,
      padding: 14,
    },
    refillMedicine: {
      fontSize: 14,
      fontWeight: "600",
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
      fontWeight: "700",
    },
    tipCard: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: 14,
      padding: 14,
      marginBottom: 10,
      elevation: 1,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.06,
      shadowRadius: 3,
    },
    tipIcon: {
      width: 44,
      height: 44,
      borderRadius: 12,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 14,
    },
    tipContent: {
      flex: 1,
    },
    tipTitle: {
      fontSize: 14,
      fontWeight: "700",
      color: theme.textPrimary,
      marginBottom: 4,
    },
    tipDesc: {
      fontSize: 12,
      color: theme.textSecondary,
      lineHeight: 18,
    },
  });
=======
const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 16, backgroundColor: theme.surface, borderBottomWidth: 1, borderBottomColor: theme.border },
  greeting: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary },
  subGreeting: { fontSize: 14, color: theme.textSecondary, marginTop: 2 },
  profileButton: {},
  avatar: { width: 40, height: 40, borderRadius: 20 },
  content: { padding: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  statCard: { width: '48%', backgroundColor: theme.surface, padding: 16, borderRadius: 16, marginBottom: 12, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  iconContainer: { padding: 8, borderRadius: 8, marginBottom: 10, alignSelf: 'flex-start' },
  statValue: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary },
  statTitle: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  statSubtitle: { fontSize: 10, color: theme.textTertiary, marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textPrimary },
  seeAll: { fontSize: 14, color: theme.primary, fontWeight: '600' },
  actionsContainer: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  actionButton: { alignItems: 'center', width: '22%' },
  actionIcon: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  actionText: { fontSize: 12, color: theme.textSecondary, textAlign: 'center' },
  orderCard: { backgroundColor: theme.surface, borderRadius: 14, padding: 16, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  orderId: { fontSize: 15, fontWeight: '700', color: theme.textPrimary },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { fontSize: 12, fontWeight: '600' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderMeta: { fontSize: 13, color: theme.textSecondary },
  orderTotal: { fontSize: 15, fontWeight: '700', color: theme.textPrimary },
  horizontalScroll: { marginBottom: 4 },
  rxCard: { backgroundColor: theme.surface, borderRadius: 14, padding: 16, marginRight: 14, width: 260, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  rxHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  rxId: { fontSize: 12, color: theme.textSecondary, marginLeft: 6, fontWeight: '600' },
  rxMedicine: { fontSize: 16, fontWeight: '700', color: theme.textPrimary, marginBottom: 4 },
  rxDoctor: { fontSize: 13, color: theme.textSecondary, marginBottom: 10 },
  rxExpiry: { flexDirection: 'row', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: theme.border },
  rxExpiryText: { fontSize: 12, color: theme.textSecondary, marginLeft: 6, fontWeight: '600' },
  refillCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.surface, borderRadius: 12, marginBottom: 10, overflow: 'hidden', elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  refillUrgencyBar: { width: 4, alignSelf: 'stretch' },
  refillContent: { flex: 1, padding: 14 },
  refillMedicine: { fontSize: 14, fontWeight: '600', color: theme.textPrimary },
  refillDate: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  refillBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, marginRight: 14 },
  refillDays: { fontSize: 14, fontWeight: '700' },
  tipCard: { flexDirection: 'row', backgroundColor: theme.surface, borderRadius: 14, padding: 14, marginBottom: 10, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 3 },
  tipIcon: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  tipContent: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginBottom: 4 },
  tipDesc: { fontSize: 12, color: theme.textSecondary, lineHeight: 18 },
  emptyCard: { backgroundColor: theme.surface, borderRadius: 14, padding: 24, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  emptyText: { fontSize: 13, color: theme.textSecondary, marginTop: 8 },
});
>>>>>>> 8a0117a (Rebase and fixes functionality)
