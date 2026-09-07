import React from 'react';
import * as Linking from 'expo-linking';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Switch, Alert } from 'react-native';
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
  const { user: appUser, preferences, updatePreferences, logout } = useUserStore();
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

  const handleDeleteAccount = async () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data will be permanently deleted.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: async () => { await handleSignOut(); } },
      ]
    );
  };

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'system') => {
    setTheme(newTheme);
    updatePreferences({ theme: newTheme });
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.authPrompt}>
          <Text style={[styles.authIcon, { color: theme.colors.textTertiary }]}>👤</Text>
          <Text style={[styles.authTitle, { color: theme.colors.text }]}>Welcome to Oria</Text>
          <Text style={[styles.authSubtitle, { color: theme.colors.textSecondary }]}>
            Sign in to save places, create lists, and use Oria AI
          </Text>
          <GlassButton size="lg" onPress={() => router.push('/auth')}>
            Sign In
          </GlassButton>
          <GlassButton size="lg" onPress={() => router.push('/onboarding')}>
            Continue as Guest
          </GlassButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>

          <View style={styles.profileHeader}>
            <GlassAvatar
              name={user?.firstName ?? undefined}
              uri={user?.imageUrl ?? undefined}
              size="xxl"
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: theme.colors.text }]}>
                {user?.firstName || ''} {user?.lastName || ''}
              </Text>
              <Text style={[styles.profileEmail, { color: theme.colors.textSecondary }]}>
                {user?.emailAddresses?.[0]?.emailAddress}
              </Text>
              <View style={styles.profileBadges}>
                <GlassChip variant="outline" size="sm">Explorer</GlassChip>
                <GlassChip variant="outline" size="sm">Planner</GlassChip>
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Account</Text>
            <GlassCard variant="light" style={styles.settingsCard}>
              <GlassCardListItem
                title="Account Settings"
                subtitle="Name, photo, password, and security"
                leftIcon={<Text style={styles.settingIcon}>✏️</Text>}
                rightIcon={<Text style={styles.settingArrow}>→</Text>}

                padding="md"
                divider={true}
                onPress={() => Linking.openURL(accountSettingsUrl)}
              />
              <GlassCardListItem
                title="Email & Security"
                subtitle="Password, 2FA, sessions"
                leftIcon={<Text style={styles.settingIcon}>🔐</Text>}
                rightIcon={<Text style={styles.settingArrow}>→</Text>}

                padding="md"
                divider={true}
                onPress={() => Linking.openURL(accountSettingsUrl)}
              />
              <GlassCardListItem
                title="Connected Accounts"
                subtitle="Manage social logins"
                leftIcon={<Text style={styles.settingIcon}>🔗</Text>}
                rightIcon={<Text style={styles.settingArrow}>→</Text>}

                padding="md"
                divider={false}
                onPress={() => Linking.openURL(accountSettingsUrl)}
              />
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Preferences</Text>
            <GlassCard variant="light" style={styles.settingsCard}>
              <GlassCardListItem
                title="Interests"
                subtitle="Customize your discovery"
                leftIcon={<Text style={styles.settingIcon}>❤️</Text>}
                rightIcon={<Text style={styles.settingArrow}>→</Text>}

                padding="md"
                divider={true}
                onPress={() => Linking.openURL(accountSettingsUrl)}
              />
              <GlassCardListItem
                title="Search Radius"
                subtitle={`${preferences?.preferred_radius || 5000}m default`}
                leftIcon={<Text style={styles.settingIcon}>📍</Text>}
                rightIcon={<Text style={styles.settingArrow}>→</Text>}

                padding="md"
                divider={true}
                onPress={() => Linking.openURL(accountSettingsUrl)}
              />
              <GlassCardListItem
                title="Notifications"
                subtitle="Push and email preferences"
                leftIcon={<Text style={styles.settingIcon}>🔔</Text>}
                rightIcon={
                  <Switch
                    value={preferences?.notifications_enabled ?? true}
                    onValueChange={(v) => updatePreferences({ notifications_enabled: v })}
                    thumbColor={theme.colors.primary}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                  />
                }

                padding="md"
                divider={true}
              />
              <GlassCardListItem
                title="Location Sharing"
                subtitle="Share location with friends"
                leftIcon={<Text style={styles.settingIcon}>📍</Text>}
                rightIcon={
                  <Switch
                    value={preferences?.location_sharing ?? false}
                    onValueChange={(v) => updatePreferences({ location_sharing: v })}
                    thumbColor={theme.colors.primary}
                    trackColor={{ false: theme.colors.border, true: theme.colors.primaryLight }}
                  />
                }

                padding="md"
                divider={false}
              />
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>AI Settings</Text>
            <GlassCard variant="light" style={styles.settingsCard}>
              <GlassCardListItem
                title="AI Model"
                subtitle="mistral-small-2"
                leftIcon={<Text style={styles.settingIcon}>🤖</Text>}
                rightIcon={<Text style={styles.settingArrow}>→</Text>}

                padding="md"
                divider={true}
                onPress={() => {}}
              />
              <GlassCardListItem
                title="Conversation History"
                subtitle="Manage saved chats"
                leftIcon={<Text style={styles.settingIcon}>💬</Text>}
                rightIcon={<Text style={styles.settingArrow}>→</Text>}

                padding="md"
                divider={true}
                onPress={() => router.push('/ai')}
              />
              <GlassCardListItem
                title="Data Usage"
                subtitle="Control AI data processing"
                leftIcon={<Text style={styles.settingIcon}>📊</Text>}
                rightIcon={<Text style={styles.settingArrow}>→</Text>}

                padding="md"
                divider={false}
                onPress={() => Linking.openURL(accountSettingsUrl)}
              />
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>Appearance</Text>
            <GlassCard variant="light" style={styles.settingsCard}>
              <View style={styles.themeOptions}>
                {(['light', 'dark', 'system'] as const).map((t) => (
                  <TouchableOpacity
                    key={t}
                    onPress={() => handleThemeChange(t)}
                    style={[
                      styles.themeOption,
                      {
                        borderColor: uiTheme === t ? theme.colors.primary : theme.colors.border,
                        backgroundColor: uiTheme === t
                          ? (colorScheme === 'dark' ? 'rgba(0,102,204,0.15)' : 'rgba(0,102,204,0.08)')
                          : 'transparent',
                      },
                    ]}
                    hitSlop={8}
                  >
                    <View style={[styles.themeOptionIcon, { backgroundColor: t === 'light' ? '#F7F9FC' : t === 'dark' ? '#1E293B' : theme.colors.primary }]}>
                      <Text style={styles.themeOptionIconText}>
                        {t === 'light' ? '☀️' : t === 'dark' ? '🌙' : '💻'}
                      </Text>
                    </View>
                    <Text style={[styles.themeOptionLabel, { color: uiTheme === t ? theme.colors.primary : theme.colors.text }]}>
                      {t.charAt(0).toUpperCase() + t.slice(1)}
                    </Text>
                    {uiTheme === t && (
                      <View style={[styles.themeOptionCheck, { backgroundColor: theme.colors.primary }]}>
                        <Text style={styles.themeOptionCheckText}>✓</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.colors.textSecondary }]}>About</Text>
            <GlassCard variant="light" style={styles.settingsCard}>
              <GlassCardListItem title="Privacy Policy" padding="md" divider={true} onPress={() => router.push('/legal/privacy')} />
              <GlassCardListItem title="Terms of Service" padding="md" divider={true} onPress={() => router.push('/legal/terms')} />
              <GlassCardListItem title="Open Source Licenses" padding="md" divider={true} onPress={() => router.push('/legal/licenses')} />
              <GlassCardListItem title="Third Party Services" padding="md" divider={true} onPress={() => router.push('/legal/third-party')} />
              <GlassCardListItem title="About Oria" padding="md" divider={false} onPress={() => router.push('/legal/about')} />
            </GlassCard>
          </View>

          <View style={styles.dangerZone}>
            <Text style={[styles.dangerTitle, { color: theme.colors.error }]}>Danger Zone</Text>
            <GlassCard variant="light" style={styles.dangerCard}>
              <GlassCardListItem title="Sign Out" padding="md" divider={true} onPress={handleSignOut} />
              <GlassCardListItem title="Delete Account" padding="md" divider={false} onPress={handleDeleteAccount} />
            </GlassCard>
          </View>

        </View>
      </ScrollView>

      <LiquidTabBar
        tabs={[
          { id: 'explore', label: 'Explore', icon: <Text style={styles.tabIcon}>🗺️</Text>, selectedIcon: <Text style={styles.tabIcon}>🗺️</Text> },
          { id: 'ai', label: 'Oria AI', icon: <Text style={styles.tabIcon}>✨</Text>, selectedIcon: <Text style={styles.tabIcon}>✨</Text> },
          { id: 'saved', label: 'Saved', icon: <Text style={styles.tabIcon}>❤️</Text>, selectedIcon: <Text style={styles.tabIcon}>❤️</Text> },
          { id: 'profile', label: 'Profile', icon: <Text style={styles.tabIcon}>👤</Text>, selectedIcon: <Text style={styles.tabIcon}>👤</Text> },
        ]}
        activeTab="profile"
        onTabPress={(tabId) => router.push(`/${tabId}` as any)}
        variant="floating"
        style={styles.tabBar}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FC' },
  scrollView: { flex: 1 },
  content: { paddingHorizontal: 20, paddingVertical: 20, gap: 24 },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, paddingTop: 10 },
  avatar: {},
  profileInfo: { flex: 1, gap: 4 },
  profileName: { fontSize: 24, fontWeight: '700' },
  profileEmail: { fontSize: 15 },
  profileBadges: { flexDirection: 'row', gap: 8, marginTop: 8 },
  section: { gap: 12 },
  sectionTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  settingsCard: { borderRadius: 20, overflow: 'hidden' },
  settingIcon: { fontSize: 20 },
  settingArrow: { fontSize: 18, fontWeight: '700' },
  themeOptions: { flexDirection: 'row', gap: 12, padding: 16 },
  themeOption: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10, paddingVertical: 16, paddingHorizontal: 12, borderRadius: 16, borderWidth: 2 },
  themeOptionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  themeOptionIconText: { fontSize: 18 },
  themeOptionLabel: { fontSize: 14, fontWeight: '600' },
  themeOptionCheck: { width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  themeOptionCheckText: { fontSize: 12, fontWeight: '700', color: 'white' },
  dangerZone: { marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', gap: 12 },
  dangerTitle: { fontSize: 13, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5 },
  dangerCard: { borderRadius: 20, overflow: 'hidden' },
  tabBar: { position: 'absolute', bottom: 0, left: 16, right: 16, marginBottom: 20 },
  tabIcon: { fontSize: 22 },
  authPrompt: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 20 },
  authIcon: { fontSize: 64 },
  authTitle: { fontSize: 24, fontWeight: '700', textAlign: 'center' },
  authSubtitle: { fontSize: 15, textAlign: 'center', lineHeight: 22 },
});
