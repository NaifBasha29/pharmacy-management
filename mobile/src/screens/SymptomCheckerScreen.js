import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert, ScrollView
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { aiAPI } from '../services/mobileApi';

export default function SymptomCheckerScreen({ navigation }) {
  const [symptoms, setSymptoms] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const { addToCart } = useCart();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const quickSymptoms = [
    'Fever', 'Headache', 'Cold & Cough', 'Stomach Pain',
    'Allergy', 'Body Pain', 'Diarrhea', 'Skin Issue',
    'Fatigue & Weakness', 'Eye Problem', 'Sleep Issues'
  ];

  const handleCheck = useCallback(async () => {
    if (!symptoms.trim()) {
      Alert.alert('Input Required', 'Please describe your symptoms');
      return;
    }
    try {
      setLoading(true);
      const res = await aiAPI.symptomCheck(symptoms.trim());
      if (res.data.success) {
        setResult(res.data.data);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to check symptoms. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [symptoms]);

  const handleQuickTap = (symptom) => {
    const current = symptoms.trim();
    setSymptoms(current ? `${current}, ${symptom.toLowerCase()}` : symptom.toLowerCase());
  };

  const handleAddToCart = (medicine) => {
    if (medicine.stock <= 0) {
      Alert.alert('Out of Stock', 'This medicine is currently unavailable.');
      return;
    }
    addToCart(medicine);
    Alert.alert('Added', `${medicine.name} added to cart`);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Icon name="arrow-left" size={24} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Symptom Checker</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Input Section */}
        <View style={styles.inputSection}>
          <Text style={styles.sectionLabel}>Describe your symptoms</Text>
          <TextInput
            style={styles.textInput}
            placeholder="e.g., I have fever and headache since yesterday..."
            placeholderTextColor={theme.placeholder}
            value={symptoms}
            onChangeText={setSymptoms}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Quick Symptom Tags */}
        <View style={styles.tagsSection}>
          <Text style={styles.tagsLabel}>Quick select:</Text>
          <View style={styles.tags}>
            {quickSymptoms.map((s) => (
              <TouchableOpacity
                key={s}
                style={styles.tag}
                onPress={() => handleQuickTap(s)}
              >
                <Text style={styles.tagText}>{s}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TouchableOpacity
          style={[styles.checkBtn, loading && styles.disabledBtn]}
          onPress={handleCheck}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Icon name="stethoscope" size={20} color="#fff" />
              <Text style={styles.checkBtnText}>Check Symptoms</Text>
            </>
          )}
        </TouchableOpacity>

        {/* Results */}
        {result && (
          <View style={styles.results}>
            {/* Disclaimer */}
            <View style={styles.disclaimer}>
              <Icon name="alert-circle-outline" size={18} color={theme.warning} />
              <Text style={styles.disclaimerText}>
                {result.disclaimer || 'These are general suggestions. Consult a healthcare professional.'}
              </Text>
            </View>

            {/* Conditions */}
            {result.conditions && result.conditions.length > 0 && (
              <View style={styles.conditionsRow}>
                <Text style={styles.conditionsLabel}>Possible conditions:</Text>
                <View style={styles.conditionsTags}>
                  {result.conditions.map((c) => (
                    <View key={c} style={styles.conditionTag}>
                      <Text style={styles.conditionTagText}>{c}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {result.message && (
              <Text style={styles.resultMessage}>{result.message}</Text>
            )}

            {/* Suggested Medicines */}
            {result.suggestions && result.suggestions.length > 0 && (
              <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsTitle}>Suggested Medicines</Text>
                {result.suggestions.map((med) => (
                  <View key={med._id} style={styles.medCard}>
                    <View style={styles.medInfo}>
                      <Text style={styles.medName}>{med.name}</Text>
                      {med.dosageForm && (
                        <Text style={styles.medDosage}>{med.dosageForm} {med.strength || ''}</Text>
                      )}
                      <Text style={styles.medPrice}>₹{(med.price || 0).toLocaleString('en-IN')}</Text>
                      <Text style={[styles.medStock, med.stock <= 0 && { color: theme.error }]}>
                        {med.stock > 0 ? `${med.stock} available` : 'Out of stock'}
                      </Text>
                    </View>
                    <TouchableOpacity
                      style={[styles.addBtn, med.stock <= 0 && styles.disabledBtn]}
                      onPress={() => handleAddToCart(med)}
                      disabled={med.stock <= 0}
                    >
                      <Icon name="cart-plus" size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 16, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: theme.textPrimary },
  content: { flex: 1, padding: 16 },
  inputSection: { marginBottom: 12 },
  sectionLabel: { fontSize: 15, fontWeight: '600', color: theme.textPrimary, marginBottom: 8 },
  textInput: {
    backgroundColor: theme.inputBackground, borderRadius: 12, padding: 14,
    color: theme.textPrimary, fontSize: 15, minHeight: 100,
    borderWidth: 1, borderColor: theme.border,
  },
  tagsSection: { marginBottom: 16 },
  tagsLabel: { fontSize: 13, color: theme.textSecondary, marginBottom: 8 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tag: {
    backgroundColor: theme.surfaceHighlight, paddingHorizontal: 12, paddingVertical: 6,
    borderRadius: 16, borderWidth: 1, borderColor: theme.border,
  },
  tagText: { fontSize: 13, color: theme.textSecondary },
  checkBtn: {
    backgroundColor: theme.primary, borderRadius: 12, paddingVertical: 14,
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8,
    marginBottom: 20,
  },
  checkBtnText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  disabledBtn: { opacity: 0.5 },
  results: { marginBottom: 30 },
  disclaimer: {
    flexDirection: 'row', backgroundColor: theme.warningMuted, borderRadius: 8,
    padding: 12, marginBottom: 16, gap: 8, alignItems: 'flex-start',
  },
  disclaimerText: { flex: 1, color: theme.warning, fontSize: 13, lineHeight: 18 },
  conditionsRow: { marginBottom: 12 },
  conditionsLabel: { fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 6 },
  conditionsTags: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  conditionTag: {
    backgroundColor: theme.primaryMuted, paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  conditionTagText: { color: theme.primary, fontSize: 13, fontWeight: '500', textTransform: 'capitalize' },
  resultMessage: { fontSize: 14, color: theme.textSecondary, marginBottom: 16, lineHeight: 20 },
  suggestionsTitle: { fontSize: 16, fontWeight: '600', color: theme.textPrimary, marginBottom: 12 },
  suggestionsSection: { marginTop: 4 },
  medCard: {
    flexDirection: 'row', backgroundColor: theme.surface,
    borderRadius: 10, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: theme.border, alignItems: 'center',
  },
  medInfo: { flex: 1 },
  medName: { fontSize: 15, fontWeight: '600', color: theme.textPrimary },
  medDosage: { fontSize: 12, color: theme.textSecondary, marginTop: 2 },
  medPrice: { fontSize: 15, fontWeight: 'bold', color: theme.primary, marginTop: 4 },
  medStock: { fontSize: 11, color: theme.success, marginTop: 2 },
  addBtn: {
    backgroundColor: theme.primary, borderRadius: 20,
    width: 40, height: 40, justifyContent: 'center', alignItems: 'center', marginLeft: 10,
  },
});
