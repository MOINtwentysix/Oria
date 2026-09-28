import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Linking } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard } from '@/components/ui';
import { useRouter } from 'expo-router';

export default function LegalScreen() {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: theme.colors.ink }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
        ]}>
          Rechtliches
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <GlassCard variant="light" style={styles.contentCard}>
            <Text style={[
              styles.legalContent,
              { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
            ]}>
RECHTLICHER HINWEIS

Diese Seite ist ein Platzhalter für rechtliche Inhalte, die vor Veröffentlichung von Rechtsanwälten geprüft und freigegeben werden müssen. Die finale Version muss rechtlich bindende Bedingungen enthalten, die spezifisch für Orias Betrieb, Zuständigkeit und Dienste sind.

Kontakt: legal@oria.app
            </Text>
          </GlassCard>

          <GlassCard variant="light" style={styles.noticeCard}>
            <View style={styles.noticeHeader}>
              <Text style={styles.noticeIcon}>⚠️</Text>
              <Text style={[
                styles.noticeTitle,
                { color: theme.colors.warning, fontFamily: theme.typography.fontFamily.display },
              ]}>
                Platzhalter-Inhalt
              </Text>
            </View>
            <Text style={[
              styles.noticeText,
              { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
            ]}>
              Dies ist ein Platzhalter für rechtliche Inhalte, die vor Veröffentlichung von Rechtsanwälten geprüft und freigegeben werden müssen.
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
    backgroundColor: theme.colors.paper,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: { fontSize: 38, lineHeight: 38, fontWeight: '300', includeFontPadding: false },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    includeFontPadding: false,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 16,
  },
  contentCard: {
    padding: 20,
  },
  legalContent: {
    fontSize: 15,
    lineHeight: 24,
    whiteSpace: 'pre',
    includeFontPadding: false,
  },
  noticeCard: {
    padding: 20,
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  noticeIcon: {
    fontSize: 20,
  },
  noticeTitle: {
    fontSize: 16,
    fontWeight: '700',
    includeFontPadding: false,
  },
  noticeText: {
    fontSize: 15,
    lineHeight: 22,
    includeFontPadding: false,
  },
});
