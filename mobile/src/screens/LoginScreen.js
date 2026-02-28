import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, KeyboardAvoidingView, Platform,
  ActivityIndicator, StatusBar, ScrollView, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword]   = useState('');
  const [showPass, setShowPass]   = useState(false);
  const { login, loading, error } = useAuth();

  const handleLogin = async () => {
    if (!identifier.trim() || !password) {
      Alert.alert('Missing fields', 'Please enter your email and password.');
      return;
    }
    const ok = await login(identifier.trim(), password);
    if (!ok && !error) {
      Alert.alert('Login failed', 'Invalid email or password. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <StatusBar barStyle="light-content" backgroundColor="#000" />

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
          {/* ── Brand ── */}
          <View style={styles.brandBlock}>
            <View style={styles.logoBox}>
              <MaterialIcons name="local-pharmacy" size={34} color="#fff" />
            </View>
            <Text style={styles.brandName}>RxHub</Text>
            <Text style={styles.headline}>Welcome back to RxHub</Text>
            <Text style={styles.subHeadline}>Manage your health securely</Text>
          </View>

          {/* ── Error ── */}
          {error ? (
            <View style={styles.errorBox}>
              <MaterialIcons name="error-outline" size={16} color="#f87171" />
              <Text style={styles.errorText}>
                {error.includes('401') || error.toLowerCase().includes('invalid')
                  ? 'Invalid credentials. Please try again.'
                  : error.includes('Network')
                  ? 'Cannot connect to server. Check your connection.'
                  : error}
              </Text>
            </View>
          ) : null}

          {/* ── Form ── */}
          <View style={styles.form}>
            {/* Email */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Email Address</Text>
              <View style={styles.inputWrap}>
                <MaterialIcons name="mail" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor="#4b5563"
                  value={identifier}
                  onChangeText={setIdentifier}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  returnKeyType="next"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldGroup}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <MaterialIcons name="lock" size={20} color="#6b7280" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { paddingRight: 48 }]}
                  placeholder="••••••••"
                  placeholderTextColor="#4b5563"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
                <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPass(p => !p)}>
                  <MaterialIcons name={showPass ? 'visibility' : 'visibility-off'} size={20} color="#6b7280" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot */}
            <TouchableOpacity style={styles.forgotRow}>
              <Text style={styles.forgotText}>Forgot Password?</Text>
            </TouchableOpacity>

            {/* Login Button */}
            <TouchableOpacity
              style={[styles.loginBtn, loading && { opacity: 0.7 }]}
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.loginBtnText}>Login</Text>}
            </TouchableOpacity>
          </View>

          {/* ── Divider ── */}
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or continue with</Text>
            <View style={styles.dividerLine} />
          </View>

          {/* ── Social Buttons ── */}
          <View style={styles.socialRow}>
            <TouchableOpacity style={styles.socialBtn}>
              {/* Google "G" coloured icon */}
              <View style={styles.gIcon}>
                <Text style={styles.gIconText}>G</Text>
              </View>
              <Text style={styles.socialBtnText}>Google</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.socialBtn}>
              <MaterialIcons name="facebook" size={22} color="#1877f2" />
              <Text style={styles.socialBtnText}>Facebook</Text>
            </TouchableOpacity>
          </View>

          {/* ── Sign Up ── */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.signupLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000', overflow: 'hidden' },

  // Background glows
  glowTL: {
    position: 'absolute', top: '-10%', left: '-10%',
    width: '55%', height: '30%', borderRadius: 999,
    backgroundColor: '#f9741530',
    // RN doesn't support CSS blur on Views; use this as a colour overlay
  },
  glowBR: {
    position: 'absolute', bottom: '-10%', right: '-10%',
    width: '55%', height: '30%', borderRadius: 999,
    backgroundColor: '#7c3aed15',
  },

  scroll: { flexGrow: 1, paddingHorizontal: 28, paddingTop: 40, paddingBottom: 32 },

  // Brand
  brandBlock: { alignItems: 'center', marginBottom: 36 },
  logoBox: {
    width: 68, height: 68, borderRadius: 18,
    backgroundColor: '#f97415', justifyContent: 'center', alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#f97415', shadowOpacity: 0.4, shadowRadius: 20, elevation: 12,
  },
  brandName: { color: '#fff', fontSize: 22, fontWeight: '800', letterSpacing: -0.5, marginBottom: 8 },
  headline: { color: '#fff', fontSize: 26, fontWeight: '800', textAlign: 'center', letterSpacing: -0.5, lineHeight: 32 },
  subHeadline: { color: '#9ca3af', fontSize: 14, marginTop: 6, textAlign: 'center' },

  // Error
  errorBox: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#ef444415', borderWidth: 1, borderColor: '#ef444430', borderRadius: 12, padding: 12, marginBottom: 16 },
  errorText: { flex: 1, color: '#f87171', fontSize: 13, lineHeight: 18 },

  // Form
  form: { width: '100%', gap: 4 },
  fieldGroup: { marginBottom: 16 },
  label: { color: '#9ca3af', fontSize: 12, fontWeight: '600', marginBottom: 7, marginLeft: 2 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#27272a', borderRadius: 14 },
  inputIcon: { marginLeft: 14 },
  input: { flex: 1, color: '#fff', fontSize: 15, paddingHorizontal: 12, paddingVertical: 15 },
  eyeBtn: { position: 'absolute', right: 0, top: 0, bottom: 0, paddingHorizontal: 14, justifyContent: 'center' },

  // Forgot
  forgotRow: { alignSelf: 'flex-end', marginBottom: 22, marginTop: 2 },
  forgotText: { color: '#71717a', fontSize: 13, fontWeight: '500' },

  // Login button
  loginBtn: {
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    backgroundColor: '#f97415',
    shadowColor: '#f97415', shadowOpacity: 0.35, shadowRadius: 14, shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  loginBtnText: { color: '#fff', fontSize: 17, fontWeight: '800' },

  // Divider
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 28 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#27272a' },
  dividerText: { color: '#52525b', fontSize: 11, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.8, marginHorizontal: 14 },

  // Social buttons
  socialRow: { flexDirection: 'row', gap: 14, marginBottom: 32 },
  socialBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: '#0a0a0a', borderWidth: 1, borderColor: '#27272a', borderRadius: 14, paddingVertical: 14 },
  socialBtnText: { color: '#d4d4d8', fontSize: 14, fontWeight: '700' },

  // Google G
  gIcon: { width: 22, height: 22, borderRadius: 11, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' },
  gIconText: { color: '#4285F4', fontWeight: '900', fontSize: 13 },

  // Sign up
  signupRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 4 },
  signupText: { color: '#9ca3af', fontSize: 14 },
  signupLink: { color: '#f97415', fontSize: 14, fontWeight: '800' },
});
