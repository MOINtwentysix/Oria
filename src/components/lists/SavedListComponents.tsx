import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, FlatList, Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassChip, GlassCard, GlassAvatar, GlassCardListItem, GlassInput } from '@/components/ui';
import { SavedList, SavedPlace, SavedListItem } from '@/types';

interface SavedListCardProps {
  list: SavedList;
  onPress?: () => void;
  onLongPress?: () => void;
  onShare?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  style?: any;
}

export const SavedListCard: React.FC<SavedListCardProps> = ({
  list,
  onPress,
  onLongPress,
  onShare,
  onEdit,
  onDelete,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  return (
    <TouchableOpacity
      onPress={onPress}
      onLongPress={onLongPress}
      style={[
        styles.card,
        {
          backgroundColor: colorScheme === 'dark' ? theme.glassStyles.heavyDark.backgroundColor : theme.glassStyles.heavy.backgroundColor,
          borderColor: theme.colors.glassBorder,
          borderWidth: 1,
        },
        style,
      ]}
      hitSlop={8}
    >
      {list.cover_image && (
        <Image
          source={{ uri: list.cover_image }}
          style={styles.coverImage}
          resizeMode="cover"
        />
      )}
      {!list.cover_image && (
        <View style={[
          styles.coverPlaceholder,
          { backgroundColor: theme.colors.accent },
        ]}>
          <Text style={styles.coverPlaceholderText}>❤️</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={[
              styles.cardTitle,
              { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
            ]}>
              {list.name}
            </Text>
            {list.is_default && (
              <View style={[
                styles.defaultBadge,
                { backgroundColor: theme.colors.accentSoft },
              ]}>
                <Text style={[
                  styles.defaultBadgeText,
                  { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body },
                ]}>
                  Standard
                </Text>
              </View>
            )}
            {list.is_shared && (
              <View style={[
                styles.sharedBadge,
                { backgroundColor: theme.colors.successSoft },
              ]}>
                <Text style={[
                  styles.sharedBadgeText,
                  { color: theme.colors.success, fontFamily: theme.typography.fontFamily.body },
                ]}>
                  👥 Geteilt
                </Text>
              </View>
            )}
          </View>
          {list.description && (
            <Text style={[
              styles.cardDescription,
              { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
            ]}>
              {list.description}
            </Text>
          )}
        </View>

        <View style={styles.cardStats}>
          <View style={styles.stat}>
            <Text style={[
              styles.statValue,
              { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
            ]}>
              {list.place_count || 0}
            </Text>
            <Text style={[
              styles.statLabel,
              { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
            ]}>
              Orte
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[
              styles.statValue,
              { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
            ]}>
              {list.member_count || 1}
            </Text>
            <Text style={[
              styles.statLabel,
              { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
            ]}>
              Mitglieder
            </Text>
          </View>
        </View>

        {list.is_shared && onShare && (
          <TouchableOpacity onPress={onShare} style={styles.shareButton} hitSlop={8}>
            <Text style={[
              styles.shareButtonText,
              { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body },
            ]}>
              Liste teilen ↗
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
};

const s1 = StyleSheet.create({
  card: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  coverImage: {
    width: '100%',
    height: 140,
  },
  coverPlaceholder: {
    width: '100%',
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    fontSize: 48,
  },
  cardContent: {
    padding: 16,
    gap: 12,
  },
  cardHeader: {
    gap: 8,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    includeFontPadding: false,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    includeFontPadding: false,
  },
  sharedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 9999,
  },
  sharedBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    includeFontPadding: false,
  },
  cardDescription: {
    fontSize: 14,
    lineHeight: 21,
    includeFontPadding: false,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 4,
  },
  stat: {
    gap: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '800',
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    includeFontPadding: false,
  },
  shareButton: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13,27,30,0.05)',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
  },
});

const s2 = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(13,27,30,0.45)',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  modalContent: {
    borderRadius: 28,
    overflow: 'hidden',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(13,27,30,0.05)',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    includeFontPadding: false,
  },
  closeButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    fontSize: 24,
    fontWeight: '300',
    includeFontPadding: false,
  },
  modalBody: {
    padding: 20,
    gap: 16,
  },
  modalInput: {
    marginBottom: 8,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
    includeFontPadding: false,
  },
  toggleTrack: {
    width: 52,
    height: 28,
    borderRadius: 14,
    padding: 2,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEFBF6',
    shadowColor: '#0D1B1E',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(13,27,30,0.05)',
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
});

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string, isShared?: boolean) => void;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  visible,
  onClose,
  onCreate,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isShared, setIsShared] = React.useState(false);

  if (!visible) return null;

  return (
    <View style={styles.modalOverlay}>
      <View style={[
        styles.modalContent,
        {
          backgroundColor: theme.colors.paper,
          borderColor: theme.colors.glassBorder,
          borderWidth: 1,
        },
      ]}>
        <View style={styles.modalHeader}>
          <Text style={[
            styles.modalTitle,
            { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
          ]}>
            Neue Liste
          </Text>
          <TouchableOpacity onPress={onClose} hitSlop={16} style={styles.closeButton}>
            <Text style={[styles.closeIcon, { color: theme.colors.inkSubtle }]}>✕</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.modalBody}>
          <GlassInput
            label="Name"
            placeholder="z. B. Meine Lieblingscafés"
            value={name}
            onChangeText={setName}
            autoFocus={true}
            style={styles.modalInput}
          />

          <GlassInput
            label="Beschreibung (optional)"
            placeholder="Was macht diese Liste besonders?"
            value={description}
            onChangeText={setDescription}
            multiline={true}
            numberOfLines={3}
            style={styles.modalInput}
          />

          <View style={styles.toggleRow}>
            <Text style={[
              styles.toggleLabel,
              { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
            ]}>
              Mit Freunden teilen
            </Text>
            <TouchableOpacity
              onPress={() => setIsShared(!isShared)}
              style={[
                styles.toggleTrack,
                { backgroundColor: isShared ? theme.colors.accent : theme.colors.inkSubtle },
              ]}
              hitSlop={8}
            >
              <Animated.View
                style={[
                  styles.toggleThumb,
                  { transform: [{ translateX: isShared ? 24 : 0 }] },
                ]}
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.modalActions}>
          <GlassButton variant="secondary" size="md" onPress={onClose} style={styles.cancelButton}>
            Abbrechen
          </GlassButton>
          <GlassButton variant="primary" size="md" onPress={() => { onCreate(name, description, isShared); onClose(); }} disabled={!name.trim()} style={styles.createButton}>
            Erstellen
          </GlassButton>
        </View>
      </View>
    </View>
  );
};

const styles = { ...s1, ...s2 };
export default styles;
