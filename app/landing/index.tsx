import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Animated, Easing, Image, Dimensions } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme, useFontsLoaded } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard } from '@/components/ui';
import { useAuth } from '@/services/auth';
import { useRouter } from 'expo-router';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function LandingPage() {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { isSignedIn } = useAuth();
  const fontsLoaded = useFontsLoaded();
  const router = useRouter();

  const [heroAnim] = React.useState(new Animated.Value(0));
  const [scrollAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (fontsLoaded) {
      Animated.timing(heroAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }).start();
    }
  }, [fontsLoaded]);

  const fadeIn = heroAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const translateY = heroAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [40, 0],
  });

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.replace('/explore');
    } else {
      router.push('/onboarding');
    }
  };

  if (!fontsLoaded) {
    return (
      <SafeAreaView style={[styles.loadingContainer, { backgroundColor: theme.colors.paper }]}>
        <View style={[styles.loadingSpinner, { borderColor: theme.colors.border, borderTopColor: theme.colors.accent }]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollAnim } } }],
          { useNativeDriver: true }
        )}
      >
        {/* Hero Section - distinctive, not template */}
        <Animated.View
          style={[
            styles.hero,
            { opacity: fadeIn, transform: [{ translateY }] },
          ]}
        >
          {/* Subtle decorative element - organic shape hinting at map/discovery */}
          <View style={styles.heroDecoration} />
          
          <Text style={[
            styles.heroLogo,
            { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
          ]}>
            Oria
          </Text>
          
          <Text style={[
            styles.heroTagline,
            { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
          ]}>
            Entdecke, was um dich herum ist.
          </Text>

          <GlassButton 
            size="xl" 
            fullWidth 
            onPress={handleGetStarted} 
            style={styles.heroCta}
            variant="primary"
          >
            Los geht's
          </GlassButton>
          
          <TouchableOpacity onPress={() => router.push('/auth')} style={styles.heroSignIn} hitSlop={16}>
            <Text style={[
              styles.heroSignInText,
              { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
            ]}>
              Schon ein Konto? Anmelden
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Features Section - distinctive layout, not card grid */}
        <View style={[styles.section, { borderTopColor: theme.colors.border }]}>
          <Text style={[
            styles.sectionEyebrow,
            { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
          ]}>
            Warum Oria
          </Text>
          
          <View style={styles.featureRow}>
            {[
              { icon: '🗺️', title: 'Interaktive Karte', desc: 'Flüssige Map mit Live-Plätzen & Kategorien' },
              { icon: '✨', title: 'Oria AI', desc: 'Natürliche Sprachsuche & smarte Empfehlungen' },
              { icon: '❤️', title: 'Listen & Teilen', desc: 'Orte speichern, Listen mit Freunden teilen' },
            ].map((feature, index) => (
              <View key={index} style={styles.featureItem}>
                <View style={styles.featureIconWrapper}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                </View>
                <Text style={[
                  styles.featureTitle,
                  { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                ]}>
                  {feature.title}
                </Text>
                <Text style={[
                  styles.featureDesc,
                  { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                ]}>
                  {feature.desc}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Trust / Privacy Section - distinctive, not generic */}
        <View style={[styles.section, { borderTopColor: theme.colors.border }]}>
          <View style={styles.trustCard}>
            <View style={styles.trustIconWrapper}>
              <Text style={styles.trustIcon}>🔒</Text>
            </View>
            <Text style={[
              styles.trustTitle,
              { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
            ]}>
              Deine Daten gehören dir.
            </Text>
            <Text style={[
              styles.trustDesc,
              { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
            ]}>
              Kein Tracking, kein Verkauf, volle Transparenz. DSGVO-konform, Server in Deutschland.
            </Text>
            <TouchableOpacity onPress={() => router.push('/legal/privacy')} style={styles.legalLink} hitSlop={16}>
              <Text style={[
                styles.legalLinkText,
                { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body },
              ]}>
                Datenschutzrichtlinie lesen
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Beta badge - distinctive */}
        <View style={styles.betaSection}>
          <View style={[
            styles.betaBadge,
            { backgroundColor: theme.colors.accentSoft, borderColor: theme.colors.accent },
          ]}>
            <Text style={[
              styles.betaBadgeText,
              { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.display },
            ]}>
              Closed Beta — Nur in Deutschland
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={[
            styles.footerText,
            { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
          ]}>
            Oria — Orte entdecken, die du lieben wirst.
          </Text>
          <View style={styles.footerLinks}>
            <TouchableOpacity onPress={() => router.push('/legal/imprint')} hitSlop={12}>
              <Text style={[
                styles.footerLink,
                { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
              ]}>
                Impressum
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/legal/terms')} hitSlop={12}>
              <Text style={[
                styles.footerLink,
                { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
              ]}>
                AGB
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/legal/cookies')} hitSlop={12}>
              <Text style={[
                styles.footerLink,
                { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
              ]}>
                Cookies
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingSpinner: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 3,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  hero: {
    paddingHorizontal: 24,
    paddingTop: 56,
    paddingBottom: 48,
    alignItems: 'stretch',
    gap: 24,
    position: 'relative',
  },
  heroDecoration: {
    position: 'absolute',
    top: -60,
    right: -60,
    width: 180,
    height: 180,
    borderRadius: 120,
    backgroundColor: '#FFF4F1',
    opacity: 0.6,
  },
  heroLogo: {
    fontSize: 56,
    fontWeight: '800',
    lineHeight: 62,
    letterSpacing: -1.2,
    includeFontPadding: false,
    textAlign: 'center',
  },
  heroTagline: {
    fontSize: 22,
    fontWeight: '400',
    lineHeight: 32,
    letterSpacing: 0,
    includeFontPadding: false,
    textAlign: 'center',
  },
  heroCta: {
    marginTop: 8,
  },
  heroSignIn: {
    paddingTop: 16,
    alignItems: 'center',
  },
  heroSignInText: {
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    includeFontPadding: false,
  },
  section: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    gap: 20,
    borderTopWidth: 1,
  },
  sectionEyebrow: {
    fontSize: 11,
    fontWeight: '700',
    lineHeight: 16,
    letterSpacing: 1.5,
    includeFontPadding: false,
    textTransform: 'uppercase',
    textAlign: 'center',
  },
  sectionBody: {
    fontSize: 17,
    fontWeight: '400',
    lineHeight: 27,
    letterSpacing: 0,
    includeFontPadding: false,
    textAlign: 'center',
  },
  featureRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  featureItem: {
    flex: 1,
    gap: 12,
    alignItems: 'center',
    paddingHorizontal: 8,
  },
  featureIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFF4F1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureIcon: {
    fontSize: 26,
  },
  featureTitle: {
    fontSize: 17,
    fontWeight: '600',
    lineHeight: 24,
    letterSpacing: 0,
    includeFontPadding: false,
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    letterSpacing: 0,
    includeFontPadding: false,
    textAlign: 'center',
  },
  trustCard: {
    padding: 28,
    borderRadius: 24,
    backgroundColor: '#FFF4F1',
    alignItems: 'center',
    gap: 14,
  },
  trustIconWrapper: {
    width: 56,
    height: 56,
    borderRadius: 18,
    backgroundColor: '#FFE8E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustIcon: {
    fontSize: 26,
  },
  trustTitle: {
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 30,
    letterSpacing: -0.4,
    includeFontPadding: false,
    textAlign: 'center',
  },
  trustDesc: {
    fontSize: 15,
    fontWeight: '400',
    lineHeight: 24,
    letterSpacing: 0,
    includeFontPadding: false,
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  legalLink: {
    marginTop: 6,
    paddingTop: 4,
  },
  legalLinkText: {
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 22,
    includeFontPadding: false,
  },
  betaSection: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    alignItems: 'center',
  },
  betaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 9999,
    borderWidth: 1,
  },
  betaBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 18,
    letterSpacing: 0.5,
    includeFontPadding: false,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 36,
    alignItems: 'center',
    gap: 16,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '400',
    lineHeight: 21,
    textAlign: 'center',
    includeFontPadding: false,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '400',
    lineHeight: 20,
    includeFontPadding: false,
  },
});

export default LandingPage;
