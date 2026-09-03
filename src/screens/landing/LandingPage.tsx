import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard } from '@/components/ui';
import { useAuth } from '@/services/clerk';
import { useAppNavigation } from '@/hooks/useAppNavigation';

export const LandingPage: React.FC = () => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { isSignedIn } = useAuth();
  const router = useAppNavigation();

  const handleGetStarted = () => {
    if (isSignedIn) {
      router.replace('/explore');
    } else {
      router.push('/onboarding');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          <View style={styles.hero}>
            <Text style={[
              styles.heroLogo,
              { color: theme.colors.text },
            ]}>
              oria
            </Text>
            <Text style={[
              styles.heroTagline,
              { color: theme.colors.textSecondary },
            ]}>
              Discover what's around you.
            </Text>
            <GlassButton size="xl" fullWidth onPress={handleGetStarted} style={styles.heroCta}>
              Get Started
            </GlassButton>
            <TouchableOpacity onPress={() => router.push('/auth')} style={styles.heroSignIn}>
              <Text style={[
                styles.heroSignInText,
                { color: theme.colors.textSecondary },
              ]}>
                Already have an account? Sign in
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              { color: theme.colors.text },
            ]}>
              Discover
            </Text>
            <Text style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Find amazing places near you with our interactive map. Search, filter, and explore categories.
            </Text>
            <View style={styles.featureGrid}>
{[
                { icon: '🗺️', title: 'Interactive Map', desc: 'Beautiful, fluid map experience' },
                { icon: '🔍', title: 'Smart Search', desc: 'Find exactly what you are looking for' },
                { icon: '🏷️', title: 'Categories', desc: '10+ categories to explore' },
                { icon: '📍', title: 'My Location', desc: 'Instantly center on your position' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={[
                    styles.featureTitle,
                    { color: theme.colors.text },
                  ]}>
                    {feature.title}
                  </Text>
                  <Text style={[
                    styles.featureDesc,
                    { color: theme.colors.textSecondary },
                  ]}>
                    {feature.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              { color: theme.colors.text },
            ]}>
              Explore
            </Text>
            <Text style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Rich place details with photos, ratings, hours, and more. Save favorites instantly.
            </Text>
            <View style={styles.featureGrid}>
              {[
                { icon: '📸', title: 'Photos & Details', desc: 'High-quality images and info' },
                { icon: '⭐', title: 'Ratings & Reviews', desc: 'Know before you go' },
                { icon: '🕐', title: 'Opening Hours', desc: 'Real-time open status' },
                { icon: '💾', title: 'One-Tap Save', desc: 'Add to lists instantly' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={[
                    styles.featureTitle,
                    { color: theme.colors.text },
                  ]}>
                    {feature.title}
                  </Text>
                  <Text style={[
                    styles.featureDesc,
                    { color: theme.colors.textSecondary },
                  ]}>
                    {feature.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              { color: theme.colors.text },
            ]}>
              Oria AI
            </Text>
            <Text style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Your intelligent travel companion. Ask questions, get recommendations, plan trips.
            </Text>
            <View style={styles.featureGrid}>
              {[
                { icon: '💬', title: 'Ask Oria', desc: 'Natural language place search' },
                { icon: '🗺️', title: 'Plan My Trip', desc: 'AI-generated itineraries' },
                { icon: '🔍', title: 'Find Something', desc: 'Describe what you want' },
                { icon: '🎲', title: 'Surprise Me', desc: 'Random discoveries' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={[
                    styles.featureTitle,
                    { color: theme.colors.text },
                  ]}>
                    {feature.title}
                  </Text>
                  <Text style={[
                    styles.featureDesc,
                    { color: theme.colors.textSecondary },
                  ]}>
                    {feature.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              { color: theme.colors.text },
            ]}>
              Shared Lists
            </Text>
            <Text style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Collaborate with friends. Create lists together, plan group trips, share discoveries.
            </Text>
            <View style={styles.featureGrid}>
              {[
                { icon: '👥', title: 'Collaborative Lists', desc: 'Multiple editors, real-time sync' },
                { icon: '🔐', title: 'Role-Based Access', desc: 'Owner, Editor, Viewer permissions' },
                { icon: '📤', title: 'Easy Sharing', desc: 'Invite via link or email' },
                { icon: '✨', title: 'Group Trip Planning', desc: 'AI plans from shared lists' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={[
                    styles.featureTitle,
                    { color: theme.colors.text },
                  ]}>
                    {feature.title}
                  </Text>
                  <Text style={[
                    styles.featureDesc,
                    { color: theme.colors.textSecondary },
                  ]}>
                    {feature.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              { color: theme.colors.text },
            ]}>
              Plan Trips
            </Text>
            <Text style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Turn places into journeys. AI creates optimized routes, export to Google Maps.
            </Text>
            <View style={styles.featureGrid}>
              {[
                { icon: '🗺️', title: 'Smart Routing', desc: 'OSM-based route optimization' },
                { icon: '⏱️', title: 'Time-Aware', desc: 'Realistic travel times' },
                { icon: '🚗', title: 'Multi-Modal', desc: 'Walk, bike, drive, or transit' },
                { icon: '↗️', title: 'Google Maps Export', desc: 'One-tap navigation' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={[
                    styles.featureTitle,
                    { color: theme.colors.text },
                  ]}>
                    {feature.title}
                  </Text>
                  <Text style={[
                    styles.featureDesc,
                    { color: theme.colors.textSecondary },
                  ]}>
                    {feature.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[
              styles.sectionTitle,
              { color: theme.colors.text },
            ]}>
              Privacy First
            </Text>
            <Text style={[
              styles.sectionSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Your data belongs to you. No tracking, no selling, transparent practices.
            </Text>
            <View style={styles.featureGrid}>
{[
                { icon: '🔒', title: 'Encrypted Data', desc: 'End-to-end encryption' },
                { icon: '🚫', title: 'No Tracking', desc: 'We do not follow you around' },
                { icon: '📋', title: 'Data Control', desc: 'Export or delete anytime' },
                { icon: '🌍', title: 'GDPR Compliant', desc: 'European privacy standards' },
              ].map((feature, index) => (
                <View key={index} style={styles.featureCard}>
                  <Text style={styles.featureIcon}>{feature.icon}</Text>
                  <Text style={[
                    styles.featureTitle,
                    { color: theme.colors.text },
                  ]}>
                    {feature.title}
                  </Text>
                  <Text style={[
                    styles.featureDesc,
                    { color: theme.colors.textSecondary },
                  ]}>
                    {feature.desc}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.ctaSection}>
            <Text style={[
              styles.ctaTitle,
              { color: theme.colors.text },
            ]}>
              Ready to explore?
            </Text>
            <Text style={[
              styles.ctaSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Join thousands discovering amazing places with Oria
            </Text>
            <GlassButton size="xl" fullWidth onPress={handleGetStarted} style={styles.ctaButton}>
              Get Started Free
            </GlassButton>
          </View>

          <View style={styles.footer}>
            <Text style={[
              styles.footerText,
              { color: theme.colors.textTertiary },
            ]}>
              © 2026 Oria. All rights reserved.
            </Text>
            <View style={styles.footerLinks}>
              <TouchableOpacity onPress={() => router.push('/legal/privacy')} hitSlop={8}>
                <Text style={[
                  styles.footerLink,
                  { color: theme.colors.textSecondary },
                ]}>
                  Privacy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/legal/terms')} hitSlop={8}>
                <Text style={[
                  styles.footerLink,
                  { color: theme.colors.textSecondary },
                ]}>
                  Terms
              </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/legal/imprint')} hitSlop={8}>
                <Text style={[
                  styles.footerLink,
                  { color: theme.colors.textSecondary },
                ]}>
                  Imprint
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
    paddingBottom: 60,
    gap: 48,
  },
  hero: {
    alignItems: 'center',
    gap: 20,
    paddingVertical: 40,
  },
  heroLogo: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: -2,
  },
  heroTagline: {
    fontSize: 20,
    textAlign: 'center',
    lineHeight: 28,
    paddingHorizontal: 20,
  },
  heroCta: {
    minWidth: 280,
    marginTop: 8,
  },
  heroSignIn: {
    marginTop: 12,
  },
  heroSignInText: {
    fontSize: 15,
    fontWeight: '500',
  },
  section: {
    gap: 20,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  sectionSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    paddingHorizontal: 4,
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'space-between',
  },
  featureCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backgroundColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  featureIcon: {
    fontSize: 36,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  featureDesc: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  ctaSection: {
    alignItems: 'center',
    gap: 12,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '800',
    textAlign: 'center',
  },
  ctaSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  ctaButton: {
    minWidth: 280,
    marginTop: 8,
  },
  footer: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  footerText: {
    fontSize: 13,
  },
  footerLinks: {
    flexDirection: 'row',
    gap: 24,
  },
  footerLink: {
    fontSize: 13,
    fontWeight: '500',
  },
});