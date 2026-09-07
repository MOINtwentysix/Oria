import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { completeSSO } from '@/services/auth';

export default function AuthCallbackRoute() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [error, setError] = React.useState<string | null>(null);
  const handled = React.useRef(false);

  React.useEffect(() => {
    if (handled.current) return;
    handled.current = true;
    const callbackUrl = typeof window !== 'undefined'
      ? window.location.href
      : `oria://auth/callback?${new URLSearchParams(params as Record<string, string>).toString()}`;
    completeSSO(callbackUrl)
      .then(() => router.replace('/explore'))
      .catch((callbackError: Error) => setError(callbackError.message));
  }, [params, router]);

  return (
    <View style={styles.container}>
      {error ? <Text style={styles.error}>{error}</Text> : <ActivityIndicator />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  error: { color: '#DC2626', textAlign: 'center' },
});