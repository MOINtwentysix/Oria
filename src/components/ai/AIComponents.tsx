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
          backgroundColor: isUser ? theme.colors.primary : (colorScheme === 'dark' ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.7)'),
          borderColor: isUser ? 'transparent' : (colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)'),
          borderWidth: isUser ? 0 : 1,
          marginLeft: isUser ? 50 : 0,
          marginRight: isUser ? 0 : 50,
        },
      ]}>
        <Text style={[
          styles.messageText,
          { color: isUser ? theme.colors.textOnPrimary : theme.colors.text },
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
                    { backgroundColor: theme.colors.backgroundTertiary },
                  ]}>
                    <Text style={styles.placeCardImagePlaceholderText}>📍</Text>
                  </View>
                )}

                <View style={styles.placeCardInfo}>
                  <Text style={[
                    styles.placeCardName,
                    { color: theme.colors.text },
                  ]}>
                    {card.name}
                  </Text>
                  <View style={styles.placeCardMeta}>
                    <Text style={[
                      styles.placeCardCategory,
                      { color: theme.colors.textSecondary },
                    ]}>
                      {card.category}
                    </Text>
                    {card.rating && (
                      <Text style={[
                        styles.placeCardRating,
                        { color: theme.colors.textSecondary },
                      ]}>
                        ⭐ {card.rating.toFixed(1)}
                      </Text>
                    )}
                    {card.distance && (
                      <Text style={[
                        styles.placeCardDistance,
                        { color: theme.colors.primary },
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
                    {card.action === 'show_on_map' ? 'Show on Map' : card.action}
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
  },
  placeCardsContainer: {
    gap: 10,
  },
  placeCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(0,0,0,0.03)',
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
  },
  placeCardRating: {
    fontSize: 11,
  },
  placeCardDistance: {
    fontSize: 11,
    fontWeight: '600',
  },
});

interface AIChatInputProps {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onVoicePress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  style?: any;
}

export const AIChatInput: React.FC<AIChatInputProps> = ({
  value,
  onChangeText,
  onSend,
  onVoicePress,
  disabled = false,
  loading = false,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  return (
    <BlurView intensity={80} style={[
      styles.inputContainer,
      {
        backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)',
        borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
        borderWidth: 1,
      },
      style,
    ]}>
      <View style={styles.inputRow}>
        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontSize: 16,
              flex: 1,
            },
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask Oria anything..."
          placeholderTextColor={theme.colors.textTertiary}
          multiline
          maxLength={2000}
          onSubmitEditing={onSend}
          blurOnSubmit={false}
          editable={!disabled && !loading}
          selectionColor={theme.colors.primary}
        />

        {onVoicePress && (
          <TouchableOpacity
            onPress={onVoicePress}
            hitSlop={12}
            style={styles.voiceButton}
            disabled={disabled || loading}
          >
            <View style={[
              styles.voiceButtonInner,
              { backgroundColor: loading ? theme.colors.textTertiary : theme.colors.primary },
            ]}>
              <Text style={styles.voiceButtonText}>{loading ? '⏳' : '🎤'}</Text>
            </View>
          </TouchableOpacity>
        )}

        {(value.trim() || loading) && (
          <TouchableOpacity
            onPress={onSend}
            hitSlop={12}
            style={styles.sendButton}
            disabled={disabled || loading || !value.trim()}
          >
            <View style={[
              styles.sendButtonInner,
              { backgroundColor: value.trim() ? theme.colors.primary : theme.colors.textTertiary },
            ]}>
              <Text style={styles.sendButtonText}>↑</Text>
            </View>
          </TouchableOpacity>
        )}
      </View>
    </BlurView>
  );
};

