import React from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { useAuth } from '@/services/clerk';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { SignIn, SignUp } from '@clerk/expo/web';

export const AuthScreen: React.FC = () => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { isLoaded, isSignedIn } = useAuth();
  const router = useAppNavigation();

  const [mode, setMode] = React.useState<'signin' | 'signup'>('signin');

  // <SignIn /> / <SignUp /> are web-only. This file is resolved for web via
  // Metro's platform resolution (.web.tsx). Native builds use AuthScreen.tsx.
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

        <View style={styles.modeToggle}>
          <View
            style={[styles.modeButton, { backgroundColor: mode === 'signin' ? theme.colors.primary : 'transparent' }]}
            onClick={() => { setMode('signin'); }}
          >
            <Text style={[styles.modeButtonText, { color: mode === 'signin' ? 'white' : theme.colors.textSecondary }]}>
              Sign In
            </Text>
          </View>
          <View
            style={[styles.modeButton, { backgroundColor: mode === 'signup' ? theme.colors.primary : 'transparent' }]}
            onClick={() => { setMode('signup'); }}
          >
            <Text style={[styles.modeButtonText, { color: mode === 'signup' ? 'white' : theme.colors.textSecondary }]}>
              Sign Up
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          {mode === 'signin' ? <SignIn routing="path" path="/auth" /> : <SignUp routing="path" path="/auth" />}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: '100vh',
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
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
