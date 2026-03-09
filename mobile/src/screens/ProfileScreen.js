import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, StatusBar, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { patientsAPI, authAPI } from '../services/mobileApi';
import Toast from 'react-native-toast-message';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const TABS = ['Personal Details', 'Health Profile', 'Security'];

export default function ProfileScreen({ navigation }) {
  const { user, updateUser, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState('Health Profile');
  const [saving, setSaving] = useState(false);

  // Personal
  const [personal, setPersonal] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });

  // Health
  const [health, setHealth] = useState({
    bloodGroup: user?.bloodGroup || 'O+',
    allergies: user?.allergies || [],
    conditions: user?.conditions || [],
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
  });
  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');

  // Security
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const firstName = (user?.name || 'U').charAt(0).toUpperCase();

  const savePersonal = async () => {
    try {
      setSaving(true);
      const res = await patientsAPI.update(user._id, personal);
      Toast.show({ type: 'success', text1: 'Profile updated!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save changes' });
    } finally {
      setSaving(false);
    }
  };

  const saveHealth = async () => {
    try {
      setSaving(true);
      await patientsAPI.addMedicalHistory(user._id, health);
      Toast.show({ type: 'success', text1: 'Health profile saved!' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to save health profile' });
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (!security.currentPassword || !security.newPassword) {
      Toast.show({ type: 'error', text1: 'Please fill all password fields' }); return;
    }
    if (security.newPassword !== security.confirmPassword) {
      Toast.show({ type: 'error', text1: 'Passwords do not match' }); return;
    }
    try {
      setSaving(true);
      await authAPI.changePassword?.({ currentPassword: security.currentPassword, newPassword: security.newPassword });
      Toast.show({ type: 'success', text1: 'Password changed successfully!' });
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch {
      Toast.show({ type: 'error', text1: 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const addTag = (type) => {
    if (type === 'allergy' && allergyInput.trim()) {
      setHealth(h => ({ ...h, allergies: [...h.allergies, allergyInput.trim()] }));
      setAllergyInput('');
    } else if (type === 'condition' && conditionInput.trim()) {
      setHealth(h => ({ ...h, conditions: [...h.conditions, conditionInput.trim()] }));
      setConditionInput('');
    }
  };

  const removeTag = (type, idx) => {
    if (type === 'allergy') setHealth(h => ({ ...h, allergies: h.allergies.filter((_, i) => i !== idx) }));
    else setHealth(h => ({ ...h, conditions: h.conditions.filter((_, i) => i !== idx) }));
  };

  // ── Personal Tab ──
  const PersonalTab = () => (
    <View style={styles.tabContent}>
      <LabelInput label="Full Name"   val={personal.name}    onChg={v => setPersonal(p => ({ ...p, name: v }))}    />
      <LabelInput label="Email"       val={user?.email || ''} onChg={() => {}} editable={false} />
      <LabelInput label="Phone"       val={personal.phone}   onChg={v => setPersonal(p => ({ ...p, phone: v }))}   keyType="phone-pad" />
      <LabelInput label="Address"     val={personal.address} onChg={v => setPersonal(p => ({ ...p, address: v }))} multiline />
      <SaveBtn onPress={savePersonal} saving={saving} />
    </View>
  );

  // ── Health Tab ──
  const HealthTab = () => (
    <View style={styles.tabContent}>
      {/* Blood Group */}
      <Text style={styles.fieldLabel}>Blood Group</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 20 }}>
        {BLOOD_GROUPS.map(bg => (
          <TouchableOpacity
            key={bg}
            style={[styles.bloodGroupPill, health.bloodGroup === bg && styles.bloodGroupPillActive]}
            onPress={() => setHealth(h => ({ ...h, bloodGroup: bg }))}
          >
            <Text style={[styles.bloodGroupText, health.bloodGroup === bg && styles.bloodGroupTextActive]}>{bg}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Allergies */}
      <View style={styles.tagSection}>
        <View style={styles.tagSectionHeader}>
          <Text style={styles.fieldLabel}>Allergies</Text>
          <TouchableOpacity onPress={() => health.allergies.length > 0 && removeTag('allergy', health.allergies.length - 1)}>
          </TouchableOpacity>
        </View>
        <View style={styles.tagRow}>
          {health.allergies.map((a, i) => (
            <View key={i} style={styles.allergyTag}>
              <Text style={styles.allergyTagText}>{a}</Text>
              <TouchableOpacity onPress={() => removeTag('allergy', i)}>
                <MaterialIcons name="close" size={14} color="#f87171" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.tagInput}>
            <TextInput
              value={allergyInput}
              onChangeText={setAllergyInput}
              onSubmitEditing={() => addTag('allergy')}
              placeholder="Add allergy..."
              placeholderTextColor="#6b7280"
              style={styles.tagInputField}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => addTag('allergy')} style={styles.tagAddBtn}>
              <MaterialIcons name="add" size={16} color="#f97415" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Conditions */}
      <View style={styles.tagSection}>
        <Text style={styles.fieldLabel}>Chronic Conditions</Text>
        <View style={styles.tagRow}>
          {health.conditions.map((c, i) => (
            <View key={i} style={styles.conditionTag}>
              <Text style={styles.conditionTagText}>{c}</Text>
              <TouchableOpacity onPress={() => removeTag('condition', i)}>
                <MaterialIcons name="close" size={14} color="#fbbf24" />
              </TouchableOpacity>
            </View>
          ))}
          <View style={styles.tagInput}>
            <TextInput
              value={conditionInput}
              onChangeText={setConditionInput}
              onSubmitEditing={() => addTag('condition')}
              placeholder="Add condition..."
              placeholderTextColor="#6b7280"
              style={styles.tagInputField}
              returnKeyType="done"
            />
            <TouchableOpacity onPress={() => addTag('condition')} style={styles.tagAddBtn}>
              <MaterialIcons name="add" size={16} color="#f97415" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Height / Weight */}
      <View style={styles.gridRow2}>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Height (cm)</Text>
          <TextInput style={styles.input} value={health.height} onChangeText={v => setHealth(h => ({ ...h, height: v }))} keyboardType="numeric" placeholderTextColor="#6b7280" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.fieldLabel}>Weight (kg)</Text>
          <TextInput style={styles.input} value={health.weight} onChangeText={v => setHealth(h => ({ ...h, weight: v }))} keyboardType="numeric" placeholderTextColor="#6b7280" />
        </View>
      </View>

      <SaveBtn onPress={saveHealth} saving={saving} />
    </View>
  );

  // ── Security Tab ──
  const SecurityTab = () => (
    <View style={styles.tabContent}>
      <LabelInput label="Current Password" val={security.currentPassword} onChg={v => setSecurity(s => ({ ...s, currentPassword: v }))} secure />
      <LabelInput label="New Password"     val={security.newPassword}     onChg={v => setSecurity(s => ({ ...s, newPassword: v }))}     secure />
      <LabelInput label="Confirm Password" val={security.confirmPassword} onChg={v => setSecurity(s => ({ ...s, confirmPassword: v }))} secure />
      <SaveBtn label="Change Password" onPress={changePassword} saving={saving} />

      {/* Theme Toggle */}
      <TouchableOpacity
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 14, paddingHorizontal: 4, marginBottom: 10 }}
        onPress={toggleTheme}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <MaterialIcons name={isDark ? 'dark-mode' : 'light-mode'} size={20} color={isDark ? '#f59e0b' : '#3b82f6'} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 15 }}>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </Text>
        </View>
        <View style={{
          width: 50, height: 28, borderRadius: 14, padding: 3,
          backgroundColor: isDark ? '#f97415' : '#d1d5db',
          justifyContent: 'center',
        }}>
          <View style={{
            width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff',
            alignSelf: isDark ? 'flex-end' : 'flex-start',
          }} />
        </View>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logoutBtn} onPress={() => Alert.alert('Logout', 'Are you sure?', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: logout }
      ])}>
        <MaterialIcons name="logout" size={18} color="#ef4444" />
        <Text style={styles.logoutBtnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar barStyle="light-content" backgroundColor="#23170f" />

      {/* ── Header ── */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.pageTitle}>Profile</Text>
        <TouchableOpacity style={styles.backBtn}>
          <MaterialIcons name="settings" size={22} color="#9ca3af" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>

        {/* ── Avatar Block ── */}
        <View style={styles.avatarBlock}>
          <View style={styles.avatarRing}>
            <View style={styles.avatarInner}>
              <Text style={styles.avatarLetter}>{firstName}</Text>
            </View>
          </View>
          <View style={styles.onlineDot} />
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <View style={styles.activeBadge}>
            <Text style={styles.activeBadgeText}>Active Member</Text>
          </View>
          <Text style={styles.patientId}>Patient ID: {user?._id?.slice(-8) || '—'}</Text>
        </View>

        {/* ── Tabs ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {TABS.map(t => (
            <TouchableOpacity key={t} style={[styles.tabBtn, activeTab === t && styles.tabBtnActive]} onPress={() => setActiveTab(t)}>
              <Text style={[styles.tabBtnText, activeTab === t && styles.tabBtnTextActive]}>{t}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Tab Content ── */}
        {activeTab === 'Personal Details' && <PersonalTab />}
        {activeTab === 'Health Profile'   && <HealthTab />}
        {activeTab === 'Security'         && <SecurityTab />}
      </ScrollView>
    </SafeAreaView>
  );
}

