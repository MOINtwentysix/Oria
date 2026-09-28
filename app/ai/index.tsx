import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, SafeAreaView, Image, TextInput, FlatList, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassCard, GlassAvatar, GlassChip, GlassInput } from '@/components/ui';
import { LiquidTabBar } from '@/components/common';
import { AIChatMessage, AIChatInput, AIModeCard, TripPlanView } from '@/components/ai/AIComponents';
import { useAuth } from '@/services/auth';
import { useUIStore } from '@/store';
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
  const { messages, loading, error, streaming, currentConversation, streamAskOria, planTrip, addMessage } = useAI();
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
    try {
      const response = await streamAskOria(
        query,
        currentLocation || { latitude: 52.52, longitude: 13.405 },
        nearbyPlaces,
        messages.map(m => ({ role: m.role, content: m.content })),
        () => undefined
      );
      addMessage({
        id: `msg-${Date.now()}-assistant`,
        conversation_id: currentConversation?.id || '',
        role: 'assistant',
        content: response?.trim() || 'Ich konnte darauf gerade keine Antwort erstellen. Bitte versuche es noch einmal.',
        created_at: new Date().toISOString(),
      });
    } catch {
      addMessage({
        id: `msg-${Date.now()}-assistant`,
        conversation_id: currentConversation?.id || '',
        role: 'assistant',
        content: 'Ich konnte darauf gerade keine Antwort erstellen. Bitte versuche es noch einmal.',
        created_at: new Date().toISOString(),
      });
    }
  };

  const handlePlaceCardPress = (card: PlaceCard) => {
    router.push('/explore');
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
    setMode('list');
    setShowModeSelector(false);
  };

  if (!isSignedIn) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.paper }]}>
        <View style={styles.emptyState}>
          <Text style={[styles.emptyIcon, { color: theme.colors.inkSubtle }]}>✨</Text>
          <Text style={[styles.emptyTitle, { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display }]}>
            Anmelden für Oria AI
          </Text>
          <Text style={[styles.emptySubtitle, { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body }]}>
            Persönliche Empfehlungen & Reiseplanung
          </Text>
          <GlassButton size="lg" onPress={() => router.push('/auth')}>
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
            Oria AI
          </Text>
          {user && (
            <TouchableOpacity onPress={() => router.push('/profile')} hitSlop={12} style={styles.avatarButton}>
              <GlassAvatar name={user?.firstName} uri={user?.imageUrl} size="sm" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.content}>

          {showModeSelector && (
            <View style={styles.modeSelector}>
              <Text style={[styles.modeSelectorTitle, { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.display }]}>
                Modus
              </Text>
              <View style={styles.modeCards}>
                <AIModeCard
                  icon="💬"
                  title="Chat"
                  subtitle="Frag Oria nach Orten & Tipps"
                  active={mode === 'chat'}
                  onPress={() => setMode('chat')}
                  color={theme.colors.accent}
                />
                <AIModeCard
                  icon="🗺️"
                  title="Reise planen"
                  subtitle="KI-Route mit Google Maps Export"
                  active={mode === 'trip'}
                  onPress={handlePlanTripPress}
                  color={theme.colors.success}
                />
                <AIModeCard
                  icon="📋"
                  title="Aus Liste"
                  subtitle="Route aus deinen gespeicherten Orten"
                  active={mode === 'list'}
                  onPress={handlePlanFromList}
                  color={theme.colors.warning}
                />
              </View>
            </View>
          )}

          {mode === 'chat' && (
            <View style={styles.chatContainer}>
              <View style={styles.messagesContainer}>
                {messages.length > 0 ? (
                  <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                      <AIChatMessage
                        message={item}
                        onPlacePress={handlePlaceCardPress}
                      />
                    )}
                    ListEmptyComponent={
                      <View style={styles.welcomeMessage}>
                        <Text style={[
                          styles.welcomeTitle,
                          { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
                        ]}>
                          Wie kann ich dir helfen?
                        </Text>
                        <Text style={[
                          styles.welcomeSubtitle,
                          { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                        ]}>
                          Frag nach Cafés, plane eine Route oder lass dich inspirieren
                        </Text>
                      </View>
                    }
                  />
                ) : (
                  <View style={styles.welcomeMessage}>
                    <Text style={[
                      styles.welcomeTitle,
                      { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
                    ]}>
                      Wie kann ich dir helfen?
                    </Text>
                    <Text style={[
                      styles.welcomeSubtitle,
                      { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                    ]}>
                      Frag nach Cafés, plane eine Route oder lass dich inspirieren
                    </Text>
                  </View>
                )}
                {error && (
                  <View style={[styles.errorContainer, { backgroundColor: theme.colors.errorSoft }]}>
                    <Text style={[styles.errorText, { color: theme.colors.error, fontFamily: theme.typography.fontFamily.body }]}>{error}</Text>
                  </View>
                )}
                {streaming && (
                  <View style={styles.typingIndicator}>
                    <Text style={[styles.typingText, { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body }]}>
                      Oria denkt nach...
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

      <View style={[styles.inputContainer, { borderTopColor: theme.colors.border }]}>
        <AIChatInput
          value={inputValue}
          onChangeText={setInputValue}
          onSend={handleSend}
          onVoicePress={() => {}}
          disabled={false}
          loading={streaming}
        />
      </View>

      <LiquidTabBar
        tabs={[
          { id: 'explore', label: 'Entdecken', icon: <Text style={styles.tabIcon}>🗺️</Text>, selectedIcon: <Text style={styles.tabIcon}>🗺️</Text> },
          { id: 'ai', label: 'Oria AI', icon: <Text style={styles.tabIcon}>✨</Text>, selectedIcon: <Text style={styles.tabIcon}>✨</Text> },
          { id: 'saved', label: 'Gespeichert', icon: <Text style={styles.tabIcon}>❤️</Text>, selectedIcon: <Text style={styles.tabIcon}>❤️</Text> },
          { id: 'profile', label: 'Profil', icon: <Text style={styles.tabIcon}>👤</Text>, selectedIcon: <Text style={styles.tabIcon}>👤</Text> },
        ]}
        activeTab="ai"
        onTabPress={(tabId) => router.push(`/${tabId}` as any)}
        variant="floating"
        style={styles.tabBar}
      />
    </SafeAreaView>
  );
};

export default AIScreen;

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
  avatarButton: {
    padding: 4,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 150,
  },
  content: {
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 24,
  },
  modeSelector: {
    gap: 16,
  },
  modeSelectorTitle: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
    textTransform: 'uppercase',
    includeFontPadding: false,
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
  errorContainer: {
    padding: 16,
    borderRadius: 16,
  },
  errorText: {
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
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
    includeFontPadding: false,
  },
  welcomeSubtitle: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    includeFontPadding: false,
  },
  typingIndicator: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  typingText: {
    fontSize: 14,
    fontWeight: '500',
    includeFontPadding: false,
  },
  inputContainer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    paddingBottom: 100,
    borderTopWidth: 1,
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
