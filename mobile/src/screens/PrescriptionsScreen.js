import React, { useState, useEffect, useCallback } from 'react';
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
  Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';

const STATUS_CONFIG = {
  pending: { color: '#f59e0b', icon: 'clock-outline', label: 'Pending' },
  approved: { color: '#10b981', icon: 'check-circle-outline', label: 'Approved' },
  rejected: { color: '#ef4444', icon: 'close-circle-outline', label: 'Rejected' },
};

const STATS_CONFIG = {
  approved: { label: 'Approved', color: '#10b981', bgColor: 'rgba(16,185,129,0.1)' },
  pending: { label: 'Pending', color: '#f59e0b', bgColor: 'rgba(245,158,11,0.1)' },
  rejected: { label: 'Rejected', color: '#ef4444', bgColor: 'rgba(239,68,68,0.1)' },
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
  const styles = createStyles(theme);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get('/prescriptions');
      const prescriptionsData = res.data.data.prescriptions || [];
      setPrescriptions(prescriptionsData);
      
      // Calculate stats from prescriptions
      const calculatedStats = {
        approved: prescriptionsData.filter(p => p.status === 'approved').length,
        pending: prescriptionsData.filter(p => p.status === 'pending').length,
        rejected: prescriptionsData.filter(p => p.status === 'rejected').length,
      };
      setStats(calculatedStats);
    } catch (error) {
      console.log('Error fetching prescriptions:', error);
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
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera roll permissions to upload prescriptions.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please grant camera permissions to take photos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedImage) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('prescription', {
        uri: selectedImage.uri,
        type: 'image/jpeg',
        name: 'prescription.jpg',
      });

      await api.post('/prescriptions/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      Alert.alert('Success', 'Prescription uploaded successfully!');
      setSelectedImage(null);
      fetchPrescriptions();
    } catch (error) {
      console.log('Upload error:', error);
      Alert.alert('Error', 'Failed to upload prescription. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const showImageOptions = () => {
    Alert.alert(
      'Upload Prescription',
      'Choose an option',
      [
        { text: 'Take Photo', onPress: takePhoto },
        { text: 'Choose from Gallery', onPress: pickImage },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getRelativeTime = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffMs = now - past;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  const selectImage = showImageOptions;

  const renderPrescription = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const imageUrl = item.image?.startsWith('http') 
      ? item.image 
      : `${api.defaults.baseURL?.replace('/api', '')}/${item.image}`;

    return (
      <View style={[styles.prescriptionCard, { backgroundColor: theme.card }]}>
        <Image
          source={{ uri: imageUrl }}
          style={styles.prescriptionImage}
          resizeMode="cover"
        />
        <View style={styles.prescriptionContent}>
          <View style={styles.prescriptionHeader}>
            <Text style={[styles.medicineName, { color: theme.textPrimary }]}>
              {item.medicineName || 'Unknown Script'}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
              <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
            </View>
          </View>
          <Text style={[styles.uploadDate, { color: theme.textSecondary }]}>
            Uploaded on {formatDate(item.createdAt)}
          </Text>
          {item.note && (
            <View style={styles.noteContainer}>
              <Text style={[styles.noteLabel, { color: theme.primary }]}>Pharmacist Note:</Text>
              <Text style={[styles.noteText, { color: theme.textSecondary }]}>{item.note}</Text>
            </View>
          )}
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn}>
          <Icon name="arrow-back" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.title}>Prescriptions</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Upload Section */}
        <View style={styles.uploadSection}>
          <View style={[styles.uploadCardMinimal, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Icon name="file-upload-outline" size={32} color={theme.primary} />
            <Text style={[styles.uploadTitle, { color: theme.textPrimary }]}>Upload Prescription</Text>
            <Text style={[styles.uploadSubtitle, { color: theme.textSecondary }]}>
              Select an image or PDF file
            </Text>
            <TouchableOpacity 
              style={[styles.uploadBtn, { backgroundColor: theme.primary }]} 
              onPress={showImageOptions}
              disabled={uploading}
            >
              <Text style={styles.uploadBtnText}>Select File</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Overview */}
        <View style={styles.statusOverview}>
          <View style={[styles.statusItem, { backgroundColor: STATS_CONFIG.approved.bgColor }]}>
            <Text style={[styles.statusValue, { color: STATS_CONFIG.approved.color }]}>{stats.approved}</Text>
            <Text style={[styles.statusLabel, { color: STATS_CONFIG.approved.color }]}>Approved</Text>
          </View>
          <View style={[styles.statusItem, { backgroundColor: STATS_CONFIG.pending.bgColor }]}>
            <Text style={[styles.statusValue, { color: STATS_CONFIG.pending.color }]}>{stats.pending}</Text>
            <Text style={[styles.statusLabel, { color: STATS_CONFIG.pending.color }]}>Pending</Text>
          </View>
          <View style={[styles.statusItem, { backgroundColor: STATS_CONFIG.rejected.bgColor }]}>
            <Text style={[styles.statusValue, { color: STATS_CONFIG.rejected.color }]}>{stats.rejected}</Text>
            <Text style={[styles.statusLabel, { color: STATS_CONFIG.rejected.color }]}>Rejected</Text>
          </View>
        </View>

        {/* Recent Prescriptions */}
        <View style={styles.recentSection}>
          <Text style={[styles.sectionTitle, { color: theme.textPrimary }]}>Recent Prescriptions</Text>
          <View style={styles.prescriptionsList}>
            {prescriptions.length > 0 ? (
              prescriptions.slice(0, 3).map((prescription) => (
                <View key={prescription._id} style={[styles.prescriptionItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <View style={[styles.prescriptionIcon, { backgroundColor: theme.primary + '10' }]}>
                    <Icon name="file-document-outline" size={20} color={theme.primary} />
                  </View>
                  <View style={styles.prescriptionInfo}>
                    <Text style={[styles.prescriptionName, { color: theme.textPrimary }]}>
                      {prescription.medicineName || 'Prescription'}
                    </Text>
                    <Text style={[styles.prescriptionDate, { color: theme.textSecondary }]}>
                      {getRelativeTime(prescription.createdAt)}
                    </Text>
                  </View>
                  <View style={[
                    styles.prescriptionStatus,
                    { backgroundColor: STATUS_CONFIG[prescription.status].color }
                  ]}>
                    <Text style={styles.prescriptionStatusText}>
                      {STATUS_CONFIG[prescription.status].label}
                    </Text>
                  </View>
                </View>
              ))
            ) : (
              <View style={styles.emptyPrescriptions}>
                <Icon name="file-document-outline" size={32} color={theme.textSecondary} />
                <Text style={[styles.emptyPrescriptionsText, { color: theme.textSecondary }]}>
                  No prescriptions yet
                </Text>
                <Text style={[styles.emptyPrescriptionsSubtext, { color: theme.textSecondary }]}>
                  Upload your first prescription to get started
                </Text>
              </View>
            )}
          </View>
        </View>

      </ScrollView>

      {/* Image Preview Modal */}
      <Modal
        visible={previewVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setPreviewVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setPreviewVisible(false)}
          >
            <Icon name="close" size={28} color="#fff" />
          </TouchableOpacity>
          <Image
            source={{ uri: previewImage }}
            style={styles.modalImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: theme.textPrimary,
    flex: 1,
    textAlign: 'center',
    marginRight: 40,
  },
  scrollContent: { paddingBottom: 100 },
  // Upload Section
  uploadSection: { paddingHorizontal: 20, marginBottom: 24 },
  uploadCardMinimal: {
    padding: 32,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    gap: 16,
  },
  uploadTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  uploadBtnText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  // Status Overview
  statusOverview: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 12,
    marginBottom: 24,
  },
  statusItem: {
    flex: 1,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  statusValue: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statusLabel: {
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  // Recent Prescriptions
  recentSection: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  prescriptionsList: {
    gap: 12,
  },
  prescriptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  prescriptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  prescriptionInfo: {
    flex: 1,
  },
  prescriptionName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  prescriptionDate: {
    fontSize: 12,
  },
  prescriptionStatus: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  prescriptionStatusText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    textTransform: 'uppercase',
  },
  emptyPrescriptions: {
    padding: 48,
    alignItems: 'center',
    gap: 12,
  },
  emptyPrescriptionsText: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyPrescriptionsSubtext: {
    fontSize: 14,
    textAlign: 'center',
  },
  historySection: { paddingHorizontal: 16 },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  historyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  viewAllText: {
    fontSize: 14,
    fontWeight: 'semibold',
    color: theme.primary,
  },
  prescriptionCard: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: theme.border,
  },
  prescriptionImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 16,
  },
  prescriptionContent: { flex: 1 },
  prescriptionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  medicineName: {
    fontSize: 16,
    fontWeight: 'bold',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  uploadDate: {
    fontSize: 12,
    marginBottom: 8,
  },
  noteContainer: {
    backgroundColor: theme.primary + '10',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.primary + '30',
  },
  noteLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  noteText: {
    fontSize: 12,
    lineHeight: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: theme.textSecondary,
    marginTop: 12,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: theme.textSecondary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
  },
  modalImage: {
    width: '90%',
    height: '70%',
  },
});
