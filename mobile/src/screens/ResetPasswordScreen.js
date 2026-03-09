import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api from '../config/api';

export default function ResetPasswordScreen({ route, navigation }) {
  const { resetToken } = route.params;
  const { theme } = useTheme();
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const styles = createStyles(theme);

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError('Please fill in both fields');
      return;
    }
    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      setError('');
      const res = await api.post('/auth/reset-password', { resetToken, newPassword });

      if (res.data.success) {
        Alert.alert(
          'Password Reset',
          'Your password has been reset successfully. Please login with your new password.',
          [{ text: 'Go to Login', onPress: () => navigation.popToTop() }]
        );
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          <View style={styles.iconContainer}>
            <Icon name="shield-lock-outline" size={60} color={theme.primary} />
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>New Password</Text>
            <Text style={styles.subtitle}>
              Create a strong password for your account. It must be at least 6 characters long.
            </Text>
          </View>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>New Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Enter new password"
                  placeholderTextColor={theme.placeholder}
                  value={newPassword}
                  onChangeText={(text) => { setNewPassword(text); setError(''); }}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  style={styles.eyeButton}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Icon
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={theme.textTertiary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                style={styles.input}
                placeholder="Confirm new password"
                placeholderTextColor={theme.placeholder}
                value={confirmPassword}
                onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
                secureTextEntry={!showPassword}
              />
            </View>

            {newPassword.length > 0 && (
              <View style={styles.strengthRow}>
                <View style={[styles.strengthBar, newPassword.length >= 2 && styles.strengthWeak]} />
                <View style={[styles.strengthBar, newPassword.length >= 6 && styles.strengthMedium]} />
                <View style={[styles.strengthBar, newPassword.length >= 10 && /[A-Z]/.test(newPassword) && /[0-9]/.test(newPassword) && styles.strengthStrong]} />
                <Text style={styles.strengthText}>
                  {newPassword.length < 6 ? 'Too short' :
                    newPassword.length < 10 ? 'Medium' : 'Strong'}
                </Text>
              </View>
            )}

            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleReset}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color={theme.buttonText} />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </TouchableOpacity>
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
  iconContainer: { alignItems: 'center', marginBottom: 24 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: theme.primary, textAlign: 'center', marginBottom: 12 },
  subtitle: { fontSize: 15, color: theme.textSecondary, textAlign: 'center', lineHeight: 22 },
  form: { width: '100%' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: theme.textPrimary, marginBottom: 8 },
  input: {
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    borderRadius: 12, padding: 16, fontSize: 16, color: theme.textPrimary,
  },
  passwordRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 12,
  },
  passwordInput: { flex: 1, padding: 16, fontSize: 16, color: theme.textPrimary },
  eyeButton: { paddingHorizontal: 14 },
  strengthRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20, gap: 6 },
  strengthBar: { flex: 1, height: 4, borderRadius: 2, backgroundColor: theme.border },
  strengthWeak: { backgroundColor: '#ef4444' },
  strengthMedium: { backgroundColor: '#f59e0b' },
  strengthStrong: { backgroundColor: '#22c55e' },
  strengthText: { fontSize: 12, color: theme.textSecondary, marginLeft: 8, width: 70 },
  button: {
    backgroundColor: theme.primary, borderRadius: 12, padding: 18,
    alignItems: 'center', marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: theme.buttonText, fontSize: 16, fontWeight: 'bold' },
  errorContainer: { backgroundColor: theme.errorMuted, padding: 12, borderRadius: 8, marginBottom: 16 },
  errorText: { color: theme.error, textAlign: 'center', fontSize: 14 },
});
