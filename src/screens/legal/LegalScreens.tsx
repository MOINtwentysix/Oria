import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard } from '@/components/ui';
import { useRouter } from 'expo-router';

interface LegalScreenProps {
  title: string;
  content: string;
  lastUpdated?: string;
}

export const LegalScreen: React.FC<LegalScreenProps> = ({ title, content, lastUpdated }) => {
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
          {title}
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {lastUpdated && (
            <View style={styles.lastUpdated}>
              <Text style={[
                styles.lastUpdatedText,
                { color: theme.colors.textTertiary },
              ]}>
                Last updated: {lastUpdated}
              </Text>
            </View>
          )}

          <GlassCard variant="glass" style={styles.contentCard}>
            <Text style={[
              styles.legalContent,
              { color: theme.colors.text },
            ]}>
              {content}
            </Text>
          </GlassCard>

          <GlassCard variant="glass" style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <Text style={styles.noticeIcon}>⚠️</Text>
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
};

export const PrivacyPolicyScreen: React.FC = () => (
  <LegalScreen
    title="Privacy Policy"
    lastUpdated="August 2026"
    content={`
PRIVACY POLICY FOR ORIA

1. INFORMATION WE COLLECT
- Account Information: When you create an account, we collect your name, email address, and authentication credentials via Clerk.
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
- We share data with service providers: Clerk (auth), Neon (database), Foursquare (places), Mistral (AI), OSRM (routing)
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
`}
  />
);

export const TermsOfServiceScreen: React.FC = () => (
  <LegalScreen
    title="Terms of Service"
    lastUpdated="August 2026"
    content={`
TERMS OF SERVICE FOR ORIA

1. ACCEPTANCE OF TERMS
By using Oria, you agree to these Terms. If you disagree, do not use the app.

2. DESCRIPTION OF SERVICE
Oria is a location discovery application that helps users find places, save favorites, create lists, plan trips, and share with friends using AI assistance.

3. USER ACCOUNTS
- You must be 13+ to use Oria
- You are responsible for your account security
- You must provide accurate information
- One account per person

4. ACCEPTABLE USE
You agree NOT to:
- Use Oria for illegal activities
- Scrape, crawl, or bulk extract data
- Reverse engineer or hack the service
- Impersonate others
- Spam or harass other users
- Violate intellectual property rights

5. USER CONTENT
- You retain ownership of your content (lists, notes, etc.)
- You grant us a license to host, display, and process your content
- You are responsible for your content
- We may remove content violating these Terms

6. THIRD-PARTY SERVICES
Oria integrates with:
- Foursquare Places API (place data)
- Mistral AI (AI recommendations)
- OpenStreetMap/OSRM (routing)
- Clerk (authentication)
- Neon (database)
Your use of Oria constitutes acceptance of their terms.

7. AI FEATURES
- AI recommendations are for informational purposes only
- We do not guarantee accuracy of AI suggestions
- Always verify information independently
- AI may make mistakes

8. SUBSCRIPTIONS & PAYMENTS
- Free tier available with core features
- Premium features may require subscription
- Prices subject to change with notice
- Refunds per platform policy (Apple/Google)

9. DISCLAIMERS
- Service provided "as is" without warranties
- Place data from Foursquare may be inaccurate
- Routing from OSRM may not reflect current conditions
- Not liable for damages from reliance on app

10. LIMITATION OF LIABILITY
To the maximum extent permitted by law, Oria is not liable for indirect, incidental, or consequential damages.

11. TERMINATION
We may suspend or terminate accounts violating these Terms.

12. GOVERNING LAW
These Terms governed by laws of Germany. Disputes resolved in Berlin courts.

13. CHANGES
We may update these Terms. Continued use constitutes acceptance.

14. CONTACT
For questions: legal@oria.app
`}
  />
);

export const ImprintScreen: React.FC = () => (
  <LegalScreen
    title="Imprint"
    lastUpdated="August 2026"
    content={`
IMPRINT (IMPRESSUM)

Oria App
c/o [Company Name UG (haftungsbeschränkt)]
[Street Address]
[Postal Code] [City]
Germany

Managing Director: [Name]
Email: legal@oria.app
Phone: [Phone Number]

Register Court: [Court Name]
Register Number: [HRB Number]
VAT ID: [DE Number]

Platform: iOS App Store / Google Play Store
App Store Provider: Apple Inc.
Google Play Provider: Google LLC

Hosting: Neon (PostgreSQL), Vercel/Expo
Authentication: Clerk
Place Data: Foursquare Labs, Inc.
AI Provider: Mistral AI
Routing: OpenStreetMap contributors / OSRM

Content Responsibility: [Name] (per § 55 Abs. 2 RStV)
[Address]
`}
  />
);

export const CookiePolicyScreen: React.FC = () => (
  <LegalScreen
    title="Cookie Policy"
    lastUpdated="August 2026"
    content={`
COOKIE POLICY FOR ORIA

Oria uses cookies and similar technologies for:

ESSENTIAL COOKIES (Always Active)
- Authentication tokens (Clerk)
- Session management
- Security (CSRF protection)
- Load balancing

FUNCTIONAL COOKIES
- User preferences (theme, language, units)
- Onboarding state
- Recent searches cache

ANALYTICS COOKIES (Optional)
- Anonymous usage statistics
- Feature adoption metrics
- Performance monitoring

THIRD-PARTY COOKIES
- Clerk authentication cookies
- Expo/React Native storage (AsyncStorage)
- No advertising cookies

MOBILE APP STORAGE
On mobile, we use AsyncStorage (React Native) instead of traditional cookies for:
- Authentication tokens
- User preferences
- Offline cache
- Onboarding progress

YOUR CHOICES
- Essential cookies cannot be disabled
- Analytics cookies can be disabled in Settings
- Clear all data: Settings → Delete Account

CONTACT
privacy@oria.app
`}
  />
);

