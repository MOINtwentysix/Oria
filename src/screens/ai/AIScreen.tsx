import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, TextInput, FlatList, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard, GlassAvatar, GlassChip, GlassInput } from '@/components/ui';
import { LiquidTabBar } from '@/components/common';
import { AIChatMessage, AIChatInput, AIModeCard, TripPlanView } from '@/components/ai/AIComponents';
import { useAuth } from '@/services/auth';
import { useUIStore, useAIStore } from '@/store';
import { Place, AIMessage, PlaceCard } from '@/types';
import { useAppNavigation } from '@/hooks/useAppNavigation';
import { useLocation } from '@/hooks/useLocation';
import { usePlaces } from '@/hooks/usePlaces';
import { useAI } from '@/hooks/useAI';

export const AIScreen: React.FC = () => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const { user, isSignedIn } = useAuth();
  const { tabBarVisible, setTabBarVisible } = useUIStore();
  const { messages, loading, error, streaming, currentConversation, setCurrentConversation, addMessage } = useAIStore();
  const { streamAskOria, planTrip } = useAI();
  const { currentLocation } = useLocation();
  const { places: nearbyPlaces, searchNearby } = usePlaces();
  const router = useAppNavigation();

  const [inputValue, setInputValue] = React.useState('');
  const [mode, setMode] = React.useState<'chat' | 'trip' | 'list'>('chat');
  const [showModeSelector, setShowModeSelector] = React.useState(true);
  const [tripPlan, setTripPlan] = React.useState<any>(null);
  const [listTripPlan, setListTripPlan] = React.useState<any>(null);

  React.useEffect(() => {
    setTabBarVisible(true);
    if (currentLocation && nearbyPlaces.length === 0) {
      searchNearby(currentLocation.latitude, currentLocation.longitude);
    }
  }, [currentLocation, nearbyPlaces.length]);

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const query = inputValue;
    setInputValue('');

    const userMessage: AIMessage = {
      id: `msg-${Date.now()}`,
      conversation_id: currentConversation?.id || '',
      role: 'user',
      content: query,
      created_at: new Date().toISOString(),
    };
    addMessage(userMessage);

    const response = await streamAskOria(
      query,
      currentLocation || { latitude: 52.52, longitude: 13.405 },
      nearbyPlaces,
      messages.map(m => ({ role: m.role, content: m.content })),
      () => undefined
    );
    if (response) {
      addMessage({
        id: `msg-${Date.now()}-assistant`,
        conversation_id: currentConversation?.id || '',
        role: 'assistant',
        content: response,
        created_at: new Date().toISOString(),
      });
    }
  };

  const handlePlaceCardPress = (card: PlaceCard) => {
    router.push('/explore');
    // Navigate to explore and highlight place
  };

  const handlePlanTripPress = async () => {
    setMode('trip');
    setShowModeSelector(false);
    
    const trip = await planTrip(
      currentLocation || { latitude: 52.52, longitude: 13.405 },
      4,
      ['food', 'culture', 'nature'],
      'medium',
      2,
      'walking',
      nearbyPlaces
    );
    setTripPlan(trip);
  };

  const handlePlanFromList = async () => {
    // Would need selected list
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={[
            styles.emptyIcon,
            { color: theme.colors.textTertiary },
          ]}>
            ✨
          </Text>
          <Text style={[
            styles.emptyTitle,
            { color: theme.colors.text },
          ]}>
            Sign in to use Oria AI
          </Text>
          <Text style={[
            styles.emptySubtitle,
            { color: theme.colors.textSecondary },
          ]}>
            Get personalized recommendations and plan trips
          </Text>
          <GlassButton size="lg" onPress={() => router.push('/auth')}>
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
            Oria AI
          </Text>
          <TouchableOpacity onPress={() => router.push('/profile')} hitSlop={12} style={styles.avatarButton}>
            <GlassAvatar name={user?.firstName ?? undefined} uri={user?.imageUrl ?? undefined} size="sm" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.content}>
          {showModeSelector && (
            <View style={styles.modeSelector}>
              <Text style={[
                styles.modeSelectorTitle,
                { color: theme.colors.textSecondary },
              ]}>
                How can I help?
              </Text>
              <View style={styles.modeCards}>
                <AIModeCard
                  title="Ask Oria"
                  description="Ask about places nearby"
                  icon="💬"
                  onPress={() => { setMode('chat'); setShowModeSelector(false); }}
                />
                <AIModeCard
                  title="Plan My Trip"
                  description="Create a personalized itinerary"
                  icon="🗺️"
                  onPress={handlePlanTripPress}
                />
                <AIModeCard
                  title="Find Something"
                  description="Describe what you're looking for"
                  icon="🔍"
                  onPress={() => { setMode('chat'); setShowModeSelector(false); }}
                />
                <AIModeCard
                  title="Surprise Me"
                  description="Get a random recommendation"
                  icon="🎲"
                  onPress={() => {
                    setMode('chat');
                    setShowModeSelector(false);
                    handleSend();
                  }}
                />
              </View>
            </View>
          )}

          {mode === 'chat' && (
            <View style={styles.chatContainer}>
              <View style={styles.messagesContainer}>
                {messages.length === 0 && !showModeSelector ? (
                  <View style={styles.welcomeMessage}>
                    <Text style={[
                      styles.welcomeTitle,
                      { color: theme.colors.text },
                    ]}>
                      How can I help you discover places?
                    </Text>
                    <Text style={[
                      styles.welcomeSubtitle,
                      { color: theme.colors.textSecondary },
                    ]}>
                      Ask me about restaurants, activities, or anything nearby!
                    </Text>
                  </View>
                ) : (
                  messages.map((msg, index) => (
                    <AIChatMessage
                      key={msg.id || index}
                      message={msg}
                      onPlaceCardPress={handlePlaceCardPress}
                    />
                  ))
                )}
                {streaming && (
                  <View style={styles.typingIndicator}>
                    <Text style={[
                      styles.typingText,
                      { color: theme.colors.textTertiary },
                    ]}>
                      Oria is thinking...
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}

          {tripPlan && (
            <TripPlanView
              trip={tripPlan}
              onViewRoute={() => {}}
              onOpenInGoogleMaps={() => {}}
              onSaveTrip={() => {}}
            />
          )}

          {listTripPlan && (
            <TripPlanView
              trip={listTripPlan}
              onViewRoute={() => {}}
              onOpenInGoogleMaps={() => {}}
              onSaveTrip={() => {}}
            />
          )}
        </View>
      </ScrollView>

      <View style={styles.inputContainer}>
        <AIChatInput
          value={inputValue}
          onChangeText={setInputValue}
          onSend={handleSend}
          onVoicePress={() => {}}
          disabled={!currentLocation}
          loading={streaming}
        />
      </View>

      <LiquidTabBar
        tabs={[
          { id: 'explore', label: 'Explore', icon: <Text style={styles.tabIcon}>🗺️</Text>, selectedIcon: <Text style={styles.tabIcon}>🗺️</Text> },
          { id: 'ai', label: 'Oria AI', icon: <Text style={styles.tabIcon}>✨</Text>, selectedIcon: <Text style={styles.tabIcon}>✨</Text> },
          { id: 'saved', label: 'Saved', icon: <Text style={styles.tabIcon}>❤️</Text>, selectedIcon: <Text style={styles.tabIcon}>❤️</Text> },
          { id: 'profile', label: 'Profile', icon: <Text style={styles.tabIcon}>👤</Text>, selectedIcon: <Text style={styles.tabIcon}>👤</Text> },
        ]}
        activeTab="ai"
        onTabPress={(tabId) => router.push(`/${tabId}` as any)}
        variant="floating"
        style={styles.tabBar}
      />
    </SafeAreaView>
  );
};

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
  avatarButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 24,
  },
  modeSelector: {
    gap: 16,
  },
  modeSelectorTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  modeCards: {
    gap: 12,
  },
  chatContainer: {
    flex: 1,
    minHeight: 400,
  },
  messagesContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  welcomeMessage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  welcomeSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  typingIndicator: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 100,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
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