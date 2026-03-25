import { Redirect } from 'expo-router';
import { useAuthStore } from '../src/stores/auth-store';

export default function Index() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return isAuthenticated
    ? <Redirect href="/(tabs)" />
    : <Redirect href="/(auth)/login" />;
}
