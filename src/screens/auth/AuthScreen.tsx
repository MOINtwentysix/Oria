import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard } from '@/components/ui';
import { useAuth, useSSO } from '@/services/auth';
import { useAppNavigation } from '@/hooks/useAppNavigation';

export const AuthScreen: React.FC = () => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { isLoaded, isSignedIn } = useAuth();
  const { startSSOFlow } = useSSO();
  const router = useAppNavigation();

  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Redirecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSSO = async (strategy: 'oauth_google' | 'oauth_apple') => {
    setError('');
    setLoading(true);
    try {
      const { createdSessionId, setActive } = await startSSOFlow({ strategy });
      if (createdSessionId) {
        await setActive({ session: createdSessionId });
        router.replace('/explore');
      } else {
        setError('The social sign-in flow needs to be completed.');
      }
    } catch (err: any) {
      setError(err.message || 'Social sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>

          <View style={styles.header}>
            <Text style={[
              styles.logo,
              { color: theme.colors.text },
            ]}>
              oria
            </Text>
            <Text style={[
              styles.tagline,
              { color: theme.colors.textSecondary },
            ]}>
              Discover what's around you
            </Text>
          </View>

          {error && (
            <GlassCard variant="light" style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={[
                  styles.errorText,
                  { color: theme.colors.error },
                ]}>
                  {error}
                </Text>
              </View>
            </GlassCard>
          )}

          <GlassCard variant="light" style={styles.formCard}>
            <View style={styles.form}>
              <GlassButton
                size="lg"
                fullWidth
                onPress={() => handleSSO('oauth_google')}
                loading={loading}
                style={styles.submitButton}
              >
                Continue with Google
              </GlassButton>
              <GlassButton
                size="lg"
                fullWidth
                onPress={() => handleSSO('oauth_apple')}
                loading={loading}
                style={styles.submitButton}
              >
                Continue with Apple
              </GlassButton>
            </View>
          </GlassCard>

          <View style={styles.footer}>
            <Text style={[
              styles.footerText,
              { color: theme.colors.textTertiary },
            ]}>
              By continuing, you agree to our
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => router.push('/legal/terms')} hitSlop={8}>
                <Text style={[
                  styles.footerLink,
                  { color: theme.colors.primary },
                ]}>
                  Terms of Service
                </Text>
              </TouchableOpacity>
              <Text style={[
                styles.footerText,
                { color: theme.colors.textTertiary },
              ]}>
                and
              </Text>
              <TouchableOpacity onPress={() => router.push('/legal/privacy')} hitSlop={8}>
                <Text style={[
                  styles.footerLink,
                  { color: theme.colors.primary },
                ]}>
                  Privacy Policy
                </Text>
              </TouchableOpacity>
            </View>
          </View>

        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    flex: 1,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    gap: 8,
    marginBottom: 40,
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
    marginBottom: 24,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderRadius: 16,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  modeButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  modeButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  errorCard: {
    marginBottom: 16,
  },
  errorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
  },
  errorIcon: {
    fontSize: 20,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
  },
  formCard: {
    padding: 20,
  },
  form: {
    gap: 16,
  },
  formInput: {
    marginTop: 0,
  },
  submitButton: {
    marginTop: 8,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  dividerText: {
    fontSize: 13,
    fontWeight: '500',
    
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
});