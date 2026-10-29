import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { FloatingTabBar, TabKey } from '../components/FloatingTabBar';
import { ExploreScreen } from '../screens/ExploreScreen';
import { OriaAIScreen } from '../screens/OriaAIScreen';
import { ListsScreen } from '../screens/ListsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { RoutePlannerModal } from '../screens/RoutePlannerModal';
import { Place } from '../types';

export default function AppEntry() {
  const [activeTab, setActiveTab] = useState<TabKey>('explore');
  const [isRoutePlannerVisible, setIsRoutePlannerVisible] = useState<boolean>(false);
  const [routePlannerInitialPlace, setRoutePlannerInitialPlace] = useState<Place | undefined>();

  const handleOpenRoutePlanner = (place?: Place) => {
    setRoutePlannerInitialPlace(place);
    setIsRoutePlannerVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Tab Screen Views */}
      <View style={styles.screenContainer}>
        {activeTab === 'explore' && (
          <ExploreScreen onOpenRoutePlanner={handleOpenRoutePlanner} />
        )}
        {activeTab === 'ai' && (
          <OriaAIScreen onOpenRoutePlanner={handleOpenRoutePlanner} />
        )}
        {activeTab === 'lists' && (
          <ListsScreen onOpenRoutePlanner={handleOpenRoutePlanner} />
        )}
        {activeTab === 'profile' && (
          <ProfileScreen onOpenRoutePlanner={() => handleOpenRoutePlanner()} />
        )}
      </View>

      {/* Floating Translucent Liquid Glass Bottom Bar */}
      <FloatingTabBar
        activeTab={activeTab}
        onTabChange={(tab) => setActiveTab(tab)}
      />

      {/* Multi-Stop Route Planner Modal */}
      <RoutePlannerModal
        visible={isRoutePlannerVisible}
        onClose={() => setIsRoutePlannerVisible(false)}
        initialPlace={routePlannerInitialPlace}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  screenContainer: {
    flex: 1,
  },
});
