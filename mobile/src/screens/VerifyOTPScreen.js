import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';

const OTP_LENGTH = 6;

export default function VerifyOTPScreen({ route, navigation }) {
  const { identifier, maskedEmail } = route.params;
  const { theme } = useTheme();
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);
  const styles = createStyles(theme);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(timer);
  }, [countdown]);

  const handleOtpChange = (value, index) => {
    if (value.length > 1) {
      // Handle paste — distribute digits across fields
      const digits = value.replace(/[^0-9]/g, '').split('').slice(0, OTP_LENGTH);
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < OTP_LENGTH) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
      setError('');
      return;
    }

    const digit = value.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== OTP_LENGTH) {
      setError('Please enter the complete 6-digit code');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/verify-otp', { identifier, otp: otpCode });

      if (res.data.success) {
        navigation.replace('ResetPassword', { resetToken: res.data.data.resetToken });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Verification failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0) return;

    try {
      setResending(true);
      setError('');
      await api.post('/auth/forgot-password', { identifier });
      setCountdown(60);
      setOtp(Array(OTP_LENGTH).fill(''));
      Alert.alert('OTP Resent', 'A new verification code has been sent to your email.');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resend OTP.');
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={theme.textPrimary} />
          </TouchableOpacity>

          <View style={styles.iconContainer}>
            <Icon name="email-check-outline" size={60} color={theme.primary} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>Verify OTP</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to{'\n'}
              <Text style={styles.emailText}>{maskedEmail}</Text>
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.otpRow}>
            {otp.map((digit, index) => (
              <TextInput
                key={index}
                ref={ref => inputRefs.current[index] = ref}
                style={[styles.otpInput, digit && styles.otpInputFilled]}
                value={digit}
                onChangeText={value => handleOtpChange(value, index)}
                onKeyPress={e => handleKeyPress(e, index)}
                keyboardType="number-pad"
                maxLength={index === 0 ? OTP_LENGTH : 1}
                selectTextOnFocus
              />
            ))}
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={theme.buttonText} />
            ) : (
              <Text style={styles.buttonText}>Verify</Text>
            )}
          </TouchableOpacity>

          <View style={styles.resendRow}>
            <Text style={styles.resendHint}>Didn't receive the code? </Text>
            {countdown > 0 ? (
              <Text style={styles.countdownText}>Resend in {countdown}s</Text>
            ) : (
              <TouchableOpacity onPress={handleResend} disabled={resending}>
                {resending ? (
                  <ActivityIndicator size="small" color={theme.primary} />
                ) : (
                  <Text style={styles.resendLink}>Resend OTP</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme) => StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.background },
  keyboardView: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center' },
  backButton: { position: 'absolute', top: 16, left: 0, padding: 8 },
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  header: { marginBottom: 32, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.primary, marginBottom: 12 },
  subtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', lineHeight: 22 },
  emailText: { fontWeight: '700', color: theme.textPrimary },
  otpRow: {
    flexDirection: 'row', justifyContent: 'center', gap: 10,
    marginBottom: 32,
  },
  otpInput: {
    width: 48, height: 56, borderWidth: 2, borderColor: theme.border,
    borderRadius: 12, fontSize: 22, fontWeight: 'bold', textAlign: 'center',
    color: theme.textPrimary, backgroundColor: theme.surface,
  },
  otpInputFilled: { borderColor: theme.primary, backgroundColor: theme.primaryMuted },
  button: {
    backgroundColor: theme.primary, borderRadius: 12, padding: 18,
    alignItems: 'center',
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: theme.buttonText, fontSize: 16, fontWeight: 'bold' },
  resendRow: {
    flexDirection: 'row', justifyContent: 'center', alignItems: 'center',
    marginTop: 24,
  },
  resendHint: { color: theme.textSecondary, fontSize: 14 },
  countdownText: { color: theme.textTertiary, fontSize: 14, fontWeight: '600' },
  resendLink: { color: theme.primary, fontSize: 14, fontWeight: '700' },
  errorContainer: { backgroundColor: theme.errorMuted, padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: theme.error, textAlign: 'center', fontSize: 14 },
});
