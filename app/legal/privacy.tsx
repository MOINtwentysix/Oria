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
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
          <Text style={[styles.backIcon, { color: theme.colors.ink }]}>‹</Text>
        </TouchableOpacity>
        <Text style={[
          styles.headerTitle,
          { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
        ]}>
          Datenschutz
        </Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          <View style={[styles.lastUpdated, { borderBottomColor: theme.colors.border }]}>
            <Text style={[
              styles.lastUpdatedText,
              { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
            ]}>
              Stand: September 2026
            </Text>
          </View>

          <GlassCard variant="light" style={styles.contentCard}>
            <Text style={[
              styles.legalContent,
              { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
            ]}>
DATENSCHUTZERKLÄRUNG FÜR ORIA

1. WIR ERHEBEN
- Kontodaten: Name, E-Mail, Authentifizierung via M26 Account SSO
- Standortdaten: Mit deiner Erlaubnis präziser Standort für Orte & Routen
- Nutzungsdaten: Suchen, gespeicherte Orte, KI-Interaktionen
- Gerätedaten: IDs, OS-Version, App-Version für Analysen

2. VERWENDUNG
- Kernfunktionen: Ortssuche, Navigation, Entdeckung
- Personalisierung: Empfehlungen, Listen, Reiseplanung
- Verbesserung: Analysen, Bugfixes, Features
- Kommunikation: Benachrichtigungen, Updates, Support

3. WEITERGABE
- KEIN Verkauf deiner Daten
- Dienstleister: M26 SSO (Auth), Neon (DB), Foursquare (Orte), Mistral (KI), OSRM (Routing)
- Anonymisierte Aggregaten für Analysen
- Gesetzliche Anfragen wenn rechtlich erforderlich

4. SPEICHERDAUER
- Kontodaten: Solange Account aktiv
- Standortdaten: 30 Tage für Routenhistorie
- Suchhistorie: 90 Tage
- Jederzeit löschbar auf Anfrage

5. DEINE RECHTE
- Auskunft über deine Daten
- Berichtigung unrichtiger Daten
- Löschung deiner Daten
- Datenexport
- Opt-out aus Analysen
- Widerruf Standortfreigabe

6. SICHERHEIT
- Verschlüsselung in Transit (TLS 1.3) & at rest
- Regelmäßige Security Audits
- Datenminimierung

7. KINDER
Oria nicht für unter 13. Keine wissentliche Datenerhebung von Kindern.

8. KONTAKT
Datenschutz: privacy@oria.app
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
              Dies ist ein Platzhalter für rechtliche Inhalte, die vor Veröffentlichung von Rechtsanwälten geprüft und freigegeben werden müssen. Die finale Version muss rechtlich bindende Bedingungen enthalten, die spezifisch für Orias Betrieb, Zuständigkeit und Dienste sind.
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
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
  lastUpdated: {
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  lastUpdatedText: {
    fontSize: 13,
    includeFontPadding: false,
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
