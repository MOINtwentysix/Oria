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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isSignedIn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
        <View style={styles.loadingContainer}>
          <Text style={[styles.loadingText, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>Redirecting...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleSSO = async () => {
    setError('');
    setLoading(true);
    try {
      await startSSOFlow();
      router.replace('/explore');
    } catch (err: any) {
      setError(err.message || 'Social sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.content}>

          <View style={styles.header}>
            <Text style={[
              styles.logo,
              { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
            ]}>
              Oria
            </Text>
            <Text style={[
              styles.tagline,
              { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
            ]}>
              Entdecke, was um dich herum ist
            </Text>
          </View>

          {error && (
            <GlassCard variant="light" style={styles.errorCard}>
              <View style={styles.errorContent}>
                <Text style={styles.errorIcon}>⚠️</Text>
                <Text style={[
                  styles.errorText,
                  { color: theme.colors.error, fontFamily: theme.typography.fontFamily.body },
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
                onPress={handleSSO}
                loading={loading}
                style={styles.submitButton}
                icon={<Text style={{fontSize: 20}}>🔍</Text>}
                iconPosition="left"
              >
                Mit Google fortfahren
              </GlassButton>
              <GlassButton
                size="lg"
                fullWidth
                variant="secondary"
                onPress={handleSSO}
                loading={loading}
                style={styles.submitButton}
                icon={<Text style={{fontSize: 20}}>🍎</Text>}
                iconPosition="left"
              >
                Mit Apple fortfahren
              </GlassButton>
            </View>
          </GlassCard>

          <View style={styles.footer}>
            <Text style={[
              styles.footerText,
              { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
            ]}>
              Mit der Anmeldung akzeptierst du unsere
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => router.push('/legal/terms')} hitSlop={8}>
                <Text style={[
                  styles.footerLink,
                  { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body },
                ]}>
                  AGB
                </Text>
              </TouchableOpacity>
              <Text style={[
                styles.footerText,
                { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
              ]}>
                und
              </Text>
              <TouchableOpacity onPress={() => router.push('/legal/privacy')} hitSlop={8}>
                <Text style={[
                  styles.footerLink,
                  { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body },
                ]}>
                  Datenschutzrichtlinie
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
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: -1.2,
    includeFontPadding: false,
  },
  tagline: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 25,
    includeFontPadding: false,
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
    includeFontPadding: false,
  },
  formCard: {
    padding: 20,
  },
  form: {
    gap: 16,
  },
  submitButton: {
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    gap: 8,
  },
  footerText: {
    fontSize: 13,
    textAlign: 'center',
    includeFontPadding: false,
  },
  footerLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '600',
    includeFontPadding: false,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    includeFontPadding: false,
  },
});
