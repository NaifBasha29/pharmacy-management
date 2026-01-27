import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/colors';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

const MenuItem = ({ icon, title, onPress, danger }) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress}>
    <View style={styles.menuIconContainer}>
      <Icon name={icon} size={24} color={danger ? colors.error : colors.textSecondary} />
    </View>
    <Text style={[styles.menuTitle, danger && styles.dangerText]}>{title}</Text>
    <Icon name="chevron-right" size={24} color={colors.textLight} />
  </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Icon name="arrow-left" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Profile</Text>
        <View style={{ width: 24 }} />
      </View>
      
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
             <Icon name="account-circle" size={80} color={colors.primary} />
          </View>
          <Text style={styles.name}>{user?.name}</Text>
          <Text style={styles.email}>{user?.email}</Text>
          <View style={styles.roleBadge}>
             <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Account Settings</Text>
          <MenuItem icon="account-cog-outline" title="Edit Profile" onPress={() => {}} />
          <MenuItem icon="lock-outline" title="Change Password" onPress={() => {}} />
          <MenuItem icon="bell-outline" title="Notifications" onPress={() => {}} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionHeader}>Support</Text>
          <MenuItem icon="help-circle-outline" title="Help & Support" onPress={() => {}} />
          <MenuItem icon="file-document-outline" title="Terms & Conditions" onPress={() => {}} />
        </View>

        <View style={styles.section}>
           <MenuItem icon="logout" title="Logout" onPress={logout} danger />
        </View>

        <Text style={styles.version}>Version 1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  content: {
    paddingBottom: 24,
  },
  profileHeader: {
    alignItems: 'center',
    padding: 24,
    backgroundColor: colors.surface,
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    color: colors.textSecondary,
    marginBottom: 16,
  },
  roleBadge: {
    backgroundColor: `${colors.primary}20`,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  roleText: {
    color: colors.primary,
    fontWeight: '600',
    fontSize: 12,
  },
  section: {
    backgroundColor: colors.surface,
    marginTop: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  sectionHeader: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  menuIconContainer: {
    width: 32,
    justifyContent: 'center',
  },
  menuTitle: {
    flex: 1,
    fontSize: 16,
    color: colors.textPrimary,
  },
  dangerText: {
    color: colors.error,
  },
  version: {
    textAlign: 'center',
    marginTop: 24,
    color: colors.textLight,
  }
});
