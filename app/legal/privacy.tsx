import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard } from '@/components/ui';
import { useRouter } from 'expo-router';

export default function PrivacyPolicyScreen() {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
          <View style={styles.backIcon} />
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          { color: theme.colors.text },
        ]}>
          Privacy Policy
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={styles.lastUpdated}>
            <Text style={[
              styles.lastUpdatedText,
              { color: theme.colors.textTertiary },
            ]}>
              Last updated: August 2026
            </Text>
          </View>

          <GlassCard variant="light" style={styles.contentCard}>
            <Text style={[
              styles.legalContent,
              { color: theme.colors.text },
            ]}>
PRIVACY POLICY FOR ORIA

1. INFORMATION WE COLLECT
- Account Information: When you create an account, we collect your name, email address, and authentication credentials via the M26 Account SSO service.
- Location Data: With your permission, we collect precise location data to show nearby places and calculate routes.
- Usage Data: We collect information about how you use the app, including searches, saved places, and AI interactions.
- Device Information: We collect device identifiers, OS version, and app version for analytics and debugging.

2. HOW WE USE YOUR DATA
- Provide core functionality: location-based place discovery, search, and navigation
- Personalize your experience: recommendations, saved lists, trip planning
- Improve our services: analytics, bug fixes, feature development
- Communicate with you: notifications, updates, support

3. DATA SHARING
- We do NOT sell your personal data
- We share data with service providers: M26 Account SSO (auth), Neon (database), Foursquare (places), Mistral (AI), OSRM (routing)
- We may share anonymized, aggregated data for analytics
- We comply with legal requests when required by law

4. DATA RETENTION
- Account data: retained while account is active
- Location data: retained for 30 days for route history
- Search history: retained for 90 days
- You can request deletion at any time

5. YOUR RIGHTS
- Access your data
- Correct inaccurate data
- Delete your data
- Export your data
- Opt-out of analytics
- Withdraw consent for location tracking

6. SECURITY
- Encryption in transit (TLS 1.3) and at rest
- Regular security audits
- Minimal data collection principle

7. CHILDREN'S PRIVACY
Oria is not intended for children under 13. We do not knowingly collect data from children.

8. CONTACT
For privacy questions: privacy@oria.app
            </Text>
          </GlassCard>

          <GlassCard variant="light" style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <Text style={styles.noticeIcon}>\u26a0\ufe0f</Text>
              <Text style={[
                styles.noticeTitle,
                { color: theme.colors.warning },
              ]}>
                Placeholder Content
              </Text>
            </View>
            <Text style={[
              styles.noticeText,
              { color: theme.colors.textSecondary },
            ]}>
              This is a placeholder for legal content that must be reviewed and approved by legal counsel before publication. 
              The final version should include legally binding terms specific to Oria's operations, jurisdiction, and services.
            </Text>
          </GlassCard>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'currentColor',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    opacity: 0.6,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 16,
  },
  lastUpdated: {
    paddingHorizontal: 4,
  },
  lastUpdatedText: {
    fontSize: 13,
    fontWeight: '500',
  },
  contentCard: {
    padding: 20,
  },
  legalContent: {
    fontSize: 14,
    lineHeight: 22,
    
  },
  noticeCard: {
    padding: 16,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  noticeIcon: {
    fontSize: 20,
  },
  noticeTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  noticeText: {
    fontSize: 13,
    lineHeight: 20,
  },
});
