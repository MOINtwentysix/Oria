import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView } from 'react-native';
import * as Linking from 'expo-linking';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard, GlassAvatar, GlassChip, GlassCardListItem } from '@/components/ui';
import { LiquidTabBar } from '@/components/common';
import { useAuth } from '@/services/auth';
import { useUIStore, useUserStore } from '@/store';
import { useAppNavigation } from '@/hooks/useAppNavigation';

export const ProfileScreen: React.FC = () => {
  const accountSettingsUrl = 'https://accounts.moin26.dev/user';
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { user, isSignedIn, signOut } = useAuth();
  const { preferences, updatePreferences, logout } = useUserStore();
  const { tabBarVisible, setTabBarVisible, theme: uiTheme, setTheme } = useUIStore();
  const router = useAppNavigation();

  React.useEffect(() => {
    setTabBarVisible(true);
  }, [setTabBarVisible]);

  const handleSignOut = async () => {
    await signOut();
    logout();
    router.replace('/auth');
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    updatePreferences({ theme: newTheme });
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
        <View style={styles.authPrompt}>
          <Text style={[styles.authIcon, { color: theme.colors.inkSubtle }]}>👤</Text>
          <Text style={[styles.authTitle, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display }]}>
            Willkommen bei Oria
          </Text>
          <Text style={[styles.authSubtitle, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
            Anmelden, um Orte zu speichern, Listen zu erstellen und Oria AI zu nutzen
          </Text>
          <GlassButton size="lg" onPress={() => router.push('/auth')}>
            Anmelden
          </GlassButton>
          <GlassButton variant="secondary" size="lg" onPress={() => router.push('/onboarding')}>
            Als Gast fortfahren
          </GlassButton>
        </View>
      </SafeAreaView>
    );
  }

  const themeOptions = [
    { id: 'light', label: 'Hell', icon: '☀️' },
    { id: 'dark', label: 'Dunkel', icon: '🌙' },
    { id: 'system', label: 'System', icon: '💻' },
  ];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          <View style={styles.profileHeader}>
            <GlassAvatar
              name={user?.firstName}
              uri={user?.imageUrl}
              size="xxl"
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body }]}>
                {user?.firstName || ''} {user?.lastName || ''}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
                {user?.emailAddresses?.[0]?.emailAddress}
              </Text>
              <View style={styles.profileBadges}>
                <GlassChip variant="outline" size="sm">Entdecker</GlassChip>
                <GlassChip variant="outline" size="sm">Planer</GlassChip>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display }]}>Konto</Text>
            <GlassCard variant="light" style={styles.settingsCard}>
              <View style={styles.accountButtonContainer}>
                <GlassButton size="lg" fullWidth onPress={() => Linking.openURL(accountSettingsUrl)}>
                  Account verwalten
                </GlassButton>
              </View>
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display }]}>Einstellungen</Text>
            <GlassCard variant="light" style={styles.settingsCard}>
              <GlassCardListItem
                title="Interessen"
                subtitle="Entdeckungen anpassen"
                leftIcon={<Text style={styles.settingIcon}>❤️</Text>}
                rightIcon={<Text style={styles.settingArrow}>→</Text>}
                padding="md"
                divider={true}
                onPress={() => Linking.openURL(accountSettingsUrl)}
              />
              <GlassCardListItem
                title="Suchradius"
                subtitle={`${preferences?.preferred_radius || 5000} m`}
                leftIcon={<Text style={styles.settingIcon}>📍</Text>}
                rightIcon={<Text style={styles.settingArrow}>→</Text>}
                padding="md"
                divider={true}
                onPress={() => Linking.openURL(accountSettingsUrl)}
              />
              <GlassCardListItem
                title="Design"
                subtitle={uiTheme === 'system' ? 'System' : uiTheme === 'dark' ? 'Dunkel' : 'Hell'}
                leftIcon={<Text style={styles.settingIcon}>🎨</Text>}
                rightIcon={<Text style={styles.settingArrow}>→</Text>}
                padding="md"
                divider={true}
                onPress={() => {}}
              />
              <GlassCardListItem
                title="Benachrichtigungen"
                subtitle="Push & E-Mail"
                leftIcon={<Text style={styles.settingIcon}>🔔</Text>}
                rightIcon={<Text style={styles.settingArrow}>→</Text>}
                padding="md"
                divider={false}
                onPress={() => {}}
              />
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display }]}>Rechtliches</Text>
            <GlassCard variant="light" style={styles.settingsCard}>
              <GlassCardListItem title="Datenschutz" padding="md" divider={true} onPress={() => router.push('/legal/privacy')} />
              <GlassCardListItem title="Nutzungsbedingungen" padding="md" divider={true} onPress={() => router.push('/legal/terms')} />
              <GlassCardListItem title="Open-Source-Lizenzen" padding="md" divider={true} onPress={() => router.push('/legal/licenses')} />
              <GlassCardListItem title="Drittanbieter" padding="md" divider={true} onPress={() => router.push('/legal/third-party')} />
              <GlassCardListItem title="Über Oria" padding="md" divider={false} onPress={() => router.push('/legal/about')} />
            </GlassCard>
          </View>

          <View style={[styles.dangerZone, { borderTopColor: theme.colors.border }]}>
            <Text style={[styles.dangerTitle, { color: theme.colors.error, fontFamily: theme.typography.fontFamily.display }]}>Gefahrenzone</Text>
            <GlassCard variant="light" style={styles.dangerCard}>
              <GlassCardListItem title="Abmelden" padding="md" divider={false} onPress={handleSignOut} />
            </GlassCard>
          </View>

        </View>
      </ScrollView>

      <LiquidTabBar
        tabs={[
          { id: 'explore', label: 'Entdecken', icon: <Text style={styles.tabIcon}>🗺️</Text>, selectedIcon: <Text style={styles.tabIcon}>🗺️</Text> },
          { id: 'ai', label: 'Oria AI', icon: <Text style={styles.tabIcon}>✨</Text>, selectedIcon: <Text style={styles.tabIcon}>✨</Text> },
          { id: 'saved', label: 'Gespeichert', icon: <Text style={styles.tabIcon}>❤️</Text>, selectedIcon: <Text style={styles.tabIcon}>❤️</Text> },
          { id: 'profile', label: 'Profil', icon: <Text style={styles.tabIcon}>👤</Text>, selectedIcon: <Text style={styles.tabIcon}>👤</Text> },
        ]}
        activeTab="profile"
        onTabPress={(tabId) => router.push(`/${tabId}` as any)}
        variant="floating"
        style={styles.tabBar}
      />
    </SafeAreaView>
  );
};

export default ProfileScreen;

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollView: { flex: 1 },
  scrollContent: { paddingBottom: 140 },
  content: { paddingHorizontal: 24, paddingVertical: 24, paddingBottom: 150, gap: 24 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 10 },
  avatar: {},
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 24, fontWeight: '700', includeFontPadding: false },
  profileEmail: { fontSize: 15, includeFontPadding: false },
  profileBadges: { flexDirection: 'row', gap: 8, marginTop: 8 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', includeFontPadding: false },
  settingsCard: { borderRadius: 20, overflow: 'hidden' },
  accountButtonContainer: { padding: 16 },
  settingIcon: { fontSize: 20 },
  settingArrow: { fontSize: 18, fontWeight: '700', includeFontPadding: false },
  dangerZone: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, gap: 12 },
  dangerTitle: { fontSize: 11, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', includeFontPadding: false },
  dangerCard: { borderRadius: 20, overflow: 'hidden' },
  tabBar: { position: 'absolute', bottom: 0, left: 16, right: 16, marginBottom: 20 },
  tabIcon: { fontSize: 22 },
  authPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 20 },
  authIcon: { fontSize: 64 },
  authTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center', includeFontPadding: false },
  authSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22, includeFontPadding: false },
});
