import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassCard } from '@/components/ui';
import { useRouter } from 'expo-router';

export default function ThirdPartyServicesScreen() {
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
          Third Party Services
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
THIRD PARTY SERVICES

Oria integrates with the following third-party services:

M26 ACCOUNT SSO (Authentication)
- Service: User authentication, sessions, social login
- Provider: M26 Account
- Data Shared: Email, name, profile image, device info

NEON (Database)
- Service: PostgreSQL database hosting
- Provider: Neon Inc.
- Data Shared: All app data (users, places, lists, trips)
- Privacy: https://neon.tech/privacy
- Terms: https://neon.tech/terms

OPENSTREETMAP (Place Data)
- Service: Place search, details, categories via Overpass API & Nominatim
- Provider: OpenStreetMap Foundation
- Data Shared: Search queries, location coordinates
- Privacy: https://osmfoundation.org/wiki/Privacy_Policy
- Terms: https://osmfoundation.org/wiki/Terms_of_Use
- Attribution: \u00a9 OpenStreetMap contributors

MISTRAL AI (AI Recommendations)
- Service: Large language model for recommendations
- Provider: Mistral AI
- Data Shared: User queries, nearby place context (anonymized)
- Privacy: https://mistral.ai/privacy
- Terms: https://mistral.ai/terms

OPENSTREETMAP / OSRM (Routing)
- Service: Route calculation, distance matrices
- Provider: OpenStreetMap contributors / Project OSRM
- Data Shared: Waypoint coordinates
- Privacy: https://operations.osmfoundation.org/privacy-policy/
- License: Open Database License (ODbL)

GOOGLE MAPS (Navigation Export)
- Service: Deep linking to Google Maps navigation
- Provider: Google LLC
- Data Shared: Route waypoints (when user explicitly exports)
- Privacy: https://policies.google.com/privacy
- Terms: https://policies.google.com/terms

APPLE MAPS (Navigation Export - iOS)
- Service: Deep linking to Apple Maps navigation
- Provider: Apple Inc.
- Data Shared: Route waypoints (when user explicitly exports)
- Privacy: https://www.apple.com/legal/privacy/

EXPO / EAS (Build & Deployment)
- Service: App building, OTA updates, push notifications
- Provider: Expo Application Services (EAS)
- Data Shared: App binary, update manifests
- Privacy: https://expo.dev/privacy
- Terms: https://expo.dev/terms

Each service has its own privacy policy and terms of service. Your use of Oria constitutes acceptance of data sharing with these providers as described above.
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
