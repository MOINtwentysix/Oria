import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassCard } from '@/components/ui';
import { useRouter } from 'expo-router';

export default function AboutScreen() {
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
          About Oria
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
Built with \u2764\ufe0f by the Oria Team

CONTACT
General: hello@oria.app
Support: support@oria.app
Legal: legal@oria.app
Privacy: privacy@oria.app

SOCIAL
Website: https://oria.app
Twitter: @oria_app
Instagram: @oria_app

ACKNOWLEDGMENTS
- Foursquare for comprehensive place data
- Mistral AI for intelligent recommendations
- OpenStreetMap contributors for routing data
- Expo team for amazing developer tools
- React Native community for open source libraries
- All beta testers and early users

THANK YOU
Thank you for using Oria! We're just getting started.
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
