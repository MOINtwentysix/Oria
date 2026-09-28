import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, RefreshControl } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard, GlassAvatar, GlassChip } from '@/components/ui';
import { LiquidTabBar } from '@/components/common';
import { useAuth } from '@/services/auth';
import { useUIStore, useSavedStore } from '@/store';
import { SavedList, SavedPlace } from '@/types';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { SavedListCard, CreateListModal } from '@/components/lists/SavedListComponents';

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
    if (isSignedIn && user) {
      loadLists(user.id);
      loadSavedPlaces(user.id);
    }
  }, [isSignedIn, loadLists, loadSavedPlaces, user?.id]);

  const handleCreateList = async (name: string, description?: string, isShared = false) => {
    if (user) {
      await createList(user.id, name, description, isShared);
      setShowCreateModal(false);
    } else {
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
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyIcon, { color: theme.colors.inkSubtle }]}>🔐</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display }]}>
            Anmelden, um Orte zu speichern
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
            Listen erstellen, Favoriten speichern, mit Freunden teilen
          </Text>
          <GlassButton variant="primary" size="lg" onPress={() => router.push('/auth')}>
            Anmelden
          </GlassButton>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <View style={styles.headerContent}>
          <Text style={[styles.title, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display }]}>
            Gespeichert
          </Text>
          <TouchableOpacity onPress={() => setShowCreateModal(true)} hitSlop={12} style={styles.createButton}>
            <View style={[styles.createButtonInner, { backgroundColor: theme.colors.accent }]}>
              <Text style={styles.createButtonIcon}>+</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView} showsVerticalScrollIndicator={false} refreshControl={
        <RefreshControl refreshing={loading} onRefresh={() => { if (user) { loadLists(user.id); loadSavedPlaces(user.id); } }} />
      }>
        <View style={styles.content}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display }]}>
              Deine Listen
            </Text>
            <Text style={[styles.sectionCount, { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body }]}>
              {lists.length} Listen
            </Text>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={[styles.loadingText, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
                Lädt...
              </Text>
            </View>
          ) : lists.length === 0 ? (
            <View style={styles.emptyLists}>
              <GlassCard variant="light" style={styles.emptyListsCard}>
                <View style={styles.emptyListsContent}>
                  <Text style={styles.emptyListsIcon}>❤️</Text>
                  <Text style={[
                    styles.emptyListsTitle,
                    { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    Noch keine Listen
                  </Text>
                  <Text style={[
                    styles.emptyListsSubtitle,
                    { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    Erstelle deine erste Liste für Favoriten
                  </Text>
                  <GlassButton variant="primary" size="md" style={styles.emptyListsButton} onPress={() => setShowCreateModal(true)}>
                    Liste erstellen
                  </GlassButton>
                </View>
              </GlassCard>
            </View>
          ) : (
            <View style={styles.listContainer}>
              {lists.map((item) => (
                <SavedListCard
                  key={item.id}
                  list={item}
                  onPress={() => handleListPress(item)}
                  onShare={() => {}}
                  style={styles.listCard}
                />
              ))}
            </View>
          )}

          {savedPlaces.length > 0 && !activeList && (
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display }]}>
                Gespeicherte Orte
              </Text>
              <Text style={[styles.sectionCount, { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body }]}>
                {savedPlaces.length} Orte
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

export default SavedScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
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
    includeFontPadding: false,
  },
  createButton: {
    padding: 8,
  },
  createButtonInner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createButtonIcon: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    includeFontPadding: false,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 140,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 32,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  sectionCount: {
    fontSize: 13,
    fontWeight: '500',
    includeFontPadding: false,
  },
  loadingContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    includeFontPadding: false,
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
    includeFontPadding: false,
  },
  emptyListsSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    includeFontPadding: false,
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
    includeFontPadding: false,
  },
  emptySubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    includeFontPadding: false,
  },
});

export default SavedScreen;
