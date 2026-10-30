import React, { useState, useEffect, useCallback } from 'react';
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Platform,
  Linking,
} from 'react-native';
import {
  User,
  Shield,
  Trash2,
  MapPin,
  ChevronRight,
  ExternalLink,
  Route as RouteIcon,
  Globe,
} from 'lucide-react-native';
import { UserProfile } from '../types';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import {
  clearAllUserData,
  getUserProfile,
  updateUserProfile,
} from '../services/storage';

interface ProfileScreenProps {
  onOpenRoutePlanner?: () => void;
}

const ACCOUNTS_URL = 'https://accounts.moin26.dev/user';

export function ProfileScreen({ onOpenRoutePlanner }: ProfileScreenProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [profile, setProfile] = useState<UserProfile | null>(null);

  const loadProfile = useCallback(async () => {
    const data = await getUserProfile();
    setProfile(data);
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const handleToggleAnalytics = async (val: boolean) => {
    if (!profile) return;
    const updated = await updateUserProfile({
      privacy: { ...profile.privacy, allowAnalytics: val },
    });
    setProfile(updated);
  };

  const handleOpenAccountManagement = async () => {
    try {
      await Linking.openURL(ACCOUNTS_URL);
    } catch {
      Alert.alert('Link Error', `Could not open ${ACCOUNTS_URL}`);
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear Local Data',
      'This will erase your locally cached search history, collections, and routes in accordance with GDPR privacy rights. Are you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All Data',
          style: 'destructive',
          onPress: async () => {
            await clearAllUserData();
            await loadProfile();
            Alert.alert('Data Cleared', 'All personal data has been erased from this device.');
          },
        },
      ]
    );
  };

  if (!profile) return null;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header Title */}
        <View style={styles.topHeader}>
          <Text style={[styles.screenTitle, { color: colors.text }]}>Profile & Account</Text>
        </View>

        {/* User Card */}
        <View
          style={[
            styles.userCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            Shadows.soft,
          ]}
        >
          <View style={styles.avatarWrap}>
            <View style={[styles.avatarCircle, { backgroundColor: colors.primaryLight }]}>
              <User size={32} color={colors.primary} />
            </View>
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{profile.name}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{profile.email}</Text>
            <TouchableOpacity
              style={styles.manageAccountBtn}
              onPress={handleOpenAccountManagement}
            >
              <Text style={[styles.manageAccountText, { color: colors.primary }]}>
                Manage Account & Profile
              </Text>
              <ExternalLink size={13} color={colors.primary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Management via accounts.moin26.dev */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>ACCOUNT & SECURITY</Text>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            Shadows.soft,
          ]}
        >
          <TouchableOpacity style={styles.actionRow} onPress={handleOpenAccountManagement}>
            <View style={styles.statLeft}>
              <Globe size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statTitle, { color: colors.text }]}>Account Center</Text>
                <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
                  Edit profile, password, email & delete account at accounts.moin26.dev
                </Text>
              </View>
            </View>
            <ExternalLink size={16} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Tools & Planning */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>PLAN & GO</Text>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            Shadows.soft,
          ]}
        >
          <TouchableOpacity
            style={styles.actionRow}
            onPress={() => {
              if (onOpenRoutePlanner) onOpenRoutePlanner();
            }}
          >
            <View style={styles.statLeft}>
              <RouteIcon size={18} color={colors.primary} />
              <View>
                <Text style={[styles.statTitle, { color: colors.text }]}>Multi-Stop Route Planner</Text>
                <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
                  Plan itineraries with OpenStreetMap routing
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Privacy & GDPR Data Protection */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>
          PRIVACY & PERMISSIONS
        </Text>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            Shadows.soft,
          ]}
        >
          <View style={styles.actionRow}>
            <View style={styles.statLeft}>
              <MapPin size={18} color={colors.primary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statTitle, { color: colors.text }]}>Location Privacy</Text>
                <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
                  Location is only requested when active to find nearby places. Never tracked or sold.
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.actionRow}>
            <View style={styles.statLeft}>
              <Shield size={18} color={colors.textSecondary} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.statTitle, { color: colors.text }]}>Anonymous Telemetry</Text>
                <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
                  Help us improve map searches without storing personal IDs
                </Text>
              </View>
            </View>
            <Switch
              value={profile.privacy.allowAnalytics}
              onValueChange={handleToggleAnalytics}
              trackColor={{ false: colors.divider, true: colors.primary }}
            />
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.actionRow} onPress={handleClearData}>
            <View style={styles.statLeft}>
              <Trash2 size={18} color={colors.danger} />
              <View>
                <Text style={[styles.statTitle, { color: colors.danger }]}>Clear Offline Device Cache</Text>
                <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
                  GDPR Article 17 Right to Erasure
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* Footer */}
        <View style={styles.footerWrap}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Oria Version 1.0.0 • AI powered by Mistral AI (mistral-small-latest) • Maps by OpenStreetMap
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'android' ? 44 : 12,
    paddingBottom: 110,
  },
  topHeader: {
    marginBottom: Spacing.lg,
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.4,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  avatarWrap: {
    position: 'relative',
  },
  avatarCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userInfo: {
    marginLeft: 14,
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '700',
  },
  userEmail: {
    fontSize: 13,
    marginTop: 2,
  },
  manageAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  manageAccountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: Spacing.sm,
    marginTop: Spacing.md,
  },
  sectionCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.md,
  },
  statLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  statSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(128, 128, 128, 0.2)',
    marginLeft: 46,
  },
  footerWrap: {
    marginTop: Spacing.xl,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 11,
    textAlign: 'center',
  },
});
