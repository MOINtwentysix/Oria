import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard, GlassAvatar, GlassChip, GlassInput, GlassCardListItem } from '@/components/ui';
import { LiquidTabBar } from '@/components/common';
import { useAuth } from '@/services/auth';
import { useUIStore, useSavedStore } from '@/store';
import { SavedList, SavedListItem } from '@/types';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { ShareListModal, SavedPlaceItem } from '@/components/lists/SavedListComponents';

export const SavedListScreen: React.FC = () => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { user, isSignedIn } = useAuth();
  const { tabBarVisible, setTabBarVisible, bottomSheetVisible, setBottomSheetVisible } = useUIStore();
  const { lists, activeList, loading, error, loadListItems, addListItem, removeListItem, reorderListItems, inviteToList, removeListMember, updateMemberRole } = useSavedStore();
  const router = useAppNavigation();

  const [showShareModal, setShowShareModal] = React.useState(false);
  const [items, setItems] = React.useState<SavedListItem[]>([]);
  const [showAddPlace, setShowAddPlace] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState('');

  const list = activeList || lists[0];
  const visibleItems = items.filter((item) => {
    const query = searchQuery.trim().toLowerCase();
    return !query || item.place_data?.name?.toLowerCase().includes(query);
  });

  React.useEffect(() => {
    setTabBarVisible(false);
    if (list) {
      loadListItems(list.id).then(data => setItems(data));
    }
  }, [list, loadListItems]);

  const handleRemoveItem = (itemId: string) => {
    removeListItem(itemId, list?.id);
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleInvite = () => {
    setShowShareModal(true);
  };

  const handleShare = () => {
    setShowShareModal(true);
  };

  const handlePlanTrip = () => {
    router.push('/ai/plan-list');
  };

  if (!list) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
        <View style={styles.emptyState}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
            <Text style={[styles.backIcon, { color: theme.colors.ink }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[
            styles.emptyTitle,
            { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
          ]}>
            Keine Liste ausgewählt
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = true;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={[
          styles.backButton,
          { backgroundColor: theme.colors.glass },
        ]}>
          <Text style={[styles.backIcon, { color: theme.colors.ink }]}>‹</Text>
        </TouchableOpacity>

        <View style={styles.headerContent}>
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

          <View style={styles.headerInfo}>
            <View style={styles.headerTitleRow}>
              <Text style={[
                styles.listName,
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
                styles.listDescription,
                { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
              ]}>
                {list.description}
              </Text>
            )}
            <View style={styles.headerStats}>
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
          </View>
        </View>

        <View style={styles.headerActions}>
          {isOwner && (
            <TouchableOpacity
              onPress={handleInvite}
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.accent, borderColor: theme.colors.accent },
              ]}
              hitSlop={8}
            >
              <Text style={styles.actionButtonIcon}>✉️</Text>
              <Text style={[
                styles.actionButtonTextPrimary,
                { color: theme.colors.textOnPrimary, fontFamily: theme.typography.fontFamily.body },
              ]}>
                Teilen
              </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={handlePlanTrip}
            style={[
              styles.actionButton,
              { backgroundColor: 'transparent', borderColor: theme.colors.border },
            ]}
            hitSlop={8}
          >
            <Text style={styles.actionButtonIcon}>🗺️</Text>
            <Text style={[
              styles.actionButtonText,
              { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
            ]}>
              Reise planen
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>

          <GlassInput
            style={styles.searchBar}
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Orte in dieser Liste suchen..."
            leftIcon={<Text style={styles.searchIcon}>⌕</Text>}
          />

          {visibleItems.length === 0 ? (
            <View style={styles.emptyList}>
              <GlassCard variant="light" style={styles.emptyListCard}>
                <View style={styles.emptyListContent}>
                  <Text style={styles.emptyListIcon}>📍</Text>
                  <Text style={[
                    styles.emptyListTitle,
                    { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    Noch keine Orte in dieser Liste
                  </Text>
                  <Text style={[
                    styles.emptyListSubtitle,
                    { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    Tippe auf das + auf der Karte, um Orte hinzuzufügen
                  </Text>
                  <GlassButton variant="primary" size="md" style={styles.emptyListButton} onPress={() => router.push('/explore')}>
                    Orte entdecken
                  </GlassButton>
                </View>
              </GlassCard>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {visibleItems.map((item) => (
                <SavedPlaceItem
                  key={item.id}
                  item={item}
                  onPress={() => {}}
                  onRemove={() => handleRemoveItem(item.id)}
                  style={styles.placeItem}
                />
              ))}
            </View>
          )}

          <View style={styles.separator} />
        </View>
      </ScrollView>

      <ShareListModal
        visible={showShareModal}
        onClose={() => setShowShareModal(false)}
        list={list}
        onInvite={async (email, role) => {
          await inviteToList(list.id, email, role);
        }}
        onRemoveMember={async (memberId) => {
          await removeListMember(list.id, memberId);
        }}
        onChangeRole={async (memberId, role) => {
          await updateMemberRole(list.id, memberId, role);
        }}
      />

      <LiquidTabBar
        tabs={[
          { id: 'explore', label: 'Entdecken', icon: <Text style={styles.tabIcon}>🗺️</Text>, selectedIcon: <Text style={styles.tabIcon}>🗺️</Text> },
          { id: 'ai', label: 'Oria AI', icon: <Text style={styles.tabIcon}>✨</Text>, selectedIcon: <Text style={styles.tabIcon}>✨</Text> },
          { id: 'saved', label: 'Gespeichert', icon: <Text style={styles.tabIcon}>❤️</Text>, selectedIcon: <Text style={styles.tabIcon}>❤️</Text> },
          { id: 'profile', label: 'Profil', icon: <Text style={styles.tabIcon}>👤</Text>, selectedIcon: <Text style={styles.tabIcon}>👤</Text> },
        ]}
        activeTab="saved"
        onTabPress={(tabId) => router.push(`/${tabId}` as any)}
        variant="floating"
        style={styles.tabBar}
      />
    </SafeAreaView>
  );
};

export default SavedListScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: 'relative',
  },
  backButton: {
    position: 'absolute',
    left: 16,
    top: 16,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  backIcon: { fontSize: 38, lineHeight: 38, fontWeight: '300', includeFontPadding: false },
  headerContent: {
    flexDirection: 'row',
    gap: 16,
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  coverImage: {
    width: 80,
    height: 80,
    borderRadius: 16,
  },
  coverPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    fontSize: 32,
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 8,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  listName: {
    fontSize: 22,
    fontWeight: '700',
    includeFontPadding: false,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    includeFontPadding: false,
  },
  sharedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  sharedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    includeFontPadding: false,
  },
  listDescription: {
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
  },
  headerStats: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 4,
  },
  stat: {
    alignItems: 'flex-start',
    gap: 2,
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    includeFontPadding: false,
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
    includeFontPadding: false,
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
    includeFontPadding: false,
  },
  actionButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '700',
    includeFontPadding: false,
  },
  actionButtonIcon: {
    fontSize: 18,
  },
  searchBar: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  searchIcon: {
    fontSize: 18,
  },
  searchInput: {
    marginTop: 0,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 150,
  },
  emptyList: {
    paddingVertical: 60,
  },
  emptyListCard: {
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  emptyListContent: {
    alignItems: 'center',
    gap: 16,
  },
  emptyListIcon: {
    fontSize: 48,
  },
  emptyListTitle: {
    fontSize: 20,
    fontWeight: '700',
    includeFontPadding: false,
  },
  emptyListSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    includeFontPadding: false,
  },
  emptyListButton: {
    marginTop: 8,
    minWidth: 160,
  },
  listContainer: {
    gap: 10,
  },
  placeItem: {
    marginBottom: 8,
  },
  separator: {
    height: 8,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 16,
    right: 16,
    marginBottom: 20,
  },
  tabIcon: {
    fontSize: 22,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
});
