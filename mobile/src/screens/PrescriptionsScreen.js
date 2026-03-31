import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons as Icon } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useTheme } from "../context/ThemeContext";
import api from "../config/api";
import { prescriptionsAPI } from "../services/mobileApi";

const STATUS_CONFIG = {
  pending: { color: "#f59e0b", icon: "clock-outline", label: "Pending" },
  approved: {
    color: "#10b981",
    icon: "check-circle-outline",
    label: "Approved",
  },
  rejected: {
    color: "#ef4444",
    icon: "close-circle-outline",
    label: "Rejected",
  },
};

const getRelativeTime = (date) => {
  const diffDays = Math.floor((Date.now() - new Date(date)) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
};

export default function PrescriptionsScreen() {
  const { theme } = useTheme();
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [stats, setStats] = useState({ approved: 0, pending: 0, rejected: 0 });

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get("/prescriptions");
      const data = res.data.data.prescriptions || [];
      setPrescriptions(data);
      setStats({
        approved: data.filter((p) => p.status === "approved").length,
        pending: data.filter((p) => p.status === "pending").length,
        rejected: data.filter((p) => p.status === "rejected").length,
      });
    } catch (_) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPrescriptions().then(() => setRefreshing(false));
  }, []);

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission needed",
        "Grant gallery access to upload prescriptions.",
      );
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setSelectedImage(result.assets[0]);
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission needed", "Grant camera access to take photos.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled) setSelectedImage(result.assets[0]);
  };

  const handleUpload = async () => {
    if (!selectedImage) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("prescription", {
        uri: selectedImage.uri,
        type: "image/jpeg",
        name: "prescription.jpg",
      });
      await prescriptionsAPI.upload(formData);
      Alert.alert("Success", "Prescription uploaded successfully!");
      setSelectedImage(null);
      fetchPrescriptions();
    } catch (_) {
      Alert.alert("Error", "Failed to upload prescription. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert("Upload Prescription", "Choose an option", [
      { text: "Take Photo", onPress: takePhoto },
      { text: "Choose from Gallery", onPress: pickImage },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const STAT_ITEMS = [
    {
      key: "approved",
      label: "Approved",
      color: "#10b981",
      bg: "rgba(16,185,129,0.12)",
      icon: "check-circle-outline",
    },
    {
      key: "pending",
      label: "Pending",
      color: "#f59e0b",
      bg: "rgba(245,158,11,0.12)",
      icon: "clock-outline",
    },
    {
      key: "rejected",
      label: "Rejected",
      color: "#ef4444",
      bg: "rgba(239,68,68,0.12)",
      icon: "close-circle-outline",
    },
  ];

  return (
    <SafeAreaView
      style={[s.root, { backgroundColor: theme.background }]}
      edges={["top"]}
    >
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <Text style={[s.title, { color: theme.textPrimary }]}>
          Prescriptions
        </Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
      >
        <View
          style={[
            s.uploadCard,
            { backgroundColor: theme.card, borderColor: theme.primary + "40" },
          ]}
        >
          {selectedImage ? (
            <View style={s.previewArea}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={s.previewImg}
                resizeMode="cover"
              />
              <View style={s.previewActions}>
                <TouchableOpacity
                  style={[
                    s.previewBtn,
                    {
                      borderColor: theme.border,
                      backgroundColor: theme.background,
                    },
                  ]}
                  onPress={() => setSelectedImage(null)}
                  activeOpacity={0.8}
                >
                  <Icon name="close" size={18} color={theme.error} />
                  <Text
                    style={[s.previewBtnText, { color: theme.textSecondary }]}
                  >
                    Remove
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    s.previewBtn,
                    {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={handleUpload}
                  disabled={uploading}
                  activeOpacity={0.85}
                >
                  {uploading ? (
                    <ActivityIndicator color="#fff" size="small" />
                  ) : (
                    <>
                      <Icon
                        name="cloud-upload-outline"
                        size={18}
                        color="#fff"
                      />
                      <Text style={[s.previewBtnText, { color: "#fff" }]}>
                        Upload
                      </Text>
                    </>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={s.uploadEmpty}>
              <View
                style={[
                  s.uploadIcon,
                  { backgroundColor: theme.primary + "18" },
                ]}
              >
                <Icon
                  name="file-document-outline"
                  size={36}
                  color={theme.primary}
                />
              </View>
              <Text style={[s.uploadTitle, { color: theme.textPrimary }]}>
                Upload Prescription
              </Text>
              <Text style={[s.uploadSub, { color: theme.textSecondary }]}>
                Snap a photo or choose from gallery
              </Text>
              <View style={s.uploadBtns}>
                <TouchableOpacity
                  style={[
                    s.uploadBtn,
                    {
                      backgroundColor: theme.primary + "15",
                      borderColor: theme.primary + "40",
                    },
                  ]}
                  onPress={takePhoto}
                  activeOpacity={0.8}
                >
                  <Icon name="camera-outline" size={18} color={theme.primary} />
                  <Text style={[s.uploadBtnText, { color: theme.primary }]}>
                    Camera
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    s.uploadBtn,
                    {
                      backgroundColor: theme.primary,
                      borderColor: theme.primary,
                    },
                  ]}
                  onPress={pickImage}
                  activeOpacity={0.85}
                >
                  <Icon name="image-outline" size={18} color="#fff" />
                  <Text style={[s.uploadBtnText, { color: "#fff" }]}>
                    Gallery
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <View style={s.statsRow}>
          {STAT_ITEMS.map((item) => (
            <View
              key={item.key}
              style={[s.statCard, { backgroundColor: item.bg }]}
            >
              <Icon name={item.icon} size={20} color={item.color} />
              <Text style={[s.statValue, { color: item.color }]}>
                {stats[item.key]}
              </Text>
              <Text style={[s.statLabel, { color: item.color }]}>
                {item.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={[s.sectionTitle, { color: theme.textPrimary }]}>
            History
          </Text>

          {loading ? (
            <ActivityIndicator
              color={theme.primary}
              style={{ marginTop: 12 }}
            />
          ) : prescriptions.length > 0 ? (
            prescriptions.map((rx) => {
              const status = STATUS_CONFIG[rx.status] || STATUS_CONFIG.pending;
              const imageUrl = rx.image?.startsWith("http")
                ? rx.image
                : `${api.defaults.baseURL?.replace("/api", "")}/${rx.image}`;
              return (
                <TouchableOpacity
                  key={rx._id}
                  style={[
                    s.rxCard,
                    { backgroundColor: theme.card, borderColor: theme.border },
                  ]}
                  onPress={() => {
                    setPreviewImage(imageUrl);
                    setPreviewVisible(true);
                  }}
                  activeOpacity={0.85}
                >
                  <Image
                    source={{ uri: imageUrl }}
                    style={s.rxThumb}
                    resizeMode="cover"
                  />
                  <View style={s.rxInfo}>
                    <Text
                      style={[s.rxName, { color: theme.textPrimary }]}
                      numberOfLines={1}
                    >
                      {rx.medicineName || "Prescription"}
                    </Text>
                    <Text style={[s.rxDate, { color: theme.textSecondary }]}>
                      {getRelativeTime(rx.createdAt)}
                    </Text>
                    {rx.note && (
                      <Text
                        style={[s.rxNote, { color: theme.textSecondary }]}
                        numberOfLines={2}
                      >
                        📋 {rx.note}
                      </Text>
                    )}
                  </View>
                  <View
                    style={[
                      s.statusBadge,
                      { backgroundColor: status.color + "20" },
                    ]}
                  >
                    <Icon name={status.icon} size={12} color={status.color} />
                    <Text style={[s.statusText, { color: status.color }]}>
                      {status.label}
                    </Text>
                  </View>
                </TouchableOpacity>
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
                name="file-document-outline"
                size={48}
                color={theme.textTertiary}
              />
              <Text style={[s.emptyTitle, { color: theme.textPrimary }]}>
                No prescriptions yet
              </Text>
              <Text style={[s.emptySub, { color: theme.textSecondary }]}>
                Upload your first prescription above to get started
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <Modal
        visible={previewVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={s.modalBg}>
          <TouchableOpacity
            style={s.modalClose}
            onPress={() => setPreviewVisible(false)}
          >
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: previewImage }}
            style={s.modalImg}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  title: { fontSize: 24, fontWeight: "800", lineHeight: 30 },
  scroll: { padding: 16, paddingBottom: 100 },
  uploadCard: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    overflow: "hidden",
    marginBottom: 16,
  },
  uploadEmpty: { padding: 24, alignItems: "center", gap: 10 },
  uploadIcon: {
    width: 70,
    height: 70,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  uploadTitle: { fontSize: 17, fontWeight: "700", lineHeight: 22 },
  uploadSub: { fontSize: 13, lineHeight: 18, textAlign: "center" },
  uploadBtns: { flexDirection: "row", gap: 10, marginTop: 4 },
  uploadBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  uploadBtnText: { fontSize: 14, fontWeight: "600" },
  previewArea: { padding: 16, gap: 12 },
  previewImg: { width: "100%", height: 180, borderRadius: 12 },
  previewActions: { flexDirection: "row", gap: 10 },
  previewBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  previewBtnText: { fontSize: 14, fontWeight: "600" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    gap: 6,
  },
  statValue: { fontSize: 24, fontWeight: "800", lineHeight: 30 },
  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  section: {},
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    lineHeight: 22,
    marginBottom: 12,
  },
  rxCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
  },
  rxThumb: { width: 64, height: 64, borderRadius: 10 },
  rxInfo: { flex: 1, gap: 4 },
  rxName: { fontSize: 14, fontWeight: "700", lineHeight: 20 },
  rxDate: { fontSize: 12, lineHeight: 16 },
  rxNote: { fontSize: 12, lineHeight: 16 },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: { fontSize: 11, fontWeight: "600" },
  emptyBox: {
    borderRadius: 16,
    padding: 36,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
  },
  emptyTitle: { fontSize: 16, fontWeight: "700", lineHeight: 22 },
  emptySub: { fontSize: 13, lineHeight: 20, textAlign: "center" },
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.92)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalClose: {
    position: "absolute",
    top: 52,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  modalImg: { width: "92%", height: "72%" },
});
