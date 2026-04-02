import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import { useTheme } from "../context/ThemeContext";
import { useCart } from "../context/CartContext";
import { aiAPI } from "../services/mobileApi";

export default function ChatbotScreen({ navigation }) {
  const [messages, setMessages] = useState([
    {
      id: "0",
      text: "Hello! I'm your RxPlus assistant. I can help you find medicines, check order status, or answer health questions. How can I help?",
      isBot: true,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const flatListRef = useRef(null);
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const quickQuestions = [
    "Medicine for fever",
    "Track my order",
    "Medicine for headache",
    "What helps with cold?",
  ];

  const sendMessage = async (text) => {
    const msgText = text || input.trim();
    if (!msgText || loading) return;

    const userMsg = {
      id: Date.now().toString(),
      text: msgText,
      isBot: false,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await aiAPI.chat(msgText);
      if (res.data.success) {
        const data = res.data.data;
        const botMsg = {
          id: (Date.now() + 1).toString(),
          text: data.message,
          isBot: true,
          medicines: data.medicines || [],
          orders: data.orders || [],
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
      }
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          text: "Sorry, I'm having trouble connecting. Please try again.",
          isBot: true,
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (flatListRef.current && messages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        100,
      );
    }
  }, [messages]);

  const handleAddToCart = (medicine) => {
    if (medicine.stock <= 0) return;
    addToCart(medicine);
  };

  const renderMessage = ({ item }) => (
    <View style={[styles.msgRow, item.isBot ? styles.botRow : styles.userRow]}>
      {item.isBot && (
        <View style={styles.botAvatar}>
          <Icon name="robot" size={18} color={theme.primary} />
        </View>
      )}
      <View
        style={[
          styles.msgBubble,
          item.isBot ? styles.botBubble : styles.userBubble,
        ]}
      >
        <Text
          style={[
            styles.msgText,
            item.isBot ? styles.botText : styles.userText,
          ]}
        >
          {item.text}
        </Text>

        {/* Medicine suggestions */}
        {item.medicines && item.medicines.length > 0 && (
          <View style={styles.medList}>
            {item.medicines.map((med) => (
              <View key={med._id} style={styles.medItem}>
                <View style={styles.medInfo}>
                  <Text style={styles.medName}>{med.name}</Text>
                  <Text style={styles.medPrice}>
                    ₹{(med.price || 0).toLocaleString("en-IN")}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.addBtn, med.stock <= 0 && styles.disabledBtn]}
                  onPress={() => handleAddToCart(med)}
                  disabled={med.stock <= 0}
                >
                  <Icon name="cart-plus" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Order status */}
        {item.orders && item.orders.length > 0 && (
          <View style={styles.orderList}>
            {item.orders.map((order) => (
              <View key={order._id} style={styles.orderItem}>
                <Text style={styles.orderNum}>{order.orderNumber}</Text>
                <View
                  style={[
                    styles.statusBadge,
                    {
                      backgroundColor:
                        getStatusColor(order.status, theme) + "20",
                    },
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
            ))}
          </View>
        )}

        <Text style={styles.timestamp}>
          {item.timestamp.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={["top"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Icon name="robot" size={22} color={theme.primary} />
          <Text style={styles.headerTitle}>RxPlus AI</Text>
        </View>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={styles.chatArea}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={90}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          showsVerticalScrollIndicator={false}
        />

        {/* Quick questions */}
        {messages.length <= 1 && (
          <View style={styles.quickSection}>
            {quickQuestions.map((q) => (
              <TouchableOpacity
                key={q}
                style={styles.quickBtn}
                onPress={() => sendMessage(q)}
              >
                <Text style={styles.quickText}>{q}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Input */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Ask me anything..."
            placeholderTextColor={theme.placeholder}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={() => sendMessage()}
            returnKeyType="send"
            editable={!loading}
          />
          <TouchableOpacity
            style={[
              styles.sendBtn,
              (!input.trim() || loading) && styles.disabledBtn,
            ]}
            onPress={() => sendMessage()}
            disabled={!input.trim() || loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Icon name="send" size={20} color="#fff" />
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const getStatusColor = (status, theme) => {
  const map = {
    pending: theme.warning,
    confirmed: theme.info,
    processing: theme.info,
    dispatched: theme.primary,
    delivered: theme.success,
    cancelled: theme.error,
  };
  return map[status] || theme.textSecondary;
};

const createStyles = (theme) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.background },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    headerCenter: { flexDirection: "row", alignItems: "center", gap: 8 },
    headerTitle: { fontSize: 18, fontWeight: "bold", color: theme.textPrimary },
    chatArea: { flex: 1 },
    messagesList: { padding: 16, paddingBottom: 8 },
    msgRow: { flexDirection: "row", marginBottom: 12, maxWidth: "85%" },
    botRow: { alignSelf: "flex-start" },
    userRow: { alignSelf: "flex-end" },
    botAvatar: {
      width: 30,
      height: 30,
      borderRadius: 15,
      backgroundColor: theme.primaryMuted,
      justifyContent: "center",
      alignItems: "center",
      marginRight: 8,
      marginTop: 4,
    },
    msgBubble: { borderRadius: 16, padding: 12, maxWidth: "100%" },
    botBubble: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
      borderTopLeftRadius: 4,
    },
    userBubble: { backgroundColor: theme.primary, borderTopRightRadius: 4 },
    msgText: { fontSize: 14, lineHeight: 20 },
    botText: { color: theme.textPrimary },
    userText: { color: "#fff" },
    timestamp: {
      fontSize: 10,
      color: theme.textTertiary,
      marginTop: 4,
      alignSelf: "flex-end",
    },
    medList: { marginTop: 10, gap: 6 },
    medItem: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: theme.inputBackground,
      borderRadius: 8,
      padding: 8,
    },
    medInfo: { flex: 1 },
    medName: { fontSize: 13, fontWeight: "600", color: theme.textPrimary },
    medPrice: { fontSize: 13, color: theme.primary, fontWeight: "bold" },
    addBtn: {
      backgroundColor: theme.primary,
      borderRadius: 16,
      width: 32,
      height: 32,
      justifyContent: "center",
      alignItems: "center",
    },
    disabledBtn: { opacity: 0.4 },
    orderList: { marginTop: 10, gap: 6 },
    orderItem: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: theme.inputBackground,
      borderRadius: 8,
      padding: 8,
    },
    orderNum: { fontSize: 13, fontWeight: "600", color: theme.textPrimary },
    statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
    statusText: {
      fontSize: 11,
      fontWeight: "600",
      textTransform: "capitalize",
    },
    quickSection: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 8,
      paddingHorizontal: 16,
      paddingBottom: 12,
    },
    quickBtn: {
      backgroundColor: theme.surfaceHighlight,
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 18,
      borderWidth: 1,
      borderColor: theme.border,
    },
    quickText: { fontSize: 13, color: theme.textSecondary },
    inputRow: {
      flexDirection: "row",
      alignItems: "center",
      padding: 12,
      gap: 10,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      backgroundColor: theme.surface,
    },
    textInput: {
      flex: 1,
      backgroundColor: theme.inputBackground,
      borderRadius: 24,
      paddingHorizontal: 16,
      paddingVertical: 10,
      fontSize: 15,
      color: theme.textPrimary,
      borderWidth: 1,
      borderColor: theme.border,
    },
    sendBtn: {
      backgroundColor: theme.primary,
      borderRadius: 22,
      width: 44,
      height: 44,
      justifyContent: "center",
      alignItems: "center",
    },
  });
