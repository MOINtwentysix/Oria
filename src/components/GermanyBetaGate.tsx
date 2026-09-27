import React from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { usePathname } from 'expo-router';
import { useLocation } from '@/hooks/useLocation';
import { openStreetMapService } from '@/services/openstreetmap';

const PROTECTED_PATHS = ['/explore', '/saved', '/ai', '/profile'];

const isProtectedPath = (pathname: string) =>
  PROTECTED_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));

export const GermanyBetaGate: React.FC = () => {
  const pathname = usePathname();
  const { getCurrentLocation } = useLocation();
  const [status, setStatus] = React.useState<'idle' | 'checking' | 'allowed' | 'blocked'>('idle');
  const [message, setMessage] = React.useState('');

  const checkAvailability = React.useCallback(async () => {
    setStatus('checking');
    setMessage('');

    const location = await getCurrentLocation();
    if (!location) {
      setMessage('Bitte erlaube den Standortzugriff, damit wir die Closed-Beta-Verfügbarkeit prüfen können.');
      setStatus('blocked');
      return;
    }

    const countryCode = await openStreetMapService.getCountryCode(location.latitude, location.longitude);
    if (countryCode === 'de') {
      setStatus('allowed');
      return;
    }

    setMessage(countryCode
      ? 'Die Oria Closed Beta ist aktuell nur in Deutschland verfügbar.'
      : 'Der Standort konnte gerade nicht verifiziert werden. Bitte versuche es erneut.');
    setStatus('blocked');
  }, [getCurrentLocation]);

  React.useEffect(() => {
    if (!isProtectedPath(pathname)) {
      setStatus('idle');
      return;
    }
    void checkAvailability();
  }, [pathname, checkAvailability]);

  if (!isProtectedPath(pathname) || status === 'idle' || status === 'allowed') {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🇩🇪</Text>
        <Text style={styles.title}>Closed Beta</Text>
        {status === 'checking' ? (
          <>
            <ActivityIndicator color="#0066CC" style={styles.spinner} />
            <Text style={styles.subtitle}>Wir prüfen, ob Oria an deinem Standort verfügbar ist.</Text>
          </>
        ) : (
          <>
            <Text style={styles.subtitle}>{message}</Text>
            <TouchableOpacity onPress={() => void checkAvailability()} style={styles.button}>
              <Text style={styles.buttonText}>Erneut prüfen</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: '#F7F9FC', alignItems: 'center', justifyContent: 'center', padding: 24, zIndex: 100 },
  card: { width: '100%', maxWidth: 460, alignItems: 'center', padding: 28, borderRadius: 24, backgroundColor: '#FFFFFF' },
  icon: { fontSize: 44, marginBottom: 12 },
  title: { fontSize: 26, fontWeight: '800', color: '#101828', marginBottom: 10 },
  subtitle: { fontSize: 16, lineHeight: 24, textAlign: 'center', color: '#667085' },
  spinner: { marginVertical: 16 },
  button: { marginTop: 22, borderRadius: 14, backgroundColor: '#0066CC', paddingHorizontal: 20, paddingVertical: 13 },
  buttonText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700' },
});
