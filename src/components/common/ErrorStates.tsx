import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';
import { GlassButton } from '@/components/ui';

interface ErrorStateProps {
  title?: string;
  message?: string;
  icon?: string;
  onRetry?: () => void;
  retryLabel?: string;
  style?: any;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'Etwas schiefgelaufen',
  message = 'Bitte versuche es erneut.',
  icon = '⚠️',
  onRetry,
  retryLabel = 'Erneut versuchen',
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.icon, { color: theme.colors.inkSubtle }]}>{icon}</Text>
      <Text style={[
        styles.title,
        { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
      ]}>
        {title}
      </Text>
      <Text style={[
        styles.message,
        { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
      ]}>
        {message}
      </Text>
      {onRetry && (
        <GlassButton variant="primary" size="md" onPress={onRetry} style={styles.retryButton}>
          {retryLabel}
        </GlassButton>
      )}
    </View>
  );
};

interface EmptyStateProps {
  title?: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: any;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'Nichts gefunden',
  message = 'Hier ist noch nichts zu sehen.',
  icon = '📭',
  actionLabel,
  onAction,
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  return (
    <View style={[styles.container, style]}>
      <Text style={[styles.icon, { color: theme.colors.inkSubtle }]}>{icon}</Text>
      <Text style={[
        styles.title,
        { color: theme.colors.ink, fontFamily: theme.typography.fontFamily.display },
      ]}>
        {title}
      </Text>
      <Text style={[
        styles.message,
        { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
      ]}>
        {message}
      </Text>
      {actionLabel && onAction && (
        <GlassButton variant="primary" size="md" onPress={onAction} style={styles.actionButton}>
          {actionLabel}
        </GlassButton>
      )}
    </View>
  );
};

interface LoadingStateProps {
  message?: string;
  style?: any;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  message = 'Lädt...',
  style,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  return (
    <View style={[styles.loadingContainer, style]}>
      <View style={[
        styles.spinner,
        { borderTopColor: theme.colors.accent },
      ]} />
      {message && (
        <Text style={[
          styles.loadingText,
          { color: theme.colors.inkMuted, fontFamily: theme.typography.fontFamily.body },
        ]}>
          {message}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 16,
  },
  icon: {
    fontSize: 64,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    includeFontPadding: false,
  },
  message: {
    fontSize: 15,
    textAlign: 'center',
    lineHeight: 22,
    includeFontPadding: false,
  },
  retryButton: {
    marginTop: 8,
    minWidth: 160,
  },
  actionButton: {
    marginTop: 8,
    minWidth: 160,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  spinner: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: '#E2E8F0',
  },
  loadingText: {
    fontSize: 16,
    fontWeight: '500',
    includeFontPadding: false,
  },
});
