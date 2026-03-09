import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import { CartProvider, useCart } from './src/context/CartContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';

// Screens
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ForgotPasswordScreen from './src/screens/ForgotPasswordScreen';
import VerifyOTPScreen from './src/screens/VerifyOTPScreen';
import ResetPasswordScreen from './src/screens/ResetPasswordScreen';
import HomeScreen from './src/screens/HomeScreen';
import CatalogScreen from './src/screens/CatalogScreen';
import CartScreen from './src/screens/CartScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import PrescriptionsScreen from './src/screens/PrescriptionsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SupportScreen from './src/screens/SupportScreen';

// New feature screens
import MedicineDetailScreen from './src/screens/MedicineDetailScreen';
import CheckoutScreen from './src/screens/CheckoutScreen';
import OrderDetailScreen from './src/screens/OrderDetailScreen';
import FavoritesScreen from './src/screens/FavoritesScreen';
import SymptomCheckerScreen from './src/screens/SymptomCheckerScreen';
import ChatbotScreen from './src/screens/ChatbotScreen';
import HomeMedicineScreen from './src/screens/HomeMedicineScreen';
import RecommendationsScreen from './src/screens/RecommendationsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { cartCount } = useCart();
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme.tabBar,
          borderTopWidth: 1,
          borderTopColor: theme.border,
          elevation: 16,
          shadowColor: theme.shadow,
          shadowOffset: { width: 0, height: -4 },
          shadowOpacity: 0.1,
          shadowRadius: 12,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.3,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Icon name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Catalog"
        component={CatalogScreen}
        options={{
          tabBarLabel: 'Catalog',
          tabBarIcon: ({ color, size }) => (
            <Icon name="store-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Orders"
        component={OrdersScreen}
        options={{
          tabBarLabel: 'Orders',
          tabBarIcon: ({ color, size }) => (
            <Icon name="package-variant" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Prescriptions"
        component={PrescriptionsScreen}
        options={{
          tabBarLabel: 'Rx',
          tabBarIcon: ({ color, size }) => (
            <Icon name="file-document-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Icon name="account-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// Placeholder component for the More tab (navigates to MoreMenu stack screen)
const MorePlaceholder = () => null;

const MainNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen
        name="Cart"
        component={CartScreen}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen name="MedicineDetail" component={MedicineDetailScreen} />
      <Stack.Screen name="Checkout" component={CheckoutScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="SymptomChecker" component={SymptomCheckerScreen} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} />
      <Stack.Screen name="HomeMedicine" component={HomeMedicineScreen} />
      <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
      <Stack.Screen name="Profile" component={ProfileScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="MoreMenu" component={MoreMenuScreen} />
    </Stack.Navigator>
  );
};

// More Menu Screen — hub for all extra features
const MORE_ITEMS = [
  { label: 'My Profile', icon: 'account-outline', screen: 'Profile', color: '#3b82f6' },
  { label: 'Favorites', icon: 'heart-outline', screen: 'Favorites', color: '#ef4444' },
  { label: 'Home Medicine Cabinet', icon: 'medical-bag', screen: 'HomeMedicine', color: '#10b981' },
  { label: 'AI Symptom Checker', icon: 'stethoscope', screen: 'SymptomChecker', color: '#8b5cf6' },
  { label: 'Chat Assistant', icon: 'robot-outline', screen: 'Chatbot', color: '#06b6d4' },
  { label: 'Recommendations', icon: 'thumb-up-outline', screen: 'Recommendations', color: '#f59e0b' },
  { label: 'Support', icon: 'help-circle-outline', screen: 'Support', color: '#6366f1' },
];

const MoreMenuScreen = ({ navigation }) => {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }} edges={['top']}>
      <View style={{
        flexDirection: 'row', alignItems: 'center',
        paddingHorizontal: 20, paddingVertical: 16,
        borderBottomWidth: 1, borderBottomColor: theme.border,
      }}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: theme.surfaceHighlight, justifyContent: 'center', alignItems: 'center' }}
        >
          <Icon name="arrow-left" size={22} color={theme.textPrimary} />
        </TouchableOpacity>
        <Text style={{ fontSize: 20, fontWeight: '700', color: theme.textPrimary, marginLeft: 14 }}>More</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        {MORE_ITEMS.map((item) => (
          <TouchableOpacity
            key={item.screen}
            style={{
              flexDirection: 'row', alignItems: 'center',
              padding: 16, backgroundColor: theme.card,
              borderRadius: 14, marginBottom: 10,
              borderWidth: 1, borderColor: theme.border,
            }}
            onPress={() => navigation.navigate(item.screen)}
            activeOpacity={0.7}
          >
            <View style={{
              width: 44, height: 44, borderRadius: 12,
              backgroundColor: item.color + '20',
              justifyContent: 'center', alignItems: 'center',
            }}>
              <Icon name={item.icon} size={24} color={item.color} />
            </View>
            <Text style={{ flex: 1, fontSize: 15, color: theme.textPrimary, marginLeft: 14, fontWeight: '600' }}>
              {item.label}
            </Text>
            <Icon name="chevron-right" size={20} color={theme.textTertiary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const Navigation = () => {
  const { user, loading } = useAuth();
  const { isDark, theme } = useTheme();

  const navTheme = {
    ...(isDark ? DarkTheme : DefaultTheme),
    colors: {
      ...(isDark ? DarkTheme.colors : DefaultTheme.colors),
      background: theme.background,
      card: theme.navBar,
      text: theme.textPrimary,
      border: theme.border,
      primary: theme.primary,
    },
  };

  if (loading) return null;

  return (
    <NavigationContainer theme={navTheme}>
      {user ? <MainNavigator /> : (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
          <Stack.Screen name="VerifyOTP" component={VerifyOTPScreen} />
          <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
        </Stack.Navigator>
      )}
    </NavigationContainer>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

function AppContent() {
  const { isDark } = useTheme();
  return (
    <AuthProvider>
      <CartProvider>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <Navigation />
      </CartProvider>
    </AuthProvider>
  );
}
