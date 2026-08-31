import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Animated, Easing, TextInput, FlatList } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassChip, GlassCard, GlassInput, GlassAvatar, GlassCardListItem } from '@/components/ui';
import { Place, SavedList, SavedListItem } from '@/types';
import { CATEGORIES } from '@/constants';

interface SavedListCardProps {
  list: SavedList;
  onPress: () => void;
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
          backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.6)' : 'rgba(255,255,255,0.6)',
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
          { backgroundColor: theme.colors.primary },
        ]}>
          <Text style={styles.coverPlaceholderText}>❤️</Text>
        </View>
      )}

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleRow}>
            <Text style={[
              styles.cardTitle,
              { color: theme.colors.text },
            ]}>
              {list.name}
            </Text>
            {list.is_default && (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Default</Text>
              </View>
            )}
            {list.is_shared && (
              <View style={styles.sharedBadge}>
                <Text style={styles.sharedBadgeText}>👥 Shared</Text>
              </View>
            )}
          </View>
          {list.description && (
            <Text style={[
              styles.cardDescription,
              { color: theme.colors.textSecondary },
            ]}>
              {list.description}
            </Text>
          )}
        </View>

        <View style={styles.cardStats}>
          <View style={styles.stat}>
            <Text style={[
              styles.statValue,
              { color: theme.colors.text },
            ]}>
              {list.place_count || 0}
            </Text>
            <Text style={[
              styles.statLabel,
              { color: theme.colors.textTertiary },
            ]}>
              Places
            </Text>
          </View>
          <View style={styles.stat}>
            <Text style={[
              styles.statValue,
              { color: theme.colors.text },
            ]}>
              {list.member_count || 1}
            </Text>
            <Text style={[
              styles.statLabel,
              { color: theme.colors.textTertiary },
            ]}>
              Members
            </Text>
          </View>
        </View>

        {list.is_shared && onShare && (
          <TouchableOpacity onPress={onShare} style={styles.shareButton} hitSlop={8}>
            <Text style={[
              styles.shareButtonText,
              { color: theme.colors.primary },
            ]}>
              Share List ↗️
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
    gap: 6,
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
    flex: 1,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(0,102,204,0.15)',
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0066CC',
  },
  sharedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    backgroundColor: 'rgba(0,168,107,0.15)',
  },
  sharedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#00A86B',
  },
  cardDescription: {
    fontSize: 13,
    lineHeight: 20,
  },
  cardStats: {
    flexDirection: 'row',
    gap: 24,
    paddingTop: 4,
  },
  stat: {
    alignItems: 'center',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
  shareButton: {
    paddingTop: 4,
    paddingVertical: 8,
    alignItems: 'center',
  },
  shareButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});

interface SavedPlaceItemProps {
  item: SavedListItem;
  onPress: () => void;
  onRemove: () => void;
  onMove?: () => void;
  style?: any;
}

