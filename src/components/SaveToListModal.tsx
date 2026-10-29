import React, { useEffect, useState, useCallback } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import { Check, Plus, X, Lock, Globe } from 'lucide-react-native';
import { Place, SavedList } from '../types';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import {
  addPlaceToList,
  createNewList,
  getSavedLists,
  removePlaceFromList,
} from '../services/storage';

interface SaveToListModalProps {
  place: Place | null;
  visible: boolean;
  onClose: () => void;
  onListsUpdated?: () => void;
}

export function SaveToListModal({
  place,
  visible,
  onClose,
  onListsUpdated,
}: SaveToListModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [lists, setLists] = useState<SavedList[]>([]);
  const [isCreatingNew, setIsCreatingNew] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [isPrivate] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadLists = useCallback(async () => {
    const data = await getSavedLists();
    setLists(data);
  }, []);

  useEffect(() => {
    if (visible) {
      loadLists();
    }
  }, [visible, loadLists]);

  const handleTogglePlaceInList = async (list: SavedList) => {
    if (!place) return;
    const isCurrentlyInList = list.places?.some((p) => p.id === place.id);

    if (isCurrentlyInList) {
      await removePlaceFromList(list.id, place.id);
    } else {
      await addPlaceToList(list.id, place);
    }

    await loadLists();
    if (onListsUpdated) onListsUpdated();
  };

  const handleCreateList = async () => {
    if (!newTitle.trim()) return;
    try {
      const created = await createNewList(newTitle.trim(), newDesc.trim(), undefined, isPrivate);
      if (place) {
        await addPlaceToList(created.id, place);
      }
      setIsCreatingNew(false);
      setNewTitle('');
      setNewDesc('');
      await loadLists();
      if (onListsUpdated) onListsUpdated();
    } catch (err: any) {
      if (err.message === 'LIST_LIMIT_REACHED') {
        setErrorMsg('Free tier list limit (10 lists) reached. Upgrade to Pro for unlimited lists!');
      } else {
        setErrorMsg('Could not create list. Please try again.');
      }
    }
  };

  if (!place) return null;

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
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
          <View style={styles.handleContainer}>
            <View style={[styles.handle, { backgroundColor: colors.divider }]} />
          </View>

          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>Save to List</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <X size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.listContent} showsVerticalScrollIndicator={false}>
            {errorMsg ? (
              <View style={[styles.errorBox, { backgroundColor: colors.accentLight }]}>
                <Text style={[styles.errorText, { color: colors.accent }]}>{errorMsg}</Text>
              </View>
            ) : null}

            {/* List options */}
            {lists.map((list) => {
              const containsPlace = list.places?.some((p) => p.id === place.id);
              return (
                <TouchableOpacity
                  key={list.id}
                  style={[
                    styles.listItem,
                    {
                      backgroundColor: containsPlace
                        ? colors.primaryLight
                        : colors.backgroundSelected,
                      borderColor: containsPlace ? colors.primary : 'transparent',
                    },
                  ]}
                  onPress={() => handleTogglePlaceInList(list)}
                >
                  <View style={styles.listInfo}>
                    <View style={styles.titleRow}>
                      <Text style={[styles.listTitle, { color: colors.text }]}>
                        {list.title}
                      </Text>
                      {list.isPrivate ? (
                        <Lock size={12} color={colors.textTertiary} />
                      ) : (
                        <Globe size={12} color={colors.textTertiary} />
                      )}
                    </View>
                    <Text style={[styles.listSub, { color: colors.textSecondary }]}>
                      {list.places?.length || 0} places
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.checkCircle,
                      {
                        backgroundColor: containsPlace ? colors.primary : colors.cardBorder,
                      },
                    ]}
                  >
                    {containsPlace && <Check size={14} color="#FFFFFF" strokeWidth={3} />}
                  </View>
                </TouchableOpacity>
              );
            })}

            {/* Create New List Form or Button */}
            {isCreatingNew ? (
              <View style={[styles.createForm, { backgroundColor: colors.backgroundElement, borderColor: colors.cardBorder }]}>
                <Text style={[styles.formLabel, { color: colors.text }]}>New List Name</Text>
                <TextInput
                  placeholder="e.g. Best Architecture, Date Night..."
                  placeholderTextColor={colors.textTertiary}
                  value={newTitle}
                  onChangeText={setNewTitle}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundSelected,
                      color: colors.text,
                    },
                  ]}
                  autoFocus
                />

                <Text style={[styles.formLabel, { color: colors.text }]}>Description (Optional)</Text>
                <TextInput
                  placeholder="Notes or tags for this collection"
                  placeholderTextColor={colors.textTertiary}
                  value={newDesc}
                  onChangeText={setNewDesc}
                  style={[
                    styles.input,
                    {
                      backgroundColor: colors.backgroundSelected,
                      color: colors.text,
                    },
                  ]}
                />

                <View style={styles.formButtons}>
                  <TouchableOpacity
                    style={[styles.cancelBtn, { borderColor: colors.cardBorder }]}
                    onPress={() => setIsCreatingNew(false)}
                  >
                    <Text style={{ color: colors.textSecondary }}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.submitBtn, { backgroundColor: colors.primary }]}
                    onPress={handleCreateList}
                  >
                    <Text style={{ color: '#FFFFFF', fontWeight: '600' }}>Create & Save</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.addNewBtn,
                  {
                    backgroundColor: colors.backgroundElement,
                    borderColor: colors.cardBorder,
                  },
                ]}
                onPress={() => {
                  setErrorMsg('');
                  setIsCreatingNew(true);
                }}
              >
                <Plus size={18} color={colors.primary} />
                <Text style={[styles.addNewText, { color: colors.primary }]}>
                  Create New List
                </Text>
              </TouchableOpacity>
            )}
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
    maxHeight: '75%',
    paddingBottom: Spacing.xl,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    marginBottom: Spacing.md,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    paddingHorizontal: Spacing.xl,
  },
  errorBox: {
    padding: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 12,
  },
  errorText: {
    fontSize: 13,
    fontWeight: '500',
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  listInfo: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  listTitle: {
    fontSize: 15,
    fontWeight: '600',
  },
  listSub: {
    fontSize: 12,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addNewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 6,
    marginBottom: 20,
  },
  addNewText: {
    fontSize: 14,
    fontWeight: '600',
  },
  createForm: {
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginTop: 6,
    marginBottom: 20,
  },
  formLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 6,
    marginTop: 8,
  },
  input: {
    height: 42,
    borderRadius: BorderRadius.md,
    paddingHorizontal: 12,
    fontSize: 14,
  },
  formButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 14,
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
  },
  submitBtn: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.md,
  },
});
