import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  TextInput, ActivityIndicator, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { patientsAPI, authAPI } from '../services/mobileApi';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];
const TABS = ['Personal', 'Health', 'Security'];

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState('Personal');
  const [saving, setSaving] = useState(false);

  const [personal, setPersonal] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [health, setHealth] = useState({
    bloodGroup: user?.bloodGroup || 'O+',
    allergies: user?.allergies || [],
    conditions: user?.conditions || [],
    height: user?.height?.toString() || '',
    weight: user?.weight?.toString() || '',
  });
  const [allergyInput, setAllergyInput] = useState('');
  const [conditionInput, setConditionInput] = useState('');
  const [security, setSecurity] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });

  const avatarLetter = (user?.name || 'U').charAt(0).toUpperCase();

  const showAlert = (type, msg) => Alert.alert(type === 'success' ? '✅ Success' : '❌ Error', msg);

  const savePersonal = async () => {
    try { setSaving(true); await patientsAPI.update(user._id, personal); showAlert('success', 'Profile updated!'); }
    catch (_) { showAlert('error', 'Failed to save changes'); }
    finally { setSaving(false); }
  };

  const saveHealth = async () => {
    try { setSaving(true); await patientsAPI.addMedicalHistory(user._id, health); showAlert('success', 'Health profile saved!'); }
    catch (_) { showAlert('error', 'Failed to save health profile'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (!security.currentPassword || !security.newPassword) { showAlert('error', 'Please fill all password fields'); return; }
    if (security.newPassword !== security.confirmPassword) { showAlert('error', 'Passwords do not match'); return; }
    try {
      setSaving(true);
      await authAPI.changePassword?.({ currentPassword: security.currentPassword, newPassword: security.newPassword });
      showAlert('success', 'Password changed successfully!');
      setSecurity({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (_) { showAlert('error', 'Failed to change password'); }
    finally { setSaving(false); }
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

  const Field = ({ label, value, onChange, editable = true, multiline, secure, keyType = 'default' }) => (
    <View style={s.field}>
      <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>{label}</Text>
      <TextInput
        style={[
          s.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary },
          !editable && { opacity: 0.5 },
          multiline && { height: 88, textAlignVertical: 'top', paddingTop: 12 },
        ]}
        value={value}
        onChangeText={onChange}
        editable={editable}
        multiline={multiline}
        secureTextEntry={secure}
        keyboardType={keyType}
        placeholderTextColor={theme.placeholder}
      />
    </View>
  );

  const SaveBtn = ({ label = 'Save Changes', onPress }) => (
    <TouchableOpacity
      style={[s.saveBtn, { backgroundColor: theme.primary }]}
      onPress={onPress}
      disabled={saving}
      activeOpacity={0.85}
    >
      {saving ? <ActivityIndicator color="#fff" /> : (
        <>
          <Icon name="content-save-outline" size={18} color="#fff" />
          <Text style={s.saveBtnText}>{label}</Text>
        </>
      )}
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={[s.root, { backgroundColor: theme.background }]} edges={['top']}>
      <View style={[s.header, { borderBottomColor: theme.border }]}>
        <TouchableOpacity
          style={[s.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => navigation.goBack()}
        >
          <Icon name="arrow-left" size={20} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={[s.headerTitle, { color: theme.textPrimary }]}>Profile</Text>
        <TouchableOpacity
          style={[s.iconBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={toggleTheme}
        >
          <Icon name={isDark ? 'weather-night' : 'weather-sunny'} size={20} color={isDark ? '#f59e0b' : '#3b82f6'} />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        <View style={[s.avatarBlock, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={[s.avatarRing, { borderColor: theme.primary }]}>
            <View style={[s.avatarInner, { backgroundColor: theme.primary }]}>
              <Text style={s.avatarLetter}>{avatarLetter}</Text>
            </View>
          </View>
          <View style={[s.onlineDot, { backgroundColor: '#10b981', borderColor: theme.card }]} />
          <Text style={[s.userName, { color: theme.textPrimary }]}>{user?.name || 'User'}</Text>
          <Text style={[s.userEmail, { color: theme.textSecondary }]}>{user?.email || ''}</Text>
          <View style={[s.memberBadge, { backgroundColor: '#10b98118' }]}>
            <Icon name="shield-check" size={13} color="#10b981" />
            <Text style={s.memberBadgeText}>Active Member</Text>
          </View>
          {user?._id && (
            <Text style={[s.patientId, { color: theme.textTertiary }]}>
              ID: {user._id.slice(-8).toUpperCase()}
            </Text>
          )}
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={s.tabsRow}
        >
          {TABS.map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                s.tabBtn,
                { borderBottomColor: activeTab === tab ? theme.primary : 'transparent' },
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[
                s.tabBtnText,
                { color: activeTab === tab ? theme.primary : theme.textSecondary },
              ]}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View style={s.tabContent}>

          {activeTab === 'Personal' && (
            <>
              <Field label="Full Name"    value={personal.name}    onChange={v => setPersonal(p => ({ ...p, name: v }))}    />
              <Field label="Email"        value={user?.email || ''} onChange={() => {}}                                      editable={false} />
              <Field label="Phone"        value={personal.phone}   onChange={v => setPersonal(p => ({ ...p, phone: v }))}   keyType="phone-pad" />
              <Field label="Address"      value={personal.address} onChange={v => setPersonal(p => ({ ...p, address: v }))} multiline />
              <SaveBtn onPress={savePersonal} />
            </>
          )}

          {activeTab === 'Health' && (
            <>
              <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Blood Group</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.pillsRow}>
                {BLOOD_GROUPS.map(bg => (
                  <TouchableOpacity
                    key={bg}
                    style={[
                      s.pill,
                      { backgroundColor: theme.card, borderColor: theme.border },
                      health.bloodGroup === bg && { backgroundColor: theme.primary + '18', borderColor: theme.primary },
                    ]}
                    onPress={() => setHealth(h => ({ ...h, bloodGroup: bg }))}
                  >
                    <Text style={[
                      s.pillText, { color: theme.textSecondary },
                      health.bloodGroup === bg && { color: theme.primary },
                    ]}>
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <Text style={[s.fieldLabel, { color: theme.textSecondary, marginTop: 16 }]}>Allergies</Text>
              <View style={s.tags}>
                {health.allergies.map((a, i) => (
                  <View key={i} style={[s.tag, { backgroundColor: '#ef444418', borderColor: '#ef444440' }]}>
                    <Text style={[s.tagText, { color: '#ef4444' }]}>{a}</Text>
                    <TouchableOpacity onPress={() => removeTag('allergy', i)}>
                      <Icon name="close" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={[s.tagInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <TextInput
                    value={allergyInput}
                    onChangeText={setAllergyInput}
                    onSubmitEditing={() => addTag('allergy')}
                    placeholder="Add allergy..."
                    placeholderTextColor={theme.placeholder}
                    style={[s.tagInputField, { color: theme.textPrimary }]}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={() => addTag('allergy')} style={s.tagAddBtn}>
                    <Icon name="plus" size={16} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <Text style={[s.fieldLabel, { color: theme.textSecondary, marginTop: 16 }]}>Chronic Conditions</Text>
              <View style={s.tags}>
                {health.conditions.map((c, i) => (
                  <View key={i} style={[s.tag, { backgroundColor: '#f59e0b18', borderColor: '#f59e0b40' }]}>
                    <Text style={[s.tagText, { color: '#f59e0b' }]}>{c}</Text>
                    <TouchableOpacity onPress={() => removeTag('condition', i)}>
                      <Icon name="close" size={14} color="#f59e0b" />
                    </TouchableOpacity>
                  </View>
                ))}
                <View style={[s.tagInput, { backgroundColor: theme.card, borderColor: theme.border }]}>
                  <TextInput
                    value={conditionInput}
                    onChangeText={setConditionInput}
                    onSubmitEditing={() => addTag('condition')}
                    placeholder="Add condition..."
                    placeholderTextColor={theme.placeholder}
                    style={[s.tagInputField, { color: theme.textPrimary }]}
                    returnKeyType="done"
                  />
                  <TouchableOpacity onPress={() => addTag('condition')} style={s.tagAddBtn}>
                    <Icon name="plus" size={16} color={theme.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={s.row2}>
                <View style={{ flex: 1 }}>
                  <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Height (cm)</Text>
                  <TextInput
                    style={[s.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }]}
                    value={health.height}
                    onChangeText={v => setHealth(h => ({ ...h, height: v }))}
                    keyboardType="numeric"
                    placeholderTextColor={theme.placeholder}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[s.fieldLabel, { color: theme.textSecondary }]}>Weight (kg)</Text>
                  <TextInput
                    style={[s.input, { backgroundColor: theme.card, borderColor: theme.border, color: theme.textPrimary }]}
                    value={health.weight}
                    onChangeText={v => setHealth(h => ({ ...h, weight: v }))}
                    keyboardType="numeric"
                    placeholderTextColor={theme.placeholder}
                  />
                </View>
              </View>
              <SaveBtn onPress={saveHealth} />
            </>
          )}

          {activeTab === 'Security' && (
            <>
              <Field label="Current Password" value={security.currentPassword} onChange={v => setSecurity(s => ({ ...s, currentPassword: v }))} secure />
              <Field label="New Password"     value={security.newPassword}     onChange={v => setSecurity(s => ({ ...s, newPassword: v }))}     secure />
              <Field label="Confirm Password" value={security.confirmPassword} onChange={v => setSecurity(s => ({ ...s, confirmPassword: v }))} secure />
              <SaveBtn label="Change Password" onPress={changePassword} />

              <View style={[s.divider, { backgroundColor: theme.border }]} />

              <TouchableOpacity
                style={[s.settingsRow, { backgroundColor: theme.card, borderColor: theme.border }]}
                onPress={toggleTheme}
                activeOpacity={0.8}
              >
                <View style={[s.settingsIconWrap, { backgroundColor: isDark ? '#f59e0b18' : '#3b82f618' }]}>
                  <Icon name={isDark ? 'weather-night' : 'weather-sunny'} size={20} color={isDark ? '#f59e0b' : '#3b82f6'} />
                </View>
                <Text style={[s.settingsLabel, { color: theme.textPrimary }]}>
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </Text>
                <View style={[s.toggle, { backgroundColor: isDark ? theme.primary : theme.border }]}>
                  <View style={[s.toggleThumb, { alignSelf: isDark ? 'flex-end' : 'flex-start' }]} />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                style={[s.logoutBtn, { borderColor: '#ef444440', backgroundColor: '#ef444412' }]}
                onPress={() => Alert.alert('Logout', 'Are you sure?', [
                  { text: 'Cancel', style: 'cancel' },
                  { text: 'Logout', style: 'destructive', onPress: logout },
                ])}
                activeOpacity={0.8}
              >
                <Icon name="logout" size={18} color="#ef4444" />
                <Text style={s.logoutText}>Logout</Text>
              </TouchableOpacity>
            </>
          )}

        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  root: { flex: 1 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1,
  },
  iconBtn: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1 },
  headerTitle: { fontSize: 18, fontWeight: '700', lineHeight: 24 },
  scroll: { paddingBottom: 120 },
  avatarBlock: {
    alignItems: 'center', paddingVertical: 28, marginHorizontal: 16, marginTop: 16,
    borderRadius: 20, borderWidth: 1, position: 'relative',
  },
  avatarRing: { borderWidth: 2.5, borderRadius: 56, padding: 3, marginBottom: 12 },
  avatarInner: { width: 96, height: 96, borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#fff', fontSize: 36, fontWeight: '800' },
  onlineDot: {
    position: 'absolute', top: 72, left: '55%',
    width: 18, height: 18, borderRadius: 9, borderWidth: 2.5,
  },
  userName: { fontSize: 20, fontWeight: '800', lineHeight: 26, marginBottom: 4 },
  userEmail: { fontSize: 13, lineHeight: 18, marginBottom: 10 },
  memberBadge: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 5, borderRadius: 99, marginBottom: 8 },
  memberBadgeText: { color: '#10b981', fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },
  patientId: { fontSize: 11, fontWeight: '500' },
  tabsRow: { paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
  tabBtn: { paddingVertical: 10, paddingHorizontal: 16, borderBottomWidth: 2.5, marginRight: 4 },
  tabBtnText: { fontSize: 14, fontWeight: '700', lineHeight: 20 },
  tabContent: { paddingHorizontal: 16, paddingTop: 4 },
  field: { marginBottom: 16 },
  fieldLabel: { fontSize: 12, fontWeight: '600', marginBottom: 8, letterSpacing: 0.3, textTransform: 'uppercase' },
  input: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, fontSize: 15, lineHeight: 22 },
  pillsRow: { gap: 8, paddingVertical: 8 },
  pill: { paddingHorizontal: 16, paddingVertical: 9, borderRadius: 99, borderWidth: 1 },
  pillText: { fontSize: 13, fontWeight: '700' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 4 },
  tag: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 10, borderWidth: 1 },
  tagText: { fontSize: 13, fontWeight: '600' },
  tagInput: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 10, paddingLeft: 10, paddingRight: 4 },
  tagInputField: { fontSize: 13, padding: 6, minWidth: 100 },
  tagAddBtn: { padding: 6 },
  row2: { flexDirection: 'row', gap: 12, marginTop: 16, marginBottom: 0 },
  saveBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    marginTop: 20, marginBottom: 8, paddingVertical: 15, borderRadius: 16,
  },
  saveBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  divider: { height: 1, marginVertical: 20 },
  settingsRow: {
    flexDirection: 'row', alignItems: 'center', gap: 14,
    padding: 14, borderRadius: 14, borderWidth: 1, marginBottom: 12,
  },
  settingsIconWrap: { width: 38, height: 38, borderRadius: 11, justifyContent: 'center', alignItems: 'center' },
  settingsLabel: { flex: 1, fontSize: 15, fontWeight: '600', lineHeight: 20 },
  toggle: { width: 48, height: 28, borderRadius: 14, padding: 3, justifyContent: 'center' },
  toggleThumb: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    paddingVertical: 14, borderRadius: 14, borderWidth: 1, marginTop: 8,
  },
  logoutText: { color: '#ef4444', fontWeight: '700', fontSize: 14 },
});