export const SavedPlaceItem: React.FC<SavedPlaceItemProps> = ({
  item,
  onPress,
  onRemove,
  onMove,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const place = item.place_data;
  const firstPhoto = place.photos[0];
  const photoUrl = firstPhoto?.url || firstPhoto ? `${firstPhoto.prefix}original${firstPhoto.suffix}` : null;

  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.placeItem,
        {
          backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.5)' : 'rgba(255,255,255,0.5)',
        },
        style,
      ]}
      hitSlop={8}
    >
      <View style={styles.placeItemContent}>
        {photoUrl && (
          <Image
            source={{ uri: photoUrl }}
            style={styles.placeImage}
            resizeMode="cover"
          />
        )}
        {!photoUrl && (
          <View style={[
            styles.placeImagePlaceholder,
            { backgroundColor: theme.colors.backgroundTertiary },
          ]}>
            <Text style={styles.placeImagePlaceholderText}>
              {place.categories[0]?.icon || '📍'}
            </Text>
          </View>
        )}

        <View style={styles.placeInfo}>
          <Text style={[
            styles.placeName,
            { color: theme.colors.text },
          ]}>
            {place.name}
          </Text>

          {place.categories[0] && (
            <Text style={[
              styles.placeCategory,
              { color: theme.colors.textSecondary },
            ]}>
              {place.categories[0].icon} {place.categories[0].name}
            </Text>
          )}

          {place.rating && (
            <Text style={[
              styles.placeRating,
              { color: theme.colors.textSecondary },
            ]}>
              ⭐ {place.rating.toFixed(1)}
            </Text>
          )}

          {item.notes && (
            <Text style={[
              styles.placeNotes,
              { color: theme.colors.textTertiary },
            ]}>
              "{item.notes}"
            </Text>
          )}
        </View>

        <TouchableOpacity onPress={onRemove} hitSlop={12} style={styles.removeButton}>
          <View style={styles.removeIcon} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const s4 = StyleSheet.create({
  placeItem: {
    borderRadius: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  placeItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
  },
  placeImagePlaceholder: {
    width: 64,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeImagePlaceholderText: {
    fontSize: 24,
  },
  placeInfo: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 2,
  },
  placeName: {
    fontSize: 15,
    fontWeight: '600',
  },
  placeCategory: {
    fontSize: 12,
  },
  placeRating: {
    fontSize: 12,
  },
  placeNotes: {
    fontSize: 12,
    fontStyle: 'italic',
  },
  removeButton: {
    padding: 8,
  },
  removeIcon: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'currentColor',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    opacity: 0.5,
  },
});

interface CreateListModalProps {
  visible: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string, isShared?: boolean) => void;
  style?: any;
}

