import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import api from "../config/api";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;

export default function CatalogScreen({ navigation }) {
  const { theme } = useTheme();
  const [medicines, setMedicines] = useState([]);
  const [categories, setCategories] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { addToCart, cartCount } = useCart();
  const styles = createStyles(theme);
  const categoryData = [{ _id: "", name: "All" }, ...categories];

  useEffect(() => {
    fetchCategories();
    fetchMedicines();
  }, []);

  useEffect(() => {
    const delaySearch = setTimeout(() => {
      fetchMedicines();
    }, 500);
    return () => clearTimeout(delaySearch);
  }, [search, selectedCategory]);

  const fetchCategories = async () => {
    try {
      const res = await api.get("/categories");
      setCategories(res.data.data.categories || []);
    } catch (error) {
      console.log("Error fetching categories:", error);
    }
  };

  const fetchMedicines = async () => {
    try {
      setLoading(true);
      const params = {};
      if (search) params.search = search;
      if (selectedCategory) params.category = selectedCategory;

      const res = await api.get("/medicines", { params });
      setMedicines(res.data.data.medicines || []);
    } catch (error) {
      console.log("Error fetching medicines:", error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMedicines().then(() => setRefreshing(false));
  }, [search, selectedCategory]);

  const handleAddToCart = (medicine) => {
    addToCart(medicine, 1);
  };

  const renderCategory = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.categoryChip,
        selectedCategory === item._id && styles.categoryChipActive,
      ]}
      onPress={() => {
        if (item._id === "") {
          setSelectedCategory("");
          return;
        }
        setSelectedCategory(selectedCategory === item._id ? "" : item._id);
      }}
    >
      <Text
        style={[
          styles.categoryText,
          selectedCategory === item._id && styles.categoryTextActive,
        ]}
      >
        {item.name}
      </Text>
    </TouchableOpacity>
  );

  const renderMedicine = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.9}
      onPress={() =>
        navigation.navigate("MedicineDetail", { medicineId: item._id })
      }
    >
      <Image
        source={{
          uri: item.image || "https://via.placeholder.com/150?text=Medicine",
        }}
        style={styles.image}
        resizeMode="cover"
      />
      {item.stock < 10 && item.stock > 0 && (
        <View style={styles.lowStockBadge}>
          <Text style={styles.lowStockText}>Low Stock</Text>
        </View>
      )}
      {item.stock === 0 && (
        <View style={styles.outOfStockBadge}>
          <Text style={styles.outOfStockText}>Out of Stock</Text>
        </View>
      )}
      <View style={styles.cardContent}>
        <Text style={styles.medicineName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.medicineCategory} numberOfLines={1}>
          {item.category?.name || "General"}
        </Text>
        <View style={styles.priceRow}>
          <Text style={styles.price}>₹{(item.price || 0).toLocaleString('en-IN')}</Text>
          <TouchableOpacity
            style={[
              styles.addButton,
              item.stock === 0 && styles.addButtonDisabled,
            ]}
            onPress={() => handleAddToCart(item)}
            disabled={item.stock === 0}
          >
            <Icon name="cart-plus" size={18} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Browse</Text>
          <Text style={styles.titleAccent}>Medicines</Text>
        </View>
        <TouchableOpacity
          style={styles.cartButton}
          onPress={() => navigation.navigate("Cart")}
        >
          <Icon name="cart-outline" size={24} color={theme.primary} />
          {cartCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="magnify" size={20} color={theme.textTertiary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search medicines..."
          placeholderTextColor={theme.placeholder}
          value={search}
          onChangeText={setSearch}
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch("")}>
            <Icon name="close-circle" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      {/* Categories */}
      {categories.length > 0 && (
        <FlatList
          data={categoryData}
          renderItem={renderCategory}
          keyExtractor={(item) => item._id || "all"}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesList}
        />
      )}

      {/* Medicines Grid */}
      {loading && medicines.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading medicines...</Text>
        </View>
      ) : (
        <FlatList
          data={medicines}
          renderItem={renderMedicine}
          keyExtractor={(item) => item._id}
          numColumns={2}
          contentContainerStyle={styles.medicinesList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="pill-off" size={64} color={theme.textTertiary} />
              <Text style={styles.emptyText}>No medicines found</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

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
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: "300",
      color: theme.textPrimary,
    },
    titleAccent: {
      fontSize: 28,
      fontWeight: "bold",
      color: theme.primary,
    },
    cartButton: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: theme.surface,
      justifyContent: "center",
      alignItems: "center",
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    cartBadge: {
      position: "absolute",
      top: 0,
      right: 0,
      backgroundColor: theme.error,
      borderRadius: 10,
      minWidth: 20,
      height: 20,
      justifyContent: "center",
      alignItems: "center",
    },
    cartBadgeText: {
      color: "#fff",
      fontSize: 12,
      fontWeight: "bold",
    },
    searchContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBackground || theme.surface,
      marginHorizontal: 16,
      marginVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.border,
      elevation: 2,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    searchInput: {
      flex: 1,
      paddingVertical: 14,
      paddingHorizontal: 12,
      fontSize: 16,
      color: theme.textPrimary,
    },
    categoriesList: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      alignItems: "center",
    },

    categoryChip: {
      minWidth: 90, // ensures small text like "All" expands
      height: 36,
      paddingHorizontal: 16,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: theme.chip || theme.surfaceHighlight,
      borderRadius: 20,
      marginRight: 10,
      borderWidth: 1,
      borderColor: theme.borderStrong || theme.border,
    },

    categoryChipActive: {
      backgroundColor: theme.primary,
      borderColor: theme.primary,

      elevation: 4,

      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
    },

    categoryText: {
      fontSize: 14,
      fontWeight: "600",
      textAlign: "center", // important
      color: theme.chipText || theme.textPrimary,
    },

    categoryTextActive: {
      color: "#fff",
    },

    medicinesList: {
      paddingHorizontal: 12,
      paddingTop: 8,
      paddingBottom: 120,
    },
    card: {
      width: CARD_WIDTH,
      backgroundColor: theme.surface,
      borderRadius: 10,
      margin: 8,
      elevation: 3,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      overflow: "hidden",
    },
    image: {
      width: "100%",
      height: 120,
      backgroundColor: theme.surfaceHighlight,
    },
    lowStockBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: theme.warning,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    lowStockText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "bold",
    },
    outOfStockBadge: {
      position: "absolute",
      top: 8,
      right: 8,
      backgroundColor: theme.error,
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 8,
    },
    outOfStockText: {
      color: "#fff",
      fontSize: 10,
      fontWeight: "bold",
    },
    cardContent: {
      padding: 12,
    },
    medicineName: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.textPrimary,
      marginBottom: 4,
    },
    medicineCategory: {
      fontSize: 12,
      color: theme.textSecondary,
      marginBottom: 8,
    },
    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    price: {
      fontSize: 18,
      fontWeight: "bold",
      color: theme.success,
    },
    addButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.primary,
      justifyContent: "center",
      alignItems: "center",
    },
    addButtonDisabled: {
      backgroundColor: theme.textTertiary,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
    },
    loadingText: {
      marginTop: 12,
      color: theme.textSecondary,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingTop: 60,
    },
    emptyText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.textSecondary,
    },
  });
