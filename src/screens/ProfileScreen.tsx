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
} from 'react-native';
import {
  User,
  Sparkles,
  Shield,
  Trash2,
  Bookmark,
  MapPin,
  ChevronRight,
  Zap,
  Route as RouteIcon,
} from 'lucide-react-native';
import { UserProfile } from '../types';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import { OriaProModal } from '../components/OriaProModal';
import {
  clearAllUserData,
  getUserProfile,
  updateUserProfile,
} from '../services/storage';

interface ProfileScreenProps {
  onOpenRoutePlanner?: () => void;
}

export function ProfileScreen({ onOpenRoutePlanner }: ProfileScreenProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isProModalVisible, setIsProModalVisible] = useState<boolean>(false);

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

  const isPro = profile.subscription.tier === 'pro';

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
            {isPro && (
              <View style={[styles.proBadge, { backgroundColor: colors.accent }]}>
                <Sparkles size={11} color="#FFFFFF" />
              </View>
            )}
          </View>

          <View style={styles.userInfo}>
            <Text style={[styles.userName, { color: colors.text }]}>{profile.name}</Text>
            <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{profile.email}</Text>
            <View style={styles.tierPillRow}>
              <View
                style={[
                  styles.tierTag,
                  {
                    backgroundColor: isPro ? colors.accentLight : colors.backgroundSelected,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.tierTagText,
                    { color: isPro ? colors.accent : colors.textSecondary },
                  ]}
                >
                  {isPro ? 'ORIA PRO MEMBER' : 'ORIA FREE TIER'}
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Plan Upgrade Banner if Free Tier */}
        {!isPro && (
          <TouchableOpacity
            activeOpacity={0.85}
            style={[
              styles.upgradeBanner,
              { backgroundColor: colors.accentLight, borderColor: colors.accent },
            ]}
            onPress={() => setIsProModalVisible(true)}
          >
            <View style={styles.bannerIcon}>
              <Sparkles size={22} color={colors.accent} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.accent }]}>Upgrade to Oria Pro</Text>
              <Text style={[styles.bannerSubtitle, { color: colors.textSecondary }]}>
                Unlimited Oria AI discovery, unlimited lists & multi-stop itinerary exports.
              </Text>
            </View>
            <ChevronRight size={18} color={colors.accent} />
          </TouchableOpacity>
        )}

        {/* Usage & Discovery Stats */}
        <Text style={[styles.sectionTitle, { color: colors.textSecondary }]}>USAGE & LIMITS</Text>
        <View
          style={[
            styles.sectionCard,
            { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
            Shadows.soft,
          ]}
        >
          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Zap size={18} color={colors.accent} />
              <View>
                <Text style={[styles.statTitle, { color: colors.text }]}>Oria AI Requests</Text>
                <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
                  {isPro ? 'Unlimited requests' : '50 requests included per month'}
                </Text>
              </View>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {isPro
                ? '∞'
                : `${profile.subscription.aiRequestsUsed} / ${profile.subscription.aiRequestsLimit}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.statRow}>
            <View style={styles.statLeft}>
              <Bookmark size={18} color={colors.primary} />
              <View>
                <Text style={[styles.statTitle, { color: colors.text }]}>Saved Lists</Text>
                <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
                  {isPro ? 'Unlimited lists' : 'Up to 10 collections on Free'}
                </Text>
              </View>
            </View>
            <Text style={[styles.statValue, { color: colors.text }]}>
              {isPro ? '∞' : `${profile.listsCount} / ${profile.subscription.listsLimit}`}
            </Text>
          </View>
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
                <Text style={[styles.statTitle, { color: colors.danger }]}>Clear All My Data</Text>
                <Text style={[styles.statSubtitle, { color: colors.textSecondary }]}>
                  GDPR Article 17 Right to Erasure
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        </View>

        {/* OpenStreetMap Community Footer */}
        <View style={styles.footerWrap}>
          <Text style={[styles.footerText, { color: colors.textTertiary }]}>
            Oria Version 1.0.0 • Powered by OpenStreetMap, Overpass & OSRM
          </Text>
        </View>
      </ScrollView>

      {/* Pro Upgrade Modal */}
      <OriaProModal
        visible={isProModalVisible}
        onClose={() => setIsProModalVisible(false)}
        onUpgraded={loadProfile}
      />
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
  proBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
  tierPillRow: {
    marginTop: 6,
    flexDirection: 'row',
  },
  tierTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  tierTagText: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    marginBottom: Spacing.xl,
    gap: 12,
  },
  bannerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bannerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  bannerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    lineHeight: 16,
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
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
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
  statValue: {
    fontSize: 14,
    fontWeight: '700',
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
