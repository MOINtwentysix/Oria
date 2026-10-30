import React, { useState, useRef } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import {
  Send,
  Sparkles,
} from 'lucide-react-native';
import { AIMessage, Place } from '../types';
import { BorderRadius, Colors, Shadows, Spacing } from '../constants/theme';
import { LiquidGlassView } from '../components/LiquidGlassView';
import { PlaceCard } from '../components/PlaceCard';
import { PlaceDetailModal } from '../components/PlaceDetailModal';
import { SaveToListModal } from '../components/SaveToListModal';
import { sendAIMessage } from '../services/ai';
import { isPlaceSaved } from '../services/storage';

interface OriaAIScreenProps {
  onOpenRoutePlanner?: (initialPlace?: Place) => void;
}

const INITIAL_MESSAGES: AIMessage[] = [
  {
    id: 'welcome_1',
    role: 'assistant',
    content:
      "Hello! I am **Oria AI**, powered by Mistral AI.\n\nEvery recommendation I provide is strictly grounded in real, verified OpenStreetMap data — never fictional places. What would you like to explore today?",
    suggestedPrompts: [
      '☕ Find quiet cafés near me',
      '🌳 Scenic parks & green spaces',
      '🎨 Top museums & cultural spots',
    ],
    timestamp: new Date().toISOString(),
  },
];

