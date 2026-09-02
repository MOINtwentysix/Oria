import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemeProvider } from '@/design-system/ThemeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/queryClient';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="landing/index" />
            <Stack.Screen name="auth/index" />
            <Stack.Screen name="onboarding/index" />
            
            <Stack.Screen name="legal/privacy" />
            <Stack.Screen name="legal/terms" />
            <Stack.Screen name="legal/imprint" />
            <Stack.Screen name="legal/cookies" />
            <Stack.Screen name="legal/licenses" />
            <Stack.Screen name="legal/third-party" />
            <Stack.Screen name="legal/about" />

            <Stack.Screen name="explore/index" />
            <Stack.Screen name="explore/search" />
            <Stack.Screen name="saved/index" />
            <Stack.Screen name="saved/list" />
            <Stack.Screen name="ai/index" />
            <Stack.Screen name="profile/index" />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
