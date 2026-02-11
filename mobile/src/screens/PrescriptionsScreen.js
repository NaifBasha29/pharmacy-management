import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
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
import { colors } from '../theme/colors';
import api from '../config/api';

const STATUS_CONFIG = {
  pending: { color: '#f59e0b', icon: 'clock-outline', label: 'Pending' },
  approved: { color: '#10b981', icon: 'check-circle-outline', label: 'Approved' },
  rejected: { color: '#ef4444', icon: 'close-circle-outline', label: 'Rejected' },
};

export default function PrescriptionsScreen() {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    fetchPrescriptions();
  }, []);

  const fetchPrescriptions = async () => {
    try {
      const res = await api.get('/prescriptions');
      setPrescriptions(res.data.data.prescriptions || []);
    } catch (error) {
      console.log('Error fetching prescriptions:', error);
    } finally {
      setLoading(false);
    }
  };

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

  const renderPrescription = ({ item }) => {
    const status = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;
    const imageUrl = item.image?.startsWith('http') 
      ? item.image 
      : `${api.defaults.baseURL?.replace('/api', '')}/${item.image}`;

    return (
      <TouchableOpacity
        style={styles.prescriptionCard}
        onPress={() => {
          setPreviewImage(imageUrl);
          setPreviewVisible(true);
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.prescriptionImage}
          resizeMode="cover"
        />
        <View style={styles.prescriptionInfo}>
          <View style={[styles.statusBadge, { backgroundColor: `${status.color}20` }]}>
            <Icon name={status.icon} size={14} color={status.color} />
            <Text style={[styles.statusText, { color: status.color }]}>{status.label}</Text>
          </View>
          <Text style={styles.prescriptionDate}>{formatDate(item.createdAt)}</Text>
          {item.note && (
            <Text style={styles.prescriptionNote} numberOfLines={2}>{item.note}</Text>
          )}
        </View>
        <Icon name="chevron-right" size={24} color={colors.textLight} />
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Text style={styles.title}>Prescriptions</Text>
      </View>

      {/* Upload Section */}
      <View style={styles.uploadSection}>
        {selectedImage ? (
          <View style={styles.previewContainer}>
            <Image source={{ uri: selectedImage.uri }} style={styles.previewImage} />
            <View style={styles.previewActions}>
              <TouchableOpacity
                style={styles.cancelPreviewButton}
                onPress={() => setSelectedImage(null)}
              >
                <Icon name="close" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
              onPress={handleUpload}
              disabled={uploading}
            >
              {uploading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Icon name="cloud-upload-outline" size={20} color="#fff" />
                  <Text style={styles.uploadButtonText}>Upload</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity style={styles.uploadCard} onPress={showImageOptions}>
            <View style={styles.uploadIconContainer}>
              <Icon name="camera-plus-outline" size={32} color={colors.primary} />
            </View>
            <Text style={styles.uploadTitle}>Upload Prescription</Text>
            <Text style={styles.uploadSubtitle}>Take a photo or choose from gallery</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Prescriptions List */}
      <Text style={styles.sectionTitle}>Your Prescriptions</Text>
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={prescriptions}
          renderItem={renderPrescription}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.prescriptionsList}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Icon name="file-document-outline" size={64} color={colors.textLight} />
              <Text style={styles.emptyText}>No prescriptions uploaded yet</Text>
            </View>
          }
        />
      )}

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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  uploadSection: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  uploadCard: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: colors.primary + '40',
  },
  uploadIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  uploadTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  previewContainer: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewActions: {
    position: 'absolute',
    top: 8,
    right: 8,
  },
  cancelPreviewButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    padding: 16,
    gap: 8,
  },
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  uploadButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  prescriptionsList: {
    padding: 16,
    paddingTop: 0,
    paddingBottom: 100,
  },
  prescriptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  prescriptionImage: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#f3f4f6',
  },
  prescriptionInfo: {
    flex: 1,
    marginLeft: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
    marginBottom: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  prescriptionDate: {
    fontSize: 14,
    color: colors.textSecondary,
  },
  prescriptionNote: {
    fontSize: 12,
    color: colors.textLight,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 40,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
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