export function OriaAIScreen({ onOpenRoutePlanner }: OriaAIScreenProps) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  const scrollViewRef = useRef<any>(null);
  const [messages, setMessages] = useState<AIMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);

  // Modals
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [isDetailVisible, setIsDetailVisible] = useState<boolean>(false);
  const [isSaveModalVisible, setIsSaveModalVisible] = useState<boolean>(false);
  const [placeToSave, setPlaceToSave] = useState<Place | null>(null);
  const [savedMap, setSavedMap] = useState<Record<string, boolean>>({});

  const handleSendPrompt = async (textToSend: string) => {
    const text = textToSend.trim();
    if (!text || isTyping) return;

    setInputText('');
    const userMsg: AIMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);

    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await sendAIMessage({ prompt: text });
      setMessages((prev) => [...prev, response]);

      if (response.recommendedPlaces) {
        for (const p of response.recommendedPlaces) {
          const saved = await isPlaceSaved(p.id);
          setSavedMap((prev) => ({ ...prev, [p.id]: saved }));
        }
      }
    } catch (err) {
      console.error('AI chat error:', err);
    } finally {
      setIsTyping(false);
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={styles.topHeader}>
        <View style={styles.headerTitleRow}>
          <View style={[styles.aiBadge, { backgroundColor: colors.accentLight }]}>
            <Sparkles size={16} color={colors.accent} />
          </View>
          <View>
            <Text style={[styles.title, { color: colors.text }]}>Oria AI</Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              Mistral AI Location Discovery
            </Text>
          </View>
        </View>
      </View>

      {/* Chat Messages */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatScroll}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageRow,
                msg.role === 'user' ? styles.userRow : styles.assistantRow,
              ]}
            >
              <View
                style={[
                  styles.bubble,
                  msg.role === 'user'
                    ? [styles.userBubble, { backgroundColor: colors.primary }]
                    : [
                        styles.assistantBubble,
                        {
                          backgroundColor: colors.cardBackground,
                          borderColor: colors.cardBorder,
                        },
                        Shadows.soft,
                      ],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    { color: msg.role === 'user' ? '#FFFFFF' : colors.text },
                  ]}
                >
                  {msg.content}
                </Text>

                {/* Render recommended real places */}
                {msg.recommendedPlaces && msg.recommendedPlaces.length > 0 && (
                  <View style={styles.placesContainer}>
                    {msg.recommendedPlaces.map((place) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        layout="compact"
                        isSaved={savedMap[place.id]}
                        onPress={() => {
                          setSelectedPlace(place);
                          setIsDetailVisible(true);
                        }}
                      />
                    ))}
                  </View>
                )}

                {/* Suggested Follow-up Prompts */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <View style={styles.promptSuggestions}>
                    {msg.suggestedPrompts.map((sug, i) => (
                      <TouchableOpacity
                        key={i}
                        style={[
                          styles.suggestedChip,
                          {
                            backgroundColor: colors.backgroundSelected,
                            borderColor: colors.cardBorder,
                          },
                        ]}
                        onPress={() => handleSendPrompt(sug)}
                      >
                        <Text style={[styles.suggestedChipText, { color: colors.primary }]}>
                          {sug}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          ))}

          {isTyping && (
            <View style={[styles.messageRow, styles.assistantRow]}>
              <View
                style={[
                  styles.assistantBubble,
                  styles.typingBubble,
                  { backgroundColor: colors.cardBackground, borderColor: colors.cardBorder },
                ]}
              >
                <ActivityIndicator size="small" color={colors.accent} />
                <Text style={[styles.typingText, { color: colors.textSecondary }]}>
                  Synthesizing with Mistral AI & OpenStreetMap...
                </Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.bottomBar}>
          <LiquidGlassView
            intensity={90}
            borderRadius={BorderRadius.full}
            style={[
              styles.inputWrapper,
              {
                backgroundColor:
                  scheme === 'dark'
                    ? 'rgba(28, 28, 30, 0.9)'
                    : 'rgba(255, 255, 255, 0.9)',
                borderColor: colors.cardBorder,
              },
              Shadows.medium,
            ]}
          >
            <TextInput
              style={[styles.input, { color: colors.text }]}
              placeholder="Ask anything (e.g. quiet cafés, weekend spots)..."
              placeholderTextColor={colors.textTertiary}
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => handleSendPrompt(inputText)}
              returnKeyType="send"
            />
            <TouchableOpacity
              style={[
                styles.sendBtn,
                {
                  backgroundColor: inputText.trim() ? colors.accent : colors.divider,
                },
              ]}
              disabled={!inputText.trim() || isTyping}
              onPress={() => handleSendPrompt(inputText)}
            >
              <Send size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </LiquidGlassView>
        </View>
      </KeyboardAvoidingView>

      {/* Place Details Modal */}
      <PlaceDetailModal
        place={selectedPlace}
        visible={isDetailVisible}
        onClose={() => setIsDetailVisible(false)}
        onSaveToList={(p) => {
          setPlaceToSave(p);
          setIsSaveModalVisible(true);
        }}
        onAddToRoute={(p) => {
          if (onOpenRoutePlanner) onOpenRoutePlanner(p);
        }}
        isSaved={selectedPlace ? savedMap[selectedPlace.id] : false}
      />

      {/* Save to Collection Modal */}
      <SaveToListModal
        place={placeToSave}
        visible={isSaveModalVisible}
        onClose={() => setIsSaveModalVisible(false)}
        onListsUpdated={async () => {
          if (placeToSave) {
            const saved = await isPlaceSaved(placeToSave.id);
            setSavedMap((prev) => ({ ...prev, [placeToSave.id]: saved }));
          }
        }}
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
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  aiBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 12,
  },
  chatScroll: {
    flex: 1,
  },
  chatContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: 110,
  },
  messageRow: {
    marginVertical: 6,
    flexDirection: 'row',
  },
  userRow: {
    justifyContent: 'flex-end',
  },
  assistantRow: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '85%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
  },
  userBubble: {
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    borderBottomLeftRadius: 4,
    borderWidth: 1,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
  },
  placesContainer: {
    marginTop: Spacing.md,
    gap: 6,
  },
  promptSuggestions: {
    marginTop: Spacing.md,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  suggestedChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  suggestedChipText: {
    fontSize: 12,
    fontWeight: '500',
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 12,
  },
  typingText: {
    fontSize: 13,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 92,
    left: 16,
    right: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
  },
  input: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 8,
  },
  sendBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
