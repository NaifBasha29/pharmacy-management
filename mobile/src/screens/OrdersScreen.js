import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import api from "../config/api";

const STATUS_CONFIG = {
<<<<<<< HEAD
  pending: { color: "#f59e0b", icon: "clock-outline", label: "Pending" },
  confirmed: {
    color: "#3b82f6",
    icon: "check-circle-outline",
    label: "Confirmed",
  },
  processing: { color: "#8b5cf6", icon: "cog-outline", label: "Processing" },
  dispatched: {
    color: "#06b6d4",
    icon: "truck-delivery-outline",
    label: "Dispatched",
  },
  delivered: {
    color: "#10b981",
    icon: "package-variant-closed-check",
    label: "Delivered",
  },
  cancelled: {
    color: "#ef4444",
    icon: "close-circle-outline",
    label: "Cancelled",
  },
=======
  pending:    { color: '#d97706', bg: '#f59e0b20', icon: 'clock-outline',                label: 'Pending'    },
  confirmed:  { color: '#1d4ed8', bg: '#dbeafe',   icon: 'check-circle-outline',         label: 'Confirmed'  },
  processing: { color: '#4f46e5', bg: '#e0e7ff',   icon: 'cog-outline',                  label: 'Processing' },
  dispatched: { color: '#a855f7', bg: '#fae8ff',   icon: 'truck-delivery-outline',       label: 'Dispatched' },
  delivered:  { color: '#16a34a', bg: '#dcfce7',   icon: 'package-variant-closed-check', label: 'Delivered'  },
  cancelled:  { color: '#dc2626', bg: '#fee2e2',   icon: 'close-circle-outline',         label: 'Cancelled'  },
>>>>>>> 8a0117a (Rebase and fixes functionality)
};

const TABS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrdersScreen({ navigation }) {
  const { theme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await api.get("/orders");
      setOrders(res.data.data.orders || []);
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders().then(() => setRefreshing(false));
  }, []);

  const handleCancelOrder = (orderId) => {
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await api.put(`/orders/${orderId}/cancel`);
            fetchOrders();
          } catch (_) {
            Alert.alert("Error", "Failed to cancel order");
          }
        },
      },
    ]);
  };

  const filteredOrders = (() => {
    if (activeTab === "active")
      return orders.filter((o) =>
        ["pending", "confirmed", "processing", "dispatched"].includes(o.status),
      );
    if (activeTab === "completed")
      return orders.filter((o) => o.status === "delivered");
    if (activeTab === "cancelled")
      return orders.filter((o) => o.status === "cancelled");
    return orders;
  })();

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const renderOrderItem = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const canCancel = ["pending", "confirmed"].includes(item.status);

    return (
      <TouchableOpacity
        style={[
          s.card,
          { backgroundColor: theme.card, borderColor: theme.border },
        ]}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("OrderDetail", { orderId: item._id })
        }
      >
        <View style={s.cardTop}>
          <View style={s.cardLeft}>
            <Text style={[s.orderId, { color: theme.textPrimary }]}>
              #{item._id?.slice(-8).toUpperCase()}
            </Text>
            <Text style={[s.orderDate, { color: theme.textSecondary }]}>
              {item.createdAt ? formatDate(item.createdAt) : ""}
            </Text>
          </View>
          <View
            style={[s.statusBadge, { backgroundColor: status.color + "20" }]}
          >
            <Icon name={status.icon} size={13} color={status.color} />
            <Text style={[s.statusText, { color: status.color }]}>
              {status.label}
            </Text>
          </View>
        </View>

        <View style={[s.divider, { backgroundColor: theme.border }]} />

        <View style={s.cardMid}>
          <View style={s.itemsRow}>
            <Icon name="pill" size={16} color={theme.textTertiary} />
            <Text style={[s.itemCount, { color: theme.textSecondary }]}>
              {item.items?.length || 0} item
              {(item.items?.length || 0) !== 1 ? "s" : ""}
            </Text>
          </View>
          <Text style={[s.total, { color: theme.primary }]}>
<<<<<<< HEAD
            ₹{(item.totalAmount ?? item.total ?? 0).toLocaleString("en-IN")}
=======
            ₹{(item.totalAmount || item.total || 0).toLocaleString('en-IN')}
>>>>>>> 8a0117a (Rebase and fixes functionality)
          </Text>
        </View>

        {canCancel && (
          <TouchableOpacity
            style={[
              s.cancelBtn,
              { borderColor: "#ef444440", backgroundColor: "#ef444412" },
            ]}
            onPress={() => handleCancelOrder(item._id)}
            activeOpacity={0.8}
          >
            <Icon name="close-circle-outline" size={16} color="#ef4444" />
            <Text style={s.cancelBtnText}>Cancel Order</Text>
          </TouchableOpacity>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView
      style={[s.root, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <Text style={[s.title, { color: theme.textPrimary }]}>My Orders</Text>
        <View
          style={[
            s.countBadge,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Text style={[s.countText, { color: theme.textSecondary }]}>
            {orders.length}
          </Text>
        </View>
      </View>

      <View style={s.tabsRow}>
        {TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[
                s.tab,
                {
                  backgroundColor: isActive ? theme.primary : theme.card,
                  borderColor: isActive ? theme.primary : theme.border,
                },
              ]}
              onPress={() => setActiveTab(tab.key)}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  s.tabText,
                  { color: isActive ? "#fff" : theme.textSecondary },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {loading ? (
        <View style={s.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={s.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.primary}
            />
          }
          ListEmptyComponent={
            <View style={s.center}>
              <Icon
                name="package-variant"
                size={60}
                color={theme.textTertiary}
              />
              <Text style={[s.emptyTitle, { color: theme.textPrimary }]}>
                No orders found
              </Text>
              <Text style={[s.emptyDesc, { color: theme.textSecondary }]}>
                {activeTab === "all"
                  ? "Your order history will appear here"
                  : `No ${activeTab} orders`}
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: "800", lineHeight: 30 },
  countBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
  },
  countText: { fontSize: 13, fontWeight: "600" },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  tabText: { fontSize: 13, fontWeight: "600" },
  list: { padding: 16, paddingBottom: 120 },
  card: { borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1 },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  cardLeft: { gap: 4 },
  orderId: { fontSize: 15, fontWeight: "700", lineHeight: 20 },
  orderDate: { fontSize: 12, lineHeight: 16 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: { fontSize: 12, fontWeight: "600" },
  divider: { height: 1, marginVertical: 12 },
  cardMid: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemsRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  itemCount: { fontSize: 14, lineHeight: 20 },
  total: { fontSize: 20, fontWeight: "800", lineHeight: 26 },
  cancelBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  cancelBtnText: { color: "#ef4444", fontSize: 14, fontWeight: "600" },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 80,
    gap: 10,
  },
  emptyTitle: { fontSize: 18, fontWeight: "700", lineHeight: 24 },
  emptyDesc: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    paddingHorizontal: 32,
  },
});
