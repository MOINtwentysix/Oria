import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { ThemeProvider } from '@/design-system/ThemeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/queryClient';
import { useAuth } from '@/services/clerk';
import { useUIStore } from '@/store';

export default function RootLayout() {
  const { isLoaded, isSignedIn } = useAuth();
  const { onboardingComplete } = useUIStore();
  const router = useRouter();

  // Wait for auth to be loaded before rendering
  React.useEffect(() => {
    if (isLoaded) {
      // Redirect based on auth and onboarding status
      if (isSignedIn && onboardingComplete) {
        router.replace('/explore');
      } else if (isSignedIn) {
        router.replace('/onboarding');
      } else {
        router.replace('/landing');
      }
    }
  }, [isLoaded, isSignedIn, onboardingComplete, router]);

  // Show loading state while auth is loading
  if (!isLoaded) {
    return null;
  }

  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </ThemeProvider>
  );
}
