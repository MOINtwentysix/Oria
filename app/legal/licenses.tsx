import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassCard } from '@/components/ui';
import { useRouter } from 'expo-router';

export default function OpenSourceLicensesScreen() {
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
          Open Source Licenses
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

STATE MANAGEMENT & DATA
- zustand (MIT) - https://github.com/pmndrs/zustand
- @tanstack/react-query (MIT) - https://github.com/TanStack/query

AUTHENTICATION
- @clerk/clerk-expo (MIT) - https://github.com/clerk/clerk-sdk-react-native
- @clerk/expo (MIT) - https://github.com/clerk/clerk-sdk-react-native

UTILITIES
- axios (MIT) - https://github.com/axios/axios

Full license texts available at respective GitHub repositories.
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
