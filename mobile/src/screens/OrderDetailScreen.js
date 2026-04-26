import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
  Share,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { ordersAPI, refillsAPI, reviewsAPI } from "../services/mobileApi";

const STATUS_STEPS = [
  "pending",
  "confirmed",
  "processing",
  "dispatched",
  "delivered",
];

const formatCurrency = (value = 0) =>
  `₹${(value || 0).toLocaleString("en-IN")}`;

export default function OrderDetailScreen({ route, navigation }) {
  const { orderId } = route.params;
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [review, setReview] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: "" });
  const [submitting, setSubmitting] = useState(false);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  useEffect(() => {
    fetchOrder();
    fetchReview();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await ordersAPI.getById(orderId);
      if (res.data.success) {
        setOrder(res.data.data);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to load order");
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const fetchReview = async () => {
    try {
      const res = await reviewsAPI.getByOrder(orderId);
      if (res.data.success && res.data.data) {
        setReview(res.data.data);
      }
    } catch (error) {
      // No review yet
    }
  };

  const handleCancel = () => {
    if (!order || !["pending", "confirmed"].includes(order.status)) return;
    Alert.alert("Cancel Order", "Are you sure you want to cancel this order?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes, Cancel",
        style: "destructive",
        onPress: async () => {
          try {
            await ordersAPI.cancel(orderId);
            fetchOrder();
          } catch (error) {
            Alert.alert("Error", "Failed to cancel order");
          }
        },
      },
    ]);
  };

  const handleRefill = async () => {
    Alert.alert("Reorder", "Place a new order with the same items?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Reorder",
        onPress: async () => {
          try {
            setSubmitting(true);
            const res = await refillsAPI.create(orderId);
            if (res.data.success) {
              const msg = res.data.unavailable
                ? `Order placed! Some items were unavailable: ${res.data.unavailable.join(", ")}`
                : "Refill order placed successfully!";
              Alert.alert("Success", msg, [
                {
                  text: "View Orders",
                  onPress: () =>
                    navigation.navigate("Main", { screen: "Orders" }),
                },
              ]);
            }
          } catch (error) {
            const msg =
              error.response?.data?.message || "Failed to create refill";
            Alert.alert("Error", msg);
          } finally {
            setSubmitting(false);
          }
        },
      },
    ]);
  };

  const handleSubmitReview = async () => {
    try {
      setSubmitting(true);
      const res = await reviewsAPI.create(
        orderId,
        reviewForm.rating,
        reviewForm.comment,
      );
      if (res.data.success) {
        setReview(res.data.data);
        setShowReview(false);
        Alert.alert("Thank You", "Your review has been submitted");
      }
    } catch (error) {
      Alert.alert(
        "Error",
        error.response?.data?.message || "Failed to submit review",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareReceipt = async () => {
    if (!order) return;
    const items =
      order.items
        ?.map(
          (i) =>
            `  ${i.name} x${i.quantity} - ${formatCurrency((i.price || 0) * (i.quantity || 0))}`,
        )
        .join("\n") || "";
    const receipt = `
📋 RxPlus Order Receipt
━━━━━━━━━━━━━━━━━━━━━━
Order: ${order.orderNumber || order._id}
Date: ${new Date(order.createdAt).toLocaleDateString()}
Status: ${order.status?.toUpperCase()}

Items:
${items}

  Subtotal: ${formatCurrency(order.subtotal)}
  Tax: ${formatCurrency(order.tax)}
  Shipping: ${formatCurrency(order.shippingCost)}
━━━━━━━━━━━━━━━━━━━━━━
  Total: ${formatCurrency(order.total)}
Payment: ${order.paymentMethod || "N/A"}
━━━━━━━━━━━━━━━━━━━━━━
Thank you for shopping with RxPlus!
    `.trim();

    try {
      await Share.share({ message: receipt });
    } catch (error) {
      console.log("Share error:", error);
    }
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

  if (!order) return null;

  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === "cancelled";
  const isDelivered = order.status === "delivered";

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order Details</Text>
        <TouchableOpacity onPress={handleShareReceipt}>
          <Icon name="share-variant" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Order Number & Status */}
        <View style={styles.section}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>
                {order.orderNumber || "Order"}
              </Text>
              <Text style={styles.orderDate}>
                {new Date(order.createdAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(order.status, theme) + "20" },
              ]}
            >
              <Text
                style={[
                  styles.statusText,
                  { color: getStatusColor(order.status, theme) },
                ]}
              >
                {order.status}
              </Text>
            </View>
          </View>
        </View>

        {/* Tracking Timeline */}
        {!isCancelled && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Tracking</Text>
            <View style={styles.timeline}>
              {STATUS_STEPS.map((step, index) => {
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;
                return (
                  <View key={step} style={styles.timelineStep}>
                    <View style={styles.timelineLeft}>
                      <View
                        style={[
                          styles.dot,
                          isActive && styles.activeDot,
                          isCurrent && styles.currentDot,
                        ]}
                      >
                        {isActive && (
                          <Icon name="check" size={12} color="#fff" />
                        )}
                      </View>
                      {index < STATUS_STEPS.length - 1 && (
                        <View
                          style={[
                            styles.line,
                            isActive &&
                              currentStep > index &&
                              styles.activeLine,
                          ]}
                        />
                      )}
                    </View>
                    <View style={styles.timelineRight}>
                      <Text
                        style={[
                          styles.stepLabel,
                          isActive && styles.activeStepLabel,
                        ]}
                      >
                        {step.charAt(0).toUpperCase() + step.slice(1)}
                      </Text>
                      {isCurrent && order.trackingHistory && (
                        <Text style={styles.stepNote}>
                          {order.trackingHistory[
                            order.trackingHistory.length - 1
                          ]?.note || ""}
                        </Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Items</Text>
          {order.items?.map((item, index) => (
            <View key={index} style={styles.itemRow}>
              <View style={styles.itemInfo}>
                <Text style={styles.itemName}>{item.name}</Text>
                <Text style={styles.itemQty}>Qty: {item.quantity}</Text>
              </View>
              <Text style={styles.itemTotal}>
                {formatCurrency((item.price || 0) * (item.quantity || 0))}
              </Text>
            </View>
          ))}
        </View>

        {/* Price Breakdown */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Summary</Text>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Subtotal</Text>
            <Text style={styles.priceValue}>
              {formatCurrency(order.subtotal)}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Tax</Text>
            <Text style={styles.priceValue}>{formatCurrency(order.tax)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Shipping</Text>
            <Text style={styles.priceValue}>
              {(order.shippingCost || 0) === 0
                ? "FREE"
                : formatCurrency(order.shippingCost)}
            </Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.priceRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatCurrency(order.total)}</Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Payment Method</Text>
            <Text style={styles.priceValue}>
              {order.paymentMethod?.toUpperCase() || "COD"}
            </Text>
          </View>
          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>Payment Status</Text>
            <Text
              style={[
                styles.priceValue,
                {
                  color:
                    order.paymentStatus === "paid"
                      ? theme.success
                      : theme.warning,
                },
              ]}
            >
              {order.paymentStatus?.toUpperCase() || "PENDING"}
            </Text>
          </View>
        </View>

        {/* Shipping Address */}
        {order.shippingAddress && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Delivery Address</Text>
            <Text style={styles.addressText}>
              {order.shippingAddress.name}
              {"\n"}
              {order.shippingAddress.street}
              {"\n"}
              {order.shippingAddress.city}, {order.shippingAddress.state}{" "}
              {order.shippingAddress.zipCode}
            </Text>
          </View>
        )}

        {/* Review */}
        {isDelivered && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Review</Text>
            {review ? (
              <View style={styles.reviewDisplay}>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Icon
                      key={s}
                      name={s <= review.rating ? "star" : "star-outline"}
                      size={20}
                      color={theme.warning}
                    />
                  ))}
                </View>
                {review.comment ? (
                  <Text style={styles.reviewComment}>{review.comment}</Text>
                ) : null}
              </View>
            ) : (
              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() => setShowReview(true)}
              >
                <Icon name="star-outline" size={18} color={theme.primary} />
                <Text style={styles.reviewBtnText}>Rate this order</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Actions */}
        <View style={styles.actionsSection}>
          {["pending", "confirmed"].includes(order.status) && (
            <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
              <Icon name="cancel" size={18} color={theme.error} />
              <Text style={styles.cancelBtnText}>Cancel Order</Text>
            </TouchableOpacity>
          )}
          {isDelivered && (
            <TouchableOpacity
              style={[styles.refillBtn, submitting && { opacity: 0.5 }]}
              onPress={handleRefill}
              disabled={submitting}
            >
              <Icon name="refresh" size={18} color="#fff" />
              <Text style={styles.refillBtnText}>Reorder</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Review Modal */}
      <Modal visible={showReview} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rate Your Order</Text>
              <TouchableOpacity onPress={() => setShowReview(false)}>
                <Icon name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <View style={styles.starsInput}>
              {[1, 2, 3, 4, 5].map((s) => (
                <TouchableOpacity
                  key={s}
                  onPress={() => setReviewForm((p) => ({ ...p, rating: s }))}
                >
                  <Icon
                    name={s <= reviewForm.rating ? "star" : "star-outline"}
                    size={36}
                    color={theme.warning}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review (optional)..."
              placeholderTextColor={theme.placeholder}
              value={reviewForm.comment}
              onChangeText={(t) => setReviewForm((p) => ({ ...p, comment: t }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[styles.submitBtn, submitting && { opacity: 0.5 }]}
              onPress={handleSubmitReview}
              disabled={submitting}
            >
              {submitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.submitBtnText}>Submit Review</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const getStatusColor = (status, theme) => {
  const map = {
    pending: '#d97706',
    confirmed: '#1d4ed8',
    processing: '#4f46e5',
    dispatched: '#a855f7',
    delivered: '#16a34a',
    cancelled: '#dc2626',
  };
  return map[status] || theme.textSecondary;
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
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
    scroll: { flex: 1 },
    section: {
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: theme.textPrimary,
      marginBottom: 12,
    },
    orderHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    orderNumber: { fontSize: 18, fontWeight: "bold", color: theme.textPrimary },
    orderDate: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
    statusBadge: {
      paddingHorizontal: 12,
      paddingVertical: 4,
      borderRadius: 12,
    },
    statusText: {
      fontSize: 13,
      fontWeight: "700",
      textTransform: "capitalize",
    },
    timeline: { paddingLeft: 4 },
    timelineStep: { flexDirection: "row", minHeight: 50 },
    timelineLeft: { alignItems: "center", width: 30 },
    dot: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: theme.surfaceHighlight,
      borderWidth: 2,
      borderColor: theme.border,
      justifyContent: "center",
      alignItems: "center",
    },
    activeDot: { backgroundColor: theme.success, borderColor: theme.success },
    currentDot: { backgroundColor: theme.primary, borderColor: theme.primary },
    line: {
      flex: 1,
      width: 2,
      backgroundColor: theme.border,
      marginVertical: 2,
    },
    activeLine: { backgroundColor: theme.success },
    timelineRight: { flex: 1, marginLeft: 12, paddingBottom: 16 },
    stepLabel: { fontSize: 14, color: theme.textTertiary },
    activeStepLabel: { color: theme.textPrimary, fontWeight: "600" },
    stepNote: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
    itemRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 8,
      borderBottomWidth: 1,
      borderBottomColor: theme.border + "50",
    },
    itemInfo: { flex: 1 },
    itemName: { fontSize: 14, color: theme.textPrimary, fontWeight: "500" },
    itemQty: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
    itemTotal: { fontSize: 14, fontWeight: "600", color: theme.textPrimary },
    priceRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      paddingVertical: 4,
    },
    priceLabel: { fontSize: 14, color: theme.textSecondary },
    priceValue: { fontSize: 14, color: theme.textPrimary },
    divider: { height: 1, backgroundColor: theme.border, marginVertical: 6 },
    totalLabel: { fontSize: 16, fontWeight: "bold", color: theme.textPrimary },
    totalValue: { fontSize: 18, fontWeight: "bold", color: theme.primary },
    addressText: { fontSize: 14, color: theme.textSecondary, lineHeight: 22 },
    actionsSection: { padding: 16, gap: 10 },
    cancelBtn: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      padding: 14,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: theme.error,
    },
    cancelBtnText: { color: theme.error, fontSize: 15, fontWeight: "600" },
    refillBtn: {
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      gap: 8,
      padding: 14,
      borderRadius: 12,
      backgroundColor: theme.primary,
    },
    refillBtnText: { color: "#fff", fontSize: 15, fontWeight: "600" },
    reviewDisplay: { gap: 8 },
    stars: { flexDirection: "row", gap: 2 },
    reviewComment: {
      fontSize: 14,
      color: theme.textSecondary,
      fontStyle: "italic",
    },
    reviewBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      borderRadius: 10,
      backgroundColor: theme.primaryMuted,
    },
    reviewBtnText: { color: theme.primary, fontSize: 14, fontWeight: "600" },
    modalOverlay: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "flex-end",
    },
    modalContent: {
      backgroundColor: theme.background,
      borderTopLeftRadius: 20,
      borderTopRightRadius: 20,
      padding: 20,
      paddingBottom: 40,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    modalTitle: { fontSize: 18, fontWeight: "bold", color: theme.textPrimary },
    starsInput: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 8,
      marginBottom: 20,
    },
    reviewInput: {
      backgroundColor: theme.inputBackground,
      borderRadius: 12,
      padding: 14,
      color: theme.textPrimary,
      fontSize: 15,
      minHeight: 100,
      marginBottom: 16,
      borderWidth: 1,
      borderColor: theme.border,
    },
    submitBtn: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 14,
      alignItems: "center",
    },
    submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  });
