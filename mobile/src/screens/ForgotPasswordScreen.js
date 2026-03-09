import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';

export default function ForgotPasswordScreen({ navigation }) {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme } = useTheme();
  const styles = createStyles(theme);

  const handleSendOTP = async () => {
    if (!identifier.trim()) {
      setError('Please enter your email or patient ID');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/forgot-password', { identifier: identifier.trim() });

      if (res.data.success) {
        Alert.alert('OTP Sent', `A verification code has been sent to ${res.data.data.maskedEmail}`);
        navigation.navigate('VerifyOTP', {
          identifier: identifier.trim(),
          maskedEmail: res.data.data.maskedEmail
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="arrow-left" size={22} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <View style={styles.iconWrap}>
              <Icon name="lock-reset" size={40} color={theme.primary} />
            </View>
          </View>

          <Text style={styles.title}>Forgot Password?</Text>
          <Text style={styles.subtitle}>
            Enter your email or patient ID and we'll send a verification code.
          </Text>

          {!!error && (
            <View style={styles.errorBanner}>
              <Icon name="alert-circle-outline" size={16} color={theme.error} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.fieldWrap}>
            <Text style={styles.label}>Email or Patient ID</Text>
            <View style={styles.inputRow}>
              <Icon name="account-outline" size={20} color={theme.textTertiary} style={{ marginRight: 10 }} />
              <TextInput
                style={styles.input}
                placeholder="Enter your email or patient ID"
                placeholderTextColor={theme.placeholder}
                value={identifier}
                onChangeText={(text) => { setIdentifier(text); setError(''); }}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleSendOTP}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.btnText}>Send Verification Code</Text>}
          </TouchableOpacity>

          <TouchableOpacity style={styles.backLink} onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Icon name="arrow-left" size={16} color={theme.primary} />
            <Text style={styles.backLinkText}>Back to Login</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  scroll: { flexGrow: 1, padding: 24, paddingTop: 60, paddingBottom: 40 },
  backButton: {
    position: 'absolute', top: 16, left: 24,
    width: 40, height: 40, borderRadius: 12,
    backgroundColor: theme.surfaceHighlight, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1, borderColor: theme.border,
  },
  iconContainer: { alignItems: 'center', marginTop: 32, marginBottom: 28 },
  iconWrap: {
    width: 88, height: 88, borderRadius: 28,
    backgroundColor: theme.primaryMuted, justifyContent: 'center', alignItems: 'center',
    borderWidth: 1.5, borderColor: theme.primary + '40',
  },
  title: { fontSize: 24, fontWeight: '700', color: theme.textPrimary, textAlign: 'center', marginBottom: 10, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: theme.textSecondary, textAlign: 'center', lineHeight: 22, marginBottom: 28 },
  errorBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: theme.errorMuted, borderRadius: 10, padding: 12, marginBottom: 20,
    borderWidth: 1, borderColor: theme.error + '30',
  },
  errorText: { flex: 1, fontSize: 13, color: theme.error, fontWeight: '500' },
  fieldWrap: { marginBottom: 20 },
  label: { fontSize: 13, fontWeight: '600', color: theme.textSecondary, marginBottom: 8, letterSpacing: 0.2 },
  inputRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.inputBackground, borderRadius: 12,
    borderWidth: 1.5, borderColor: theme.border, paddingHorizontal: 14, minHeight: 52,
  },
  input: { flex: 1, fontSize: 15, color: theme.textPrimary, paddingVertical: 0 },
  btn: {
    backgroundColor: theme.primary, borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    shadowColor: theme.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6,
  },
  btnDisabled: { opacity: 0.6 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  backLink: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 24, gap: 6 },
  backLinkText: { color: theme.primary, fontSize: 14, fontWeight: '600' },
});
