import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, StatusBar, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { authAPI } from '../services/mobileApi';
import { useTheme } from '../context/ThemeContext';

const STEPS = ['Account', 'Personal', 'Health'];

export default function RegisterScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const { theme, isDark } = useTheme();
  const styles = createStyles(theme);

  // Step 0 — Account credentials
  const [email, setEmail]       = useState('');
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');

  // Step 1 — Personal info
  const [name, setName]       = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob]         = useState('');

  // Step 2 — Health profile
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [allergies, setAllergies]   = useState('');
  const [conditions, setConditions] = useState('');

  const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'];

  // ── Validate step before advancing ──
  const validateStep = () => {
    if (step === 0) {
      if (!email.trim())        { Alert.alert('Missing field', 'Email is required to log in.'); return false; }
      if (!phone.trim())        { Alert.alert('Missing field', 'Phone number is required.'); return false; }
      if (!password)            { Alert.alert('Missing field', 'Please enter a password.'); return false; }
      if (password.length < 6) { Alert.alert('Weak password', 'Password must be at least 6 characters.'); return false; }
      if (password !== confirm) { Alert.alert('Password mismatch', 'Passwords do not match.'); return false; }
    }
    if (step === 1) {
      if (!name.trim()) { Alert.alert('Missing field', 'Please enter your full name.'); return false; }
    }
    return true;
  };

  const nextStep = () => { if (validateStep()) setStep(s => Math.min(s + 1, 2)); };
  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  const handleRegister = async () => {
    const payload = {
      name:              name.trim(),
      email:             email.trim() || undefined,
      phone:             phone.trim(),
      password,
      dateOfBirth:       dob.trim() || undefined,
      bloodGroup,
      allergies:         allergies.split(',').map(a => a.trim()).filter(Boolean),
      chronicConditions: conditions.split(',').map(c => c.trim()).filter(Boolean),
      address:           address.trim() || undefined,
    };

    if (!payload.phone) {
      Alert.alert('Missing field', 'Please enter your phone number in Step 2 before submitting.');
      return;
    }

    try {
      setLoading(true);
      const res = await authAPI.registerPatient?.(payload);
      if (res?.data?.success) {
        Alert.alert(
          'Account Created! 🎉',
          'Your account is ready. Log in with your email and password.',
          [{ text: 'Go to Login', onPress: () => navigation.navigate('Login') }]
        );
      } else {
        Alert.alert('Registration failed', res?.data?.message || 'Please try again.');
      }
    } catch (err) {
      const msg = err?.response?.data?.message;
      Alert.alert('Error', msg || 'Could not connect to server. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Progress bar ──
  const ProgressBar = () => (
    <View style={styles.progressWrap}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <View style={[styles.progressStep, i <= step && styles.progressStepActive]}>
            {i < step
              ? <MaterialIcons name="check" size={14} color={theme.buttonText} />
              : <Text style={[styles.progressNum, i <= step && styles.progressNumActive]}>{i + 1}</Text>}
          </View>
          {i < STEPS.length - 1 && (
            <View style={[styles.progressLine, i < step && styles.progressLineActive]} />
          )}
        </React.Fragment>
      ))}
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.background} />

      {/* Background glows */}
      <View style={styles.glowTL} />
      <View style={styles.glowBR} />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* ── Header ── */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtnSmall} onPress={() => step > 0 ? prevStep() : navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={20} color={theme.textPrimary} />
            </TouchableOpacity>
            <View style={styles.logoSmall}>
              <MaterialIcons name="local-pharmacy" size={22} color="#fff" />
            </View>
          </View>

          {/* ── Title ── */}
          <View style={styles.titleBlock}>
            <Text style={styles.titleMain}>Create Account</Text>
            <Text style={styles.titleSub}>Join RxHub — your health, simplified</Text>
          </View>

          {/* ── Progress ── */}
          <ProgressBar />
          <Text style={styles.stepLabel}>{STEPS[step]} Details</Text>

          {/* ── Step 0: Credentials ── */}
          {step === 0 && (
            <View style={styles.form}>
              <FieldInput label="Email Address *" icon="mail" value={email} onChange={setEmail} keyType="email-address" placeholder="example@email.com" />
              <FieldInput label="Phone Number *" icon="phone" value={phone} onChange={setPhone} keyType="phone-pad" placeholder="+91 98765 43210" />

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Password</Text>
                <View style={styles.inputWrap}>
                  <MaterialIcons name="lock" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { paddingRight: 48 }]}
                    placeholder="Min 6 characters"
                    placeholderTextColor={theme.placeholder}
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPass}
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(p => !p)}>
                    <MaterialIcons name={showPass ? 'visibility' : 'visibility-off'} size={20} color={theme.textTertiary} />
                  </TouchableOpacity>
                </View>
                {/* Password strength indicator */}
                {password.length > 0 && (
                  <View style={styles.strengthRow}>
                    {[...Array(4)].map((_, i) => (
                      <View key={i} style={[
                        styles.strengthBar,
                        i < Math.min(Math.floor(password.length / 3), 4) && {
                          backgroundColor: password.length < 6 ? theme.error : password.length < 9 ? theme.warning : theme.success
                        }
                      ]} />
                    ))}
                    <Text style={styles.strengthLabel}>
                      {password.length < 6 ? 'Weak' : password.length < 9 ? 'Fair' : 'Strong'}
                    </Text>
                  </View>
                )}
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirm Password</Text>
                <View style={styles.inputWrap}>
                  <MaterialIcons name="lock-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                  <TextInput
                    style={[styles.input, { paddingRight: 48 }]}
                    placeholder="Re-enter password"
                    placeholderTextColor={theme.placeholder}
                    value={confirm}
                    onChangeText={setConfirm}
                    secureTextEntry={!showConfirm}
                  />
                  <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowConfirm(p => !p)}>
                    <MaterialIcons name={showConfirm ? 'visibility' : 'visibility-off'} size={20} color={theme.textTertiary} />
                  </TouchableOpacity>
                </View>
                {confirm.length > 0 && password !== confirm && (
                  <Text style={styles.matchError}>Passwords don't match</Text>
                )}
              </View>
            </View>
          )}

          {/* ── Step 1: Personal ── */}
          {step === 1 && (
            <View style={styles.form}>
              <FieldInput label="Full Name *" icon="person" value={name} onChange={setName} placeholder="Alex Morgan" />
              <FieldInput label="Address" icon="home" value={address} onChange={setAddress} placeholder="123 Street, City" multiline />
              <FieldInput label="Date of Birth" icon="cake" value={dob} onChange={setDob} placeholder="YYYY-MM-DD" keyType="default" />
            </View>
          )}

          {/* ── Step 2: Health ── */}
          {step === 2 && (
            <View style={styles.form}>
              <Text style={styles.label}>Blood Group</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8, marginBottom: 20 }}>
                {BLOOD_GROUPS.map(bg => (
                  <TouchableOpacity
                    key={bg}
                    style={[styles.bloodPill, bloodGroup === bg && styles.bloodPillActive]}
                    onPress={() => setBloodGroup(bg)}
                  >
                    <Text style={[styles.bloodPillText, bloodGroup === bg && styles.bloodPillTextActive]}>{bg}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>

              <View style={styles.infoCard}>
                <MaterialIcons name="info" size={14} color={theme.primary} />
                <Text style={styles.infoCardText}>For the next two fields, separate multiple entries with a comma. E.g. "Peanuts, Penicillin"</Text>
              </View>

              <FieldInput label="Allergies (comma-separated)" icon="warning" value={allergies} onChange={setAllergies} placeholder="Penicillin, Peanuts" />
              <FieldInput label="Chronic Conditions" icon="medical-services" value={conditions} onChange={setConditions} placeholder="Hypertension, Asthma" multiline />
            </View>
          )}

          {/* ── Navigation Buttons ── */}
          <View style={styles.navRow}>
            {step > 0 && (
              <TouchableOpacity style={styles.prevBtn} onPress={prevStep}>
                <MaterialIcons name="arrow-back" size={18} color={theme.textSecondary} />
                <Text style={styles.prevBtnText}>Back</Text>
              </TouchableOpacity>
            )}

            {step < 2 ? (
              <TouchableOpacity style={[styles.nextBtn, step === 0 && { flex: 1 }]} onPress={nextStep}>
                <Text style={styles.nextBtnText}>Continue</Text>
                <MaterialIcons name="arrow-forward" size={18} color={theme.buttonText} />
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[styles.nextBtn, { flex: 1 }, loading && { opacity: 0.7 }]}
                onPress={handleRegister}
                disabled={loading}
              >
                {loading
                  ? <ActivityIndicator color={theme.buttonText} />
                  : <>
                      <Text style={styles.nextBtnText}>Create Account</Text>
                      <MaterialIcons name="check-circle" size={18} color={theme.buttonText} />
                    </>}
              </TouchableOpacity>
            )}
          </View>

          {/* ── Sign In link ── */}
          <View style={styles.loginRow}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Sign In</Text>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Reusable field ──
