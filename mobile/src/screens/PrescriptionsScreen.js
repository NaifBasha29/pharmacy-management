import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  Image, Alert, StatusBar, Pressable, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { prescriptionsAPI } from '../services/mobileApi';
import Toast from 'react-native-toast-message';

const STATUS_CONFIG = {
  approved: { label: 'Approved', bg: '#dcfce7', text: '#16a34a', icon: 'check-circle' },
  pending:  { label: 'Pending',  bg: '#fef9c3', text: '#d97706', icon: 'schedule' },
  rejected: { label: 'Rejected', bg: '#fee2e2', text: '#dc2626', icon: 'cancel' },
};

export default function PrescriptionsScreen({ navigation }) {
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUri, setPreviewUri] = useState(null);

  const fetchPrescriptions = useCallback(async () => {
    try {
      const res = await prescriptionsAPI.getAll();
      setPrescriptions(res.data?.data?.prescriptions || []);
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Failed to load prescriptions' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPrescriptions(); }, []);

  const pickFromCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert('Permission Required', 'Camera permission is needed.'); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!result.canceled) {
      setPreviewUri(result.assets[0].uri);
      setSelectedFile({ uri: result.assets[0].uri, name: 'prescription.jpg', type: 'image/jpeg' });
    }
  };

  const pickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.85 });
    if (!result.canceled) {
      setPreviewUri(result.assets[0].uri);
      setSelectedFile({ uri: result.assets[0].uri, name: 'prescription.jpg', type: 'image/jpeg' });
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('prescription', selectedFile);
      await prescriptionsAPI.upload(formData);
      Toast.show({ type: 'success', text1: 'Prescription uploaded!', text2: 'Our pharmacists will review it shortly.' });
      setSelectedFile(null);
      setPreviewUri(null);
      fetchPrescriptions();
    } catch (err) {
      Toast.show({ type: 'error', text1: 'Upload failed', text2: 'Please try again.' });
    } finally {
      setUploading(false);
    }
  };

  const renderPrescriptionCard = (rx) => {
    const sc = STATUS_CONFIG[rx.status] || STATUS_CONFIG.pending;
    return (
      <View key={rx._id} style={styles.rxCard}>
        <View style={styles.rxRow}>
          {/* Thumbnail */}
          <View style={styles.rxThumbWrap}>
            {rx.imageUrl
              ? <Image source={{ uri: rx.imageUrl }} style={styles.rxThumb} resizeMode="cover" />
              : <View style={[styles.rxThumb, styles.rxThumbFallback]}><Text style={{ fontSize: 28 }}>📄</Text></View>}
            {rx.status === 'rejected' && (
              <View style={styles.rxBlurOverlay}>
                <MaterialIcons name="visibility-off" size={20} color="#ffffff70" />
              </View>
            )}
          </View>

          {/* Info */}
          <View style={styles.rxInfo}>
            <View style={styles.rxTopRow}>
              <Text style={styles.rxName} numberOfLines={1}>{rx.note || 'Prescription'}</Text>
              <View style={[styles.rxStatusBadge, { backgroundColor: sc.bg }]}>
                <Text style={[styles.rxStatusText, { color: sc.text }]}>{sc.label}</Text>
              </View>
            </View>
            <Text style={styles.rxDate}>
              {new Date(rx.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </Text>

            {rx.pharmacistNote && (
              <View style={[styles.rxNote, rx.status === 'rejected' ? styles.rxNoteRed : styles.rxNoteBlue]}>
                <Text style={styles.rxNoteLabel}>{rx.status === 'rejected' ? '⚠ Issue: ' : '💬 Note: '}</Text>
                <Text style={styles.rxNoteText}>{rx.pharmacistNote}</Text>
              </View>
            )}
            {rx.status === 'pending' && !rx.pharmacistNote && (
              <Text style={styles.rxPending}>Review in progress...</Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#23170f" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Prescriptions</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Upload Section ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Upload New</Text>

          {/* Drop zone */}
          <Pressable
            style={styles.dropZone}
            onPress={pickFromGallery}
          >
            {previewUri ? (
              <View style={{ position: 'relative' }}>
                <Image source={{ uri: previewUri }} style={styles.previewImg} resizeMode="contain" />
                <TouchableOpacity
                  style={styles.removePreviewBtn}
                  onPress={() => { setSelectedFile(null); setPreviewUri(null); }}
                >
                  <MaterialIcons name="close" size={14} color="#fff" />
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.uploadIconWrap}>
                  <MaterialIcons name="upload-file" size={36} color="#f97415" />
                </View>
                <Text style={styles.dropZoneTitle}>Upload Prescription</Text>
                <Text style={styles.dropZoneSub}>Tap to browse or drag & drop</Text>
              </>
            )}
          </Pressable>

          {/* Pick options */}
          <View style={styles.pickOptionsRow}>
            <TouchableOpacity style={styles.pickOptionBtn} onPress={pickFromGallery}>
              <MaterialIcons name="photo-library" size={18} color="#f97415" />
              <Text style={styles.pickOptionText}>Gallery</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.pickOptionBtn} onPress={pickFromCamera}>
              <MaterialIcons name="camera-alt" size={18} color="#f97415" />
              <Text style={styles.pickOptionText}>Camera</Text>
            </TouchableOpacity>
          </View>

          {/* Upload button */}
          <TouchableOpacity
            style={[styles.uploadBtn, (!selectedFile || uploading) && styles.uploadBtnDisabled]}
            onPress={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading
              ? <ActivityIndicator color="#fff" />
              : <>
                  <MaterialIcons name="cloud-upload" size={18} color="#fff" />
                  <Text style={styles.uploadBtnText}>Upload File</Text>
                </>}
          </TouchableOpacity>
        </View>

        {/* ── History ── */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>History</Text>
            <Text style={styles.countBadge}>{prescriptions.length} Records</Text>
          </View>

          {loading ? (
            <View style={styles.loadingWrap}><ActivityIndicator color="#f97415" /></View>
          ) : prescriptions.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={{ fontSize: 40, opacity: 0.3, marginBottom: 8 }}>📄</Text>
              <Text style={styles.emptyText}>No prescriptions yet</Text>
            </View>
          ) : (
            <View style={styles.rxList}>
              {prescriptions.map(renderPrescriptionCard)}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23170f' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f9741520' },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: '#352418' },
  pageTitle: { flex: 1, color: '#fff', fontWeight: '800', fontSize: 17, textAlign: 'center' },

  // Sections
  section: { padding: 20, paddingBottom: 0 },
  sectionTitle: { color: '#fff', fontWeight: '800', fontSize: 22, letterSpacing: -0.5, marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  countBadge: { backgroundColor: '#352418', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 99, color: '#cca88e', fontSize: 12, fontWeight: '600' },

  // Drop Zone
  dropZone: { borderWidth: 2, borderStyle: 'dashed', borderColor: '#6a482f', borderRadius: 16, backgroundColor: '#2e1f16', padding: 32, alignItems: 'center', gap: 10 },
  uploadIconWrap: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#4a322180', justifyContent: 'center', alignItems: 'center' },
  dropZoneTitle: { color: '#fff', fontWeight: '700', fontSize: 17 },
  dropZoneSub: { color: '#9ca3af', fontSize: 13 },
  previewImg: { width: 260, height: 180, borderRadius: 12 },
  removePreviewBtn: { position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: 14, backgroundColor: '#ef4444', justifyContent: 'center', alignItems: 'center' },

  // Pick options
  pickOptionsRow: { flexDirection: 'row', gap: 12, marginTop: 14 },
  pickOptionBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 10, borderRadius: 12, backgroundColor: '#352418', borderWidth: 1, borderColor: '#f9741530' },
  pickOptionText: { color: '#f97415', fontWeight: '700', fontSize: 13 },

  // Upload button
  uploadBtn: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 14, borderRadius: 99, backgroundColor: '#f97415', elevation: 6, shadowColor: '#f97415', shadowOpacity: 0.3, shadowRadius: 8, marginBottom: 20 },
  uploadBtnDisabled: { backgroundColor: '#4a3221' },
  uploadBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Rx List
  rxList: { gap: 12, marginBottom: 20 },
  rxCard: { backgroundColor: '#2c1d14', borderRadius: 16, padding: 16 },
  rxRow: { flexDirection: 'row', gap: 14 },
  rxThumbWrap: { position: 'relative' },
  rxThumb: { width: 90, height: 90, borderRadius: 12, backgroundColor: '#352418' },
  rxThumbFallback: { justifyContent: 'center', alignItems: 'center' },
  rxBlurOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: '#00000060', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },

  // Rx info
  rxInfo: { flex: 1 },
  rxTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  rxName: { flex: 1, color: '#fff', fontWeight: '700', fontSize: 15, marginRight: 8 },
  rxStatusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 99 },
  rxStatusText: { fontSize: 10, fontWeight: '700' },
  rxDate: { color: '#9c7b64', fontSize: 11, fontWeight: '500', marginBottom: 8 },
  rxNote: { borderRadius: 10, padding: 10, borderLeftWidth: 3 },
  rxNoteBlue: { backgroundColor: '#f9741510', borderLeftColor: '#f97415' },
  rxNoteRed: { backgroundColor: '#ef444415', borderLeftColor: '#ef4444' },
  rxNoteLabel: { fontWeight: '700', color: '#e5e5e5', fontSize: 11 },
  rxNoteText: { color: '#d1d5db', fontSize: 11, lineHeight: 16, marginTop: 2 },
  rxPending: { color: '#6b7280', fontSize: 12, fontStyle: 'italic' },

  // Empty / Loading
  loadingWrap: { padding: 48, alignItems: 'center' },
  emptyState: { padding: 48, alignItems: 'center' },
  emptyText: { color: '#9ca3af', fontSize: 14 },
});
