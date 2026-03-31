import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { favoritesAPI } from "../services/mobileApi";

export default function FavoritesScreen({ navigation }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const fetchFavorites = useCallback(async () => {
    try {
      const res = await favoritesAPI.getAll();
      if (res.data.success) {
        setFavorites(res.data.data);
      }
    } catch (error) {
      console.log("Error fetching favorites:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", fetchFavorites);
    return unsubscribe;
  }, [navigation, fetchFavorites]);

  const handleRemove = async (medicineId) => {
    Alert.alert("Remove Favorite", "Remove this from your wishlist?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Remove",
        style: "destructive",
        onPress: async () => {
          try {
            await favoritesAPI.remove(medicineId);
            setFavorites((prev) =>
              prev.filter((f) => f.medicine?._id !== medicineId),
            );
          } catch (error) {
            Alert.alert("Error", "Failed to remove favorite");
          }
        },
      },
    ]);
  };

  const handleAddToCart = (medicine) => {
    if (medicine.stock <= 0) {
      Alert.alert("Out of Stock", "This medicine is currently unavailable.");
      return;
    }
    addToCart(medicine);
    Alert.alert("Added", `${medicine.name} added to cart`);
  };

  const renderItem = ({ item }) => {
    const med = item.medicine;
    if (!med) return null;

    const discountedPrice = med.discount
      ? (med.price || 0) - ((med.price || 0) * med.discount) / 100
      : med.price || 0;
    const outOfStock = med.stock <= 0;

    return (
      <View style={styles.card}>
        <Image
          source={{
            uri: med.image || "https://via.placeholder.com/80?text=Rx",
          }}
          style={styles.image}
        />
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={2}>
            {med.name}
          </Text>
          {med.dosageForm && (
            <Text style={styles.dosage}>
              {med.dosageForm} {med.strength || ""}
            </Text>
          )}
          <View style={styles.priceRow}>
            <Text style={styles.price}>
              ₹{discountedPrice.toLocaleString("en-IN")}
            </Text>
            {med.discount > 0 && (
              <Text style={styles.originalPrice}>
                ₹{(med.price || 0).toLocaleString("en-IN")}
              </Text>
            )}
          </View>
          <Text style={[styles.stock, outOfStock && styles.outOfStock]}>
            {outOfStock ? "Out of Stock" : `${med.stock} in stock`}
          </Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => handleRemove(med._id)}
          >
            <Icon name="heart-off" size={20} color={theme.error} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.cartBtn, outOfStock && styles.disabledBtn]}
            onPress={() => handleAddToCart(med)}
            disabled={outOfStock}
          >
            <Icon name="cart-plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={["top"]}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
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
        <Text style={styles.headerTitle}>My Wishlist</Text>
        <View style={{ width: 24 }} />
      </View>

      {favorites.length === 0 ? (
        <View style={styles.center}>
          <Icon name="heart-outline" size={80} color={theme.textTertiary} />
          <Text style={styles.emptyTitle}>No favorites yet</Text>
          <Text style={styles.emptySubtitle}>
            Save medicines you like for later
          </Text>
          <TouchableOpacity
            style={styles.shopBtn}
            onPress={() => navigation.navigate("Main", { screen: "Catalog" })}
          >
            <Text style={styles.shopBtnText}>Browse Medicines</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={favorites}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                fetchFavorites();
              }}
              tintColor={theme.primary}
            />
          }
        />
      )}
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
    list: { padding: 16 },
    card: {
      flexDirection: "row",
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 12,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: theme.border,
    },
    image: {
      width: 70,
      height: 70,
      borderRadius: 8,
      backgroundColor: theme.inputBackground,
    },
    info: { flex: 1, marginLeft: 12, justifyContent: "center" },
    name: { fontSize: 15, fontWeight: "600", color: theme.textPrimary },
    dosage: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
    priceRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
    price: { fontSize: 16, fontWeight: "bold", color: theme.primary },
    originalPrice: {
      fontSize: 12,
      color: theme.textTertiary,
      textDecorationLine: "line-through",
      marginLeft: 6,
    },
    stock: { fontSize: 11, color: theme.success, marginTop: 2 },
    outOfStock: { color: theme.error },
    actions: {
      justifyContent: "space-between",
      alignItems: "center",
      marginLeft: 8,
    },
    actionBtn: { padding: 8 },
    cartBtn: {
      backgroundColor: theme.primary,
      borderRadius: 20,
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
    },
    disabledBtn: { opacity: 0.4 },
    emptyTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.textPrimary,
      marginTop: 16,
    },
    emptySubtitle: { fontSize: 14, color: theme.textSecondary, marginTop: 4 },
    shopBtn: {
      backgroundColor: theme.primary,
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 25,
      marginTop: 20,
    },
    shopBtnText: { color: "#fff", fontWeight: "600", fontSize: 15 },
  });
