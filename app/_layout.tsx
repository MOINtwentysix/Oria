import React from 'react';
import { Stack } from 'expo-router';
import { GestureHandlerRootView } from 'expo-router';
import { ThemeProvider } from '@/design-system/ThemeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/queryClient';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }} />
            <Stack.Screen name="landing/index" options={{ headerShown: false }} />
            <Stack.Screen name="auth/index" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding/index" options={{ headerShown: false }} />
            
            {/* Legal Screens */}
            <Stack.Screen name="legal/privacy" options={{ headerShown: false }} />
            <Stack.Screen name="legal/terms" options={{ headerShown: false }} />
            <Stack.Screen name="legal/imprint" options={{ headerShown: false }} />
            <Stack.Screen name="legal/cookies" options={{ headerShown: false }} />
            <Stack.Screen name="legal/licenses" options={{ headerShown: false }} />
            <Stack.Screen name="legal/third-party" options={{ headerShown: false }} />
            <Stack.Screen name="legal/about" options={{ headerShown: false }} />

            {/* Protected screens */}
            <Stack.Screen name="explore/index" options={{ headerShown: false }} />
            <Stack.Screen name="explore/search" options={{ headerShown: false }} />
            <Stack.Screen name="saved/index" options={{ headerShown: false }} />
            <Stack.Screen name="saved/list" options={{ headerShown: false }} />
            <Stack.Screen name="ai/index" options={{ headerShown: false }} />
            <Stack.Screen name="profile/index" options={{ headerShown: false }} />
          </Stack>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}
