import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { aiAPI } from "../services/mobileApi";

export default function RecommendationsScreen({ navigation }) {
  const [recommendations, setRecommendations] = useState([]);
  const [basedOn, setBasedOn] = useState("popular");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const fetchRecs = useCallback(async () => {
    try {
      const res = await aiAPI.recommendations();
      if (res.data.success) {
        setRecommendations(res.data.data.recommendations);
        setBasedOn(res.data.data.basedOn);
      }
    } catch (error) {
      console.log("Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchRecs();
  }, [fetchRecs]);

  const handleAddToCart = (med) => {
    if (med.stock <= 0) return;
    addToCart(med);
  };

  const renderItem = ({ item }) => {
    const discountedPrice = item.discount
      ? (item.price || 0) - ((item.price || 0) * item.discount) / 100
      : item.price || 0;

    return (
      <View style={styles.card}>
        <Image
          source={{
            uri: item.image || "https://via.placeholder.com/80?text=Rx",
          }}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {item.name}
          </Text>
          {item.dosageForm && (
            <Text style={styles.dosage}>
              {item.dosageForm} {item.strength || ""}
            </Text>
          )}
          {item.category?.name && (
            <Text style={styles.category}>{item.category.name}</Text>
          )}
          <View style={styles.priceRow}>
<<<<<<< HEAD
            <Text style={styles.price}>
              ₹{discountedPrice.toLocaleString("en-IN")}
            </Text>
            {item.discount > 0 && (
              <Text style={styles.oldPrice}>
                ₹{(item.price || 0).toLocaleString("en-IN")}
              </Text>
=======
            <Text style={styles.price}>₹{(discountedPrice || 0).toLocaleString('en-IN')}</Text>
            {item.discount > 0 && (
              <Text style={styles.oldPrice}>₹{(item.price || 0).toLocaleString('en-IN')}</Text>
>>>>>>> 8a0117a (Rebase and fixes functionality)
            )}
            {item.discount > 0 && (
              <View style={styles.discountBadge}>
                <Text style={styles.discountText}>{item.discount}% OFF</Text>
              </View>
            )}
          </View>
        </View>
        <TouchableOpacity
          style={[styles.addBtn, item.stock <= 0 && styles.disabledBtn]}
          onPress={() => handleAddToCart(item)}
          disabled={item.stock <= 0}
        >
          <Icon name="cart-plus" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Finding recommendations...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>For You</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.basedOnRow}>
        <Icon
          name={basedOn === "purchase_history" ? "history" : "trending-up"}
          size={16}
          color={theme.textSecondary}
        />
        <Text style={styles.basedOnText}>
          {basedOn === "purchase_history"
            ? "Based on your purchase history"
            : "Popular medicines"}
        </Text>
      </View>

      <FlatList
        data={recommendations}
        renderItem={renderItem}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchRecs();
            }}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.center}>
            <Icon
              name="thumb-up-outline"
              size={60}
              color={theme.textTertiary}
            />
            <Text style={styles.emptyText}>No recommendations yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    center: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      padding: 20,
    },
    loadingText: { color: theme.textSecondary, marginTop: 12, fontSize: 14 },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerTitle: { fontSize: 20, fontWeight: "bold", color: theme.textPrimary },
    basedOnRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      paddingHorizontal: 16,
      paddingTop: 12,
      paddingBottom: 4,
    },
    basedOnText: { fontSize: 13, color: theme.textSecondary },
    list: { padding: 16 },
    card: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: "center",
    },
    image: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: theme.inputBackground,
    },
    info: { flex: 1, marginLeft: 12 },
    name: { fontSize: 15, fontWeight: "600", color: theme.textPrimary },
    dosage: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
    category: { fontSize: 11, color: theme.primary, marginTop: 2 },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      gap: 6,
    },
    price: { fontSize: 16, fontWeight: "bold", color: theme.primary },
    oldPrice: {
      fontSize: 12,
      color: theme.textTertiary,
      textDecorationLine: "line-through",
    },
    discountBadge: {
      backgroundColor: theme.successMuted,
      paddingHorizontal: 6,
      paddingVertical: 2,
      borderRadius: 4,
    },
    discountText: { fontSize: 10, color: theme.success, fontWeight: "700" },
    addBtn: {
      backgroundColor: theme.primary,
      borderRadius: 22,
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
      marginLeft: 8,
    },
    disabledBtn: { opacity: 0.4 },
    emptyText: { fontSize: 16, color: theme.textSecondary, marginTop: 12 },
  });