export const CreateListModal: React.FC<CreateListModalProps> = ({
  visible,
  onClose,
  onCreate,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [name, setName] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [isShared, setIsShared] = React.useState(false);
  const [error, setError] = React.useState('');

  if (!visible) return null;

  const handleCreate = () => {
    if (!name.trim()) {
      setError('Please enter a list name');
      return;
    }
    onCreate(name.trim(), description.trim() || undefined, isShared);
    onClose();
  };

  return (
    <Animated.View
      style={[
        styles.modalContainer,
        { opacity: visible ? 1 : 0 },
        style,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity onPress={onClose} style={styles.modalOverlay} activeOpacity={1} />

      <BlurView intensity={95} style={[
        styles.modal,
        { backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)' },
      ]}>
        <View style={styles.modalHandle}>
          <View style={[
            styles.handle,
            { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.3)' },
          ]} />
        </View>

        <View style={styles.modalContent}>
          <Text style={[
            styles.modalTitle,
            { color: theme.colors.text },
          ]}>
            Create New List
          </Text>
          <Text style={[
            styles.modalSubtitle,
            { color: theme.colors.textSecondary },
          ]}>
            Give your list a name and optional description
          </Text>

          <GlassInput
            value={name}
            onChangeText={setName}
            placeholder="List name (e.g., Roadtrip 2026)"
            label="Name"
            autoCapitalize="words"
            autoFocus
            style={styles.modalInput}
          />

          <GlassInput
            value={description}
            onChangeText={setDescription}
            placeholder="Description (optional)"
            label="Description"
            multiline
            numberOfLines={3}
            style={styles.modalInput}
          />

          <View style={styles.toggleRow}>
            <Text style={[
              styles.toggleLabel,
              { color: theme.colors.text },
            ]}>
              Make this list shared
            </Text>
            <TouchableOpacity
              onPress={() => setIsShared(!isShared)}
              style={[
                styles.toggleSwitch,
                { backgroundColor: isShared ? theme.colors.primary : theme.colors.border },
              ]}
            >
              <Animated.View
                style={[
                  styles.toggleThumb,
                  { transform: [{ translateX: isShared ? 24 : 0 }] },
                ]}
              />
            </TouchableOpacity>
          </View>

          {error && (
            <Text style={[
              styles.modalError,
              { color: theme.colors.error },
            ]}>
              {error}
            </Text>
          )}

          <View style={styles.modalActions}>
            <GlassButton variant="ghost" size="lg" onPress={onClose}>
              Cancel
            </GlassButton>
            <GlassButton variant="primary" size="lg" onPress={handleCreate}>
              Create List
            </GlassButton>
          </View>
        </View>
      </BlurView>
    </Animated.View>
  );
};

const s2 = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    opacity: 0.5,
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
  },
  modalHandle: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    gap: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
  },
  modalSubtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  modalInput: {
    marginTop: 4,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  toggleLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  toggleSwitch: {
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
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  modalError: {
    fontSize: 13,
    fontWeight: '500',
    marginTop: -8,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});

interface ShareListModalProps {
  visible: boolean;
  list: SavedList;
  onClose: () => void;
  onInvite: (email: string, role: 'editor' | 'viewer') => void;
  members: Array<{ id: string; user_id: string; role: string; email: string; first_name?: string; last_name?: string; image_url?: string }>;
  onRemoveMember: (memberId: string) => void;
  onChangeRole: (memberId: string, role: 'editor' | 'viewer') => void;
  style?: any;
}

export const ShareListModal: React.FC<ShareListModalProps> = ({
  visible,
  list,
  onClose,
  onInvite,
  members,
  onRemoveMember,
  onChangeRole,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [email, setEmail] = React.useState('');
  const [role, setRole] = React.useState<'editor' | 'viewer'>('editor');
  const [inviteError, setInviteError] = React.useState('');

  if (!visible) return null;

  const handleInvite = () => {
    if (!email.trim() || !email.includes('@')) {
      setInviteError('Please enter a valid email');
      return;
    }
    onInvite(email.trim(), role);
    setEmail('');
    setInviteError('');
  };

  const owner = members.find(m => m.role === 'owner');
  const editors = members.filter(m => m.role === 'editor' && m.user_id !== owner?.user_id);
  const viewers = members.filter(m => m.role === 'viewer');

  return (
    <Animated.View
      style={[
        styles.modalContainer,
        { opacity: visible ? 1 : 0 },
        style,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity onPress={onClose} style={styles.modalOverlay} activeOpacity={1} />

      <BlurView intensity={95} style={[
        styles.modal,
        { backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)' },
        { maxHeight: '90%' },
      ]}>
        <View style={styles.modalHandle}>
          <View style={[
            styles.handle,
            { backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.3)' },
          ]} />
        </View>

        <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={[
                styles.modalTitle,
                { color: theme.colors.text },
              ]}>
                Share "{list.name}"
              </Text>
              <TouchableOpacity onPress={onClose} hitSlop={16} style={styles.closeButton}>
                <View style={styles.closeIcon} />
              </TouchableOpacity>
            </View>

            <Text style={[
              styles.modalSubtitle,
              { color: theme.colors.textSecondary },
            ]}>
              Invite friends to collaborate on this list
            </Text>

            <View style={styles.inviteSection}>
              <Text style={[
                styles.sectionTitle,
                { color: theme.colors.textSecondary },
              ]}>
                Invite People
              </Text>

              <GlassInput
                value={email}
                onChangeText={setEmail}
                placeholder="friend@example.com"
                label="Email"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.modalInput}
              />

              <View style={styles.roleSelector}>
                <GlassChip
                  variant={role === 'editor' ? 'selected' : 'outline'}
                  size="sm"
                  onPress={() => setRole('editor')}
                >
                  Editor
                </GlassChip>
                <GlassChip
                  variant={role === 'viewer' ? 'selected' : 'outline'}
                  size="sm"
                  onPress={() => setRole('viewer')}
                >
                  Viewer
                </GlassChip>
              </View>

              <GlassButton variant="primary" size="md" onPress={handleInvite} disabled={!email.trim()}>
                Send Invite
              </GlassButton>

              {inviteError && (
                <Text style={[
                  styles.modalError,
                  { color: theme.colors.error },
                ]}>
                  {inviteError}
                </Text>
              )}
            </View>

            <View style={styles.membersSection}>
              <Text style={[
                styles.sectionTitle,
                { color: theme.colors.textSecondary },
              ]}>
                Members ({members.length})
              </Text>

              {owner && (
                <View style={styles.memberGroup}>
                  <Text style={[
                    styles.memberGroupTitle,
                    { color: theme.colors.textTertiary },
                  ]}>
                    Owner
                  </Text>
                  <GlassCardListItem
                    title={`${owner.first_name || ''} ${owner.last_name || ''}`.trim() || owner.email}
                    subtitle="Owner"
                    leftIcon={<GlassAvatar name={owner.first_name} uri={owner.image_url} size="sm" />}
                    variant="glass"
                    padding="sm"
                    divider={false}
                  />
                </View>
              )}

              {editors.length > 0 && (
                <View style={styles.memberGroup}>
                  <Text style={[
                    styles.memberGroupTitle,
                    { color: theme.colors.textTertiary },
                  ]}>
                    Editors
                  </Text>
                  {editors.map((member) => (
                    <GlassCardListItem
                      key={member.id}
                      title={`${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email}
                      subtitle="Editor"
                      leftIcon={<GlassAvatar name={member.first_name} uri={member.image_url} size="sm" />}
                      variant="glass"
                      padding="sm"
                      divider={false}
                      trailing={
                        <View style={styles.memberActions}>
                          <TouchableOpacity
                            onPress={() => onChangeRole(member.id, 'viewer')}
                            hitSlop={8}
                          >
                            <Text style={[
                              styles.roleChangeText,
                              { color: theme.colors.textTertiary },
                            ]}>
                              Make Viewer
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => onRemoveMember(member.id)}
                            hitSlop={8}
                          >
                            <Text style={[
                              styles.removeMemberText,
                              { color: theme.colors.error },
                            ]}>
                              Remove
                            </Text>
                          </TouchableOpacity>
                        </View>
                      }
                    />
                  ))}
                </View>
              )}

              {viewers.length > 0 && (
                <View style={styles.memberGroup}>
                  <Text style={[
                    styles.memberGroupTitle,
                    { color: theme.colors.textTertiary },
                  ]}>
                    Viewers
                  </Text>
                  {viewers.map((member) => (
                    <GlassCardListItem
                      key={member.id}
                      title={`${member.first_name || ''} ${member.last_name || ''}`.trim() || member.email}
                      subtitle="Viewer"
                      leftIcon={<GlassAvatar name={member.first_name} uri={member.image_url} size="sm" />}
                      variant="glass"
                      padding="sm"
                      divider={false}
                      trailing={
                        <View style={styles.memberActions}>
                          <TouchableOpacity
                            onPress={() => onChangeRole(member.id, 'editor')}
                            hitSlop={8}
                          >
                            <Text style={[
                              styles.roleChangeText,
                              { color: theme.colors.primary },
                            ]}>
                              Make Editor
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => onRemoveMember(member.id)}
                            hitSlop={8}
                          >
                            <Text style={[
                              styles.removeMemberText,
                              { color: theme.colors.error },
                            ]}>
                              Remove
                            </Text>
                          </TouchableOpacity>
                        </View>
                      }
                    />
                  ))}
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </BlurView>
    </Animated.View>
  );
};

const s3 = StyleSheet.create({
  modalContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    opacity: 0.5,
  },
  modal: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '90%',
  },
  modalHandle: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  modalScroll: {
    flex: 1,
  },
  modalContent: {
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 40,
    gap: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    flex: 1,
    paddingRight: 16,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: 'currentColor',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    opacity: 0.5,
  },
  modalSubtitle: {
    fontSize: 14,
    lineHeight: 20,
  },
  inviteSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modalInput: {
    marginTop: 4,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  modalError: {
    fontSize: 13,
    fontWeight: '500',
  },
  membersSection: {
    gap: 16,
  },
  memberGroup: {
    gap: 8,
  },
  memberGroupTitle: {
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  memberActions: {
    flexDirection: 'row',
    gap: 12,
  },
  roleChangeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  removeMemberText: {
    fontSize: 12,
    fontWeight: '600',
  },
});
const styles = { ...s1, ...s2, ...s3, ...s4 };
