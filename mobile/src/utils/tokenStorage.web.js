// Web — uses localStorage (expo-secure-store is not available on web)
const TokenStorage = {
  get:    (key)        => Promise.resolve(localStorage.getItem(key)),
  set:    (key, value) => Promise.resolve(localStorage.setItem(key, String(value))),
  remove: (key)        => Promise.resolve(localStorage.removeItem(key)),
};

export default TokenStorage;