export const OpenSourceLicensesScreen: React.FC = () => (
  <LegalScreen
    title="Open Source Licenses"
    lastUpdated="August 2026"
    content={`
OPEN SOURCE LICENSES

Oria is built with the following open source software:

EXPO & REACT NATIVE ECOSYSTEM
- expo (MIT) - https://github.com/expo/expo
- react-native (MIT) - https://github.com/facebook/react-native
- expo-router (MIT) - https://github.com/expo/router
- expo-location (MIT) - https://github.com/expo/expo
- expo-blur (MIT) - https://github.com/expo/expo
- expo-image-picker (MIT) - https://github.com/expo/expo
- expo-secure-store (MIT) - https://github.com/expo/expo
- expo-constants (MIT) - https://github.com/expo/expo
- expo-linking (MIT) - https://github.com/expo/expo
- expo-web-browser (MIT) - https://github.com/expo/expo
- expo-auth-session (MIT) - https://github.com/expo/expo
- expo-device (MIT) - https://github.com/expo/expo
- expo-status-bar (MIT) - https://github.com/expo/expo
- expo-build-properties (MIT) - https://github.com/expo/expo

REACT NATIVE LIBRARIES
- react-native-maps (MIT) - https://github.com/react-native-maps/react-native-maps
- react-native-gesture-handler (MIT) - https://github.com/software-mansion/react-native-gesture-handler
- react-native-reanimated (MIT) - https://github.com/software-mansion/react-native-reanimated
- react-native-screens (MIT) - https://github.com/software-mansion/react-native-screens
- react-native-safe-area-context (MIT) - https://github.com/th3rdwave/react-native-safe-area-context
- @react-native-async-storage/async-storage (MIT) - https://github.com/react-native-async-storage/async-storage
- @rnmapbox/maps (BSD-3-Clause) - https://github.com/rnmapbox/maps

STATE MANAGEMENT & DATA
- zustand (MIT) - https://github.com/pmndrs/zustand
- @tanstack/react-query (MIT) - https://github.com/TanStack/query
- @neondatabase/serverless (Apache-2.0) - https://github.com/neondatabase/serverless

AUTHENTICATION
- @clerk/clerk-expo (MIT) - https://github.com/clerk/clerk-sdk-react-native
- @clerk/expo (MIT) - https://github.com/clerk/clerk-sdk-react-native

UTILITIES
- axios (MIT) - https://github.com/axios/axios
- react-native-svg (MIT) - https://github.com/software-mansion/react-native-svg

Full license texts available at respective GitHub repositories.
`}
  />
);

export const ThirdPartyServicesScreen: React.FC = () => (
  <LegalScreen
    title="Third Party Services"
    lastUpdated="August 2026"
    content={`
THIRD PARTY SERVICES

Oria integrates with the following third-party services:

CLERK (Authentication)
- Service: User authentication, sessions, social login
- Provider: Clerk Inc.
- Data Shared: Email, name, profile image, device info
- Privacy: https://clerk.com/privacy
- Terms: https://clerk.com/terms

NEON (Database)
- Service: PostgreSQL database hosting
- Provider: Neon Inc.
- Data Shared: All app data (users, places, lists, trips)
- Privacy: https://neon.tech/privacy
- Terms: https://neon.tech/terms

FOURSQUARE PLACES API (Place Data)
- Service: Place search, details, photos, categories
- Provider: Foursquare Labs, Inc.
- Data Shared: Search queries, location coordinates
- Privacy: https://foursquare.com/privacy
- Terms: https://foursquare.com/terms
- Attribution: Place data © Foursquare

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
`}
  />
);

export const AboutScreen: React.FC = () => (
  <LegalScreen
    title="About Oria"
    lastUpdated="August 2026"
    content={`
ABOUT ORIA

Version: 1.0.0
Build: 1
Platform: iOS / Android

Oria is a modern location discovery application built with:
- React Native & Expo
- TypeScript
- Neon PostgreSQL
- Clerk Authentication
- Foursquare Places API
- Mistral AI
- OpenStreetMap / OSRM

MISSION
Help people discover amazing places around them, save favorites, collaborate with friends, and plan unforgettable trips.

TEAM
Built with ❤️ by the Oria Team

CONTACT
General: hello@oria.app
Support: support@oria.app
Legal: legal@oria.app
Privacy: privacy@oria.app

SOCIAL
Website: https://oria.app
Twitter: @oria_app
Instagram: @oria.app

ACKNOWLEDGMENTS
- Foursquare for comprehensive place data
- Mistral AI for intelligent recommendations
- OpenStreetMap contributors for routing data
- Expo team for amazing developer tools
- React Native community for open source libraries
- All beta testers and early users

THANK YOU
Thank you for using Oria! We're just getting started.
`}
  />
);

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
    whiteSpace: 'pre-wrap',
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