const s2 = StyleSheet.create({
  inputContainer: {
    borderRadius: 24,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 120,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  voiceButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  voiceButtonText: {
    fontSize: 18,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  sendButtonInner: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
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
            backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.7)' : 'rgba(255,255,255,0.7)',
            borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
            borderWidth: 1,
          },
        ]}>
          <View style={styles.modeCardContent}>
            <View style={[
              styles.modeIcon,
              { backgroundColor: theme.colors.primary },
            ]}>
              <Text style={styles.modeIconText}>{icon}</Text>
            </View>
            <View style={styles.modeText}>
              <Text style={[
                styles.modeTitle,
                { color: theme.colors.text },
              ]}>
                {title}
              </Text>
              <Text style={[
                styles.modeDescription,
                { color: theme.colors.textSecondary },
              ]}>
                {description}
              </Text>
            </View>
            <View style={[
              styles.modeArrow,
              { backgroundColor: theme.colors.primary },
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
  },
  modeDescription: {
    fontSize: 14,
    lineHeight: 20,
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
        backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)',
        borderColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(15,23,42,0.08)',
        borderWidth: 1,
      },
      style,
    ]}>
      <View style={styles.tripHeader}>
        <View style={styles.tripHeaderLeft}>
          <View style={[
            styles.tripIcon,
            { backgroundColor: theme.colors.primary },
          ]}>
            <Text style={styles.tripIconText}>✨</Text>
          </View>
          <View style={styles.tripTitleGroup}>
            <Text style={[
              styles.tripTitle,
              { color: theme.colors.text },
            ]}>
              {trip.name || 'Planned Trip'}
            </Text>
            <Text style={[
              styles.tripMeta,
              { color: theme.colors.textSecondary },
            ]}>
              {trip.duration_hours}h • {trip.stops?.length || 0} stops • {trip.transport_mode}
            </Text>
          </View>
        </View>

        <View style={styles.tripActions}>
          <GlassButton variant="glass" size="sm" onPress={onViewRoute}>
            View Route
          </GlassButton>
          <GlassButton variant="primary" size="sm" onPress={onOpenInGoogleMaps}>
            Google Maps
          </GlassButton>
        </View>
      </View>

      <View style={styles.stopsList}>
        {stops.map((stop: any, index: number) => (
          <View key={stop.id || index} style={styles.stopItem}>
            <View style={[
              styles.stopTime,
              { backgroundColor: index === 0 ? theme.colors.primary : theme.colors.backgroundTertiary },
            ]}>
              <Text style={[
                styles.stopTimeText,
                { color: index === 0 ? 'white' : theme.colors.text },
              ]}>
                {stop.start_time || `${9 + index * 2}:00`}
              </Text>
            </View>

            <View style={styles.stopConnector} />

            <View style={styles.stopContent}>
              {stop.place_data?.photos?.[0] && (
                <Image
                  source={{ uri: stop.place_data.photos[0].url || `${stop.place_data.photos[0].prefix}original${stop.place_data.photos[0].suffix}` }}
                  style={styles.stopImage}
                  resizeMode="cover"
                />
              )}
              {!stop.place_data?.photos?.[0] && (
                <View style={[
                  styles.stopImagePlaceholder,
                  { backgroundColor: theme.colors.backgroundTertiary },
                ]}>
                  <Text style={styles.stopImagePlaceholderText}>
                    {stop.place_data?.categories?.[0]?.icon || '📍'}
                  </Text>
                </View>
              )}

              <View style={styles.stopInfo}>
                <Text style={[
                  styles.stopName,
                  { color: theme.colors.text },
                ]}>
                  {stop.place_data?.name || 'Unknown Place'}
                </Text>
                {stop.place_data?.categories?.[0] && (
                  <Text style={[
                    styles.stopCategory,
                    { color: theme.colors.textSecondary },
                  ]}>
                    {stop.place_data.categories[0].icon} {stop.place_data.categories[0].name}
                  </Text>
                )}
                {stop.duration_minutes && (
                  <Text style={[
                    styles.stopDuration,
                    { color: theme.colors.textTertiary },
                  ]}>
                    {stop.duration_minutes} min
                  </Text>
                )}
              </View>
            </View>
          </View>
        ))}
      </View>

      {trip.route && (
        <View style={styles.routeSummary}>
          <View style={styles.routeInfo}>
            <Text style={[
              styles.routeLabel,
              { color: theme.colors.textSecondary },
            ]}>
              Total Route
            </Text>
            <Text style={[
              styles.routeValue,
              { color: theme.colors.text },
            ]}>
              {(trip.route.distance_meters / 1000).toFixed(1)} km • {Math.round(trip.route.duration_seconds / 60)} min
            </Text>
          </View>
          <GlassButton variant="primary" size="sm" onPress={onOpenInGoogleMaps}>
            Open in Google Maps
          </GlassButton>
        </View>
      )}
    </BlurView>
  );
};

const s4 = StyleSheet.create({
  tripCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 16,
  },
  tripHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  tripHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  tripIcon: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tripIconText: {
    fontSize: 20,
  },
  tripTitleGroup: {
    gap: 2,
  },
  tripTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  tripMeta: {
    fontSize: 13,
  },
  tripActions: {
    flexDirection: 'row',
    gap: 8,
  },
  stopsList: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 16,
  },
  stopItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  stopTime: {
    width: 56,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  stopTimeText: {
    fontSize: 11,
    fontWeight: '700',
  },
  stopConnector: {
    width: 2,
    flex: 1,
    marginTop: 8,
    marginBottom: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  stopContent: {
    flexDirection: 'row',
    flex: 1,
    gap: 10,
  },
  stopImage: {
    width: 56,
    height: 56,
    borderRadius: 12,
  },
  stopImagePlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopImagePlaceholderText: {
    fontSize: 20,
  },
  stopInfo: {
    flex: 1,
    justifyContent: 'center',
    gap: 2,
  },
  stopName: {
    fontSize: 14,
    fontWeight: '600',
  },
  stopCategory: {
    fontSize: 12,
  },
  stopDuration: {
    fontSize: 11,
  },
  routeSummary: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
  routeInfo: {
    gap: 2,
  },
  routeLabel: {
    fontSize: 12,
    fontWeight: '500',
  },
  routeValue: {
    fontSize: 15,
    fontWeight: '600',
  },
});
const styles = { ...s1, ...s2, ...s3, ...s4 };
