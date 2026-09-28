import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, Image, Animated, Easing, TextInput, FlatList } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton, GlassChip, GlassCard, GlassInput, GlassAvatar, GlassCardListItem } from '@/components/ui';
import { Place, AIConversation, AIMessage, PlaceCard } from '@/types';

interface AIChatMessageProps {
  message: AIMessage;
  onPlaceCardPress: (placeCard: PlaceCard) => void;
  style?: any;
}

export const AIChatMessage: React.FC<AIChatMessageProps> = ({
  message,
  onPlaceCardPress,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const isUser = message.role === 'user';

  return (
    <View style={[
      styles.messageContainer,
      { alignItems: isUser ? 'flex-end' : 'flex-start' },
      style,
    ]}>
      <View style={[
        styles.messageBubble,
        {
          backgroundColor: isUser ? theme.colors.accent : theme.colors.glass,
          borderColor: isUser ? 'transparent' : theme.colors.glassBorder,
          borderWidth: isUser ? 0 : 1,
          marginLeft: isUser ? 50 : 0,
          marginRight: isUser ? 0 : 50,
        },
      ]}>
        <Text style={[
          styles.messageText,
          { color: isUser ? theme.colors.textOnPrimary : theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
        ]}>
          {message.content}
        </Text>

        {message.place_cards && message.place_cards.length > 0 && (
          <View style={styles.placeCardsContainer}>
            {message.place_cards.map((card, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onPlaceCardPress(card)}
                style={styles.placeCard}
                hitSlop={8}
              >
                {card.photo_url && (
                  <Image
                    source={{ uri: card.photo_url }}
                    style={styles.placeCardImage}
                    resizeMode="cover"
                  />
                )}
                {!card.photo_url && (
                  <View style={[
                    styles.placeCardImagePlaceholder,
                    { backgroundColor: theme.colors.paperElevated },
                  ]}>
                    <Text style={styles.placeCardImagePlaceholderText}>📍</Text>
                  </View>
                )}

                <View style={styles.placeCardInfo}>
                  <Text style={[
                    styles.placeCardName,
                    { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    {card.name}
                  </Text>
                  <View style={styles.placeCardMeta}>
                    <Text style={[
                      styles.placeCardCategory,
                      { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                    ]}>
                      {card.category}
                    </Text>
                    {card.rating && (
                      <Text style={[
                        styles.placeCardRating,
                        { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                      ]}>
                        ⭐ {card.rating.toFixed(1)}
                      </Text>
                    )}
                    {card.distance && (
                      <Text style={[
                        styles.placeCardDistance,
                        { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body },
                      ]}>
                        {(card.distance / 1000).toFixed(1)} km
                      </Text>
                    )}
                  </View>
                  <GlassButton
                    variant="ghost"
                    size="sm"
                    onPress={() => onPlaceCardPress(card)}
                  >
                    {card.action === 'show_on_map' ? 'Auf Karte' : card.action}
                  </GlassButton>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const s1 = StyleSheet.create({
  messageContainer: {
    width: '100%',
    marginBottom: 12,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 14,
    borderRadius: 20,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 12,
    includeFontPadding: false,
  },
  placeCardsContainer: {
    gap: 10,
  },
  placeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(11,18,32,0.03)',
    borderRadius: 14,
    overflow: 'hidden',
    width: 280,
  },
  placeCardImage: {
    width: 70,
    height: 70,
    borderRadius: 14,
  },
  placeCardImagePlaceholder: {
    width: 70,
    height: 70,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeCardImagePlaceholderText: {
    fontSize: 24,
  },
  placeCardInfo: {
    flex: 1,
    padding: 10,
    gap: 6,
    justifyContent: 'center',
  },
  placeCardName: {
    fontSize: 14,
    fontWeight: '600',
    includeFontPadding: false,
  },
  placeCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  placeCardCategory: {
    fontSize: 11,
    fontWeight: '500',
    includeFontPadding: false,
  },
  placeCardRating: {
    fontSize: 11,
    fontWeight: '500',
    includeFontPadding: false,
  },
  placeCardDistance: {
    fontSize: 11,
    fontWeight: '600',
    includeFontPadding: false,
  },
});

interface AIChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onVoicePress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export const AIChatInput: React.FC<AIChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  onVoicePress,
  disabled = false,
  loading = false,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [text, setText] = React.useState(value);
  const [expanded, setExpanded] = React.useState(false);

  React.useEffect(() => {
    setText(value);
  }, [value]);

  const handleSend = () => {
    if (text.trim() && !loading) {
      onSend();
      setText('');
      setExpanded(false);
    }
  };

  const hasText = text.trim().length > 0;

  return (
    <BlurView intensity={80} style={[
      styles.inputContainer,
      {
        backgroundColor: colorScheme === 'dark' ? 'rgba(11,18,32,0.9)' : 'rgba(250,250,250,0.95)',
        borderColor: theme.colors.glassBorder,
        borderWidth: 1,
      },
    ]}>
      <View style={styles.inputRow}>
        <TouchableOpacity onPress={onVoicePress} hitSlop={12} style={styles.voiceButton} disabled={loading || disabled}>
          <Text style={styles.voiceIcon}>🎤</Text>
        </TouchableOpacity>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.ink,
              fontSize: theme.typography.fontSize.md,
              fontFamily: theme.typography.fontFamily.body,
              flex: 1,
              minHeight: 44,
              maxHeight: 120,
              paddingVertical: 8,
              placeholderTextColor: theme.colors.inkSubtle,
              selectionColor: theme.colors.accent,
            },
          ]}
          value={text}
          onChangeText={setText}
          placeholder="Nachricht an Oria..."
          multiline={true}
          onFocus={() => setExpanded(true)}
          onBlur={() => setExpanded(false)}
          disabled={disabled}
          autoFocus={false}
          returnKeyType="send"
          onSubmitEditing={handleSend}
          blurOnSubmit={false}
        />
        <TouchableOpacity
          onPress={handleSend}
          hitSlop={12}
          style={[
            styles.sendButton,
            {
              backgroundColor: hasText && !loading ? theme.colors.accent : theme.colors.inkSubtle,
            },
            disabled && { opacity: 0.5 },
          ]}
          disabled={!hasText || loading || disabled}
          activeOpacity={0.8}
        >
          <View style={styles.sendButtonInner}>
            <Text style={styles.sendButtonText}>↑</Text>
          </View>
        </TouchableOpacity>
      </View>
    </BlurView>
  );
};

const s2 = StyleSheet.create({
  inputContainer: {
    borderRadius: 24,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  voiceButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  voiceIcon: {
    fontSize: 20,
  },
  input: {
    flex: 1,
    includeFontPadding: false,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  sendButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
    includeFontPadding: false,
  },
});

interface AIModeCardProps {
  title: string;
  description: string;
  icon: string;
  onPress: () => void;
  style?: any;
}

export const AIModeCard: React.FC<AIModeCardProps> = ({
  title,
  description,
  icon,
  onPress,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [pressAnim] = React.useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.timing(pressAnim, {
      toValue: 0.97,
      duration: 60,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.timing(pressAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.out(Easing.back(2)),
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: pressAnim }] }, style]}>
      <TouchableOpacity
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        hitSlop={12}
        activeOpacity={1}
        style={styles.modeCard}
        accessibilityRole="button"
      >
        <BlurView intensity={60} style={[
          styles.modeCardInner,
          {
            backgroundColor: colorScheme === 'dark' ? 'rgba(11,18,32,0.8)' : 'rgba(250,250,250,0.9)',
            borderColor: theme.colors.glassBorder,
            borderWidth: 1,
          },
        ]}>
          <View style={styles.modeCardContent}>
            <View style={[
              styles.modeIcon,
              { backgroundColor: theme.colors.accentSoft },
            ]}>
              <Text style={styles.modeIconText}>{icon}</Text>
            </View>
            <View style={styles.modeText}>
              <Text style={[
                styles.modeTitle,
                { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
              ]}>
                {title}
              </Text>
              <Text style={[
                styles.modeDescription,
                { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
              ]}>
                {description}
              </Text>
            </View>
            <View style={[
              styles.modeArrow,
              { backgroundColor: theme.colors.accent },
            ]}>
              <Text style={styles.modeArrowText}>→</Text>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
};

const s3 = StyleSheet.create({
  modeCard: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  modeCardInner: {
    padding: 20,
  },
  modeCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modeIcon: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeIconText: {
    fontSize: 24,
  },
  modeText: {
    flex: 1,
    gap: 4,
  },
  modeTitle: {
    fontSize: 17,
    fontWeight: '600',
    includeFontPadding: false,
  },
  modeDescription: {
    fontSize: 14,
    lineHeight: 20,
    includeFontPadding: false,
  },
  modeArrow: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeArrowText: {
    fontSize: 16,
    fontWeight: '700',
    color: 'white',
    includeFontPadding: false,
  },
});

interface TripPlanViewProps {
  trip: any;
  onViewRoute: () => void;
  onOpenInGoogleMaps: () => void;
  onSaveTrip: () => void;
  style?: any;
}

export const TripPlanView: React.FC<TripPlanViewProps> = ({
  trip,
  onViewRoute,
  onOpenInGoogleMaps,
  onSaveTrip,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const stops = trip.stops?.sort((a: any, b: any) => a.order - b.order) || [];

  return (
    <BlurView intensity={80} style={[
      styles.tripCard,
      {
        backgroundColor: colorScheme === 'dark' ? 'rgba(11,18,32,0.9)' : 'rgba(250,250,250,0.95)',
        borderColor: theme.colors.glassBorder,
        borderWidth: 1,
      },
      style,
    ]}>
      <View style={styles.tripHeader}>
        <View style={styles.tripHeaderLeft}>
          <View style={[
            styles.tripIcon,
            { backgroundColor: theme.colors.accentSoft },
          ]}>
            <Text style={styles.tripIconText}>✨</Text>
          </View>
          <View style={styles.tripTitleGroup}>
            <Text style={[
              styles.tripTitle,
              { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
            ]}>
              {trip.name || 'Geplante Reise'}
            </Text>
            <Text style={[
              styles.tripMeta,
              { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
            ]}>
              {trip.duration_hours}h • {trip.stops?.length || 0} Stopps • {trip.transport_mode}
            </Text>
          </View>
        </View>
        <View style={styles.tripActions}>
          <GlassButton variant="ghost" size="sm" onPress={onViewRoute}>
            Route
          </GlassButton>
          <GlassButton variant="ghost" size="sm" onPress={onOpenInGoogleMaps}>
            Google Maps
          </GlassButton>
          <GlassButton variant="primary" size="sm" onPress={onSaveTrip}>
            Speichern
          </GlassButton>
        </View>
      </View>

      <View style={styles.stopsList}>
        {stops.map((stop: any, index: number) => (
          <View key={stop.place_id || index} style={styles.stopItem}>
            <View style={[
              styles.stopNumber,
              { backgroundColor: theme.colors.accentSoft },
            ]}>
              <Text style={[
                styles.stopNumberText,
                { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.display },
              ]}>
                {index + 1}
              </Text>
            </View>
            <View style={styles.stopInfo}>
              <Text style={[
                styles.stopName,
                { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.body },
              ]}>
                {stop.place_data?.name || 'Unbekannt'}
              </Text>
              <View style={styles.stopMeta}>
                {stop.place_data?.categories?.[0] && (
                  <Text style={[
                    styles.stopCategory,
                    { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    {stop.place_data.categories[0].name}
                  </Text>
                )}
                {stop.start_time && stop.end_time && (
                  <Text style={[
                    styles.stopTime,
                    { color: theme.colors.inkSubtle, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    {stop.start_time} – {stop.end_time}
                  </Text>
                )}
                {stop.travel_time_from_previous && (
                  <Text style={[
                    styles.stopTravel,
                    { color: theme.colors.accent, fontFamily: theme.typography.fontFamily.body },
                  ]}>
                    🚶 {Math.round(stop.travel_time_from_previous / 60)} min
                  </Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>
    </BlurView>
  );
};

const s4 = StyleSheet.create({
  tripCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    gap: 16,
  },
  tripHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  tripIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripIconText: {
    fontSize: 22,
  },
  tripTitleGroup: {
    flex: 1,
    gap: 2,
  },
  tripTitle: {
    fontSize: 17,
    fontWeight: '600',
    includeFontPadding: false,
  },
  tripMeta: {
    fontSize: 13,
    lineHeight: 18,
    includeFontPadding: false,
  },
  tripActions: {
    flexDirection: 'row',
    gap: 8,
  },
  stopsList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 12,
  },
  stopItem: {
    flexDirection: 'row',
    gap: 12,
  },
  stopNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
    flexShrink: 0,
  },
  stopNumberText: {
    fontSize: 12,
    fontWeight: '700',
    includeFontPadding: false,
  },
  stopInfo: {
    flex: 1,
    gap: 4,
  },
  stopName: {
    fontSize: 15,
    fontWeight: '600',
    includeFontPadding: false,
  },
  stopMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flexWrap: 'wrap',
  },
  stopCategory: {
    fontSize: 11,
    fontWeight: '500',
    includeFontPadding: false,
  },
  stopTime: {
    fontSize: 12,
    includeFontPadding: false,
  },
  stopTravel: {
    fontSize: 12,
    fontWeight: '600',
    includeFontPadding: false,
  },
});

const styles = { ...s1, ...s2, ...s3, ...s4 };
export default styles;
