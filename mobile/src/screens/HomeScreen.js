import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import api from "../config/api";

const { width } = Dimensions.get("window");
const CARD_W = (width - 48) / 2;

const STATUS_COLOR = {
  delivered: "#10b981",
  completed: "#10b981",
  processing: "#3b82f6",
  confirmed: "#3b82f6",
  pending: "#f59e0b",
  dispatched: "#06b6d4",
  cancelled: "#ef4444",
};

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { theme, isDark } = useTheme();

  const firstName = user?.name?.split(" ")[0] || "there";
  const avatarLetter = (user?.name || "U").charAt(0).toUpperCase();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";

  const [statsData, setStatsData] = useState({
    total: 0,
    active: 0,
    completed: 0,
    prescriptions: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [ordersRes, prescriptionsRes, activityRes] =
          await Promise.allSettled([
            api.get("/orders/stats"),
            api.get("/prescriptions/stats"),
            api.get("/orders/recent?limit=3"),
          ]);
        if (ordersRes.status === "fulfilled") {
          const d = ordersRes.value.data.data;
          setStatsData((prev) => ({
            ...prev,
            total: d.total || 0,
            active: d.active || 0,
            completed: d.completed || 0,
          }));
        }
        if (prescriptionsRes.status === "fulfilled") {
          const d = prescriptionsRes.value.data.data;
          setStatsData((prev) => ({ ...prev, prescriptions: d.total || 0 }));
        }
        if (activityRes.status === "fulfilled") {
          setRecentActivity(activityRes.value.data.data.orders || []);
        }
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const STAT_CARDS = [
    {
      label: "Total Orders",
      value: statsData.total,
      icon: "package-variant",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.12)",
    },
    {
      label: "Active",
      value: statsData.active,
      icon: "clock-outline",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
    },
    {
      label: "Completed",
      value: statsData.completed,
      icon: "check-circle-outline",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
    },
    {
      label: "Prescriptions",
      value: statsData.prescriptions,
      icon: "file-document-outline",
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.12)",
    },
  ];

  const QUICK_ACTIONS = [
    {
      label: "Medicines",
      icon: "pill",
      screen: "Catalog",
      color: "#3b82f6",
      bg: "rgba(59,130,246,0.12)",
    },
    {
      label: "My Orders",
      icon: "package-variant",
      screen: "Orders",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
    },
    {
      label: "Rx Upload",
      icon: "file-document-outline",
      screen: "Prescriptions",
      color: "#8b5cf6",
      bg: "rgba(139,92,246,0.12)",
    },
    {
      label: "Profile",
      icon: "account-circle-outline",
      screen: "Profile",
      color: "#f97316",
      bg: "rgba(249,115,22,0.12)",
    },
  ];

  const tabScreens = new Set(["Catalog", "Orders", "Prescriptions"]);

  return (
    <SafeAreaView
      style={[s.root, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={theme.background}
      />

      <View
        style={[
          s.header,
          {
            backgroundColor: theme.background,
            borderBottomColor: theme.border,
          },
        ]}
      >
        <View style={s.headerLeft}>
          <View style={[s.avatar, { backgroundColor: theme.primary }]}>
            <Text style={s.avatarLetter}>{avatarLetter}</Text>
          </View>
          <View>
            <Text style={[s.greeting, { color: theme.textSecondary }]}>
              {greeting} 👋
            </Text>
            <Text
              style={[s.userName, { color: theme.textPrimary }]}
              numberOfLines={1}
            >
              {firstName}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          style={[
            s.bellBtn,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <Icon name="bell-outline" size={21} color={theme.textPrimary} />
          <View style={[s.bellDot, { backgroundColor: theme.primary }]} />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        <View style={[s.banner, { backgroundColor: theme.primary }]}>
          <View style={s.bannerLeft}>
            <Text style={s.bannerTitle}>💊 Pharma Care</Text>
            <Text style={s.bannerSub}>Your health, delivered fast</Text>
            <TouchableOpacity
              style={s.bannerBtn}
              onPress={() => navigation.navigate("Main", { screen: "Catalog" })}
              activeOpacity={0.85}
            >
              <Text style={[s.bannerBtnText, { color: theme.primary }]}>
                Shop Now
              </Text>
            </TouchableOpacity>
          </View>
          <Text style={s.bannerIcon}>🏥</Text>
        </View>

        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>
            Overview
          </Text>
          {loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginTop: 8 }} />
          ) : (
            <View style={s.grid}>
              {STAT_CARDS.map((card) => (
                <View
                  key={card.label}
                  style={[
                    s.statCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <View style={[s.statIcon, { backgroundColor: card.bg }]}>
                    <Icon name={card.icon} size={20} color={card.color} />
                  </View>
                  <Text style={[s.statValue, { color: theme.textPrimary }]}>
                    {card.value}
                  </Text>
                  <Text style={[s.statLabel, { color: theme.textSecondary }]}>
                    {card.label}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>
            Quick Access
          </Text>
          <View style={s.grid}>
            {QUICK_ACTIONS.map((action) => (
              <TouchableOpacity
                key={action.label}
                style={[
                  s.actionCard,
                  { backgroundColor: theme.card, borderColor: theme.border },
                ]}
                onPress={() =>
                  tabScreens.has(action.screen)
                    ? navigation.navigate("Main", { screen: action.screen })
                    : navigation.navigate(action.screen)
                }
                activeOpacity={0.8}
              >
                <View style={[s.actionIcon, { backgroundColor: action.bg }]}>
                  <Icon name={action.icon} size={26} color={action.color} />
                </View>
                <Text style={[s.actionLabel, { color: theme.textPrimary }]}>
                  {action.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={s.section}>
          <View style={s.rowBetween}>
            <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>
              Recent Orders
            </Text>
            <TouchableOpacity
              onPress={() => navigation.navigate("Main", { screen: "Orders" })}
              activeOpacity={0.7}
            >
              <Text style={[s.viewAll, { color: theme.primary }]}>
                View all
              </Text>
            </TouchableOpacity>
          </View>

          {loading ? (
            <ActivityIndicator color={theme.primary} style={{ marginTop: 8 }} />
          ) : recentActivity.length > 0 ? (
            recentActivity.map((order, i) => {
              const status = order.status || "pending";
              const sc = STATUS_COLOR[status] || theme.textSecondary;
              return (
                <View
                  key={order._id || i}
                  style={[
                    s.actRow,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                >
                  <View style={[s.actDot, { backgroundColor: sc }]} />
                  <View style={s.actInfo}>
                    <Text
                      style={[s.actName, { color: theme.textPrimary }]}
                      numberOfLines={1}
                    >
                      {order.items?.[0]?.name || order.medicineName || "Order"}
                    </Text>
                    <Text style={[s.actDate, { color: theme.textSecondary }]}>
                      {order.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : ""}
                    </Text>
                  </View>
                  <View style={[s.chip, { backgroundColor: sc + "22" }]}>
                    <Text style={[s.chipText, { color: sc }]}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </Text>
                  </View>
                </View>
              );
            })
          ) : (
            <View
              style={[
                s.emptyBox,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Icon
                name="package-variant-closed"
                size={44}
                color={theme.textTertiary}
              />
              <Text style={[s.emptyLabel, { color: theme.textSecondary }]}>
                No recent orders
              </Text>
              <TouchableOpacity
                style={[s.emptyBtn, { backgroundColor: theme.primary }]}
                onPress={() =>
                  navigation.navigate("Main", { screen: "Catalog" })
                }
                activeOpacity={0.85}
              >
                <Text style={s.emptyBtnText}>Browse Medicines</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        <View style={[s.section, { marginBottom: 32 }]}>
          <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>
            Health Tips
          </Text>
          {[
            {
              icon: "💧",
              title: "Stay Hydrated",
              desc: "Drink 8 glasses of water daily for optimal health.",
            },
            {
              icon: "💊",
              title: "Take Meds on Time",
              desc: "Consistency is key to effective medication.",
            },
            {
              icon: "🛏️",
              title: "Rest & Recover",
              desc: "Quality sleep boosts your immune system.",
            },
          ].map((tip) => (
            <View
              key={tip.title}
              style={[
                s.tipCard,
                { backgroundColor: theme.card, borderColor: theme.border },
              ]}
            >
              <Text style={s.tipIcon}>{tip.icon}</Text>
              <View style={s.tipBody}>
                <Text style={[s.tipTitle, { color: theme.textPrimary }]}>
                  {tip.title}
                </Text>
                <Text style={[s.tipDesc, { color: theme.textSecondary }]}>
                  {tip.desc}
                </Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
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
    paddingVertical: 14,
    borderBottomWidth: 1,
  },
  headerLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarLetter: { color: "#fff", fontSize: 18, fontWeight: "800" },
  greeting: { fontSize: 12, fontWeight: "500", lineHeight: 16 },
  userName: { fontSize: 17, fontWeight: "700", lineHeight: 22 },
  bellBtn: {
    width: 42,
    height: 42,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    position: "relative",
  },
  bellDot: {
    position: "absolute",
    top: 9,
    right: 9,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  scroll: { paddingBottom: 16 },
  banner: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    padding: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  bannerLeft: { flex: 1 },
  bannerTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    lineHeight: 26,
    marginBottom: 4,
  },
  bannerSub: {
    color: "rgba(255,255,255,0.85)",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  bannerBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 20,
  },
  bannerBtnText: { fontSize: 13, fontWeight: "700" },
  bannerIcon: { fontSize: 54, marginLeft: 10 },
  section: { paddingHorizontal: 16, marginTop: 24 },
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 12,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  viewAll: { fontSize: 13, fontWeight: "600" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  statCard: {
    width: CARD_W,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    gap: 8,
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  statValue: { fontSize: 26, fontWeight: "800", lineHeight: 32 },
  statLabel: { fontSize: 12, fontWeight: "500", lineHeight: 16 },
  actionCard: {
    width: CARD_W,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    alignItems: "center",
    gap: 10,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 18,
    textAlign: "center",
  },
  actRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  actDot: { width: 10, height: 10, borderRadius: 5 },
  actInfo: { flex: 1 },
  actName: { fontSize: 14, fontWeight: "600", lineHeight: 20 },
  actDate: { fontSize: 12, lineHeight: 16, marginTop: 2 },
  chip: { borderRadius: 8, paddingVertical: 4, paddingHorizontal: 10 },
  chipText: { fontSize: 12, fontWeight: "600" },
  emptyBox: {
    borderRadius: 16,
    padding: 32,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  emptyLabel: { fontSize: 14, fontWeight: "500", lineHeight: 20 },
  emptyBtn: {
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  emptyBtnText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  tipCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
  },
  tipIcon: { fontSize: 28 },
  tipBody: { flex: 1 },
  tipTitle: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginBottom: 4,
  },
  tipDesc: { fontSize: 13, lineHeight: 20 },
});
