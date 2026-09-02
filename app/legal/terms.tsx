import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassCard } from '@/components/ui';
import { useRouter } from 'expo-router';

export default function TermsOfServiceScreen() {
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
          Terms of Service
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

          <GlassCard variant="glass" style={styles.contentCard}>
            <Text style={[
              styles.legalContent,
              { color: theme.colors.text },
            ]}>
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
            </Text>
          </GlassCard>

          <GlassCard variant="glass" style={styles.noticeCard}>
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