function FieldInput({ label, icon, value, onChange, placeholder, keyType = 'default', multiline }) {
  const { theme } = useTheme();
  const styles = createStyles(theme);
  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.inputWrap, multiline && { alignItems: 'flex-start', paddingTop: 4 }]}>
        <MaterialIcons name={icon} size={20} color={theme.textTertiary} style={[styles.inputIcon, multiline && { marginTop: 12 }]} />
        <TextInput
          style={[styles.input, multiline && { height: 80, textAlignVertical: 'top' }]}
          placeholder={placeholder}
          placeholderTextColor={theme.placeholder}
          value={value}
          onChangeText={onChange}
          keyboardType={keyType}
          multiline={multiline}
          autoCapitalize={keyType === 'email-address' ? 'none' : 'sentences'}
        />
      </View>
    </View>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background, overflow: 'hidden' },

  // Glows
  glowTL: { position: 'absolute', top: '-5%', left: '-15%', width: '60%', height: '25%', borderRadius: 999, backgroundColor: theme.primary + '25' },
  glowBR: { position: 'absolute', bottom: '5%', right: '-15%', width: '60%', height: '25%', borderRadius: 999, backgroundColor: '#7c3aed15' },

  scroll: { flexGrow: 1, paddingHorizontal: 26, paddingTop: 20, paddingBottom: 40 },

  // Header
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 },
  backBtnSmall: { width: 38, height: 38, borderRadius: 19, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, justifyContent: 'center', alignItems: 'center' },
  logoSmall: { width: 38, height: 38, borderRadius: 10, backgroundColor: theme.primary, justifyContent: 'center', alignItems: 'center' },

  // Title
  titleBlock: { marginBottom: 28 },
  titleMain: { color: theme.textPrimary, fontSize: 28, fontWeight: '800', letterSpacing: -0.5 },
  titleSub: { color: theme.textSecondary, fontSize: 14, marginTop: 4 },

  // Progress
  progressWrap: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  progressStep: { width: 28, height: 28, borderRadius: 14, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, justifyContent: 'center', alignItems: 'center' },
  progressStepActive: { backgroundColor: theme.primary, borderColor: theme.primary },
  progressNum: { color: theme.textSecondary, fontSize: 12, fontWeight: '700' },
  progressNumActive: { color: theme.buttonText },
  progressLine: { flex: 1, height: 2, backgroundColor: theme.border, marginHorizontal: 4 },
  progressLineActive: { backgroundColor: theme.primary },
  stepLabel: { color: theme.textSecondary, fontSize: 12, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 20, marginTop: 6 },

  // Form fields
  form: { gap: 4 },
  fieldGroup: { marginBottom: 16 },
  label: { color: theme.textSecondary, fontSize: 12, fontWeight: '600', marginBottom: 7, marginLeft: 2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.inputBackground, borderWidth: 1, borderColor: theme.border, borderRadius: 14 },
  inputIcon: { marginLeft: 14 },
  input: { flex: 1, color: theme.textPrimary, fontSize: 15, paddingHorizontal: 12, paddingVertical: 14 },
  eyeBtn: { position: 'absolute', right: 0, top: 0, bottom: 0, paddingHorizontal: 14, justifyContent: 'center' },

  // Password strength
  strengthRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 8 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: theme.border },
  strengthLabel: { color: theme.textSecondary, fontSize: 11, fontWeight: '600', marginLeft: 4, width: 40 },
  matchError: { color: theme.error, fontSize: 11, marginTop: 5, marginLeft: 2 },

  // Blood group pills
  bloodPill: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 99, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  bloodPillActive: { backgroundColor: theme.primaryMuted, borderColor: theme.primary },
  bloodPillText: { color: theme.textSecondary, fontWeight: '700', fontSize: 14 },
  bloodPillTextActive: { color: theme.primary },

  // Info card
  infoCard: { flexDirection: 'row', gap: 8, alignItems: 'flex-start', backgroundColor: theme.primaryMuted, borderWidth: 1, borderColor: theme.primary + '40', borderRadius: 12, padding: 12, marginBottom: 16 },
  infoCardText: { flex: 1, color: theme.textSecondary, fontSize: 12, lineHeight: 18 },

  // Navigation buttons
  navRow: { flexDirection: 'row', gap: 12, marginTop: 24 },
  prevBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 20, paddingVertical: 16, borderRadius: 14, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border },
  prevBtnText: { color: theme.textSecondary, fontWeight: '700', fontSize: 15 },
  nextBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, paddingVertical: 16, borderRadius: 14, backgroundColor: theme.primary, shadowColor: theme.primary, shadowOpacity: 0.35, shadowRadius: 14, elevation: 10 },
  nextBtnText: { color: theme.buttonText, fontSize: 16, fontWeight: '800' },

  // Login link
  loginRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  loginText: { color: theme.textSecondary, fontSize: 14 },
  loginLink: { color: theme.primary, fontSize: 14, fontWeight: '800' },
});
