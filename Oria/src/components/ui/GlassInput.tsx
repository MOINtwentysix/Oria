import React from 'react';
import { StyleSheet, View, TextInput, Text, Animated, Easing } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';

interface GlassInputProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  style?: any;
  inputStyle?: any;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onLeftIconPress?: () => void;
  onRightIconPress?: () => void;
  secureTextEntry?: boolean;
  keyboardType?: any;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoComplete?: string;
  disabled?: boolean;
  multiline?: boolean;
  numberOfLines?: number;
  maxLength?: number;
  onFocus?: () => void;
  onBlur?: () => void;
  onSubmitEditing?: () => void;
  blurOnSubmit?: boolean;
  editable?: boolean;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  value,
  onChangeText,
  placeholder,
  label,
  error,
  style,
  inputStyle,
  leftIcon,
  rightIcon,
  onLeftIconPress,
  onRightIconPress,
  secureTextEntry = false,
  keyboardType,
  autoCapitalize = 'sentences',
  autoComplete,
  disabled = false,
  multiline = false,
  numberOfLines,
  maxLength,
  onFocus,
  onBlur,
  onSubmitEditing,
  blurOnSubmit = true,
  editable = true,
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [focused, setFocused] = React.useState(false);
  const [labelAnim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (focused || value.length > 0) {
      Animated.timing(labelAnim, {
        toValue: 1,
        duration: 200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: false,
      }).start();
    } else {
      Animated.timing(labelAnim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
  }, [focused, value]);

  const labelTranslate = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -24],
  });

  const labelScale = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0.8],
  });

  const labelOpacity = labelAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1],
  });

  const containerStyle = [
    styles.container,
    {
      borderWidth: 1,
      borderColor: error
        ? theme.colors.error
        : focused
        ? theme.colors.borderFocus
        : theme.colors.border,
      backgroundColor: colorScheme === 'dark'
        ? 'rgba(30, 41, 59, 0.6)'
        : 'rgba(255, 255, 255, 0.6)',
    },
    style,
  ];

  const inputContainerStyle = [
    styles.inputContainer,
    {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.sm,
    },
  ];

  return (
    <BlurView intensity={60} style={containerStyle}>
      <View style={inputContainerStyle}>
        {leftIcon && (
          <TouchableOpacity
            onPress={onLeftIconPress}
            disabled={disabled}
            hitSlop={12}
            style={styles.iconWrapper}
          >
            {leftIcon}
          </TouchableOpacity>
        )}

        <Animated.View style={styles.labelWrapper}>
          <Animated.Text
            style={[
              styles.floatingLabel,
              {
                transform: [
                  { translateY: labelTranslate },
                  { scale: labelScale },
                ],
                opacity: labelOpacity,
                color: error
                  ? theme.colors.error
                  : focused
                  ? theme.colors.primary
                  : theme.colors.textTertiary,
              },
            ]}
          >
            {label || placeholder}
          </Animated.Text>
        </Animated.View>

        <TextInput
          style={[
            styles.input,
            {
              color: theme.colors.text,
              fontSize: theme.typography.fontSize.md,
              flex: 1,
              paddingVertical: multiline ? theme.spacing.md : 0,
            },
            inputStyle,
          ]}
          value={value}
          onChangeText={onChangeText}
          placeholder={!label ? placeholder : undefined}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoComplete={autoComplete}
          disabled={disabled}
          multiline={multiline}
          numberOfLines={numberOfLines}
          maxLength={maxLength}
          onFocus={(e) => { setFocused(true); onFocus?.(); }}
          onBlur={(e) => { setFocused(false); onBlur?.(); }}
          onSubmitEditing={onSubmitEditing}
          blurOnSubmit={blurOnSubmit}
          editable={editable}
          placeholderTextColor={theme.colors.textTertiary}
          selectionColor={theme.colors.primary}
          caretHidden={disabled}
        />

        {rightIcon && (
          <TouchableOpacity
            onPress={onRightIconPress}
            disabled={disabled}
            hitSlop={12}
            style={styles.iconWrapper}
          >
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>

      {error && (
        <Animated.Text
          style={[
            styles.errorText,
            { color: theme.colors.error },
          ]}
        >
          {error}
        </Animated.Text>
      )}
    </BlurView>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    overflow: 'hidden',
    minHeight: 56,
  },
  inputContainer: {
    flex: 1,
  },
  labelWrapper: {
    position: 'absolute',
    left: 16,
    top: 16,
    pointerEvents: 'none',
    zIndex: 1,
  },
  floatingLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  input: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 12,
  },
  iconWrapper: {
    padding: 4,
  },
  errorText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 6,
    marginLeft: 4,
    marginBottom: 4,
  },
});