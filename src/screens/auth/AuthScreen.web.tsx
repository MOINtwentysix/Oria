import React from 'react';
import { StyleSheet, View, Text, Platform, TouchableOpacity } from 'react-native';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { useAuth, useSSO } from '@/services/auth';
import { useAppNavigation } from '@/hooks/useAppNavigation';

export const AuthScreen: React.FC = () => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { isLoaded, isSignedIn } = useAuth();
  const router = useAppNavigation();

  const { startSSOFlow } = useSSO();
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  if (Platform.OS !== 'web') {
    return null;
  }

  if (!isLoaded) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.textSecondary }]}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (isSignedIn) {
    router.replace('/explore');
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={[styles.logo, { color: theme.colors.text }]}>oria</Text>
          <Text style={[styles.tagline, { color: theme.colors.textSecondary }]}>
            Discover what's around you
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>M26 Account</Text>
          <Text style={[styles.cardText, { color: theme.colors.textSecondary }]}>Sign in securely with your central account.</Text>
          {error ? <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text> : null}
          <TouchableOpacity onPress={async () => { setLoading(true); setError(''); try { await startSSOFlow(); } catch (err: any) { setError(err.message || 'Social sign-in failed'); setLoading(false); } }} style={[styles.ssoButton, { backgroundColor: theme.colors.primary }]}>
            <Text style={styles.ssoButtonText}>{loading ? 'Connecting...' : 'Continue with M26 Account'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 600,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
  },
  logo: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -2,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  modeToggle: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    cursor: 'pointer',
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  card: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
    padding: 24,
    gap: 12,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  cardText: {
    fontSize: 15,
    lineHeight: 22,
  },
  errorText: {
    fontSize: 14,
  },
  ssoButton: {
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    cursor: 'pointer',
  },
  ssoButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 600,
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
