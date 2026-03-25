import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

const webStorage = {
  getItemAsync: (key: string): Promise<string | null> =>
    Promise.resolve(localStorage.getItem(key)),
  setItemAsync: (key: string, value: string): Promise<void> => {
    localStorage.setItem(key, value);
    return Promise.resolve();
  },
  deleteItemAsync: (key: string): Promise<void> => {
    localStorage.removeItem(key);
    return Promise.resolve();
  },
};

const storage = Platform.OS === 'web' ? webStorage : SecureStore;

export default storage;
