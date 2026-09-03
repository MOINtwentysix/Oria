import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, FlatList, TextInput } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard, GlassAvatar, GlassChip, GlassInput } from '@/components/ui';
import { LiquidTabBar } from '@/components/common';
import { useAuth } from '@/services/clerk';
import { useUIStore, useSavedStore } from '@/store';
import { SavedList, SavedListItem } from '@/types';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { RefreshControl } from 'react-native';

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

  React.useEffect(() => {
    setTabBarVisible(false);
    if (list) {
      loadListItems(list.id).then(data => setItems(data));
    }
  }, [list, loadListItems]);

  const handleRemoveItem = (itemId: string) => {
    removeListItem(itemId);
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const handleInvite = () => {
    setShowShareModal(true);
  };

  const handleShare = () => {
    // Generate share link
  };

  const handlePlanTrip = () => {
    router.push('/ai/plan-list');
  };

  if (!list) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
            <View style={styles.backIcon} />
          </TouchableOpacity>
          <Text style={[
            styles.emptyTitle,
            { color: theme.colors.text },
          ]}>
            No list selected
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOwner = true; // Check from list members

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={16} style={styles.backButton}>
          <View style={styles.backIcon} />
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
              { backgroundColor: theme.colors.primary },
            ]}>
              <Text style={styles.coverPlaceholderText}>❤️</Text>
            </View>
          )}

          <View style={styles.headerInfo}>
            <View style={styles.headerTitleRow}>
              <Text style={[
                styles.listName,
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
                styles.listDescription,
                { color: theme.colors.textSecondary },
              ]}>
                {list.description}
              </Text>
            )}
            <View style={styles.headerStats}>
              <View style={styles.stat}>
                <Text style={[
                  styles.statValue,
                  { color: theme.colors.text },
                ]}>
                  {items.length}
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
          </View>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleInvite} hitSlop={12} style={styles.actionButton}>
            <Text style={[
              styles.actionButtonText,
              { color: theme.colors.primary },
            ]}>
              👥 Share
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handlePlanTrip} hitSlop={12} style={[
            styles.actionButton,
            { backgroundColor: theme.colors.primary },
          ]}>
            <Text style={styles.actionButtonTextPrimary}>
              ✨ Plan Trip
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.searchBar}>
        <GlassInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search in list..."
          leftIcon={<Text style={styles.searchIcon}>🔍</Text>}
          style={styles.searchInput}
        />
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {items.length === 0 ? (
            <View style={styles.emptyList}>
              <GlassCard variant="light" style={styles.emptyListCard}>
                <View style={styles.emptyListContent}>
                  <Text style={styles.emptyListIcon}>📍</Text>
                  <Text style={[
                    styles.emptyListTitle,
                    { color: theme.colors.text },
                  ]}>
                    No places in this list yet
                  </Text>
                  <Text style={[
                    styles.emptyListSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}>
                    Search for places and save them here
                  </Text>
                  <GlassButton size="md" onPress={() => router.push('/search')}>
                    Find Places
                  </GlassButton>
                </View>
              </GlassCard>
            </View>
          ) : (
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={({ item, index }) => (
                <SavedPlaceItem
                  item={item}
                  onPress={() => {}}
                  onRemove={() => handleRemoveItem(item.id)}
                  style={styles.placeItem}
                />
              )}
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={styles.separator} />}
            />
          )}
        </View>
      </ScrollView>

      <ShareListModal
        visible={showShareModal}
        list={list}
        onClose={() => setShowShareModal(false)}
        onInvite={async (email, role) => {
          if (user) {
            await inviteToList(list.id, email, role);
          }
        }}
        members={[]}
        onRemoveMember={async (memberId) => {
          await removeListMember(list.id, memberId);
        }}
        onChangeRole={async (memberId, role) => {
          await updateMemberRole(list.id, memberId, role);
        }}
      />

      <LiquidTabBar
        tabs={[
          { id: 'explore', label: 'Explore', icon: <Text style={styles.tabIcon}>🗺️</Text>, selectedIcon: <Text style={styles.tabIcon}>🗺️</Text> },
          { id: 'ai', label: 'Oria AI', icon: <Text style={styles.tabIcon}>✨</Text>, selectedIcon: <Text style={styles.tabIcon}>✨</Text> },
          { id: 'saved', label: 'Saved', icon: <Text style={styles.tabIcon}>❤️</Text>, selectedIcon: <Text style={styles.tabIcon}>❤️</Text> },
          { id: 'profile', label: 'Profile', icon: <Text style={styles.tabIcon}>👤</Text>, selectedIcon: <Text style={styles.tabIcon}>👤</Text> },
        ]}
        activeTab="saved"
        onTabPress={(tabId) => router.push(`/${tabId}` as any)}
        variant="floating"
        style={styles.tabBar}
      />
    </SafeAreaView>
  );
};

import { SavedListCard, CreateListModal, ShareListModal, SavedPlaceItem } from '@/components/lists/SavedListComponents';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
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
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  backIcon: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'currentColor',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    opacity: 0.6,
  },
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
  listDescription: {
    fontSize: 14,
    lineHeight: 20,
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
  },
  statLabel: {
    fontSize: 11,
    fontWeight: '500',
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
    borderColor: 'rgba(0,102,204,0.3)',
  },
  actionButtonText: {
    fontSize: 15,
    fontWeight: '600',
  },
  actionButtonTextPrimary: {
    fontSize: 15,
    fontWeight: '700',
    color: 'white',
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
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
  },
  emptyListSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
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
  },
});