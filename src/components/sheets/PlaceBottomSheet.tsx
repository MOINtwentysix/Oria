import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Animated, Easing, Image, ScrollView, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassChip, GlassCard, GlassInput, GlassAvatar } from '@/components/ui';
import { Place, Coordinates } from '@/types';
import { CATEGORIES } from '@/constants';

interface PlaceBottomSheetProps {
  place: Place | null;
  visible: boolean;
  onClose: () => void;
  onSave: (place: Place) => void;
  onDirections: (place: Place) => void;
  onShare: (place: Place) => void;
  saved: boolean;
  snapPoints?: number[];
  style?: any;
}

export const PlaceBottomSheet: React.FC<PlaceBottomSheetProps> = ({
  place,
  visible,
  onClose,
  onSave,
  onDirections,
  onShare,
  saved,
  snapPoints = ['25%', '50%', '90%'],
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  if (!place) return null;

  const firstPhoto = place.photos[0];
  const photoUrl = firstPhoto?.url || firstPhoto ? `${firstPhoto.prefix}original${firstPhoto.suffix}` : null;

  const category = place.categories[0];
  const matchingCategory = CATEGORIES.find(
    (c) => category?.name?.toLowerCase().includes(c.name.toLowerCase())
  );
  const categoryColor = matchingCategory?.color 
    ? theme.colors[matchingCategory.color as keyof typeof theme.colors] 
    : theme.colors.accent;

  const formatDistance = (meters?: number) => {
    if (!meters) return '';
    if (meters < 1000) return `${Math.round(meters)}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatHours = (hours?: Place['hours']) => {
    if (!hours?.regular) return null;
    const today = new Date().getDay();
    const todayHours = hours.regular.find(h => h.day === today);
    if (!todayHours) return null;
    return `${todayHours.open} - ${todayHours.close}`;
  };

  return (
    <Animated.View
      style={[
        styles.sheetContainer,
        { opacity: visible ? 1 : 0 },
        style,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        onPress={onClose}
        style={[styles.overlay, { backgroundColor: theme.colors.overlay }]}
        activeOpacity={1}
      />

      <BlurView intensity={95} style={[
        styles.sheet,
        {
          backgroundColor: theme.colors.paperOverlay,
        },
      ]}>
        <View style={styles.handleWrapper}>
          <View style={[
            styles.handle,
            { backgroundColor: theme.colors.inkSubtle },
          ]} />
        </View>

        <ScrollView
          style={styles.scrollView}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.header}>
            {photoUrl && (
              <Image
                source={{ uri: photoUrl }}
                style={styles.headerImage}
                resizeMode="cover"
              />
            )}
            {!photoUrl && (
              <View style={[
                styles.headerPlaceholder,
                { backgroundColor: categoryColor },
              ]}>
                <Text style={styles.headerPlaceholderText}>{category?.icon || '📍'}</Text>
              </View>
            )}

            <View style={styles.headerInfo}>
              <View style={styles.headerTopRow}>
                <Text style={[
                  styles.name,
                  { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                ]}>
                  {place.name}
                </Text>
                <TouchableOpacity onPress={onClose} hitSlop={16} style={styles.closeButton}>
                  <View style={styles.closeIcon} />
                </TouchableOpacity>
              </View>

              {category && (
                <View style={styles.categoryRow}>
                  <View style={[
                    styles.categoryBadge,
                    { backgroundColor: categoryColor },
                  ]}>
                    <Text style={styles.categoryBadgeText}>{category.icon || ''} {category.name}</Text>
                  </View>
                  {place.rating && (
                    <View style={styles.ratingRow}>
                      <Text style={[styles.ratingText, { color: theme.colors.warning }]}>⭐ {place.rating.toFixed(1)}</Text>
                    </View>
                  )}
                  {place.distance && (
                    <View style={styles.distanceRow}>
                      <Text style={[styles.distanceText, { color: theme.colors.inkMuted }]}>📍 {formatDistance(place.distance)}</Text>
                    </View>
                  )}
                </View>
              )}
            </View>
          </View>

          <View style={styles.details}>
            {place.description && (
              <View style={styles.detailSection}>
                <Text style={[
                  styles.detailLabel,
                  { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
                ]}>
                  Beschreibung
                </Text>
                <Text style={[
                  styles.detailText,
                  { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                ]}>
                  {place.description}
                </Text>
              </View>
            )}

            {place.address && (
              <View style={styles.detailSection}>
                <Text style={[
                  styles.detailLabel,
                  { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
                ]}>
                  Adresse
                </Text>
                <Text style={[
                  styles.detailText,
                  { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                ]}>
                  {place.address}
                </Text>
              </View>
            )}

            {formatHours(place.hours) && (
              <View style={styles.detailSection}>
                <Text style={[
                  styles.detailLabel,
                  { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
                ]}>
                  Öffnungszeiten
                </Text>
                <View style={[styles.openStatus, { backgroundColor: theme.colors.successSoft }]}>
                  <Text style={[
                    styles.openStatusText,
                    { color: theme.colors.success, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    Geöffnet: {formatHours(place.hours)}
                  </Text>
                </View>
              </View>
            )}

            {place.phone && (
              <View style={styles.detailSection}>
                <Text style={[
                  styles.detailLabel,
                  { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
                ]}>
                  Telefon
                </Text>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => Linking.openURL(`tel:${place.phone}`)}
                  hitSlop={12}
                >
                  <Text style={[
                    styles.linkText,
                    { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    {place.phone}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {place.website && (
              <View style={styles.detailSection}>
                <Text style={[
                  styles.detailLabel,
                  { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
                ]}>
                  Website
                </Text>
                <TouchableOpacity
                  style={styles.linkButton}
                  onPress={() => Linking.openURL(place.website)}
                  hitSlop={12}
                >
                  <Text style={[
                    styles.linkText,
                    { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    {place.website}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {place.photos && place.photos.length > 1 && (
              <View style={styles.detailSection}>
                <Text style={[
                  styles.detailLabel,
                  { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display },
                ]}>
                  Fotos
                </Text>
                <ScrollView horizontal={true} showsHorizontalScrollIndicator={false} contentContainerStyle={styles.photoScroll}>
                  {place.photos.slice(1, 6).map((photo, index) => (
                    <View key={index} style={styles.photoWrapper}>
                      <Image
                        source={{ uri: photo.url || `${photo.prefix}original${photo.suffix}` }}
                        style={styles.photoThumbnail}
                        resizeMode="cover"
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>
            )}
          </View>

          <View style={styles.actions}>
            <GlassButton
              variant={saved ? 'secondary' : 'primary'}
              size="lg"
              fullWidth
              onPress={() => onSave(place)}
              icon={<Text style={styles.actionIcon}>{saved ? '❤️' : '🤍'}</Text>}
            >
              {saved ? 'Gespeichert' : 'Ort speichern'}
            </GlassButton>

            <View style={styles.secondaryActions}>
              <GlassButton
                variant="secondary"
                size="md"
                onPress={() => onDirections(place)}
                icon={<Text style={styles.actionIcon}>🧭</Text>}
              >
                Route
              </GlassButton>

              <GlassButton
                variant="secondary"
                size="md"
                onPress={() => onShare(place)}
                icon={<Text style={styles.actionIcon}>↗️</Text>}
              >
                Teilen
              </GlassButton>
            </View>
          </View>
        </ScrollView>
      </BlurView>
    </Animated.View>
  );
};

import { Linking } from 'react-native';

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    zIndex: 100,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    opacity: 0.3,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  handleWrapper: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  scrollView: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  header: {
    position: 'relative',
    height: 200,
  },
  headerImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerPlaceholder: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerPlaceholderText: {
    fontSize: 48,
  },
  headerInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'transparent',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    flex: 1,
    paddingRight: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'white',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
  },
  categoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: 'white',
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 13,
    fontWeight: '500',
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  distanceText: {
    fontSize: 13,
    fontWeight: '500',
  },
  details: {
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 20,
  },
  detailSection: {
    gap: 6,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  detailText: {
    fontSize: 15,
    lineHeight: 22,
  },
  openStatus: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 4,
  },
  openStatusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 4,
  },
  linkText: {
    fontSize: 15,
    textDecorationLine: 'underline',
  },
  photoScroll: {
    flexDirection: 'row',
    gap: 10,
    paddingVertical: 4,
  },
  photoWrapper: {
    width: 100,
    height: 100,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoThumbnail: {
    width: 100,
    height: 100,
    borderRadius: 12,
  },
  actions: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    gap: 12,
  },
  secondaryActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionIcon: {
    fontSize: 18,
  },
});
