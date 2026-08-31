import React from 'react';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';

interface ErrorStateProps {
  type: 'loading' | 'offline' | 'location-denied' | 'location-unavailable' | 'places-api-error' | 'ai-unavailable' | 'no-places' | 'rate-limit' | 'empty-saved' | 'empty-list' | 'session-expired' | 'invalid-search' | 'network-timeout' | 'generic';
  message?: string;
  onRetry?: () => void;
  onAction?: () => void;
  actionLabel?: string;
  style?: any;
}

const errorConfigs = {
  loading: { icon: '⏳', title: 'Loading...', description: 'Please wait while we fetch data' },
  offline: { icon: '📡', title: 'You\'re Offline', description: 'Check your connection and try again' },
  'location-denied': { icon: '📍', title: 'Location Access Needed', description: 'Enable location in Settings to discover nearby places' },
  'location-unavailable': { icon: '📍', title: 'Location Unavailable', description: 'Unable to get your current location. Please try again.' },
  'foursquare-error': { icon: '🗺️', title: 'Places Unavailable', description: 'Unable to load places. Please try again later.' },
  'places-api-error': { icon: '🗺️', title: 'Places Unavailable', description: 'Unable to load places. Please try again later.' },
  'ai-unavailable': { icon: '✨', title: 'AI Unavailable', description: 'Oria AI is currently unavailable. Please try again.' },
  'no-places': { icon: '🔍', title: 'No Places Found', description: 'Try adjusting your search or filters' },
  'rate-limit': { icon: '⏱️', title: 'Too Many Requests', description: 'Please wait a moment and try again' },
  'empty-saved': { icon: '❤️', title: 'No Saved Places', description: 'Start exploring and save your favorites!' },
  'empty-list': { icon: '📝', title: 'List is Empty', description: 'Add places to this list from the map' },
  'session-expired': { icon: '🔐', title: 'Session Expired', description: 'Please sign in again to continue' },
  'invalid-search': { icon: '🔍', title: 'Invalid Search', description: 'Please enter a valid search term' },
  'network-timeout': { icon: '⏱️', title: 'Request Timeout', description: 'The request took too long. Please try again.' },
  generic: { icon: '⚠️', title: 'Something Went Wrong', description: 'An unexpected error occurred' },
};

export const ErrorState: React.FC<ErrorStateProps> = ({
  type,
  message,
  onRetry,
  onAction,
  actionLabel,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);
  const config = errorConfigs[type] || errorConfigs.generic;

  return (
    <View style={[
      styles.container,
      { backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)' },
      style,
    ]}>
      <View style={styles.content}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={[
          styles.title,
          { color: theme.colors.text },
        ]}>
          {config.title}
        </Text>
        <Text style={[
          styles.description,
          { color: theme.colors.textSecondary },
        ]}>
          {message || config.description}
        </Text>
        <View style={styles.actions}>
          {onRetry && (
            <GlassButton variant="primary" size="md" onPress={onRetry}>
              Try Again
            </GlassButton>
          )}
          {onAction && actionLabel && (
            <GlassButton variant="secondary" size="md" onPress={onAction}>
              {actionLabel}
            </GlassButton>
          )}
        </View>
      </View>
    </View>
  );
};

import { GlassButton } from '@/components/ui';

const s0 = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    borderRadius: 24,
  },
  content: {
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    fontSize: 56,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  description: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
});

export const EmptyState: React.FC<{
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: any;
}> = ({ icon, title, description, actionLabel, onAction, style }) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  return (
    <View style={[
      styles.emptyContainer,
      { backgroundColor: colorScheme === 'dark' ? 'rgba(30,41,59,0.85)' : 'rgba(255,255,255,0.85)' },
      style,
    ]}>
      <View style={styles.emptyContent}>
        <Text style={styles.emptyIcon}>{icon}</Text>
        <Text style={[
          styles.emptyTitle,
          { color: theme.colors.text },
        ]}>
          {title}
        </Text>
        <Text style={[
          styles.emptyDescription,
          { color: theme.colors.textSecondary },
        ]}>
          {description}
        </Text>
        {actionLabel && onAction && (
          <GlassButton variant="primary" size="md" onPress={onAction} style={styles.emptyAction}>
            {actionLabel}
          </GlassButton>
        )}
      </View>
    </View>
  );
};

const s2 = StyleSheet.create({
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    borderRadius: 24,
  },
  emptyContent: {
    alignItems: 'center',
    gap: 16,
  },
  emptyIcon: {
    fontSize: 56,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
  },
  emptyDescription: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
  },
  emptyAction: {
    marginTop: 8,
    minWidth: 160,
  },
});
const styles = { ...s0, ...s2 };
