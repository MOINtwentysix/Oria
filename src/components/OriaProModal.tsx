import React from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { Check, Sparkles, X, Shield, Zap, Compass, Route } from 'lucide-react-native';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import { upgradeToPro } from '../services/storage';

interface OriaProModalProps {
  visible: boolean;
  onClose: () => void;
  onUpgraded?: () => void;
}

export function OriaProModal({ visible, onClose, onUpgraded }: OriaProModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const handleUpgrade = async () => {
    await upgradeToPro();
    if (onUpgraded) onUpgraded();
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />
        <View
          style={[
            styles.sheet,
            {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.cardBorder,
            },
            Shadows.glass,
          ]}
        >
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.divider }]} />
          </View>

          <View style={styles.header}>
            <View style={[styles.badge, { backgroundColor: colors.accentLight }]}>
              <Sparkles size={14} color={colors.accent} />
              <Text style={[styles.badgeText, { color: colors.accent }]}>ORIA PRO</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            <Text style={[styles.headline, { color: colors.text }]}>
              Unlock Unlimited Discovery & AI
            </Text>
            <Text style={[styles.subheadline, { color: colors.textSecondary }]}>
              Elevate your journeys with unrestricted AI curation, unlimited collections, and advanced routing.
            </Text>

            {/* Feature comparison list */}
            <View style={[styles.featuresBox, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: colors.accentLight }]}>
                  <Zap size={18} color={colors.accent} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>Unlimited Oria AI Requests</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Free tier includes 50/month. Pro is unlimited.</Text>
                </View>
                <Check size={18} color={colors.success} />
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: colors.primaryLight }]}>
                  <Compass size={18} color={colors.primary} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>Unlimited Custom Lists</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Free tier includes up to 10 lists.</Text>
                </View>
                <Check size={18} color={colors.success} />
              </View>

              <View style={styles.featureItem}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(52, 199, 89, 0.12)' }]}>
                  <Route size={18} color={colors.success} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>Multi-Stop Export & Navigation</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Export full itineraries directly to Apple & Google Maps.</Text>
                </View>
                <Check size={18} color={colors.success} />
              </View>

              <View style={[styles.featureItem, { borderBottomWidth: 0 }]}>
                <View style={[styles.featureIcon, { backgroundColor: 'rgba(255, 149, 0, 0.12)' }]}>
                  <Shield size={18} color={colors.warning} />
                </View>
                <View style={styles.featureTextContainer}>
                  <Text style={[styles.featureTitle, { color: colors.text }]}>Offline Sync & Priority</Text>
                  <Text style={[styles.featureDesc, { color: colors.textSecondary }]}>Lightning-fast responses and offline list caching.</Text>
                </View>
                <Check size={18} color={colors.success} />
              </View>
            </View>

            {/* Configurable Notice: In accordance with Section 8: Do not invent subscription prices */}
            <View style={[styles.infoBanner, { backgroundColor: colors.backgroundSelected }]}>
              <Text style={[styles.infoText, { color: colors.textSecondary }]}>
                Active in preview / development tier mode. Payment gateways (Stripe / Apple In-App Purchase) can be attached via backend environment settings without hardcoded checkout fees.
              </Text>
            </View>

            {/* Upgrade CTA Button */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.upgradeBtn, { backgroundColor: colors.accent }]}
              onPress={handleUpgrade}
            >
              <Sparkles size={18} color="#FFFFFF" />
              <Text style={styles.upgradeBtnText}>Activate Oria Pro (Development Tier)</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderWidth: 1,
    maxHeight: '80%',
    paddingBottom: Spacing.massive,
  },
  handleContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  closeBtn: {
    padding: 4,
  },
  content: {
    paddingHorizontal: Spacing.xl,
  },
  headline: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
    marginBottom: 6,
  },
  subheadline: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: Spacing.xl,
  },
  featuresBox: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.lg,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  featureIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  featureTextContainer: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  featureDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  infoBanner: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  infoText: {
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
  },
  upgradeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: BorderRadius.xl,
  },
  upgradeBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
});
