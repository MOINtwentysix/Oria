import React from 'react';
import { Stack, useRouter } from 'expo-router';
import { ThemeProvider } from '@/design-system/ThemeProvider';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/services/queryClient';
import { AuthProvider, useAuth } from '@/services/auth';
import { useUIStore } from '@/store';

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutContent />
    </AuthProvider>
  );
}

function RootLayoutContent() {
  const { onboardingComplete } = useUIStore();
  const router = useRouter();
  const { isLoaded, isSignedIn } = useAuth();

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
    return (
      <ThemeProvider>
        <QueryClientProvider client={queryClient}>
          <div style={{ flex: 1, backgroundColor: '#F7F9FC', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <p style={{ fontSize: 16, color: '#666' }}>Loading...</p>
          </div>
        </QueryClientProvider>
      </ThemeProvider>
    );
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
