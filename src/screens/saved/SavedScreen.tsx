import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, FlatList } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard, GlassAvatar, GlassChip } from '@/components/ui';
import { LiquidTabBar } from '@/components/common';
import { useAuth } from '@/services/clerk';
import { useUIStore, useSavedStore } from '@/store';
import { SavedList, SavedPlace } from '@/types';
import { useAppNavigation } from '@/hooks/useAppNavigation';

export const SavedScreen: React.FC = () => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { user, isSignedIn } = useAuth();
  const { tabBarVisible, setTabBarVisible } = useUIStore();
  const { lists, savedPlaces, loading, error, loadLists, loadSavedPlaces, createList, setActiveList } = useSavedStore();
  const router = useAppNavigation();

  const [showCreateModal, setShowCreateModal] = React.useState(false);
  const [activeList, setActiveListState] = React.useState<SavedList | null>(null);

  React.useEffect(() => {
    setTabBarVisible(true);
    if (isSignedIn) {
      loadLists();
      loadSavedPlaces(user?.id || '');
    }
  }, [isSignedIn, loadLists, loadSavedPlaces, user?.id]);

  const handleCreateList = (name: string, description?: string, isShared = false) => {
    if (user) {
      createList(user.id, name, description, isShared);
      setShowCreateModal(false);
    }
  };

  const handleListPress = (list: SavedList) => {
    setActiveList(list);
    setActiveListState(list);
    router.push('/saved/list');
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={[
            styles.emptyIcon,
            { color: theme.colors.textTertiary },
          ]}>
            🔐
          </Text>
          <Text style={[
            styles.emptyTitle,
            { color: theme.colors.text },
          ]}>
            Sign in to save places
          </Text>
          <Text style={[
            styles.emptySubtitle,
            { color: theme.colors.textSecondary },
          ]}>
            Create lists, save favorites, and share with friends
          </Text>
          <GlassButton variant="primary" size="lg" onPress={() => router.push('/auth')}>
            Sign In
          </GlassButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={[
            styles.title,
            { color: theme.colors.text },
          ]}>
            Saved
          </Text>
          <TouchableOpacity onPress={() => setShowCreateModal(true)} hitSlop={12} style={styles.createButton}>
            <View style={styles.createButtonInner}>
              <Text style={styles.createButtonIcon}>+</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => { loadLists(); loadSavedPlaces(user.id); }} />
      }>
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={[
              styles.sectionTitle,
              { color: theme.colors.textSecondary },
            ]}>
              Your Lists
            </Text>
            <Text style={[
              styles.sectionCount,
              { color: theme.colors.textTertiary },
            ]}>
              {lists.length} lists
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[
                styles.loadingText,
                { color: theme.colors.textSecondary },
              ]}>
                Loading...
              </Text>
            </View>
          ) : lists.length === 0 ? (
            <View style={styles.emptyLists}>
              <GlassCard variant="glass" style={styles.emptyListsCard}>
                <View style={styles.emptyListsContent}>
                  <Text style={styles.emptyListsIcon}>❤️</Text>
                  <Text style={[
                    styles.emptyListsTitle,
                    { color: theme.colors.text },
                  ]}>
                    No lists yet
                  </Text>
                  <Text style={[
                    styles.emptyListsSubtitle,
                    { color: theme.colors.textSecondary },
                  ]}>
                    Create your first list to start saving places
                  </Text>
                  <GlassButton variant="primary" size="md" onPress={() => setShowCreateModal(true)} style={styles.emptyListsButton}>
                    Create List
                  </GlassButton>
                </View>
              </GlassCard>
            </View>
          ) : (
            <FlatList
              data={lists}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <SavedListCard
                  list={item}
                  onPress={() => handleListPress(item)}
                  onShare={() => {}}
                  style={styles.listCard}
                />
              )}
              ListEmptyComponent={
                <View style={styles.emptyLists}>
                  <GlassCard variant="glass" style={styles.emptyListsCard}>
                    <View style={styles.emptyListsContent}>
                      <Text style={styles.emptyListsIcon}>❤️</Text>
                      <Text style={[
                        styles.emptyListsTitle,
                        { color: theme.colors.text },
                      ]}>
                        No lists yet
                      </Text>
                      <Text style={[
                        styles.emptyListsSubtitle,
                        { color: theme.colors.textSecondary },
                      ]}>
                        Create your first list to start saving places
                      </Text>
                      <GlassButton variant="primary" size="md" onPress={() => setShowCreateModal(true)} style={styles.emptyListsButton}>
                        Create List
                      </GlassButton>
                    </View>
                  </GlassCard>
                </View>
              }
              contentContainerStyle={styles.listContainer}
              showsVerticalScrollIndicator={false}
            />
          )}

          {savedPlaces.length > 0 && !activeList && (
            <View style={styles.sectionHeader}>
              <Text style={[
                styles.sectionTitle,
                { color: theme.colors.textSecondary },
              ]}>
                Saved Places
              </Text>
              <Text style={[
                styles.sectionCount,
                { color: theme.colors.textTertiary },
              ]}>
                {savedPlaces.length} places
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <CreateListModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateList}
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

import { RefreshControl } from 'react-native';
import { SavedListCard } from '@/components/lists/SavedListComponents';
import { CreateListModal } from '@/components/lists/SavedListComponents';
import { usePlaces } from '@/hooks/usePlaces';
import { PlaceBottomSheet } from '@/components/sheets';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  createButton: {
    padding: 8,
  },
  createButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '500',
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
  },
  emptyLists: {
    paddingVertical: 40,
  },
  emptyListsCard: {
    paddingVertical: 40,
    paddingHorizontal: 30,
    alignItems: 'center',
  },
  emptyListsContent: {
    alignItems: 'center',
    gap: 16,
  },
  emptyListsIcon: {
    fontSize: 48,
  },
  emptyListsTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  emptyListsSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyListsButton: {
    marginTop: 8,
    minWidth: 160,
  },
  listContainer: {
    paddingBottom: 100,
  },
  listCard: {
    marginBottom: 12,
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
  emptyIcon: {
    fontSize: 64,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
});