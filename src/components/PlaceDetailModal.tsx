import React from 'react';
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Linking,
  Share,
} from 'react-native';
import {
  X,
  Bookmark,
  Navigation,
  Globe,
  Phone,
  Clock,
  Accessibility,
  Share2,
  ExternalLink,
  MapPin,
  Sparkles,
} from 'lucide-react-native';
import { Place } from '../types';
import { BorderRadius, CategoryColors, Colors, Shadows, Spacing } from '../constants/theme';
import { formatDistance } from '../services/overpass';
import { openExternalNavigation } from '../services/routing';

interface PlaceDetailModalProps {
  place: Place | null;
  visible: boolean;
  onClose: () => void;
  onSaveToList: (place: Place) => void;
  onAddToRoute?: (place: Place) => void;
  isSaved?: boolean;
}

export function PlaceDetailModal({
  place,
  visible,
  onClose,
  onSaveToList,
  onAddToRoute,
  isSaved = false,
}: PlaceDetailModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  if (!place) return null;

  const categoryColor =
    CategoryColors[place.category as keyof typeof CategoryColors] || colors.primary;

  const handleShare = async () => {
    try {
      await Share.share({
        title: place.name,
        message: `Check out ${place.name} on Oria! ${place.address || ''}\nhttps://oria.app/place/${place.osmId}`,
      });
    } catch {}
  };

  const handleOpenWebsite = () => {
    if (place.website) {
      Linking.openURL(place.website.startsWith('http') ? place.website : `https://${place.website}`);
    }
  };

  const handleCallPhone = () => {
    if (place.phone) {
      Linking.openURL(`tel:${place.phone.replace(/\s+/g, '')}`);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
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
          {/* Sheet Handle */}
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.divider }]} />
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Header Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: place.imageUrl }}
                style={styles.heroImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                onPress={onClose}
                style={[styles.closeBtn, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}
              >
                <X size={18} color="#FFFFFF" />
              </TouchableOpacity>

              <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
                <Text style={styles.categoryBadgeText}>
                  {place.category.toUpperCase()}
                </Text>
              </View>

              {place.isPartner && (
                <View style={styles.partnerBadge}>
                  <Sparkles size={12} color="#FFFFFF" />
                  <Text style={styles.partnerBadgeText}>Verified Partner</Text>
                </View>
              )}
            </View>

            {/* Title & Category */}
            <View style={styles.titleSection}>
              <Text style={[styles.title, { color: colors.text }]}>
                {place.name}
              </Text>
              <Text style={[styles.subCategory, { color: colors.textSecondary }]}>
                {place.subCategory || place.category}
                {place.cuisine ? ` • Cuisine: ${place.cuisine}` : ''}
                {place.distanceMeters !== undefined ? ` • ${formatDistance(place.distanceMeters)} away` : ''}
              </Text>
            </View>

            {/* Primary Action Buttons */}
            <View style={styles.actionGrid}>
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: isSaved ? colors.primaryLight : colors.backgroundSelected,
                  },
                ]}
                onPress={() => onSaveToList(place)}
              >
                <Bookmark
                  size={20}
                  color={colors.primary}
                  fill={isSaved ? colors.primary : 'none'}
                />
                <Text style={[styles.actionButtonText, { color: colors.primary }]}>
                  {isSaved ? 'Saved' : 'Save'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.primary }]}
                onPress={() => openExternalNavigation(place, 'foot')}
              >
                <Navigation size={20} color="#FFFFFF" />
                <Text style={[styles.actionButtonText, { color: '#FFFFFF', fontWeight: '600' }]}>
                  Directions
                </Text>
              </TouchableOpacity>

              {onAddToRoute && (
                <TouchableOpacity
                  style={[styles.actionButton, { backgroundColor: colors.backgroundSelected }]}
                  onPress={() => {
                    onAddToRoute(place);
                    onClose();
                  }}
                >
                  <MapPin size={20} color={colors.text} />
                  <Text style={[styles.actionButtonText, { color: colors.text }]}>
                    Add Route
                  </Text>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                style={[styles.actionButton, { backgroundColor: colors.backgroundSelected }]}
                onPress={handleShare}
              >
                <Share2 size={20} color={colors.text} />
                <Text style={[styles.actionButtonText, { color: colors.text }]}>
                  Share
                </Text>
              </TouchableOpacity>
            </View>

            {/* Place Details List */}
            <View style={[styles.detailsSection, { borderColor: colors.divider }]}>
              {place.address && (
                <View style={styles.detailRow}>
                  <MapPin size={18} color={colors.textTertiary} />
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    {place.address}
                  </Text>
                </View>
              )}

              {place.openingHours && (
                <View style={styles.detailRow}>
                  <Clock size={18} color={colors.textTertiary} />
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    {place.openingHours}
                  </Text>
                </View>
              )}

              {place.wheelchair && (
                <View style={styles.detailRow}>
                  <Accessibility size={18} color={colors.textTertiary} />
                  <Text style={[styles.detailText, { color: colors.text }]}>
                    Wheelchair Accessible: {place.wheelchair}
                  </Text>
                </View>
              )}

              {place.website && (
                <TouchableOpacity style={styles.detailRow} onPress={handleOpenWebsite}>
                  <Globe size={18} color={colors.primary} />
                  <Text style={[styles.detailText, { color: colors.primary }]}>
                    Visit Website
                  </Text>
                  <ExternalLink size={14} color={colors.primary} style={{ marginLeft: 4 }} />
                </TouchableOpacity>
              )}

              {place.phone && (
                <TouchableOpacity style={styles.detailRow} onPress={handleCallPhone}>
                  <Phone size={18} color={colors.primary} />
                  <Text style={[styles.detailText, { color: colors.primary }]}>
                    {place.phone}
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            {/* OpenStreetMap Attribution & Reliability Notice */}
            <View style={[styles.footerNotice, { backgroundColor: colors.backgroundSelected }]}>
              <Text style={[styles.footerNoticeText, { color: colors.textSecondary }]}>
                Data verified from OpenStreetMap. Contributed by the global mapping community.
              </Text>
            </View>
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
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderWidth: 1,
    maxHeight: '85%',
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
  scrollContent: {
    paddingHorizontal: Spacing.xl,
    paddingBottom: Spacing.massive,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    position: 'relative',
    marginBottom: Spacing.lg,
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  partnerBadge: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(16, 185, 129, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
  },
  partnerBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  titleSection: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subCategory: {
    fontSize: 14,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.xl,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: BorderRadius.lg,
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '500',
  },
  detailsSection: {
    borderTopWidth: 1,
    borderBottomWidth: 1,
    paddingVertical: Spacing.md,
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  detailText: {
    fontSize: 14,
    flex: 1,
  },
  footerNotice: {
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
  },
  footerNoticeText: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 16,
  },
});
