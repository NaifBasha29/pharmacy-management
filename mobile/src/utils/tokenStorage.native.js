// Native (iOS / Android) — uses expo-secure-store
import * as SecureStore from 'expo-secure-store';

const TokenStorage = {
  get:    (key)        => SecureStore.getItemAsync(key),
  set:    (key, value) => SecureStore.setItemAsync(key, String(value)),
  remove: (key)        => SecureStore.deleteItemAsync(key),
};

export default TokenStorage;
