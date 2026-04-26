import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import api from "../config/api";

const PAYMENT_METHODS = [
  { id: "cod", label: "Cash on Delivery", icon: "cash" },
  { id: "card", label: "Credit / Debit Card", icon: "credit-card" },
  { id: "upi", label: "UPI", icon: "cellphone" },
  { id: "netbanking", label: "Net Banking", icon: "bank" },
  { id: "wallet", label: "Wallet", icon: "wallet" },
];

export default function CheckoutScreen({ navigation }) {
  const { cart, clearCart, cartTotal } = useCart();
  const { user } = useAuth();

  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [prescriptions, setPrescriptions] = useState([]);
  const [selectedPrescriptionId, setSelectedPrescriptionId] = useState(null);
  const [prescriptionLoading, setPrescriptionLoading] = useState(false);
  const [address, setAddress] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    street: user?.address?.street || "",
    city: user?.address?.city || "",
    state: user?.address?.state || "",
    zipCode: user?.address?.zipCode || "",
  });
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const warningColor = theme.warning || "#f59e0b";

  const tax = (cartTotal || 0) * 0.18;
  const shipping = (cartTotal || 0) >= 500 ? 0 : 50;
  const total = (cartTotal || 0) + tax + shipping;
  const requiresPrescription = useMemo(
    () => cart.some((item) => item.prescription_required),
    [cart],
  );

  useEffect(() => {
    if (!requiresPrescription) return;

    const loadPrescriptions = async () => {
      try {
        setPrescriptionLoading(true);
        const res = await api.get("/prescriptions");
        const list = res.data.data.prescriptions || [];
        setPrescriptions(list);

        // Auto-select most recent approved, else pending
        const approved = list.find((p) => p.status === "approved");
        const pending = list.find((p) => p.status === "pending");
        setSelectedPrescriptionId(approved?._id || pending?._id || null);
      } catch (err) {
        console.log(
          "Failed to load prescriptions",
          err?.response?.data || err.message,
        );
      } finally {
        setPrescriptionLoading(false);
      }
    };

    loadPrescriptions();
  }, [requiresPrescription]);

  const handlePlaceOrder = async () => {
    if (
      !address.street ||
      !address.city ||
      !address.state ||
      !address.zipCode
    ) {
      Alert.alert("Address Required", "Please fill in your delivery address");
      return;
    }

    if (!address.name || !address.phone) {
      Alert.alert("Contact Required", "Please provide name and phone number");
      return;
    }

    if (requiresPrescription && !selectedPrescriptionId) {
      Alert.alert(
        "Prescription Required",
        "One or more medicines need a prescription. Please upload or select a prescription before placing the order.",
        [
          {
            text: "Upload Now",
            onPress: () =>
              navigation.navigate("Main", { screen: "Prescriptions" }),
          },
          { text: "Cancel", style: "cancel" },
        ],
      );
      return;
    }

    Alert.alert(
      "Confirm Order",
      `Total: ₹${total.toLocaleString("en-IN")}\nPayment: ${PAYMENT_METHODS.find((p) => p.id === paymentMethod)?.label}`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Place Order",
          onPress: async () => {
            try {
              setLoading(true);
              const orderItems = cart.map((item) => ({
                medicine: item._id,
                quantity: item.quantity,
                price: item.price,
              }));

              const orderRes = await api.post("/orders", {
                items: orderItems,
                totalAmount: cartTotal,
                shippingAddress: address,
                paymentMethod,
                prescription: selectedPrescriptionId || undefined,
              });

              if (orderRes.data.success) {
                const orderId = orderRes.data.data._id;

                // Process payment for non-COD methods
                if (paymentMethod !== "cod") {
                  try {
                    await api.post("/payments/create-intent", {
                      orderId,
                      paymentMethod,
                    });
                  } catch (payErr) {
                    console.log("Payment processing notice:", payErr);
                  }
                }

                clearCart();
                Alert.alert(
                  "Order Placed!",
                  `Your order has been placed successfully.\nOrder: ${orderRes.data.data.orderNumber || "Processing"}`,
                  [
                    {
                      text: "View Orders",
                      onPress: () =>
                        navigation.navigate("Main", { screen: "Orders" }),
                    },
                  ],
                );
              }
            } catch (error) {
              const msg =
                error.response?.data?.message || "Failed to place order";
              Alert.alert("Error", msg);
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Order Summary</Text>
          {cart.map((item, index) => (
            <View
              key={item._id || item.id || `cart-${index}`}
              style={styles.orderItem}
            >
              <Text style={styles.itemName} numberOfLines={1}>
                {item.name}
              </Text>
              <Text style={styles.itemQty}>x{item.quantity}</Text>
              <Text style={styles.itemPrice}>
                ₹
                {((item.price || 0) * (item.quantity || 0)).toLocaleString(
                  "en-IN",
                )}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Subtotal</Text>
            <Text style={styles.totalValue}>
              ₹{cartTotal.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tax (18% GST)</Text>
            <Text style={styles.totalValue}>
              ₹{tax.toLocaleString("en-IN")}
            </Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Shipping</Text>
            <Text
              style={[
                styles.totalValue,
                shipping === 0 && { color: theme.success },
              ]}
            >
              {shipping === 0 ? "FREE" : `₹${shipping.toLocaleString("en-IN")}`}
            </Text>
          </View>
          <View style={[styles.divider, { marginTop: 8 }]} />
          <View style={styles.totalRow}>
            <Text style={styles.grandTotal}>Total</Text>
            <Text style={styles.grandTotalValue}>
              ₹{total.toLocaleString("en-IN")}
            </Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Delivery Address</Text>
          <View style={styles.addressForm}>
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Full Name"
                placeholderTextColor={theme.placeholder}
                value={address.name}
                onChangeText={(t) => setAddress((p) => ({ ...p, name: t }))}
              />
              <View style={{ width: 10 }} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Phone"
                placeholderTextColor={theme.placeholder}
                value={address.phone}
                onChangeText={(t) => setAddress((p) => ({ ...p, phone: t }))}
                keyboardType="phone-pad"
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="Street Address"
              placeholderTextColor={theme.placeholder}
              value={address.street}
              onChangeText={(t) => setAddress((p) => ({ ...p, street: t }))}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="City"
                placeholderTextColor={theme.placeholder}
                value={address.city}
                onChangeText={(t) => setAddress((p) => ({ ...p, city: t }))}
              />
              <View style={{ width: 10 }} />
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="State"
                placeholderTextColor={theme.placeholder}
                value={address.state}
                onChangeText={(t) => setAddress((p) => ({ ...p, state: t }))}
              />
            </View>
            <TextInput
              style={styles.input}
              placeholder="ZIP Code"
              placeholderTextColor={theme.placeholder}
              value={address.zipCode}
              onChangeText={(t) => setAddress((p) => ({ ...p, zipCode: t }))}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {PAYMENT_METHODS.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentOption,
                paymentMethod === method.id && styles.paymentOptionActive,
              ]}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Icon
                name={method.icon}
                size={22}
                color={
                  paymentMethod === method.id
                    ? theme.primary
                    : theme.textSecondary
                }
              />
              <Text
                style={[
                  styles.paymentLabel,
                  paymentMethod === method.id && styles.paymentLabelActive,
                ]}
              >
                {method.label}
              </Text>
              <Icon
                name={
                  paymentMethod === method.id
                    ? "radiobox-marked"
                    : "radiobox-blank"
                }
                size={22}
                color={
                  paymentMethod === method.id
                    ? theme.primary
                    : theme.textTertiary
                }
              />
            </TouchableOpacity>
          ))}
        </View>

        {requiresPrescription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Prescription</Text>
            {prescriptionLoading ? (
              <ActivityIndicator color={theme.primary} />
            ) : selectedPrescriptionId ? (
              <View
                style={[styles.prescriptionCard, { borderColor: theme.border }]}
              >
                <View>
                  <Text
                    style={[
                      styles.prescriptionTitle,
                      { color: theme.textPrimary },
                    ]}
                  >
                    Using saved prescription
                  </Text>
                  <Text
                    style={[
                      styles.prescriptionSub,
                      { color: theme.textSecondary },
                    ]}
                  >
                    Auto-selected from your uploads
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.rxButton, { borderColor: theme.primary }]}
                  onPress={() =>
                    navigation.navigate("Main", { screen: "Prescriptions" })
                  }
                  activeOpacity={0.85}
                >
                  <Text style={[styles.rxButtonText, { color: theme.primary }]}>
                    Change
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View
                style={[
                  styles.prescriptionCard,
                  {
                    borderColor: warningColor + "60",
                    backgroundColor: warningColor + "10",
                  },
                ]}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.prescriptionTitle, { color: warningColor }]}
                  >
                    Upload required
                  </Text>
                  <Text
                    style={[
                      styles.prescriptionSub,
                      { color: theme.textSecondary },
                    ]}
                  >
                    A prescription is needed for items in your cart.
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.rxButton, { borderColor: warningColor }]}
                  onPress={() =>
                    navigation.navigate("Main", { screen: "Prescriptions" })
                  }
                  activeOpacity={0.85}
                >
                  <Text style={[styles.rxButtonText, { color: warningColor }]}>
                    Upload
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Place Order Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.placeBtn, loading && { opacity: 0.5 }]}
          onPress={handlePlaceOrder}
          disabled={loading || cart.length === 0}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="check-circle" size={20} color="#fff" />
              <Text style={styles.placeBtnText}>
                Place Order - ₹{total.toLocaleString("en-IN")}
              </Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
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
    content: { flex: 1, padding: 16 },
    section: {
      backgroundColor: theme.surface,
      borderRadius: 12,
      padding: 16,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    prescriptionCard: {
      borderWidth: 1,
      borderRadius: 12,
      padding: 12,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    prescriptionTitle: { fontSize: 14, fontWeight: "700" },
    prescriptionSub: { fontSize: 12, marginTop: 2 },
    rxButton: {
      paddingVertical: 8,
      paddingHorizontal: 12,
      borderRadius: 10,
      borderWidth: 1,
    },
    rxButtonText: { fontSize: 13, fontWeight: "700" },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.textPrimary,
      marginBottom: 12,
    },
    orderItem: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 6,
    },
    itemName: { flex: 1, fontSize: 14, color: theme.textPrimary },
    itemQty: { fontSize: 13, color: theme.textSecondary, marginHorizontal: 12 },
    itemPrice: {
      fontSize: 14,
      fontWeight: "600",
      color: theme.textPrimary,
      width: 70,
      textAlign: "right",
    },
    divider: { height: 1, backgroundColor: theme.border, marginVertical: 8 },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    totalLabel: { fontSize: 14, color: theme.textSecondary },
    totalValue: { fontSize: 14, color: theme.textPrimary },
    grandTotal: { fontSize: 16, fontWeight: "bold", color: theme.textPrimary },
    grandTotalValue: { fontSize: 18, fontWeight: "bold", color: theme.primary },
    addressForm: { gap: 10 },
    row: { flexDirection: "row" },
    input: {
      backgroundColor: theme.inputBackground,
      borderRadius: 10,
      padding: 12,
      color: theme.textPrimary,
      fontSize: 14,
      borderWidth: 1,
      borderColor: theme.border,
    },
    paymentOption: {
      flexDirection: "row",
      alignItems: "center",
      padding: 14,
      borderRadius: 10,
      marginBottom: 8,
      backgroundColor: theme.inputBackground,
      borderWidth: 1,
      borderColor: theme.border,
      gap: 12,
    },
    paymentOptionActive: {
      borderColor: theme.primary,
      backgroundColor: theme.primaryMuted,
    },
    paymentLabel: { flex: 1, fontSize: 15, color: theme.textSecondary },
    paymentLabelActive: { color: theme.textPrimary, fontWeight: "600" },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.surface,
    },
    placeBtn: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 16,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
    },
    placeBtnText: { color: "#fff", fontSize: 17, fontWeight: "700" },
  });
