import React from 'react';
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { Bookmark, Navigation, Sparkles } from 'lucide-react-native';
import { Place } from '../types';
import { BorderRadius, CategoryColors, Colors, Shadows, Spacing } from '../constants/theme';
import { formatDistance } from '../services/overpass';

interface PlaceCardProps {
  place: Place;
  onPress: () => void;
  onSavePress?: () => void;
  onDirectionsPress?: () => void;
  isSaved?: boolean;
  layout?: 'horizontal' | 'vertical' | 'compact';
}

export function PlaceCard({
  place,
  onPress,
  onSavePress,
  onDirectionsPress,
  isSaved = false,
  layout = 'horizontal',
}: PlaceCardProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const categoryColor =
    CategoryColors[place.category as keyof typeof CategoryColors] || colors.primary;

  if (layout === 'compact') {
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        style={[
          styles.compactCard,
          {
            backgroundColor: colors.cardBackground,
            borderColor: colors.cardBorder,
          },
          Shadows.soft,
        ]}
      >
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.compactImage}
          resizeMode="cover"
        />
        <View style={styles.compactInfo}>
          <Text style={[styles.compactTitle, { color: colors.text }]} numberOfLines={1}>
            {place.name}
          </Text>
          <Text style={[styles.compactSubtitle, { color: colors.textSecondary }]} numberOfLines={1}>
            {place.subCategory || place.category} {place.distanceMeters ? `• ${formatDistance(place.distanceMeters)}` : ''}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[
        styles.card,
        layout === 'vertical' ? styles.cardVertical : styles.cardHorizontal,
        {
          backgroundColor: colors.cardBackground,
          borderColor: colors.cardBorder,
        },
        Shadows.soft,
      ]}
    >
      <View style={layout === 'vertical' ? styles.imageContainerVertical : styles.imageContainerHorizontal}>
        <Image
          source={{ uri: place.imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <View style={[styles.categoryBadge, { backgroundColor: categoryColor }]}>
          <Text style={styles.categoryBadgeText}>
            {place.category.toUpperCase()}
          </Text>
        </View>
        {place.isPartner && (
          <View style={styles.partnerBadge}>
            <Sparkles size={11} color="#FFFFFF" />
            <Text style={styles.partnerBadgeText}>Verified Partner</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.headerRow}>
          <Text style={[styles.title, { color: colors.text }]} numberOfLines={1}>
            {place.name}
          </Text>
          {onSavePress && (
            <TouchableOpacity
              onPress={onSavePress}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.actionBtn}
            >
              <Bookmark
                size={18}
                color={isSaved ? colors.primary : colors.textTertiary}
                fill={isSaved ? colors.primary : 'none'}
              />
            </TouchableOpacity>
          )}
        </View>

        <Text style={[styles.subCategory, { color: colors.textSecondary }]} numberOfLines={1}>
          {place.subCategory || place.category}
          {place.cuisine ? ` • ${place.cuisine}` : ''}
        </Text>

        {place.address && (
          <Text style={[styles.address, { color: colors.textTertiary }]} numberOfLines={1}>
            {place.address}
          </Text>
        )}

        <View style={styles.footerRow}>
          {place.distanceMeters !== undefined && (
            <View style={[styles.distancePill, { backgroundColor: colors.backgroundSelected }]}>
              <Text style={[styles.distanceText, { color: colors.primary }]}>
                {formatDistance(place.distanceMeters)}
              </Text>
            </View>
          )}

          {place.openingHours && (
            <Text style={[styles.openBadge, { color: colors.success }]}>
              Open
            </Text>
          )}

          {onDirectionsPress && (
            <TouchableOpacity
              onPress={onDirectionsPress}
              style={[styles.directionsBtn, { backgroundColor: colors.primaryLight }]}
            >
              <Navigation size={13} color={colors.primary} />
              <Text style={[styles.directionsBtnText, { color: colors.primary }]}>
                Directions
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  cardHorizontal: {
    flexDirection: 'row',
    marginBottom: Spacing.md,
  },
  cardVertical: {
    width: 260,
    marginRight: Spacing.md,
  },
  imageContainerHorizontal: {
    width: 110,
    height: '100%',
    minHeight: 110,
    position: 'relative',
  },
  imageContainerVertical: {
    width: '100%',
    height: 140,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  partnerBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  partnerBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginRight: 6,
  },
  actionBtn: {
    padding: 2,
  },
  subCategory: {
    fontSize: 13,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  address: {
    fontSize: 12,
    marginTop: 3,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  distancePill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
  },
  distanceText: {
    fontSize: 11,
    fontWeight: '600',
  },
  openBadge: {
    fontSize: 11,
    fontWeight: '600',
  },
  directionsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  directionsBtnText: {
    fontSize: 11,
    fontWeight: '600',
  },
  compactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 8,
  },
  compactImage: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
  },
  compactInfo: {
    marginLeft: 10,
    flex: 1,
  },
  compactTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  compactSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
