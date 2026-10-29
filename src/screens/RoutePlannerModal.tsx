import React, { useState, useEffect, useCallback } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
  Platform,
} from 'react-native';
import {
  X,
  Navigation,
  Footprints,
  Bike,
  Car,
  ChevronUp,
  ChevronDown,
  Trash2,
  Plus,
  ExternalLink,
  MapPin,
  Clock,
  Route as RouteIcon,
} from 'lucide-react-native';
import { Place, PlannedRoute, TravelMode } from '../types';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import { MapViewComponent } from '../components/MapViewComponent';
import {
  calculateRoute,
  formatDuration,
  openExternalNavigation,
  openMultiStopInGoogleMaps,
} from '../services/routing';
import { formatDistance } from '../services/overpass';
import { getSavedLists } from '../services/storage';

interface RoutePlannerModalProps {
  visible: boolean;
  onClose: () => void;
  initialPlace?: Place;
}

export function RoutePlannerModal({
  visible,
  onClose,
  initialPlace,
}: RoutePlannerModalProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const [destinations, setDestinations] = useState<Place[]>([]);
  const [mode, setMode] = useState<TravelMode>('foot');
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [plannedRoute, setPlannedRoute] = useState<PlannedRoute | null>(null);
  const [availableSavedPlaces, setAvailableSavedPlaces] = useState<Place[]>([]);
  const [isAddPickerVisible, setIsAddPickerVisible] = useState<boolean>(false);

  const loadSavedPlaces = useCallback(async () => {
    const lists = await getSavedLists();
    const allPlaces: Place[] = [];
    const seen = new Set<string>();

    for (const l of lists) {
      if (l.places) {
        for (const p of l.places) {
          if (!seen.has(p.id)) {
            seen.add(p.id);
            allPlaces.push(p);
          }
        }
      }
    }
    setAvailableSavedPlaces(allPlaces);
  }, []);

  const handleCalculateRoute = useCallback(async () => {
    if (destinations.length < 2) {
      setPlannedRoute(null);
      return;
    }
    setIsCalculating(true);
    try {
      const res = await calculateRoute(destinations, mode);
      setPlannedRoute(res);
    } catch (err) {
      console.error('Routing calculation error:', err);
    } finally {
      setIsCalculating(false);
    }
  }, [destinations, mode]);

  useEffect(() => {
    if (visible) {
      loadSavedPlaces();
      if (initialPlace) {
        setDestinations((prev) => {
          if (prev.some((d) => d.id === initialPlace.id)) return prev;
          return [...prev, initialPlace];
        });
      }
    }
  }, [visible, initialPlace, loadSavedPlaces]);

  useEffect(() => {
    if (destinations.length >= 2) {
      handleCalculateRoute();
    } else {
      setPlannedRoute(null);
    }
  }, [destinations, mode, handleCalculateRoute]);

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const copy = [...destinations];
    const temp = copy[index - 1];
    copy[index - 1] = copy[index];
    copy[index] = temp;
    setDestinations(copy);
  };

  const handleMoveDown = (index: number) => {
    if (index === destinations.length - 1) return;
    const copy = [...destinations];
    const temp = copy[index + 1];
    copy[index + 1] = copy[index];
    copy[index] = temp;
    setDestinations(copy);
  };

  const handleRemove = (index: number) => {
    const copy = destinations.filter((_, i) => i !== index);
    setDestinations(copy);
  };

  const handleAddDestination = (place: Place) => {
    if (!destinations.some((d) => d.id === place.id)) {
      setDestinations((prev) => [...prev, place]);
    }
    setIsAddPickerVisible(false);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
        {/* Header */}
        <View style={styles.topHeader}>
          <View style={styles.headerTitleRow}>
            <RouteIcon size={20} color={colors.primary} />
            <Text style={[styles.title, { color: colors.text }]}>Route Planner</Text>
          </View>
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <X size={20} color={colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Travel Mode Pills */}
        <View style={styles.modeRow}>
          {(
            [
              { key: 'foot', label: 'Walking', icon: Footprints },
              { key: 'bike', label: 'Cycling', icon: Bike },
              { key: 'car', label: 'Driving', icon: Car },
            ] as const
          ).map((m) => {
            const Icon = m.icon;
            const isSelected = mode === m.key;
            return (
              <TouchableOpacity
                key={m.key}
                style={[
                  styles.modePill,
                  {
                    backgroundColor: isSelected ? colors.primary : colors.backgroundSelected,
                    borderColor: isSelected ? colors.primary : colors.cardBorder,
                  },
                ]}
                onPress={() => setMode(m.key)}
              >
                <Icon size={16} color={isSelected ? '#FFFFFF' : colors.text} />
                <Text
                  style={[
                    styles.modeText,
                    { color: isSelected ? '#FFFFFF' : colors.text, fontWeight: isSelected ? '600' : '500' },
                  ]}
                >
                  {m.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Map Preview with Route Polyline */}
        <View style={styles.mapContainer}>
          <MapViewComponent
            places={destinations}
            routeGeometry={plannedRoute?.geometry}
          />

          {isCalculating && (
            <View style={[styles.calculatingOverlay, { backgroundColor: colors.cardBackground }]}>
              <ActivityIndicator size="small" color={colors.primary} />
              <Text style={[styles.calcText, { color: colors.text }]}>
                Calculating OpenStreetMap route...
              </Text>
            </View>
          )}

          {plannedRoute && !isCalculating && (
            <View
              style={[
                styles.metricsPill,
                { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
                Shadows.medium,
              ]}
            >
              <View style={styles.metricItem}>
                <Clock size={14} color={colors.primary} />
                <Text style={[styles.metricBold, { color: colors.text }]}>
                  {formatDuration(plannedRoute.durationSeconds)}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <MapPin size={14} color={colors.primary} />
                <Text style={[styles.metricBold, { color: colors.text }]}>
                  {formatDistance(plannedRoute.distanceMeters)}
                </Text>
              </View>
              <View style={styles.metricItem}>
                <Text style={[styles.metricSub, { color: colors.textSecondary }]}>
                  {destinations.length} stops
                </Text>
              </View>
            </View>
          )}
        </View>

        {/* Stops List */}
        <View style={styles.stopsSection}>
          <View style={styles.stopsHeaderRow}>
            <Text style={[styles.stopsTitle, { color: colors.text }]}>
              Waypoints ({destinations.length})
            </Text>
            <TouchableOpacity
              style={[styles.addStopBtn, { backgroundColor: colors.primaryLight }]}
              onPress={() => setIsAddPickerVisible(true)}
            >
              <Plus size={14} color={colors.primary} />
              <Text style={[styles.addStopBtnText, { color: colors.primary }]}>Add Stop</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={destinations}
            keyExtractor={(item, idx) => `${item.id}_${idx}`}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View
                style={[
                  styles.stopRow,
                  { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
                  Shadows.soft,
                ]}
              >
                <View style={[styles.stopNumber, { backgroundColor: colors.primary }]}>
                  <Text style={styles.stopNumberText}>{index + 1}</Text>
                </View>

                <View style={styles.stopInfo}>
                  <Text style={[styles.stopName, { color: colors.text }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={[styles.stopSub, { color: colors.textSecondary }]} numberOfLines={1}>
                    {item.address || item.subCategory || item.category}
                  </Text>
                </View>

                {/* Move Up / Down Buttons */}
                <View style={styles.reorderBtns}>
                  <TouchableOpacity
                    style={styles.arrowBtn}
                    disabled={index === 0}
                    onPress={() => handleMoveUp(index)}
                  >
                    <ChevronUp size={16} color={index === 0 ? colors.divider : colors.text} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.arrowBtn}
                    disabled={index === destinations.length - 1}
                    onPress={() => handleMoveDown(index)}
                  >
                    <ChevronDown
                      size={16}
                      color={index === destinations.length - 1 ? colors.divider : colors.text}
                    />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.deleteBtn} onPress={() => handleRemove(index)}>
                  <Trash2 size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            )}
            ListEmptyComponent={
              <View style={styles.emptyStops}>
                <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
                  No stops added yet. Tap &quot;Add Stop&quot; to select places from your saved collections.
                </Text>
              </View>
            }
          />
        </View>

        {/* Footer Navigation Actions */}
        {destinations.length >= 2 && (
          <View style={[styles.footerBar, { borderTopColor: colors.cardBorder }]}>
            <TouchableOpacity
              style={[styles.exportBtn, { backgroundColor: colors.backgroundSelected }]}
              onPress={() => openMultiStopInGoogleMaps(destinations)}
            >
              <ExternalLink size={16} color={colors.text} />
              <Text style={[styles.exportBtnText, { color: colors.text }]}>Google Maps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.startNavBtn, { backgroundColor: colors.primary }]}
              onPress={() => openExternalNavigation(destinations[destinations.length - 1], mode)}
            >
              <Navigation size={18} color="#FFFFFF" />
              <Text style={styles.startNavBtnText}>Start Navigation</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Add Stop Picker Modal */}
        <Modal visible={isAddPickerVisible} animationType="slide" transparent onRequestClose={() => setIsAddPickerVisible(false)}>
          <View style={styles.pickerOverlay}>
            <TouchableOpacity style={styles.pickerBackdrop} activeOpacity={1} onPress={() => setIsAddPickerVisible(false)} />
            <View style={[styles.pickerSheet, { backgroundColor: colors.surfaceElevated, borderColor: colors.cardBorder }]}>
              <View style={styles.pickerHeader}>
                <Text style={[styles.pickerTitle, { color: colors.text }]}>Add Saved Place to Route</Text>
                <TouchableOpacity onPress={() => setIsAddPickerVisible(false)}>
                  <X size={18} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              <FlatList
                data={availableSavedPlaces}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ padding: Spacing.lg }}
                renderItem={({ item }) => (
                  <TouchableOpacity
                    style={[
                      styles.savedPlacePickItem,
                      { backgroundColor: colors.backgroundSelected, borderColor: colors.cardBorder },
                    ]}
                    onPress={() => handleAddDestination(item)}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pickName, { color: colors.text }]}>{item.name}</Text>
                      <Text style={[styles.pickSub, { color: colors.textSecondary }]}>
                        {item.subCategory || item.category} {item.city ? `• ${item.city}` : ''}
                      </Text>
                    </View>
                    <Plus size={18} color={colors.primary} />
                  </TouchableOpacity>
                )}
                ListEmptyComponent={
                  <View style={{ padding: 24, alignItems: 'center' }}>
                    <Text style={{ color: colors.textSecondary, textAlign: 'center' }}>
                      No saved places available. Save places from the Explore map first!
                    </Text>
                  </View>
                }
              />
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </Modal>
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
    paddingTop: Platform.OS === 'android' ? 44 : 10,
    paddingBottom: Spacing.sm,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
  },
  closeBtn: {
    padding: 6,
  },
  modeRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.xl,
    gap: 8,
    marginBottom: Spacing.sm,
  },
  modePill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  modeText: {
    fontSize: 12,
  },
  mapContainer: {
    height: 220,
    position: 'relative',
  },
  calculatingOverlay: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
  },
  calcText: {
    fontSize: 12,
    fontWeight: '600',
  },
  metricsPill: {
    position: 'absolute',
    bottom: 12,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  metricItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  metricBold: {
    fontSize: 13,
    fontWeight: '700',
  },
  metricSub: {
    fontSize: 12,
  },
  stopsSection: {
    flex: 1,
    paddingHorizontal: Spacing.xl,
    paddingTop: Spacing.md,
  },
  stopsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  stopsTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  addStopBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
  },
  addStopBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  stopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 8,
    gap: 10,
  },
  stopNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopNumberText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  stopInfo: {
    flex: 1,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '600',
  },
  stopSub: {
    fontSize: 11,
    marginTop: 2,
  },
  reorderBtns: {
    flexDirection: 'column',
    gap: 2,
  },
  arrowBtn: {
    padding: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  emptyStops: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 18,
  },
  footerBar: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
  },
  exportBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
  },
  exportBtnText: {
    fontSize: 14,
    fontWeight: '600',
  },
  startNavBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 14,
    borderRadius: BorderRadius.xl,
  },
  startNavBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  pickerOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
  },
  pickerBackdrop: {
    flex: 1,
  },
  pickerSheet: {
    maxHeight: '70%',
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    borderWidth: 1,
    paddingBottom: Spacing.xxl,
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
  },
  pickerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  savedPlacePickItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: 8,
  },
  pickName: {
    fontSize: 14,
    fontWeight: '600',
  },
  pickSub: {
    fontSize: 12,
    marginTop: 2,
  },
});