// ── Small helpers ──
function LabelInput({ label, val, onChg, editable = true, multiline, secure, keyType = 'default' }) {
  return (
    <View style={styles.fieldWrap}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        style={[styles.input, !editable && styles.inputDisabled, multiline && { height: 88, textAlignVertical: 'top' }]}
        value={val}
        onChangeText={onChg}
        editable={editable}
        multiline={multiline}
        secureTextEntry={secure}
        keyboardType={keyType}
        placeholderTextColor="#6b7280"
      />
    </View>
  );
}

function SaveBtn({ label = 'Save Changes', onPress, saving }) {
  return (
    <TouchableOpacity style={styles.saveBtn} onPress={onPress} disabled={saving}>
      {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>{label}</Text>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#23170f' },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', backgroundColor: '#352418' },
  pageTitle: { flex: 1, color: '#fff', fontWeight: '800', fontSize: 17, textAlign: 'center' },

  // Avatar block
  avatarBlock: { alignItems: 'center', paddingTop: 8, paddingBottom: 24, position: 'relative' },
  avatarRing: { padding: 3, borderRadius: 72, background: 'transparent', borderWidth: 2.5, borderColor: '#f97415', borderRadius: 72, marginBottom: 12 },
  avatarInner: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#f97415', justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#fff', fontSize: 38, fontWeight: '800' },
  onlineDot: { position: 'absolute', bottom: 92, right: '37%', width: 22, height: 22, borderRadius: 11, backgroundColor: '#10b981', borderWidth: 3, borderColor: '#23170f' },
  userName: { color: '#fff', fontWeight: '800', fontSize: 22, marginBottom: 6 },
  activeBadge: { backgroundColor: '#10b98120', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 99, marginBottom: 6 },
  activeBadgeText: { color: '#10b981', fontWeight: '700', fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 },
  patientId: { color: '#cca88e', fontSize: 12 },

  // Tabs
  tabsRow: { paddingHorizontal: 20, gap: 4, paddingBottom: 4 },
  tabBtn: { paddingVertical: 10, paddingHorizontal: 4, flex: 1, minWidth: 110, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#f97415' },
  tabBtnText: { color: '#cca88e', fontWeight: '600', fontSize: 13 },
  tabBtnTextActive: { color: '#f97415', fontWeight: '800' },

  // Tab content
  tabContent: { paddingHorizontal: 20, paddingTop: 20 },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: { color: '#9ca3af', fontSize: 13, fontWeight: '600', marginBottom: 6 },
  input: { backgroundColor: '#352418', borderWidth: 1, borderColor: '#4a3221', borderRadius: 14, color: '#fff', paddingHorizontal: 16, paddingVertical: 13, fontSize: 15 },
  inputDisabled: { opacity: 0.5 },
  gridRow2: { flexDirection: 'row', gap: 12, marginBottom: 16 },

  // Blood group pills
  bloodGroupPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 99, backgroundColor: '#352418', borderWidth: 1, borderColor: '#4a3221' },
  bloodGroupPillActive: { backgroundColor: '#f9741520', borderColor: '#f97415' },
  bloodGroupText: { color: '#9ca3af', fontWeight: '700', fontSize: 14 },
  bloodGroupTextActive: { color: '#f97415' },

  // Tag sections
  tagSection: { marginBottom: 20 },
  tagSectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  allergyTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: '#ef444420', borderWidth: 1, borderColor: '#ef444430' },
  allergyTagText: { color: '#f87171', fontWeight: '600', fontSize: 13 },
  conditionTag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, backgroundColor: '#f59e0b20', borderWidth: 1, borderColor: '#f59e0b30' },
  conditionTagText: { color: '#fbbf24', fontWeight: '600', fontSize: 13 },
  tagInput: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#352418', borderWidth: 1, borderColor: '#4a3221', borderRadius: 10, paddingLeft: 10, paddingRight: 4 },
  tagInputField: { color: '#fff', fontSize: 13, padding: 6, minWidth: 100 },
  tagAddBtn: { padding: 6 },

  // Save button
  saveBtn: { marginTop: 6, marginBottom: 16, backgroundColor: '#f97415', paddingVertical: 15, borderRadius: 16, alignItems: 'center', elevation: 6, shadowColor: '#f97415', shadowOpacity: 0.3, shadowRadius: 10 },
  saveBtnText: { color: '#fff', fontWeight: '800', fontSize: 15 },

  // Logout
  logoutBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 10, paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: '#ef444440' },
  logoutBtnText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
});
