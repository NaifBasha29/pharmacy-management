import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, RefreshControl, Modal
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { homeMedicinesAPI } from '../services/mobileApi';

export default function HomeMedicineScreen({ navigation }) {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', dosage: '', quantity: '1', expiryDate: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const fetchMedicines = useCallback(async () => {
    try {
      const res = await homeMedicinesAPI.getAll();
      if (res.data.success) {
        setMedicines(res.data.data);
      }
    } catch (error) {
      console.log('Error:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchMedicines(); }, [fetchMedicines]);

  const handleAdd = async () => {
    if (!form.name.trim() || !form.expiryDate.trim()) {
      Alert.alert('Required', 'Medicine name and expiry date are required');
      return;
    }

    // Validate date format YYYY-MM-DD
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(form.expiryDate)) {
      Alert.alert('Invalid Date', 'Please enter date in YYYY-MM-DD format');
      return;
    }

    try {
      setSaving(true);
      const res = await homeMedicinesAPI.add({
        name: form.name.trim(),
        dosage: form.dosage.trim(),
        quantity: parseInt(form.quantity) || 1,
        expiryDate: form.expiryDate,
        notes: form.notes.trim()
      });
      if (res.data.success) {
        setMedicines(prev => [...prev, res.data.data].sort((a, b) =>
          new Date(a.expiryDate) - new Date(b.expiryDate)
        ));
        setForm({ name: '', dosage: '', quantity: '1', expiryDate: '', notes: '' });
        setShowAdd(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to add medicine');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Remove', `Remove ${name} from your inventory?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try {
            await homeMedicinesAPI.remove(id);
            setMedicines(prev => prev.filter(m => m._id !== id));
          } catch (error) {
            Alert.alert('Error', 'Failed to remove');
          }
        }
      }
    ]);
  };

  const getDaysUntilExpiry = (dateStr) => {
    const diff = new Date(dateStr) - new Date();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const getExpiryColor = (dateStr) => {
    const days = getDaysUntilExpiry(dateStr);
    if (days < 0) return theme.error;
    if (days <= 30) return theme.warning;
    if (days <= 90) return theme.primary;
    return theme.success;
  };

  const getExpiryLabel = (dateStr) => {
    const days = getDaysUntilExpiry(dateStr);
    if (days < 0) return `Expired ${Math.abs(days)} days ago`;
    if (days === 0) return 'Expires today';
    if (days === 1) return 'Expires tomorrow';
    if (days <= 30) return `${days} days left`;
    if (days <= 90) return `${Math.ceil(days / 7)} weeks left`;
    return `${Math.ceil(days / 30)} months left`;
  };

  const expiringCount = medicines.filter(m => getDaysUntilExpiry(m.expiryDate) <= 30 && getDaysUntilExpiry(m.expiryDate) >= 0).length;
  const expiredCount = medicines.filter(m => getDaysUntilExpiry(m.expiryDate) < 0).length;

  const renderItem = ({ item }) => {
    const expiryColor = getExpiryColor(item.expiryDate);
    const isExpired = getDaysUntilExpiry(item.expiryDate) < 0;

    return (
      <View style={[styles.card, isExpired && styles.expiredCard]}>
        <View style={[styles.expiryIndicator, { backgroundColor: expiryColor }]} />
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.medName}>{item.name}</Text>
            <TouchableOpacity onPress={() => handleDelete(item._id, item.name)}>
              <Icon name="close-circle" size={22} color={theme.textTertiary} />
            </TouchableOpacity>
          </View>
          {item.dosage ? <Text style={styles.dosage}>{item.dosage}</Text> : null}
          <View style={styles.cardFooter}>
            <View style={styles.expiryRow}>
              <Icon name="calendar-clock" size={14} color={expiryColor} />
              <Text style={[styles.expiryText, { color: expiryColor }]}>
                {getExpiryLabel(item.expiryDate)}
              </Text>
            </View>
            <Text style={styles.qty}>Qty: {item.quantity}</Text>
          </View>
          {item.notes ? <Text style={styles.notes}>{item.notes}</Text> : null}
          <Text style={styles.dateText}>
            Exp: {new Date(item.expiryDate).toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Medicine Cabinet</Text>
        <TouchableOpacity onPress={() => setShowAdd(true)}>
          <Icon name="plus-circle" size={26} color={theme.primary} />
        </TouchableOpacity>
      </View>

      {/* Summary */}
      {medicines.length > 0 && (
        <View style={styles.summary}>
          <View style={styles.summaryItem}>
            <Text style={styles.summaryNum}>{medicines.length}</Text>
            <Text style={styles.summaryLabel}>Total</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: theme.warning }]}>{expiringCount}</Text>
            <Text style={styles.summaryLabel}>Expiring Soon</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryItem}>
            <Text style={[styles.summaryNum, { color: theme.error }]}>{expiredCount}</Text>
            <Text style={styles.summaryLabel}>Expired</Text>
          </View>
        </View>
      )}

      {medicines.length === 0 ? (
        <View style={styles.center}>
          <Icon name="pill" size={80} color={theme.textTertiary} />
          <Text style={styles.emptyTitle}>No medicines tracked</Text>
          <Text style={styles.emptySubtitle}>Add your home medicines to track expiry dates</Text>
          <TouchableOpacity style={styles.addBtnLg} onPress={() => setShowAdd(true)}>
            <Icon name="plus" size={18} color="#fff" />
            <Text style={styles.addBtnText}>Add Medicine</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={medicines}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => { setRefreshing(true); fetchMedicines(); }}
              tintColor={theme.primary}
            />
          }
        />
      )}

      {/* Add Modal */}
      <Modal visible={showAdd} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Medicine</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Icon name="close" size={24} color={theme.textPrimary} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.input}
              placeholder="Medicine name *"
              placeholderTextColor={theme.placeholder}
              value={form.name}
              onChangeText={(t) => setForm(p => ({ ...p, name: t }))}
            />
            <TextInput
              style={styles.input}
              placeholder="Dosage (e.g. 500mg)"
              placeholderTextColor={theme.placeholder}
              value={form.dosage}
              onChangeText={(t) => setForm(p => ({ ...p, dosage: t }))}
            />
            <View style={styles.row}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="Quantity"
                placeholderTextColor={theme.placeholder}
                value={form.quantity}
                onChangeText={(t) => setForm(p => ({ ...p, quantity: t }))}
                keyboardType="numeric"
              />
              <View style={{ width: 12 }} />
              <TextInput
                style={[styles.input, { flex: 2 }]}
                placeholder="Expiry date (YYYY-MM-DD) *"
                placeholderTextColor={theme.placeholder}
                value={form.expiryDate}
                onChangeText={(t) => setForm(p => ({ ...p, expiryDate: t }))}
              />
            </View>
            <TextInput
              style={[styles.input, { minHeight: 60 }]}
              placeholder="Notes (optional)"
              placeholderTextColor={theme.placeholder}
              value={form.notes}
              onChangeText={(t) => setForm(p => ({ ...p, notes: t }))}
              multiline
            />

            <TouchableOpacity
              style={[styles.saveBtn, saving && { opacity: 0.5 }]}
              onPress={handleAdd}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Add to Inventory</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textPrimary },
  summary: {
    flexDirection: 'row', backgroundColor: theme.surface, margin: 16,
    borderRadius: 12, padding: 16, borderWidth: 1, borderColor: theme.border,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryNum: { fontSize: 22, fontWeight: 'bold', color: theme.textPrimary },
  summaryLabel: { fontSize: 11, color: theme.textSecondary, marginTop: 2 },
  summaryDivider: { width: 1, backgroundColor: theme.border, marginHorizontal: 12 },
  list: { padding: 16, paddingTop: 0 },
  card: {
    flexDirection: 'row', backgroundColor: theme.surface, borderRadius: 12,
    marginBottom: 10, borderWidth: 1, borderColor: theme.border, overflow: 'hidden',
  },
  expiredCard: { opacity: 0.7 },
  expiryIndicator: { width: 4 },
  cardContent: { flex: 1, padding: 12 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  medName: { fontSize: 16, fontWeight: '600', color: theme.textPrimary, flex: 1 },
  dosage: { fontSize: 13, color: theme.textSecondary, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  expiryRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  expiryText: { fontSize: 13, fontWeight: '600' },
  qty: { fontSize: 12, color: theme.textSecondary },
  notes: { fontSize: 12, color: theme.textTertiary, marginTop: 4, fontStyle: 'italic' },
  dateText: { fontSize: 11, color: theme.textTertiary, marginTop: 4 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textPrimary, marginTop: 16 },
  emptySubtitle: { fontSize: 14, color: theme.textSecondary, marginTop: 4, textAlign: 'center' },
  addBtnLg: {
    flexDirection: 'row', backgroundColor: theme.primary, paddingHorizontal: 24,
    paddingVertical: 12, borderRadius: 25, marginTop: 20, gap: 8, alignItems: 'center',
  },
  addBtnText: { color: theme.buttonText, fontWeight: '600', fontSize: 15 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.background, borderTopLeftRadius: 20, borderTopRightRadius: 20,
    padding: 20, paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: { fontSize: 18, fontWeight: 'bold', color: theme.textPrimary },
  input: {
    backgroundColor: theme.inputBackground, borderRadius: 10, padding: 14,
    color: theme.textPrimary, fontSize: 15, marginBottom: 12,
    borderWidth: 1, borderColor: theme.border,
  },
  row: { flexDirection: 'row' },
  saveBtn: {
    backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 14,
    alignItems: 'center', marginTop: 8,
  },
  saveBtnText: { color: theme.buttonText, fontSize: 16, fontWeight: '600' },
});
