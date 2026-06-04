import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const { login, loading, error } = useAuth();
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleLogin = async () => {
    if (!identifier.trim() || !password) return;
    await login(identifier.trim(), password);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Brand Header */}
          <View style={styles.brand}>
            <View style={styles.logoWrap}>
              <Icon name="pill" size={36} color={theme.primary} />
            </View>
            <Text style={styles.appName}>Pharma Care</Text>
            <Text style={styles.tagline}>Your health, delivered</Text>
          </View>

          {/* Form Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSubtitle}>Sign in to your account</Text>

            {!!error && (
              <View style={styles.errorBanner}>
                <Icon name="alert-circle-outline" size={16} color={theme.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email or Patient ID</Text>
              <View style={styles.inputRow}>
                <Icon name="account-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your email or patient ID"
                  placeholderTextColor={theme.placeholder}
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  autoCorrect={false}
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputRow}>
                <Icon name="lock-outline" size={20} color={theme.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your password"
                  placeholderTextColor={theme.placeholder}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                  <Icon name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={theme.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={styles.forgotWrap}
              onPress={() => navigation.navigate('ForgotPassword')}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.btnText}>Sign In</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.demoBox}>
            <Text style={styles.demoTitle}>Demo Credentials</Text>
            <Text style={styles.demoLine}>Admin: admin@pharmacy.com / Admin@123</Text>
            <Text style={styles.demoLine}>Pharmacist: pharmacist1@pharmacy.com / Pharma@123</Text>
            <Text style={styles.demoLine}>User: user1@example.com / User@123</Text>
            <Text style={styles.demoLine}>Patient (mobile): PAT001 / Patient@123</Text>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerHint}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>Create Account</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },
  brand: { alignItems: 'center', marginBottom: 36 },
  logoWrap: {
    width: 80, height: 80, borderRadius: 24,
    backgroundColor: theme.primaryMuted, justifyContent: 'center', alignItems: 'center',
    marginBottom: 14, borderWidth: 1.5, borderColor: theme.primary + '40',
  },
  appName: { fontSize: 28, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.5 },
  tagline: { fontSize: 14, color: theme.textSecondary, marginTop: 4, letterSpacing: 0.2 },
  card: {
    backgroundColor: theme.card, borderRadius: 20,
    padding: 24, borderWidth: 1, borderColor: theme.border,
    shadowColor: theme.shadow, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1, shadowRadius: 16, elevation: 6,
  },
  demoBox: {
    marginTop: 18,
    padding: 12,
    borderRadius: 12,
    backgroundColor: theme.cardMuted,
    borderWidth: 1,
    borderColor: theme.border,
  },
  demoTitle: { fontSize: 14, fontWeight: '700', color: theme.textPrimary, marginBottom: 6 },
  demoLine: { fontSize: 13, color: theme.textSecondary, marginBottom: 2 },
  cardTitle: { fontSize: 22, fontWeight: '700', color: theme.textPrimary, letterSpacing: -0.3, marginBottom: 4 },
  cardSubtitle: { fontSize: 14, color: theme.textSecondary, marginBottom: 24 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.errorMuted, borderRadius: 10,
    padding: 12, marginBottom: 20,
    borderWidth: 1, borderColor: theme.error + '30',
  },
  errorText: { flex: 1, fontSize: 13, color: theme.error, fontWeight: '500' },
  fieldWrap: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 8, letterSpacing: 0.2 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.inputBackground, borderRadius: 12,
    borderWidth: 1.5, borderColor: theme.border,
    paddingHorizontal: 14, minHeight: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: theme.textPrimary, paddingVertical: 0 },
  eyeBtn: { padding: 4, marginLeft: 6 },
  forgotWrap: { alignSelf: 'flex-end', marginBottom: 20, marginTop: -4 },
  forgotText: { fontSize: 13, fontWeight: '600', color: theme.primary },
  btn: {
    backgroundColor: theme.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 28 },
  footerHint: { fontSize: 14, color: theme.textSecondary },
  footerLink: { fontSize: 14, fontWeight: '700', color: theme.primary },
});
