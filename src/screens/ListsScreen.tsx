import React, { useState, useEffect, useCallback } from 'react';
import {
  FlatList,
  Image,
  Modal,
  SafeAreaView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
  Platform,
} from 'react-native';
import {
  Plus,
  Bookmark,
  Share2,
  Trash2,
  Lock,
  Globe,
  ChevronRight,
  Map,
  X,
} from 'lucide-react-native';
import { Place, SavedList } from '../types';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import { PlaceCard } from '../components/PlaceCard';
import { PlaceDetailModal } from '../components/PlaceDetailModal';
import { MapViewComponent } from '../components/MapViewComponent';
import { OriaProModal } from '../components/OriaProModal';
import {
  createNewList,
  deleteList,
  getSavedLists,
  removePlaceFromList,
} from '../services/storage';

interface ListsScreenProps {
  onOpenRoutePlanner?: (initialPlace?: Place) => void;
}

export function ListsScreen({ onOpenRoutePlanner }: ListsScreenProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [lists, setLists] = useState<SavedList[]>([]);
  const [selectedList, setSelectedList] = useState<SavedList | null>(null);
  const [showMapForList, setShowMapForList] = useState<boolean>(false);

  // Modals
  const [isCreateModalVisible, setIsCreateModalVisible] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [newIsPrivate, setNewIsPrivate] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isProModalVisible, setIsProModalVisible] = useState<boolean>(false);

  // Place detail modal
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState<boolean>(false);

  const loadLists = useCallback(async () => {
    const data = await getSavedLists();
    setLists(data);
    setSelectedList((prev) => {
      if (!prev) return null;
      return data.find((l) => l.id === prev.id) || null;
    });
  }, []);

  useEffect(() => {
    loadLists();
  }, [loadLists]);

  const handleCreateList = async () => {
    if (!newTitle.trim()) return;
    try {
      await createNewList(newTitle.trim(), newDesc.trim(), undefined, newIsPrivate);
      setIsCreateModalVisible(false);
      setNewTitle('');
      setNewDesc('');
      setErrorMsg('');
      await loadLists();
    } catch (err: any) {
      if (err.message === 'LIST_LIMIT_REACHED') {
        setErrorMsg('Free tier allows up to 10 lists. Upgrade to Pro for unlimited lists!');
      } else {
        setErrorMsg('Error creating list.');
      }
    }
  };

  const handleDeleteList = async (listId: string) => {
    await deleteList(listId);
    setSelectedList(null);
    await loadLists();
  };

  const handleRemovePlace = async (listId: string, placeId: string) => {
    await removePlaceFromList(listId, placeId);
    await loadLists();
  };

  const handleShareList = async (list: SavedList) => {
    try {
      await Share.share({
        title: list.title,
        message: `Explore my saved collection "${list.title}" on Oria!\nhttps://oria.app/list/${list.shareCode || list.id}`,
      });
    } catch {}
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Top Header */}
      <View style={styles.topHeader}>
        <View>
          <Text style={[styles.title, { color: colors.text }]}>
            {selectedList ? selectedList.title : 'Saved Collections'}
          </Text>
          <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
            {selectedList
              ? `${selectedList.places?.length || 0} places saved`
              : `${lists.length} lists organized`}
          </Text>
        </View>

        {selectedList ? (
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: colors.backgroundSelected }]}
              onPress={() => setShowMapForList(!showMapForList)}
            >
              <Map size={18} color={showMapForList ? colors.primary : colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: colors.backgroundSelected }]}
              onPress={() => handleShareList(selectedList)}
            >
              <Share2 size={18} color={colors.text} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: colors.backgroundSelected }]}
              onPress={() => handleDeleteList(selectedList.id)}
            >
              <Trash2 size={18} color={colors.danger} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.headerBtn, { backgroundColor: colors.backgroundSelected }]}
              onPress={() => setSelectedList(null)}
            >
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={[styles.createBtn, { backgroundColor: colors.primary }]}
            onPress={() => setIsCreateModalVisible(true)}
          >
            <Plus size={16} color="#FFFFFF" strokeWidth={2.5} />
            <Text style={styles.createBtnText}>New List</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Selected List View or All Lists Grid */}
      {selectedList ? (
        <View style={styles.listDetailContainer}>
          {showMapForList ? (
            <View style={styles.mapWrap}>
              <MapViewComponent
                places={selectedList.places || []}
                selectedPlace={selectedPlace}
                onSelectPlace={(p) => {
                  setSelectedPlace(p);
                  setIsDetailVisible(true);
                }}
              />
            </View>
          ) : (
            <FlatList
              data={selectedList.places || []}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.placesListContent}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <Bookmark size={36} color={colors.textTertiary} />
                  <Text style={[styles.emptyTitle, { color: colors.text }]}>No places saved yet</Text>
                  <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
                    Explore spots on the map or ask Oria AI, then tap &quot;Save to List&quot; to build your collection.
                  </Text>
                </View>
              }
              renderItem={({ item }) => (
                <View style={styles.placeItemRow}>
                  <View style={{ flex: 1 }}>
                    <PlaceCard
                      place={item}
                      layout="compact"
                      isSaved={true}
                      onPress={() => {
                        setSelectedPlace(item);
                        setIsDetailVisible(true);
                      }}
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.deletePlaceBtn}
                    onPress={() => handleRemovePlace(selectedList.id, item.id)}
                  >
                    <Trash2 size={16} color={colors.danger} />
                  </TouchableOpacity>
                </View>
              )}
            />
          )}
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listsGrid}
          renderItem={({ item }) => (
            <TouchableOpacity
              activeOpacity={0.85}
              style={[
                styles.listCard,
                { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
                Shadows.soft,
              ]}
              onPress={() => setSelectedList(item)}
            >
              <Image source={{ uri: item.coverImage }} style={styles.coverImage} resizeMode="cover" />
              <View style={styles.cardInfo}>
                <View style={styles.cardHeaderRow}>
                  <Text style={[styles.cardTitle, { color: colors.text }]} numberOfLines={1}>
                    {item.title}
                  </Text>
                  {item.isPrivate ? (
                    <Lock size={12} color={colors.textTertiary} />
                  ) : (
                    <Globe size={12} color={colors.textTertiary} />
                  )}
                </View>
                {item.description ? (
                  <Text style={[styles.cardDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                    {item.description}
                  </Text>
                ) : null}
                <View style={styles.cardFooter}>
                  <Text style={[styles.placesCountText, { color: colors.primary }]}>
                    {item.places?.length || 0} places
                  </Text>
                  <ChevronRight size={16} color={colors.textTertiary} />
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Create List Modal */}
      <Modal visible={isCreateModalVisible} animationType="slide" transparent onRequestClose={() => setIsCreateModalVisible(false)}>
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setIsCreateModalVisible(false)} />
          <View style={[styles.sheet, { backgroundColor: colors.surfaceElevated, borderColor: colors.cardBorder }, Shadows.glass]}>
            <View style={styles.handleContainer}>
              <View style={[styles.handle, { backgroundColor: colors.divider }]} />
            </View>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>New Collection</Text>
              <TouchableOpacity onPress={() => setIsCreateModalVisible(false)}>
                <X size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {errorMsg ? (
                <View style={[styles.errorBox, { backgroundColor: colors.accentLight }]}>
                  <Text style={[styles.errorText, { color: colors.accent }]}>{errorMsg}</Text>
                  <TouchableOpacity
                    style={{ marginTop: 6 }}
                    onPress={() => {
                      setIsCreateModalVisible(false);
                      setIsProModalVisible(true);
                    }}
                  >
                    <Text style={{ color: colors.accent, fontWeight: '700', fontSize: 12 }}>
                      Upgrade to Pro →
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              <Text style={[styles.label, { color: colors.text }]}>Title</Text>
              <TextInput
                placeholder="e.g. Architectural Gems, Favorite Eateries"
                placeholderTextColor={colors.textTertiary}
                value={newTitle}
                onChangeText={setNewTitle}
                style={[styles.input, { backgroundColor: colors.backgroundSelected, color: colors.text }]}
                autoFocus
              />

              <Text style={[styles.label, { color: colors.text }]}>Description (Optional)</Text>
              <TextInput
                placeholder="Add context or notes"
                placeholderTextColor={colors.textTertiary}
                value={newDesc}
                onChangeText={setNewDesc}
                style={[styles.input, { backgroundColor: colors.backgroundSelected, color: colors.text }]}
              />

              <View style={styles.privacyToggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.privacyLabel, { color: colors.text }]}>
                    {newIsPrivate ? 'Private Collection' : 'Shareable Collection'}
                  </Text>
                  <Text style={[styles.privacySub, { color: colors.textSecondary }]}>
                    {newIsPrivate ? 'Only you can view this list' : 'Anyone with link can discover these places'}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleBtn,
                    { backgroundColor: newIsPrivate ? colors.backgroundSelected : colors.primaryLight },
                  ]}
                  onPress={() => setNewIsPrivate(!newIsPrivate)}
                >
                  {newIsPrivate ? <Lock size={16} color={colors.text} /> : <Globe size={16} color={colors.primary} />}
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={[styles.submitCreateBtn, { backgroundColor: colors.primary }]}
                onPress={handleCreateList}
              >
                <Text style={styles.submitCreateBtnText}>Create Collection</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Place Detail Modal */}
      <PlaceDetailModal
        place={selectedPlace}
        visible={isDetailVisible}
        onClose={() => setIsDetailVisible(false)}
        onSaveToList={() => {}}
        onAddToRoute={(p) => {
          if (onOpenRoutePlanner) onOpenRoutePlanner(p);
        }}
        isSaved={true}
      />

      {/* Oria Pro Modal */}
      <OriaProModal
        visible={isProModalVisible}
        onClose={() => setIsProModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingTop: Platform.OS === 'android' ? 44 : 8,
    paddingBottom: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(128, 128, 128, 0.2)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  createBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  createBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  listsGrid: {
    padding: Spacing.xl,
    paddingBottom: 110,
    gap: Spacing.lg,
  },
  listCard: {
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    overflow: 'hidden',
  },
  coverImage: {
    width: '100%',
    height: 120,
  },
  cardInfo: {
    padding: Spacing.lg,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    flex: 1,
    marginRight: 8,
  },
  cardDesc: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  placesCountText: {
    fontSize: 13,
    fontWeight: '600',
  },
  listDetailContainer: {
    flex: 1,
  },
  mapWrap: {
    flex: 1,
    paddingBottom: 90,
  },
  placesListContent: {
    padding: Spacing.xl,
    paddingBottom: 110,
  },
  placeItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deletePlaceBtn: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
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
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.lg,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalBody: {
    paddingHorizontal: Spacing.xl,
    gap: 10,
  },
  errorBox: {
    padding: 12,
    borderRadius: BorderRadius.md,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  input: {
    height: 44,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  privacyToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  privacyLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  privacySub: {
    fontSize: 12,
    marginTop: 2,
  },
  toggleBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  submitCreateBtn: {
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    marginTop: 10,
  },
  submitCreateBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
