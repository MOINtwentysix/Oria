import React from 'react';
import { StyleSheet, View, Text, Animated, Easing, ScrollView, TouchableOpacity } from 'react-native';
import { BlurView } from 'expo-blur';
import { useTheme, getTheme } from '@/design-system/ThemeProvider';

interface GlassModalProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  style?: any;
  contentStyle?: any;
  headerStyle?: any;
  footerStyle?: any;
  footer?: React.ReactNode;
  closeOnOverlayPress?: boolean;
  showHandle?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  animationType?: 'slide' | 'fade' | 'scale';
}

export const GlassModal: React.FC<GlassModalProps> = ({
  visible,
  onClose,
  children,
  title,
  subtitle,
  style,
  contentStyle,
  headerStyle,
  footerStyle,
  footer,
  closeOnOverlayPress = true,
  showHandle = true,
  size = 'md',
  animationType = 'slide',
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  const [anim] = React.useState(new Animated.Value(0));

  React.useEffect(() => {
    if (visible) {
      Animated.timing(anim, {
        toValue: 1,
        duration: animationType === 'scale' ? 200 : 300,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(anim, {
        toValue: 0,
        duration: 200,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }).start(() => {});
    }
  }, [visible]);

  if (!visible && anim._value === 0) {
    return null;
  }

  const sizeStyles = {
    sm: { maxWidth: 300, borderRadius: theme.borderRadius.xxxl },
    md: { maxWidth: 360, borderRadius: theme.borderRadius.xxxl },
    lg: { maxWidth: 420, borderRadius: theme.borderRadius.xxxl },
    xl: { maxWidth: 480, borderRadius: theme.borderRadius.xxxl },
    full: { maxWidth: '100%', borderRadius: theme.borderRadius.xxxl },
  };

  const s = sizeStyles[size];

  const overlayOpacity = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 0.5],
  });

  const modalTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [50, 0],
  });

  const modalScale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1],
  });

  const modalOpacity = anim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0.5, 1],
  });

  const animatedStyle = {
    opacity: modalOpacity,
    transform: [
      { translateY: modalTranslate },
      { scale: modalScale },
    ],
  };

  return (
    <Animated.View
      style={styles.overlayContainer}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <Animated.View
        style={[
          styles.overlay,
          { opacity: overlayOpacity },
        ]}
        onTouchStart={closeOnOverlayPress ? onClose : undefined}
      />

      <Animated.View style={[styles.modalContainer, animatedStyle]}>
        <BlurView intensity={90} style={[
          styles.modal,
          s,
          style,
        ]}>
          {(title || showHandle) && (
            <View style={[
              styles.header,
              headerStyle,
            ]}>
              {showHandle && (
                <View style={styles.handleContainer}>
                  <View style={styles.handle} />
                </View>
              )}
              {(title || subtitle) && (
                <View style={styles.headerContent}>
                  {title && (
                    <Text style={[
                      styles.title,
                      { color: theme.colors.text },
                    ]}>
                      {title}
                    </Text>
                  )}
                  {subtitle && (
                    <Text style={[
                      styles.subtitle,
                      { color: theme.colors.textSecondary },
                    ]}>
                      {subtitle}
                    </Text>
                  )}
                </View>
              )}
              <TouchableOpacity
                onPress={onClose}
                hitSlop={16}
                style={styles.closeButton}
                accessibilityLabel="Close modal"
              >
                <View style={styles.closeIcon} />
              </TouchableOpacity>
            </View>
          )}

          <ScrollView
            style={[
              styles.content,
              contentStyle,
            ]}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.contentContainer}
          >
            {children}
          </ScrollView>

          {footer && (
            <View style={[
              styles.footer,
              footerStyle,
            ]}>
              {footer}
            </View>
          )}
        </BlurView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  overlayContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '90%',
  },
  modal: {
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.1)',
  },
  handleContainer: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.3)',
  },
  headerContent: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '400',
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeIcon: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: 'currentColor',
    borderRadius: 2,
    transform: [{ rotate: '45deg' }],
    opacity: 0.6,
  },
  content: {
    maxHeight: '70%',
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
  },
});

export interface GlassBottomSheetProps {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  snapPoints?: number[];
  initialSnap?: number;
  style?: any;
  contentStyle?: any;
  handleStyle?: any;
  showHandle?: boolean;
  backgroundColor?: string;
  keyboardBehavior?: 'extend' | 'resize' | 'pan';
}

export const GlassBottomSheet: React.FC<GlassBottomSheetProps> = ({
  visible,
  onClose,
  children,
  snapPoints = ['25%', '50%', '90%'],
  initialSnap = 0,
  style,
  contentStyle,
  handleStyle,
  showHandle = true,
  backgroundColor,
  keyboardBehavior = 'extend',
}) => {
  const { colorScheme } = useTheme();
  const theme = getTheme(colorScheme);

  return (
    <Animated.View
      style={[
        styles.sheetContainer,
        { opacity: visible ? 1 : 0 },
        style,
      ]}
      pointerEvents={visible ? 'auto' : 'none'}
    >
      <TouchableOpacity
        onPress={onClose}
        style={styles.overlay}
        activeOpacity={1}
      />

      <BlurView
        intensity={95}
        style={[
          styles.sheet,
          {
            backgroundColor: backgroundColor || (colorScheme === 'dark' ? 'rgba(30,41,59,0.95)' : 'rgba(255,255,255,0.95)'),
          },
          style,
        ]}
      >
        {showHandle && (
          <TouchableOpacity
            onPress={onClose}
            hitSlop={20}
            style={[
              styles.handleWrapper,
              handleStyle,
            ]}
          >
            <View style={[
              styles.handle,
              {
                backgroundColor: colorScheme === 'dark' ? 'rgba(255,255,255,0.3)' : 'rgba(15,23,42,0.3)',
              },
            ]} />
          </TouchableOpacity>
        )}

        <View style={[
          styles.content,
          contentStyle,
        ]}>
          {children}
        </View>
      </BlurView>
    </Animated.View>
  );
};

const sheetStyles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    top: 0,
    zIndex: 100,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#0F172A',
    opacity: 0.5,
  },
  sheet: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    maxHeight: '90%',
  },
  handleWrapper: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  handle: {
    width: 36,
    height: 5,
    borderRadius: 3,
  },
  content: {
    flex: 1,
    paddingBottom: 20,
  },
});